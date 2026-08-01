import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  message: string;
  actions?: ReactNode;
};

export function EmptyState({ title, message, actions }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xl,
    gap: spacing.md,
    maxWidth: 520,
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.heavy,
    fontSize: typography.fontSize.large,
  },
  message: {
    color: darkColors.muted,
    lineHeight: typography.lineHeight.relaxed,
    fontSize: typography.fontSize.label,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
