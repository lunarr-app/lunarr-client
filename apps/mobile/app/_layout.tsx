import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { AppState, StyleSheet, type AppStateStatus } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingView } from "@/src/components/layout/LoadingView";
import { SkeletonProvider } from "@/src/components/layout/Skeleton";
import { queryClient } from "@/src/lib/api/query-client";
import { AuthProvider, useAuth } from "@/src/store/auth";
import { darkColors } from "@/src/theme/colors";
import { lunarrNavigationTheme, playerScreenOptions, stackScreenOptions } from "@/src/theme/navigation";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const firstSegment = segments[0];

  useEffect(() => {
    if (isLoading) return;
    const inAuth = firstSegment === "(auth)";
    if (!isAuthenticated && !inAuth) {
      router.replace("/(auth)/connect");
    } else if (isAuthenticated && inAuth) {
      router.replace("/(tabs)/movies");
    }
  }, [isAuthenticated, isLoading, router, firstSegment]);

  if (isLoading) {
    return <LoadingView />;
  }

  return <>{children}</>;
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
    <GestureHandlerRootView style={rootStyles.root}>
      <SkeletonProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <AuthGate>
                <ThemeProvider value={lunarrNavigationTheme}>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: rootStyles.root,
                      ...stackScreenOptions,
                    }}
                  >
                    <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
                    <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
                    <Stack.Screen name="movies/[id]" />
                    <Stack.Screen name="shows/[id]" />
                    <Stack.Screen name="shows/[id]/seasons/[seasonId]" />
                    <Stack.Screen name="episodes/[id]" />
                    <Stack.Screen name="people/[provider]/[id]" />
                    <Stack.Screen name="player" options={playerScreenOptions} />
                  </Stack>
                </ThemeProvider>
              </AuthGate>
            </QueryClientProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </SkeletonProvider>
    </GestureHandlerRootView>
  );
}

const rootStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: darkColors.bg },
});
