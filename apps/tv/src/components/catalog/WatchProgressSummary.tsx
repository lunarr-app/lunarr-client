import { ProgressTrack } from "@/src/components/catalog/ProgressTrack";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  watched: number;
  total: number;
  label?: string;
};

export function WatchProgressSummary({ watched, total, label = "Watched" }: Props) {
  const { scale } = useTVScale();
  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

  const wrapStyle = { gap: spacing.sm * scale };
  const copyStyle = { gap: spacing.xs * scale };
  const countStyle = { fontSize: typography.fontSize.large * scale };
  const labelStyle = { fontSize: typography.fontSize.body * scale };

  return (
    <View style={[styles.wrap, wrapStyle]} accessibilityLabel={`${watched} of ${total} episodes watched`}>
      <View style={[styles.copy, copyStyle]}>
        <Text style={[styles.count, countStyle]}>
          {watched}/{total}
        </Text>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </View>
      <ProgressTrack percent={percent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
  },
  copy: {},
  count: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  label: { color: darkColors.muted },
});
