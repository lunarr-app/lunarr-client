import { useQuery } from "@tanstack/react-query";
import { getMovies } from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

const STALE_TIME = 60_000;

export function useMoviesBrowse() {
  return useQuery({
    queryKey: queryKeys.movies.browse("recent,latest,popular"),
    queryFn: async () => {
      const { data, error } = await getMovies({ query: { rail: "recent,latest,popular" } });
      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
  });
}
