import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { FocusRing } from "./FocusRing";

type Props = Omit<TextInputProps, "style"> & {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  allowFontScaling?: boolean;
};

export function TextField({
  label,
  containerStyle,
  style,
  allowFontScaling = true,
  placeholderTextColor = darkColors.muted,
  onFocus,
  onBlur,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { scale } = useTVScale();

  const labelStyle = { fontSize: typography.fontSize.body * scale };
  const fieldSizeStyle = { minHeight: 64 * scale, borderRadius: radii.control * scale };
  const inputSizeStyle = {
    fontSize: typography.fontSize.body * scale,
    paddingVertical: spacing.sm * scale,
    paddingHorizontal: spacing.md * scale,
  };

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <Text style={[styles.label, labelStyle, focused && styles.labelFocused]} allowFontScaling={allowFontScaling}>
          {label}
        </Text>
      ) : null}
      <Pressable
        accessible
        focusable
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPress={() => inputRef.current?.focus()}
        style={[styles.field, fieldSizeStyle, focused && styles.fieldFocused, style]}
      >
        <FocusRing
          focused={focused}
          width={Math.max(2, 2 * scale)}
          color={darkColors.accent}
          radius={radii.control * scale}
          style={styles.ring}
        >
          <TextInput
            ref={inputRef}
            {...inputProps}
            allowFontScaling={allowFontScaling}
            focusable={false}
            placeholderTextColor={placeholderTextColor}
            selectionColor={darkColors.accent}
            style={[styles.input, inputSizeStyle]}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
          />
        </FocusRing>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    alignSelf: "stretch",
    width: "100%",
  },
  label: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.medium,
  },
  labelFocused: {
    color: darkColors.accent,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    borderWidth: 2,
    borderColor: darkColors.borderControl,
    backgroundColor: darkColors.inputBg,
    paddingHorizontal: 0,
  },
  fieldFocused: {
    borderColor: darkColors.accent,
  },
  ring: {
    flex: 1,
  },
  input: {
    flex: 1,
    color: darkColors.text,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
});
