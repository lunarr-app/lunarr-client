import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { Search } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { FocusRing } from "@/src/components/ui/FocusRing";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function SearchField({ value, onChangeText, onSubmitEditing, placeholder = "Search", containerStyle }: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { scale } = useTVScale();

  const fieldStyle = {
    borderWidth: Math.max(1, 2 * scale),
    borderRadius: radii.control * scale,
    minHeight: 64 * scale,
  };
  const innerStyle = { gap: spacing.md * scale, paddingHorizontal: spacing.lg * scale };
  const inputStyle = { fontSize: typography.fontSize.label * scale, paddingVertical: spacing.sm * scale };
  const iconSize = Math.round(24 * scale);

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Pressable
        accessible
        focusable
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPress={() => inputRef.current?.focus()}
        style={[styles.field, fieldStyle, focused && styles.fieldFocused]}
      >
        <FocusRing
          focused={focused}
          width={Math.max(2, 2 * scale)}
          color={darkColors.accent}
          radius={radii.control * scale}
          style={styles.ring}
        >
          <View style={[styles.inner, innerStyle]}>
            <Search color={darkColors.muted} size={iconSize} />
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              onSubmitEditing={onSubmitEditing}
              placeholder={placeholder}
              placeholderTextColor={darkColors.muted}
              selectionColor={darkColors.accent}
              focusable={false}
              style={[styles.input, inputStyle]}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </FocusRing>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    flex: 1,
  },
  field: {
    borderColor: darkColors.borderControl,
    backgroundColor: darkColors.inputBg,
  },
  fieldFocused: {
    borderColor: darkColors.accent,
  },
  ring: {
    flex: 1,
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: darkColors.text,
    backgroundColor: "transparent",
  },
});
