import { useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useQueryClient, type InfiniteData, type QueryKey } from "@tanstack/react-query";

export function useRefreshFirstPageOnFocus(queryKey: QueryKey, enabled: boolean, staleTime: number) {
  const queryClient = useQueryClient();
  const firstTimeRef = useRef(true);
  const keyRef = useRef(queryKey);
  const enabledRef = useRef(enabled);
  const staleTimeRef = useRef(staleTime);

  useEffect(() => {
    keyRef.current = queryKey;
    enabledRef.current = enabled;
    staleTimeRef.current = staleTime;
  });

  useFocusEffect(() => {
    if (firstTimeRef.current) {
      firstTimeRef.current = false;
      return;
    }
    if (!enabledRef.current) return;

    const key = keyRef.current;
    const state = queryClient.getQueryState(key);
    if (!state || Date.now() - state.dataUpdatedAt < staleTimeRef.current) return;

    queryClient.setQueryData<InfiniteData<unknown, unknown>>(key, (data) =>
      data && data.pages.length > 1 ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) } : data,
    );
    void queryClient.refetchQueries({ queryKey: key, type: "active" });
  });
}
