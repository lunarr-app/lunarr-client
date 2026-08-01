import { Pressable, StyleSheet, Text } from "react-native";

import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

type Props = {
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  onPress: () => void;
  autoFocus?: boolean;
};

export function ActionButton({ label, icon: Icon, onPress, autoFocus }: Props) {
  const { scale } = useTVScale();

  const actionStyle = {
    gap: spacing.md * scale,
    paddingHorizontal: spacing.xl * scale,
    paddingVertical: spacing.md * scale,
    borderRadius: radii.control * scale,
    borderWidth: Math.max(1, 3 * scale),
    minHeight: 56 * scale,
  };
  const actionFocusedStyle = { borderWidth: Math.max(1, 3 * scale) };
  const labelStyle = { fontSize: typography.fontSize.body * scale };
  const iconSize = Math.round(26 * scale);

  return (
    <Pressable
      onPress={onPress}
      hasTVPreferredFocus={autoFocus}
      focusable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ focused }) => [
        styles.action,
        actionStyle,
        focused && styles.actionFocused,
        focused && actionFocusedStyle,
      ]}
    >
      <Icon color={darkColors.accent} size={iconSize} />
      <Text style={[styles.actionLabel, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: darkColors.surfaceStrong,
    borderColor: "transparent",
  },
  actionFocused: {
    borderColor: darkColors.accent,
    backgroundColor: darkColors.surface,
    transform: [{ scale: 1.02 }],
  },
  actionLabel: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
});
