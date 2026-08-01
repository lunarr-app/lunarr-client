import { Button } from "@/src/components/ui/Button";
import { spacing } from "@/src/theme/spacing";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type PresetChipOption<T extends string | number> = {
  value: T;
  label: string;
};

type Props<T extends string | number> = {
  value: T;
  options: PresetChipOption<T>[];
  onValueChange: (value: T) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PresetChipRow<T extends string | number>({
  value,
  options,
  onValueChange,
  disabled = false,
  style,
}: Props<T>) {
  return (
    <View style={[styles.chips, style]}>
      {options.map((option) => (
        <Button
          key={String(option.value)}
          mode={value === option.value ? "contained" : "outlined"}
          compact
          disabled={disabled}
          onPress={() => onValueChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
