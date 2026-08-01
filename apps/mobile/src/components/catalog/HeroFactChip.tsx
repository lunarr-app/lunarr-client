import { darkColors } from "@/src/theme/colors";
import { radii } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export const heroChipBg = "rgba(247, 249, 251, 0.1)";
export const heroChipBorder = "rgba(247, 249, 251, 0.22)";
export const heroChipIconColor = darkColors.textSoft;

export function HeroFactChip({ icon, children }: { icon?: ReactNode; children: string }) {
  return (
    <View style={styles.chip}>
      {icon}
      <Text style={styles.chipText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: heroChipBg,
    borderWidth: 1,
    borderColor: heroChipBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  chipText: {
    color: darkColors.textSoft,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.meta,
  },
});
