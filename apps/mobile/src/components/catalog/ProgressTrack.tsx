import { darkColors } from "@/src/theme/colors";
import { radii } from "@/src/theme/spacing";
import { StyleSheet, View } from "react-native";

type Props = {
  percent: number;
  height?: number;
};

export function ProgressTrack({ percent, height = 5 }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    borderRadius: radii.pill,
    backgroundColor: darkColors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: darkColors.accent,
  },
});
