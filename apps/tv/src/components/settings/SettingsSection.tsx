import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  children: ReactNode;
  bordered?: boolean;
};

export function SettingsSection({ title, children, bordered = true }: Props) {
  const { scale } = useTVScale();

  const sectionStyle = { gap: spacing.md * scale };
  const headingStyle = { fontSize: typography.fontSize.body * scale, letterSpacing: 0.6 * scale };
  const cardStyle = { borderRadius: radii.card * scale, borderWidth: Math.max(1, 2 * scale) };

  return (
    <View style={[styles.section, sectionStyle]}>
      <View style={styles.headingRow}>
        <Text style={[styles.heading, headingStyle]}>{title}</Text>
      </View>
      {bordered ? (
        <View
          style={[
            styles.card,
            cardStyle,
            { backgroundColor: darkColors.surfaceStrong, borderColor: darkColors.border },
          ]}
        >
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  card: {
    overflow: "hidden",
  },
});
