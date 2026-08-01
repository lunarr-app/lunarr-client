import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getMovies, type MovieRowsResponse, type MovieSummary } from "@lunarr/api";
import { queryKeys } from "@/src/lib/api/query-keys";

export const MOVIE_LIST_STALE_TIME = 60_000;

export function useMovieList(sort: string, status: string | undefined, search: string | undefined, enabled: boolean) {
  return useInfiniteQuery<
    { items: MovieSummary[]; hasNext: boolean },
    Error,
    { pages: { items: MovieSummary[]; hasNext: boolean }[]; pageParams: number[] },
    ReturnType<typeof queryKeys.movies.list>,
    number
  >({
    queryKey: queryKeys.movies.list(sort, status, search),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error } = await getMovies({
        query: {
          rail: "all",
          sort: sort as "title" | "recent" | "year_desc" | "rating" | "release_date",
          status: status as "all" | "watched" | "unwatched" | undefined,
          search: search || undefined,
          page: pageParam,
        },
      });
      if (error) throw error;
      const rows = data as MovieRowsResponse;
      return { items: rows.all ?? [], hasNext: rows.allPage?.hasNext ?? false };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: MOVIE_LIST_STALE_TIME,
    enabled,
  });
}
