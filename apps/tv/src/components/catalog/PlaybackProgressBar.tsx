import { ProgressTrack } from "@/src/components/catalog/ProgressTrack";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  percent: number;
};

export function PlaybackProgressBar({ label, percent }: Props) {
  const { scale } = useTVScale();
  const clamped = Math.max(0, Math.min(100, percent));

  const wrapStyle = { gap: spacing.xs * scale };
  const labelStyle = { fontSize: typography.fontSize.body * scale };

  return (
    <View
      style={[styles.wrap, wrapStyle]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      accessibilityLabel={label}
    >
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <ProgressTrack percent={clamped} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
  },
  label: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.semibold,
  },
});
