import { darkColors } from "@/src/theme/colors";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

export function InfoLabel({ children }: { children: ReactNode }) {
  const { scale } = useTVScale();
  return (
    <Text style={[styles.label, { fontSize: typography.fontSize.meta * scale, letterSpacing: 0.8 * scale }]}>
      {children}
    </Text>
  );
}

export function InfoMuted({ children }: { children: ReactNode }) {
  const { scale } = useTVScale();
  return (
    <Text
      style={[
        styles.muted,
        { fontSize: typography.fontSize.body * scale, lineHeight: typography.lineHeight.normal * scale },
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: darkColors.muted,
    textTransform: "uppercase",
  },
  muted: {
    color: darkColors.muted,
  },
});
