import { useQuery } from "@tanstack/react-query";
import { getWatchlist } from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

export function useWatchlist() {
  return useQuery({
    queryKey: queryKeys.watchlist.all,
    queryFn: async () => {
      const { data, error } = await getWatchlist();
      if (error) throw error;
      return data;
    },
  });
}
