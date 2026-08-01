import { type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

type Props = {
  title: string;
  message?: string;
  icon?: LucideIcon;
};

export function EmptyState({ title, message, icon: Icon }: Props) {
  const { scale } = useTVScale();
  const wrapStyle = { gap: spacing.md * scale, padding: spacing.xl * scale };
  const iconChipStyle = {
    width: 104 * scale,
    height: 104 * scale,
    borderRadius: 52 * scale,
    borderWidth: 2 * scale,
    marginBottom: spacing.md * scale,
  };
  const titleStyle = { fontSize: typography.fontSize.heading * scale };
  const messageStyle = {
    fontSize: typography.fontSize.body * scale,
    maxWidth: 600 * scale,
    lineHeight: typography.lineHeight.relaxed * scale,
  };

  return (
    <View style={[styles.wrap, wrapStyle]}>
      {Icon ? (
        <View style={[styles.iconChip, iconChipStyle]}>
          <Icon size={52 * scale} strokeWidth={1.5} color={darkColors.muted} />
        </View>
      ) : null}
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {message ? <Text style={[styles.message, messageStyle]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surfaceStrong,
    borderColor: darkColors.border,
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
  },
  message: {
    color: darkColors.muted,
    textAlign: "center",
  },
});
