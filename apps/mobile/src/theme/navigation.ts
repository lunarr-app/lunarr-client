import { DarkTheme } from "expo-router";

import { darkColors } from "@/src/theme/colors";

export const lunarrNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.accent,
    background: darkColors.bg,
    card: darkColors.card,
    text: darkColors.text,
    border: darkColors.border,
  },
};

/** Native stack swipe-back (iOS). See https://docs.expo.dev/router/advanced/stack/ */
export const stackScreenOptions = {
  headerStyle: { backgroundColor: darkColors.card },
  headerTintColor: darkColors.text,
  headerTitleStyle: { color: darkColors.text },
  headerShadowVisible: false,
  headerBackTitleVisible: true,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  gestureDirection: "horizontal" as const,
} as const;

export const playerScreenOptions = {
  headerShown: false,
  presentation: "card" as const,
  animation: "slide_from_right" as const,
  contentStyle: { flex: 1, backgroundColor: "#000" },
} as const;
