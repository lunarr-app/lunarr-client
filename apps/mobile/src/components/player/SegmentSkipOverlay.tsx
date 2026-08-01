import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { compactControlHeight, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { SkipForward } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SEGMENT_SKIP_CHROME_OFFSET = 124;
const ICON_SIZE = scaleNum(18);

type Props = {
  skipLabel: string | null;
  noticeLabel: string | null;
  bottomInset: number;
  rightInset: number;
  onSkip: () => void;
};

export function SegmentSkipOverlay({ skipLabel, noticeLabel, bottomInset, rightInset, onSkip }: Props) {
  const positionStyle = {
    right: rightInset + spacing.md,
    bottom: bottomInset + spacing.md + SEGMENT_SKIP_CHROME_OFFSET,
  };

  if (skipLabel) {
    return (
      <View style={[styles.prompt, positionStyle]} pointerEvents="box-none">
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={skipLabel}
        >
          <SkipForward color={darkColors.text} size={ICON_SIZE} />
          <Text style={styles.label}>{skipLabel}</Text>
        </Pressable>
      </View>
    );
  }

  if (noticeLabel) {
    return (
      <View style={[styles.prompt, positionStyle]} pointerEvents="none" accessibilityLiveRegion="polite">
        <View style={styles.notice}>
          <SkipForward color={darkColors.text} size={ICON_SIZE} />
          <Text style={styles.label}>{noticeLabel}</Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  prompt: {
    position: "absolute",
    zIndex: 4,
  },
  button: {
    minHeight: compactControlHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  notice: {
    minHeight: compactControlHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  label: {
    color: darkColors.text,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.small,
  },
  pressed: {
    opacity: 0.82,
  },
});
