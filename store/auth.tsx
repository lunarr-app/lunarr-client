import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAtom } from "jotai";
import { userAtom } from "./user";
import { clearApiKeyHeader, setApiKeyHeader } from "@backend/api";

export const useProtectedRoute = () => {
  const [user] = useAtom(userAtom);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/");
    }
  }, [user, segments, router]);

  useEffect(() => {
    if (user?.api_key) {
      setApiKeyHeader(user.api_key);

      return clearApiKeyHeader;
    }
  }, [user]);
};
