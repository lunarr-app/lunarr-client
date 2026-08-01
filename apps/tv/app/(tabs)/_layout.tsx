import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { TopMenu } from "@/src/components/navigation/TopMenu";
import { darkColors } from "@/src/theme/colors";

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <TopMenu />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1, backgroundColor: darkColors.bg },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="movies" />
        <Stack.Screen name="shows" />
        <Stack.Screen name="watchlist" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
