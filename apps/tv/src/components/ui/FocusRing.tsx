import { darkColors } from "@/src/theme/colors";
import { radii } from "@/src/theme/spacing";
import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  focused: boolean;
  children: ReactNode;
  width?: number;
  color?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function FocusRing({
  focused,
  children,
  width = 4,
  color = darkColors.accent,
  radius = radii.control,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      {children}
      {focused ? (
        <View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              borderWidth: width,
              borderColor: color,
              borderRadius: radius + width,
              top: -width,
              left: -width,
              right: -width,
              bottom: -width,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  ring: {
    position: "absolute",
  },
});
