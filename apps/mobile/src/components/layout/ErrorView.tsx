import { Button } from "@/src/components/ui/Button";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

type Layout = "content" | "centered" | "footer";

type Props = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  layout?: Layout;
  style?: StyleProp<ViewStyle>;
};

export function ErrorView({
  message,
  title = "Couldn't load",
  onRetry,
  retryLabel = "Try again",
  layout = "content",
  style,
}: Props) {
  return (
    <View style={[styles[layout], style]}>
      <Text
        style={[styles.title, layout === "footer" && styles.footerTitle, layout === "centered" && styles.centeredText]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          layout === "footer" && styles.footerMessage,
          layout === "centered" && styles.centeredText,
        ]}
      >
        {message}
      </Text>
      {onRetry ? (
        <View style={[styles.actions, layout === "footer" && styles.footerActions]}>
          <Button mode="outlined" compact={layout === "footer"} onPress={onRetry}>
            {retryLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.heavy,
    fontSize: typography.fontSize.large,
  },
  message: {
    color: darkColors.error,
    lineHeight: typography.lineHeight.relaxed,
    fontSize: typography.fontSize.label,
  },
  footerTitle: {
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
  },
  footerMessage: {
    textAlign: "center",
  },
  centeredText: {
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  footerActions: {
    justifyContent: "center",
    width: "100%",
  },
  content: {
    padding: spacing.xl,
    maxWidth: 520,
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
    gap: spacing.sm,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    width: "100%",
  },
});
