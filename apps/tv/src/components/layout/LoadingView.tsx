import { darkColors } from "@/src/theme/colors";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type Props = {
  size?: "small" | "large";
};

export function LoadingView({ size = "large" }: Props) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={darkColors.accent} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
