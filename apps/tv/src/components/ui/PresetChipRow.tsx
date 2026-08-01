import { Button } from "@/src/components/ui/Button";
import { spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

export type PresetChipOption<T extends string | number> = {
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
  const { scale } = useTVScale();
  return (
    <View style={[styles.chips, { gap: spacing.md * scale }, style]}>
      {options.map((option) => (
        <View key={String(option.value)} style={styles.chip}>
          <Button
            mode={value === option.value ? "contained" : "outlined"}
            compact
            block
            disabled={disabled}
            onPress={() => onValueChange(option.value)}
          >
            {option.label}
          </Button>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
  },
  chip: {
    flex: 1,
  },
});
