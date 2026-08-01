import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getShows, type ShowRowsResponse } from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

export const SHOW_LIST_STALE_TIME = 120_000;

export function useShowList(sort: string, search?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.shows.list(sort, search),
    queryFn: async ({ pageParam }) => {
      const { data, error } = await getShows({
        query: {
          rail: "all",
          sort: sort as "title" | "recent" | "latest" | "popular",
          search: search || undefined,
          page: pageParam,
        },
      });
      if (error) throw error;
      const rows = data as ShowRowsResponse;
      return { items: rows.all ?? [], hasNext: rows.allPage?.hasNext ?? false };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    placeholderData: keepPreviousData,
    staleTime: SHOW_LIST_STALE_TIME,
  });
}
