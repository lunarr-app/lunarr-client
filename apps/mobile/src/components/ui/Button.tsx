import { darkColors } from "@/src/theme/colors";
import { compactControlHeight, compactControlHeightSmall, radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

type Mode = "contained" | "outlined" | "text";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  mode?: Mode;
  compact?: boolean;
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: () => ReactNode;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function Button({
  children,
  onPress,
  mode = "contained",
  compact = false,
  block = false,
  loading = false,
  disabled = false,
  icon,
  textColor,
  style,
  labelStyle,
}: Props) {
  const isDisabled = disabled || loading;
  const resolvedTextColor =
    textColor ?? (mode === "contained" ? darkColors.buttonText : mode === "text" ? darkColors.accent : darkColors.text);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: compactControlHeight,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          gap: spacing.sm,
        },
        compact
          ? {
              minHeight: compactControlHeightSmall,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
            }
          : null,
        block ? styles.block : null,
        mode === "contained" ? styles.contained : null,
        mode === "outlined" ? styles.outlined : null,
        mode === "text" ? styles.text : null,
        isDisabled ? styles.disabled : null,
        pressed && !isDisabled ? styles.pressed : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={resolvedTextColor} size="small" />
      ) : (
        <>
          {icon ? icon() : null}
          <Text
            style={[
              styles.label,
              {
                fontSize: compact ? typography.fontSize.meta : typography.fontSize.label,
                color: resolvedTextColor,
              },
              icon ? styles.labelWithIcon : null,
              labelStyle,
            ]}
            numberOfLines={1}
          >
            {children}
          </Text>
        </>
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
    borderRadius: radii.control,
  },
  block: {
    alignSelf: "stretch",
  },
  contained: {
    backgroundColor: darkColors.accentStrong,
  },
  outlined: {
    backgroundColor: darkColors.buttonSecondary,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  text: {
    backgroundColor: "transparent",
    paddingHorizontal: spacing.sm,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontWeight: typography.fontWeight.bold,
  },
  labelWithIcon: {
    flexShrink: 1,
  },
});
