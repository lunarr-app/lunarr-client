import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

const STALE_TIME = 5 * 60_000;

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health.all,
    queryFn: async () => {
      const { data, error } = await getHealth();
      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
  });
}
