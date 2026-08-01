import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEpisode, setEpisodeWatched } from "@lunarr/api";
import { queryKeys } from "@/src/lib/api/query-keys";

export function useEpisodeDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.episodes.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Missing episode id");
      const { data, error } = await getEpisode({ path: { id } });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useSetEpisodeWatched(episodeId: string, showId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, completed }: { fileId: string; completed: boolean }) => {
      const { error } = await setEpisodeWatched({
        path: { id: episodeId },
        body: { mediaFileId: fileId, completed },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.episodes.detail(episodeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shows.detail(showId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.continueWatching.all });
    },
  });
}
