import { Stack } from "expo-router";

export default function MoviesLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }} />;
}
