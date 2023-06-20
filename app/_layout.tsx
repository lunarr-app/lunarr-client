import { Slot } from "expo-router";
import { useProtectedRoute } from "@store/auth";
import { ThemeProvider, DarkTheme as NavigationDarkTheme } from "@react-navigation/native";
import { Provider as PaperProvider, MD3DarkTheme } from "react-native-paper";

// Customize the DarkTheme
const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...MD3DarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...MD3DarkTheme.colors,
  },
};

export default function Root() {
  useProtectedRoute();

  return (
    <PaperProvider theme={CombinedDarkTheme}>
      <ThemeProvider value={CombinedDarkTheme}>
        <Slot />
      </ThemeProvider>
    </PaperProvider>
  );
}
