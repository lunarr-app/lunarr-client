import { darkColors } from "@/src/theme/colors";
import { compactControlHeight, radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { type ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";

type Props = Omit<TextInputProps, "style"> & {
  label?: string;
  dense?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  dense = false,
  left,
  right,
  containerStyle,
  style,
  placeholderTextColor = darkColors.muted,
  ...inputProps
}: Props) {
  return (
    <View style={[{ gap: spacing.xs }, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          {
            minHeight: dense ? compactControlHeight : compactControlHeight + 8,
            paddingHorizontal: dense ? spacing.sm : spacing.md,
          },
          style,
        ]}
      >
        {left ? <View style={styles.left}>{left}</View> : null}
        <TextInput
          {...inputProps}
          placeholderTextColor={placeholderTextColor}
          style={[
            styles.input,
            {
              fontSize: dense ? typography.fontSize.body : typography.fontSize.label,
              paddingVertical: dense ? 0 : spacing.sm,
            },
            dense ? { minHeight: compactControlHeight - 2 } : null,
          ]}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.meta,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: darkColors.borderControl,
    borderRadius: radii.control,
    backgroundColor: darkColors.inputBg,
  },
  left: {
    marginRight: spacing.xs,
  },
  right: {
    marginLeft: spacing.xs,
  },
  input: {
    flex: 1,
    color: darkColors.text,
  },
});
