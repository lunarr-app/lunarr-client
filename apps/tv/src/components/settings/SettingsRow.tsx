import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  onPress?: () => void;
  isLast?: boolean;
  showChevron?: boolean;
};

export function SettingsRow({ icon: Icon, title, description, onPress, isLast = false, showChevron = true }: Props) {
  const { scale } = useTVScale();
  const interactive = Boolean(onPress);
  const titleColor = darkColors.text;
  const iconColor = darkColors.accent;
  const borderWidth = Math.max(1, 3 * scale);

  const rowStyle = {
    gap: spacing.lg * scale,
    paddingHorizontal: spacing.lg * scale,
    paddingVertical: spacing.lg * scale,
    borderWidth,
    borderRadius: radii.card * scale,
    minHeight: 72 * scale,
  };
  const separatorStyle = { borderBottomWidth: Math.max(1, 2 * scale) };
  const iconWrapStyle = { width: 32 * scale };
  const copyStyle = { gap: spacing.xs * scale };
  const titleStyle = { fontSize: typography.fontSize.title * scale };
  const descriptionStyle = { fontSize: typography.fontSize.body * scale };
  const iconSize = Math.round(24 * scale);

  return (
    <Pressable
      onPress={onPress}
      disabled={!interactive}
      focusable={interactive}
      accessibilityRole="button"
      style={({ pressed, focused }) => [
        styles.row,
        rowStyle,
        !isLast && styles.separator,
        !isLast && separatorStyle,
        (pressed || focused) && interactive && styles.active,
        (pressed || focused) && interactive && { borderWidth },
      ]}
    >
      <Icon size={iconSize} color={iconColor} style={[styles.icon, iconWrapStyle]} />
      <View style={[styles.copy, copyStyle]}>
        <Text style={[styles.title, titleStyle, { color: titleColor }]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, descriptionStyle, { color: darkColors.muted }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {showChevron ? <ChevronRight size={iconSize} color={darkColors.muted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "transparent",
  },
  separator: {
    borderBottomColor: darkColors.border,
  },
  active: {
    borderColor: darkColors.accent,
    backgroundColor: darkColors.surfaceStrong,
  },
  icon: {
    alignItems: "center",
  },
  copy: {
    flex: 1,
  },
  title: {
    fontWeight: typography.fontWeight.medium,
  },
  description: {},
});
