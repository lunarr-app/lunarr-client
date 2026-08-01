import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { compactControlHeight, radii } from "@/src/theme/spacing";
import { SlidersHorizontal } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
  compact?: boolean;
};

export function FilterButton({ onPress, accessibilityLabel = "Open filters", compact = false }: Props) {
  const iconSize = compact ? scaleNum(17) : scaleNum(20);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.trigger, compact ? { width: compactControlHeight, height: compactControlHeight } : null]}
    >
      <SlidersHorizontal color={darkColors.muted} size={iconSize} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: scaleNum(48),
    height: scaleNum(48),
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surfaceStrong,
    alignItems: "center",
    justifyContent: "center",
  },
});
