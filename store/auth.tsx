import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAtom } from "jotai";
import { userAtom } from "./user";
import { clearApiKeyHeader, setApiKeyHeader } from "@backend/api";

const authRoute = "(auth)";
const protectedRoutes = ["movies"];

export const useProtectedRoute = () => {
  const [user] = useAtom(userAtom);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const segment = segments[0];

    if (!user && protectedRoutes.includes(segment)) {
      router.replace("/login");
    }

    if (user && segment === authRoute) {
      router.replace("/movies");
    }
  }, [user, segments, router]);

  useEffect(() => {
    if (user?.api_key) {
      setApiKeyHeader(user.api_key);

      return clearApiKeyHeader;
    }
  }, [user]);
};
