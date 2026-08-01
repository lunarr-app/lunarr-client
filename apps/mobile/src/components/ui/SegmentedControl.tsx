import { darkColors } from "@/src/theme/colors";
import { compactControlHeightSmall, radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({ value, onValueChange, options, style }: Props<T>) {
  return (
    <View style={[styles.track, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onValueChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radii.control,
    backgroundColor: darkColors.inputBg,
    padding: 2,
    gap: 2,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.control - 2,
    minHeight: compactControlHeightSmall,
    paddingHorizontal: spacing.sm,
  },
  segmentSelected: {
    backgroundColor: darkColors.surfaceStrong,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  label: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.body,
  },
  labelSelected: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
});
