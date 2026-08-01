import { TextField } from "@/src/components/ui/TextField";
import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { spacing } from "@/src/theme/spacing";
import { Search, X } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  dense?: boolean;
  loading?: boolean;
};

export function SearchField({
  value,
  onChangeText,
  placeholder = "Search",
  containerStyle,
  dense = false,
  loading = false,
}: Props) {
  const iconSize = dense ? scaleNum(16) : scaleNum(18);
  const showClear = value.length > 0;
  const right =
    loading || showClear ? (
      <View style={styles.rightSlot}>
        {loading ? <ActivityIndicator size="small" color={darkColors.muted} /> : null}
        {showClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => onChangeText("")}
            hitSlop={8}
          >
            <X color={darkColors.muted} size={iconSize} />
          </Pressable>
        ) : null}
      </View>
    ) : null;

  return (
    <TextField
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      dense={dense}
      containerStyle={[styles.wrap, dense && styles.wrapDense, containerStyle]}
      style={styles.field}
      left={<Search color={darkColors.muted} size={iconSize} />}
      right={right}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md },
  wrapDense: {
    justifyContent: "center",
  },
  field: {
    backgroundColor: darkColors.inputBg,
  },
  rightSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
