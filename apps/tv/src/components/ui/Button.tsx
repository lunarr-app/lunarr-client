import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { FocusRing } from "./FocusRing";

type Mode = "contained" | "outlined" | "text";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  mode?: Mode;
  compact?: boolean;
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** @deprecated Button now scales itself via useTVScale(); prop kept for compatibility. */
  scale?: number;
  allowFontScaling?: boolean;
};

export function Button({
  children,
  onPress,
  mode = "contained",
  compact = false,
  block = false,
  loading = false,
  disabled = false,
  scale: _scale,
  allowFontScaling = true,
}: Props) {
  const isDisabled = disabled || loading;
  const { scale } = useTVScale();
  const resolvedTextColor =
    mode === "contained" ? darkColors.buttonText : mode === "text" ? darkColors.accent : darkColors.text;
  const labelFontSize = (compact ? typography.fontSize.label : typography.fontSize.body) * scale;

  const baseSizeStyle = { minHeight: (compact ? 48 : 64) * scale, borderRadius: radii.control * scale };
  const contentSizeStyle = {
    paddingHorizontal: (compact ? spacing.lg : spacing.xl) * scale,
    paddingVertical: spacing.sm * scale,
  };
  const labelSizeStyle = { fontSize: labelFontSize, lineHeight: labelFontSize * 1.25 };

  return (
    <Pressable
      accessibilityRole="button"
      focusable={!isDisabled}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        baseSizeStyle,
        block ? styles.block : null,
        mode === "contained" ? styles.contained : null,
        mode === "outlined" ? styles.outlined : null,
        mode === "text" ? styles.text : null,
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
      ]}
    >
      {({ focused }) => (
        <FocusRing
          focused={focused && !isDisabled}
          width={Math.max(2, 4 * scale)}
          color={darkColors.accent}
          radius={radii.control * scale}
          style={styles.focusRing}
        >
          <View style={[styles.content, contentSizeStyle, mode === "text" && styles.contentText]}>
            {loading ? (
              <ActivityIndicator color={resolvedTextColor} size="small" />
            ) : (
              <Text
                style={[styles.label, labelSizeStyle, { color: resolvedTextColor }]}
                numberOfLines={1}
                allowFontScaling={allowFontScaling}
              >
                {children}
              </Text>
            )}
          </View>
        </FocusRing>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  block: {
    alignSelf: "stretch",
  },
  contained: {
    backgroundColor: darkColors.accentStrong,
  },
  outlined: {
    backgroundColor: darkColors.surfaceStrong,
    borderWidth: 2,
    borderColor: darkColors.border,
  },
  text: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.9,
  },
  focusRing: {
    flex: 1,
    alignSelf: "stretch",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    flex: 1,
  },
  contentText: {
    paddingHorizontal: spacing.md,
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
    paddingHorizontal: 4,
  },
});
