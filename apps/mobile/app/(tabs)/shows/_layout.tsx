import { Stack } from "expo-router";

export default function ShowsLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }} />;
}
