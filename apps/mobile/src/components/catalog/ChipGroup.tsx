import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

export function ChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  style,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    lineHeight: scaleNum(16),
    fontSize: typography.fontSize.caption,
    marginBottom: spacing.xs,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surfaceStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    borderColor: darkColors.accent,
    backgroundColor: darkColors.accentChipSoft,
  },
  chipText: { color: darkColors.muted, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.meta },
  chipTextActive: { color: darkColors.accent },
});
