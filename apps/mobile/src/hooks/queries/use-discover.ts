import { useQuery } from "@tanstack/react-query";
import { getDiscoverMovies, getDiscoverShows } from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

const STALE_TIME = 15 * 60_000;

export function useDiscoverMoviesRail(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.discover.rail("movies"),
    queryFn: async () => {
      const { data, error } = await getDiscoverMovies({ query: { page: 1 } });
      if (error) throw error;
      return { movies: data?.movies ?? [], hasNext: data?.page?.hasNext ?? false };
    },
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useDiscoverShowsRail(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.discover.rail("shows"),
    queryFn: async () => {
      const { data, error } = await getDiscoverShows({ query: { page: 1 } });
      if (error) throw error;
      return { shows: data?.shows ?? [], hasNext: data?.page?.hasNext ?? false };
    },
    staleTime: STALE_TIME,
    enabled,
  });
}
