import { useInfiniteQuery } from "@tanstack/react-query";
import { getDiscoverMovies, getDiscoverShows, type MovieSummary, type ShowSummary } from "@lunarr/api";
import { queryKeys } from "../../query-keys";

const STALE_TIME = 15 * 60_000;

export function useDiscoverMoviesInfinite(enabled = true) {
  return useInfiniteQuery<
    { items: MovieSummary[]; hasNext: boolean },
    Error,
    { pages: { items: MovieSummary[]; hasNext: boolean }[]; pageParams: number[] },
    ReturnType<typeof queryKeys.discover.movies>,
    number
  >({
    queryKey: queryKeys.discover.movies(),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error } = await getDiscoverMovies({ query: { page: pageParam } });
      if (error) throw error;
      return { items: data?.movies ?? [], hasNext: data?.page?.hasNext ?? false };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useDiscoverShowsInfinite(enabled = true) {
  return useInfiniteQuery<
    { items: ShowSummary[]; hasNext: boolean },
    Error,
    { pages: { items: ShowSummary[]; hasNext: boolean }[]; pageParams: number[] },
    ReturnType<typeof queryKeys.discover.shows>,
    number
  >({
    queryKey: queryKeys.discover.shows(),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error } = await getDiscoverShows({ query: { page: pageParam } });
      if (error) throw error;
      return { items: data?.shows ?? [], hasNext: data?.page?.hasNext ?? false };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    staleTime: STALE_TIME,
    enabled,
  });
}
