import { darkColors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

type Props = {
  variant: "label" | "value" | "muted";
  children: ReactNode;
};

const FONT_SIZES = {
  label: typography.fontSize.meta,
  value: typography.fontSize.title,
  muted: typography.fontSize.body,
} as const;

export function InfoText({ variant, children }: Props) {
  return <Text style={[styles[variant], { fontSize: FONT_SIZES[variant] }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: darkColors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  muted: {
    color: darkColors.muted,
    lineHeight: typography.lineHeight.normal,
  },
});
