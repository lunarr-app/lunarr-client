import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getMovies, type MovieRowsResponse } from "@lunarr/api";
import { queryKeys } from "@lunarr/core";

export const MOVIE_LIST_STALE_TIME = 60_000;

export function useMovieList(sort: string, search?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.movies.list(sort, undefined, search),
    queryFn: async ({ pageParam }) => {
      const { data, error } = await getMovies({
        query: {
          rail: "all",
          sort: sort as "title" | "recent" | "year_desc" | "rating" | "release_date",
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
  });
}
