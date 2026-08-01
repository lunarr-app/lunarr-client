import { useQuery } from "@tanstack/react-query";
import { getPerson } from "@lunarr/api";
import { queryKeys } from "../../query-keys";

const STALE_TIME = 5 * 60_000;

export function usePersonDetail(provider: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.people.detail(provider ?? "", id ?? ""),
    queryFn: async () => {
      if (!provider || !id) throw new Error("Missing person identifier");
      const { data, error } = await getPerson({ path: { provider, id } });
      if (error) throw error;
      return data;
    },
    enabled: !!provider && !!id,
    staleTime: STALE_TIME,
  });
}
