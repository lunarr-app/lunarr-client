import { useInfiniteQuery } from "@tanstack/react-query";
import { getSimilarMovies, getSimilarShows, type MovieSummary, type ShowSummary } from "@lunarr/api";
import { queryKeys } from "../../query-keys";

const STALE_TIME = 15 * 60_000;

export function useSimilarMovies(mediaId: string, enabled = true) {
  return useInfiniteQuery<
    { title: string; items: MovieSummary[]; hasNext: boolean },
    Error,
    { pages: { title: string; items: MovieSummary[]; hasNext: boolean }[]; pageParams: number[] },
    ReturnType<typeof queryKeys.movies.similar>,
    number
  >({
    queryKey: queryKeys.movies.similar(mediaId),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error } = await getSimilarMovies({ path: { id: mediaId }, query: { page: pageParam } });
      if (error) throw error;
      return { title: data.movie.title, items: data.movies, hasNext: data.page.hasNext };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    staleTime: STALE_TIME,
    enabled: enabled && !!mediaId,
  });
}

export function useSimilarShows(mediaId: string, enabled = true) {
  return useInfiniteQuery<
    { title: string; items: ShowSummary[]; hasNext: boolean },
    Error,
    { pages: { title: string; items: ShowSummary[]; hasNext: boolean }[]; pageParams: number[] },
    ReturnType<typeof queryKeys.shows.similar>,
    number
  >({
    queryKey: queryKeys.shows.similar(mediaId),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data, error } = await getSimilarShows({ path: { id: mediaId }, query: { page: pageParam } });
      if (error) throw error;
      return { title: data.show.title, items: data.shows, hasNext: data.page.hasNext };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length + 1 : undefined),
    staleTime: STALE_TIME,
    enabled: enabled && !!mediaId,
  });
}
