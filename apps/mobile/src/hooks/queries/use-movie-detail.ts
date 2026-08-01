import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMovieOverview, setMovieWatched, toggleWatchlist } from "@lunarr/api";
import { queryKeys } from "@/src/lib/api/query-keys";

export function useMovieDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.movies.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Missing movie id");
      const { data, error } = await getMovieOverview({ path: { id } });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useToggleMovieWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mediaItemId }: { mediaItemId: string }) => {
      const { data, error } = await toggleWatchlist({ body: { mediaItemId } });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.detail(variables.mediaItemId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
  });
}

export function useSetMovieWatched(movieId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, completed }: { fileId: string; completed: boolean }) => {
      const { error } = await setMovieWatched({
        path: { id: movieId },
        body: { mediaFileId: fileId, completed },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.detail(movieId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.continueWatching.all });
    },
  });
}
