import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getMovies,
  getShows,
  type MovieRowsResponse,
  type ShowRowsResponse,
  type MovieSummary,
  type ShowSummary,
} from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

export function useSearchMovies(query: string) {
  return useInfiniteQuery<
    { items: MovieSummary[]; hasNext: boolean },
    Error,
    { pages: { items: MovieSummary[]; hasNext: boolean }[]; pageParams: number[] },
    ReturnType<typeof queryKeys.search.movies>,
    number
  >({
    queryKey: queryKeys.search.movies(query),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error } = await getMovies({
        query: { rail: "all", sort: "title", search: query, page: pageParam },
      });
      if (error) throw error;
      const rows = data as MovieRowsResponse;
      return { items: rows.all ?? [], hasNext: rows.allPage?.hasNext ?? false };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    enabled: query.trim().length >= 2,
  });
}

export function useSearchShows(query: string) {
  return useInfiniteQuery<
    { items: ShowSummary[]; hasNext: boolean },
    Error,
    { pages: { items: ShowSummary[]; hasNext: boolean }[]; pageParams: number[] },
    ReturnType<typeof queryKeys.search.shows>,
    number
  >({
    queryKey: queryKeys.search.shows(query),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error } = await getShows({
        query: { rail: "all", sort: "title", search: query, page: pageParam },
      });
      if (error) throw error;
      const rows = data as ShowRowsResponse;
      return { items: rows.all ?? [], hasNext: rows.allPage?.hasNext ?? false };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    enabled: query.trim().length >= 2,
  });
}
