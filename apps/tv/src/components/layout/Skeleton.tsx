import { darkColors } from "@/src/theme/colors";
import { radii } from "@/src/theme/spacing";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type ProviderProps = {
  children: ReactNode;
};

export function SkeletonProvider({ children }: ProviderProps) {
  return <>{children}</>;
}

type Props = {
  style?: StyleProp<ViewStyle>;
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
};

export function Skeleton({ style, width, height, borderRadius = radii.control }: Props) {
  return <View style={[styles.block, { width, height, borderRadius }, style]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: darkColors.card,
    opacity: 0.6,
  },
});
