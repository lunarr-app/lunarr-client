import { useQuery } from "@tanstack/react-query";
import { getShows } from "@lunarr/api";
import { queryKeys } from "@/src/lib/api/query-keys";

const STALE_TIME = 60_000;

export function useShowsBrowse() {
  return useQuery({
    queryKey: queryKeys.shows.browse("recent,latest,popular"),
    queryFn: async () => {
      const { data, error } = await getShows({ query: { rail: "recent,latest,popular" } });
      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
  });
}
