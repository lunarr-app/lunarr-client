import { Button } from "@/src/components/ui/Button";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
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
  const { scale } = useTVScale();
  const titleStyle = { fontSize: typography.fontSize.large * scale };
  const messageStyle = {
    fontSize: typography.fontSize.label * scale,
    lineHeight: typography.lineHeight.relaxed * scale,
  };
  const footerTitleStyle = { fontSize: typography.fontSize.title * scale };
  const actionsStyle = { gap: spacing.sm * scale, marginTop: spacing.xs * scale };

  const layoutStyle: ViewStyle = (() => {
    switch (layout) {
      case "centered":
        return {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.xl * scale,
          maxWidth: 520 * scale,
          alignSelf: "center",
          width: "100%",
        };
      case "footer":
        return {
          alignItems: "center",
          paddingVertical: spacing.lg * scale,
          paddingHorizontal: spacing.md * scale,
          gap: spacing.xs * scale,
          width: "100%",
        };
      case "content":
      default:
        return {
          padding: spacing.xl * scale,
          maxWidth: 520 * scale,
        };
    }
  })();

  return (
    <View style={[styles.wrap, layoutStyle, style]}>
      <Text
        style={[
          styles.title,
          titleStyle,
          layout === "footer" && footerTitleStyle,
          layout === "centered" && styles.centeredText,
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          messageStyle,
          layout === "footer" && styles.footerMessage,
          layout === "centered" && styles.centeredText,
        ]}
      >
        {message}
      </Text>
      {onRetry ? (
        <View style={[styles.actions, layout === "footer" && styles.footerActions, actionsStyle]}>
          <Button mode="outlined" compact={layout === "footer"} onPress={onRetry}>
            {retryLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  message: {
    color: darkColors.error,
  },
  footerTitle: {
    fontWeight: typography.fontWeight.semibold,
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
  },
  footerActions: {
    justifyContent: "center",
  },
});
