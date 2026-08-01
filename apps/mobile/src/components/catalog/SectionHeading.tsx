import { darkColors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
};

export function SectionHeading({ children, style }: Props) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.heading,
  },
});
