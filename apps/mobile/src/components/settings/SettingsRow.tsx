import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  onPress?: () => void;
  isLast?: boolean;
  showChevron?: boolean;
  trailing?: ReactNode;
  destructive?: boolean;
};

export function SettingsRow({
  icon: Icon,
  title,
  description,
  onPress,
  isLast = false,
  showChevron = true,
  trailing,
  destructive = false,
}: Props) {
  const interactive = Boolean(onPress || trailing);
  const titleColor = destructive ? darkColors.dangerText : darkColors.text;
  const iconColor = destructive ? darkColors.dangerText : darkColors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={!interactive}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, !isLast && styles.separator, pressed && interactive && styles.pressed]}
    >
      <Icon size={scaleNum(22)} color={iconColor} style={styles.icon} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing ?? (showChevron ? <ChevronRight size={scaleNum(20)} color={darkColors.muted} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: darkColors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 24,
    alignItems: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.body,
  },
  description: {
    fontSize: typography.fontSize.caption,
    color: darkColors.muted,
  },
});
