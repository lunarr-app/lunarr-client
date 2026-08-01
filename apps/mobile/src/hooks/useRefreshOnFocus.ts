import { useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

export function useRefreshOnFocus(keys: QueryKey[], enabled = true) {
  const queryClient = useQueryClient();
  const firstTimeRef = useRef(true);
  const keysRef = useRef(keys);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    keysRef.current = keys;
    enabledRef.current = enabled;
  });

  useFocusEffect(() => {
    if (firstTimeRef.current) {
      firstTimeRef.current = false;
      return;
    }
    if (!enabledRef.current) return;

    for (const queryKey of keysRef.current) {
      void queryClient.refetchQueries({ queryKey, stale: true, type: "active" });
    }
  });
}
