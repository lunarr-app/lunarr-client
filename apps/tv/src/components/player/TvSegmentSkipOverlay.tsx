import { darkColors } from "@/src/theme/colors";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { SkipForward } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  skipLabel: string | null;
  notice: string | null;
  onSkip: () => void;
};

export function TvSegmentSkipOverlay({ skipLabel, notice, onSkip }: Props) {
  const { scale } = useTVScale();
  if (!skipLabel && !notice) return null;

  const iconSize = Math.round(28 * scale);

  /** Extra vertical offset above the bottom safe area for the skip button. */
  const SKIP_BUTTON_BOTTOM_OFFSET = 160;
  /** Horizontal inset for the skip button (from right edge). */
  const SKIP_BUTTON_RIGHT = 60;
  /** Vertical offset for the notice overlay (above the skip button). */
  const NOTICE_BOTTOM_OFFSET = 220;

  const segmentSkipFloatingStyle = {
    right: tvSafe.horizontal * scale,
    bottom: tvSafe.vertical * scale + SKIP_BUTTON_BOTTOM_OFFSET * scale,
  };
  const segmentSkipNoticeOverlayStyle = { right: SKIP_BUTTON_RIGHT * scale, bottom: NOTICE_BOTTOM_OFFSET * scale };
  const pillStyle = {
    gap: spacing.md * scale,
    paddingHorizontal: spacing.xl * scale,
    paddingVertical: spacing.md * scale,
    borderWidth: Math.max(1, 2 * scale),
    borderRadius: radii.pill * scale,
  };
  const labelStyle = { fontSize: typography.fontSize.title * scale };

  return (
    <>
      {skipLabel ? (
        <View style={[styles.segmentSkipFloating, segmentSkipFloatingStyle]} pointerEvents="box-none">
          <Pressable
            onPress={onSkip}
            focusable
            style={({ focused }) => [styles.segmentSkipButton, pillStyle, focused && styles.segmentSkipButtonFocused]}
            accessibilityRole="button"
            accessibilityLabel={skipLabel}
          >
            <SkipForward color={darkColors.text} size={iconSize} />
            <Text style={[styles.segmentSkipLabel, labelStyle]}>{skipLabel}</Text>
          </Pressable>
        </View>
      ) : null}

      {notice ? (
        <View
          style={[styles.segmentSkipNoticeOverlay, segmentSkipNoticeOverlayStyle]}
          pointerEvents="none"
          accessibilityLiveRegion="polite"
        >
          <View style={[styles.segmentSkipNotice, pillStyle]}>
            <SkipForward color={darkColors.text} size={iconSize} />
            <Text style={[styles.segmentSkipLabel, labelStyle]}>{notice}</Text>
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  segmentSkipNoticeOverlay: {
    position: "absolute",
    zIndex: 4,
  },
  segmentSkipFloating: {
    position: "absolute",
    zIndex: 4,
  },
  segmentSkipButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "transparent",
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  segmentSkipButtonFocused: {
    borderColor: darkColors.accent,
  },
  segmentSkipNotice: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.72)",
    backgroundColor: darkColors.overlay,
  },
  segmentSkipLabel: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.medium,
  },
});
