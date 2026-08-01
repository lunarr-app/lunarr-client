import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getShowSeason, setSeasonWatched } from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

export function useSeasonDetail(showId: string | undefined, seasonId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shows.season(showId ?? "", seasonId ?? ""),
    queryFn: async () => {
      if (!showId || !seasonId) throw new Error("Missing show or season id");
      const { data, error } = await getShowSeason({ path: { id: showId, seasonId } });
      if (error) throw error;
      return data;
    },
    enabled: !!showId && !!seasonId,
    placeholderData: (previousData) => previousData,
  });
}

export function useSetSeasonWatched(showId: string, seasonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ completed }: { completed: boolean }) => {
      const { error } = await setSeasonWatched({
        path: { id: showId, seasonId },
        body: { completed },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shows.season(showId, seasonId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shows.detail(showId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.continueWatching.all });
    },
  });
}
