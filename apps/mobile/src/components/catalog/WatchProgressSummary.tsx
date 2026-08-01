import { ProgressTrack } from "@/src/components/catalog/ProgressTrack";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  watched: number;
  total: number;
  label?: string;
};

export function WatchProgressSummary({ watched, total, label = "Watched" }: Props) {
  const percent = total > 0 ? Math.round((watched / total) * 100) : 0;

  return (
    <View style={styles.wrap} accessibilityLabel={`${watched} of ${total} episodes watched`}>
      <View style={styles.copy}>
        <Text style={styles.count}>
          {watched}/{total}
        </Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <ProgressTrack percent={percent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  copy: { gap: 2 },
  count: { color: darkColors.text, fontWeight: typography.fontWeight.heavy, fontSize: typography.fontSize.title },
  label: { color: darkColors.muted, fontSize: typography.fontSize.meta },
});
