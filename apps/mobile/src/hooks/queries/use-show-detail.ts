import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getShow, toggleWatchlist } from "@lunarr/api";
import { queryKeys } from "@/src/lib/api/query-keys";

export function useShowDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shows.detail(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Missing show id");
      const { data, error } = await getShow({ path: { id } });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useToggleShowWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mediaItemId }: { mediaItemId: string }) => {
      const { data, error } = await toggleWatchlist({ body: { mediaItemId } });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shows.detail(variables.mediaItemId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.all });
    },
  });
}
