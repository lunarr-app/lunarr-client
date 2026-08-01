import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  titleGap?: number;
  showBack?: boolean;
  backLabel?: string;
};

export function PageHeader({ title, subtitle, titleGap, showBack = false, backLabel }: Props) {
  const gap = titleGap ?? spacing.sm;
  const router = useRouter();
  const canGoBack = showBack && router.canGoBack();
  const a11yLabel = backLabel != null ? `Back to ${backLabel}` : "Go back";

  return (
    <View style={[styles.header, { gap }]}>
      {canGoBack ? (
        <Pressable
          onPress={() => router.back()}
          style={styles.backRow}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
        >
          <ChevronLeft color={darkColors.accent} size={scaleNum(22)} strokeWidth={2.5} />
          {backLabel ? (
            <Text style={styles.backLabel} numberOfLines={1}>
              {backLabel}
            </Text>
          ) : null}
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: -spacing.xs,
    maxWidth: "100%",
  },
  backLabel: {
    color: darkColors.accent,
    fontWeight: typography.fontWeight.regular,
    flexShrink: 1,
    fontSize: typography.fontSize.title,
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.heavy,
    fontSize: typography.fontSize.page,
  },
  subtitle: { color: darkColors.muted, fontSize: typography.fontSize.label },
});
