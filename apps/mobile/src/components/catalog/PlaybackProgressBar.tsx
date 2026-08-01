import { ProgressTrack } from "@/src/components/catalog/ProgressTrack";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  percent: number;
};

export function PlaybackProgressBar({ label, percent }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
      <ProgressTrack percent={clamped} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    gap: spacing.xs,
  },
  label: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.meta,
  },
});
