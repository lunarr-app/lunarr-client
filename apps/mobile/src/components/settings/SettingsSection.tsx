import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  children: ReactNode;
  headerAction?: ReactNode;
  bordered?: boolean;
};

export function SettingsSection({ title, children, headerAction, bordered = true }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>{title}</Text>
        {headerAction}
      </View>
      {bordered ? (
        <View style={[styles.card, { backgroundColor: darkColors.surfaceStrong, borderColor: darkColors.border }]}>
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing.xs,
  },
  heading: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontSize: typography.fontSize.caption,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
