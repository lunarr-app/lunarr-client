import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function HeroFactChip({ children }: { children: string }) {
  const { scale } = useTVScale();
  return (
    <Text
      style={[
        styles.chip,
        {
          paddingHorizontal: spacing.md * scale,
          paddingVertical: spacing.xs * scale,
          borderRadius: radii.pill * scale,
          fontSize: typography.fontSize.body * scale,
          borderWidth: Math.max(1, 1 * scale),
        },
      ]}
    >
      {children}
    </Text>
  );
}

export function HeroFactsRow({ children }: { children: ReactNode }) {
  const { scale } = useTVScale();
  return <View style={[styles.row, { gap: spacing.sm * scale }]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    color: darkColors.textSoft,
    backgroundColor: "rgba(248,250,252,0.1)",
    borderColor: "rgba(255,255,255,0.22)",
  },
});
