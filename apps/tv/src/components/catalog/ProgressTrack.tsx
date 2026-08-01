import { darkColors } from "@/src/theme/colors";
import { radii } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { StyleSheet, View } from "react-native";

type Props = {
  percent: number;
  height?: number;
};

export function ProgressTrack({ percent, height }: Props) {
  const { scale } = useTVScale();
  const clamped = Math.max(0, Math.min(100, percent));
  const trackHeight = height ?? 12 * scale;

  return (
    <View style={[styles.track, { height: trackHeight, borderRadius: radii.pill * scale }]}>
      <View style={[styles.fill, { width: `${clamped}%`, borderRadius: radii.pill * scale }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    backgroundColor: darkColors.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: darkColors.accent,
  },
});
