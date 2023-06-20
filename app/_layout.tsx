import { Slot } from "expo-router";
import { useProtectedRoute } from "@store/auth";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";

export default function Root() {
  useProtectedRoute();

  return (
    <ThemeProvider value={DarkTheme}>
      <Slot />
    </ThemeProvider>
  );
}
