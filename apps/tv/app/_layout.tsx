import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { Stack, ThemeProvider, useRouter, useSegments, type RelativePathString } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingView } from "@/src/components/layout/LoadingView";
import { SkeletonProvider } from "@/src/components/layout/Skeleton";
import { AuthProvider, useAuth } from "@/src/store/auth";
import { queryClient } from "@/src/lib/api/query-client";
import { darkColors } from "@/src/theme/colors";
import { lunarrNavigationTheme, playerScreenOptions, stackScreenOptions } from "@/src/theme/navigation";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const typedSegments = segments as string[];
  const firstSegment = typedSegments[0];

  useEffect(() => {
    if (isLoading) return;
    const onConnect = firstSegment === "(auth)";
    if (!isAuthenticated && !onConnect) {
      router.replace("/(auth)/connect" as RelativePathString);
    } else if (isAuthenticated && onConnect) {
      router.replace("/(tabs)" as RelativePathString);
    }
  }, [isAuthenticated, isLoading, router, firstSegment]);

  if (isLoading) {
    return <LoadingView />;
  }

  return <>{children}</>;
}

function TVApp() {
  return (
    <ThemeProvider value={lunarrNavigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1, backgroundColor: darkColors.bg },
          ...stackScreenOptions,
        }}
      >
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="shows/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="shows/[id]/seasons/[seasonId]" options={{ headerShown: false }} />
        <Stack.Screen name="episodes/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="people/[provider]/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="search/results" options={{ headerShown: false }} />
        <Stack.Screen name="discover/movies" options={{ headerShown: false }} />
        <Stack.Screen name="discover/shows" options={{ headerShown: false }} />
        <Stack.Screen name="player" options={playerScreenOptions} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
      focusManager.setFocused(status === "active");
    });
    return () => subscription.remove();
  }, []);
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SkeletonProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <AuthGate>
              <TVApp />
            </AuthGate>
          </QueryClientProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </SkeletonProvider>
  );
}
