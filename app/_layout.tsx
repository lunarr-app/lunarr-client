import { Slot } from "expo-router";
import { useProtectedRoute } from "@store/auth";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";

// Customize the DarkTheme
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#1f1f1f", // Dark background color
    card: "#252525", // Dark card background color
    text: "#ffffff", // White text color
    border: "#999999", // Gray border color
  },
};

export default function Root() {
  useProtectedRoute();

  return (
    <ThemeProvider value={CustomDarkTheme}>
      <Slot />
    </ThemeProvider>
  );
}
