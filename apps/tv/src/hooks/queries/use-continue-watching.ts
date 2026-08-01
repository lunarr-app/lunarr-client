import { useQuery } from "@tanstack/react-query";
import { getContinueWatchingEpisodes, getContinueWatchingMovies } from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

export function useContinueWatchingMovies() {
  return useQuery({
    queryKey: queryKeys.continueWatching.movies(),
    queryFn: async () => {
      const { data, error } = await getContinueWatchingMovies();
      if (error) throw error;
      return { movies: data?.movies ?? [] };
    },
  });
}

export function useContinueWatchingEpisodes() {
  return useQuery({
    queryKey: queryKeys.continueWatching.episodes(),
    queryFn: async () => {
      const { data, error } = await getContinueWatchingEpisodes();
      if (error) throw error;
      return { episodes: data?.episodes ?? [], nextUp: data?.nextUp ?? [] };
    },
  });
}
