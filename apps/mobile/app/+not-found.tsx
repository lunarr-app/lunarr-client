import { EmptyState } from "@/src/components/catalog/EmptyState";
import { Screen } from "@/src/components/layout/Screen";
import { Button } from "@/src/components/ui/Button";
import { spacing } from "@/src/theme/spacing";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen edges={["top", "left", "right", "bottom"]}>
      <View style={styles.container}>
        <EmptyState
          title="Screen not found"
          message="This screen doesn't exist."
          actions={
            <>
              <Button mode="contained" onPress={() => router.replace("/(tabs)/movies")}>
                Browse movies
              </Button>
              <Button mode="outlined" onPress={() => router.replace("/(tabs)/shows")}>
                Browse shows
              </Button>
            </>
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
});
