import { Stack } from "expo-router";
import { darkColors } from "@/src/theme/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { flex: 1, backgroundColor: darkColors.bg },
      }}
    >
      <Stack.Screen name="connect" />
    </Stack>
  );
}
