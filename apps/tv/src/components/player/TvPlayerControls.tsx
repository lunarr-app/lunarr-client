import { darkColors } from "@/src/theme/colors";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { AudioLines, Pause, Play, Ratio, Subtitles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, TVFocusGuideView, View } from "react-native";

import { TvSlider } from "./TvSlider";
import { formatTime, formatTimeRange } from "./util";

type Props = {
  currentTime: number;
  seekDelta: number;
  duration: number;
  showTimePopup: boolean;
  requestSliderFocus: boolean;
  onSliderFocusChange: (focused: boolean) => void;
  isPlaying: boolean;
  focusPlayButton: boolean;
  onTogglePlay: () => void;
  hasSubtitles: boolean;
  subtitlesActive: boolean;
  onToggleSubtitleMenu: () => void;
  hasAudio: boolean;
  onToggleAudioMenu: () => void;
  zoomLabel: string;
  zoomActive: boolean;
  onCycleZoom: () => void;
};

export function TvPlayerControls({
  currentTime,
  seekDelta,
  duration,
  showTimePopup,
  requestSliderFocus,
  onSliderFocusChange,
  isPlaying,
  focusPlayButton,
  onTogglePlay,
  hasSubtitles,
  subtitlesActive,
  onToggleSubtitleMenu,
  hasAudio,
  onToggleAudioMenu,
  zoomLabel,
  zoomActive,
  onCycleZoom,
}: Props) {
  const { scale } = useTVScale();
  const controlSize = 68 * scale;
  const trackHeight = 14 * scale;
  const thumbSize = 24 * scale;
  const playIconSize = Math.round(36 * scale);
  const toolIconSize = Math.round(34 * scale);

  const bottomControlsStyle = { paddingBottom: tvSafe.vertical * scale, paddingHorizontal: tvSafe.horizontal * scale };
  const gapStyle = { gap: spacing.md * scale };
  const controlRowStyle = { minHeight: controlSize };
  const controlButtonStyle = {
    width: controlSize,
    height: controlSize,
    borderRadius: radii.control * scale,
    borderWidth: Math.max(1, 2 * scale),
  };
  const playButtonStyle = { borderRadius: controlSize / 2 };
  const timeReadoutStyle = { fontSize: typography.fontSize.title * scale };

  return (
    <TVFocusGuideView autoFocus style={[styles.bottomControls, bottomControlsStyle, gapStyle]}>
      <TvSlider
        value={Math.max(0, currentTime + seekDelta)}
        maximumValue={duration || 1}
        trackHeight={trackHeight}
        thumbSize={thumbSize}
        popupText={showTimePopup ? formatTime(currentTime + seekDelta) : undefined}
        onFocusChange={onSliderFocusChange}
        requestFocus={requestSliderFocus}
      />

      <View style={[styles.controlRow, controlRowStyle, gapStyle]}>
        <View style={[styles.primaryControls, gapStyle]}>
          <Pressable
            onPress={onTogglePlay}
            focusable
            hasTVPreferredFocus={focusPlayButton}
            style={({ focused }) => [
              styles.controlButton,
              controlButtonStyle,
              playButtonStyle,
              focused && styles.controlFocused,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause color={darkColors.accent} size={playIconSize} fill={darkColors.accent} />
            ) : (
              <Play color={darkColors.accent} size={playIconSize} fill={darkColors.accent} />
            )}
          </Pressable>

          <Text style={[styles.timeReadout, timeReadoutStyle]}>{formatTimeRange(currentTime, duration)}</Text>
        </View>

        <View style={[styles.trailingControls, gapStyle]}>
          {hasSubtitles ? (
            <Pressable
              onPress={onToggleSubtitleMenu}
              focusable
              style={({ focused }) => [
                styles.controlButton,
                controlButtonStyle,
                subtitlesActive && styles.controlActive,
                focused && styles.controlFocused,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Subtitles"
            >
              <Subtitles color={subtitlesActive ? darkColors.accent : darkColors.text} size={toolIconSize} />
            </Pressable>
          ) : null}

          {hasAudio ? (
            <Pressable
              onPress={onToggleAudioMenu}
              focusable
              style={({ focused }) => [styles.controlButton, controlButtonStyle, focused && styles.controlFocused]}
              accessibilityRole="button"
              accessibilityLabel="Audio track"
            >
              <AudioLines color={darkColors.text} size={toolIconSize} />
            </Pressable>
          ) : null}

          <Pressable
            onPress={onCycleZoom}
            focusable
            style={({ focused }) => [
              styles.controlButton,
              controlButtonStyle,
              zoomActive && styles.controlActive,
              focused && styles.controlFocused,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Zoom: ${zoomLabel}`}
            accessibilityState={{ selected: zoomActive }}
          >
            <Ratio color={zoomActive ? darkColors.accent : darkColors.text} size={toolIconSize} />
          </Pressable>
        </View>
      </View>
    </TVFocusGuideView>
  );
}

const styles = StyleSheet.create({
  bottomControls: {
    zIndex: 2,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryControls: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  trailingControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8, 12, 16, 0.58)",
    borderColor: "transparent",
  },
  controlFocused: {
    borderColor: darkColors.accent,
  },
  controlActive: {
    backgroundColor: darkColors.accentSoft,
  },
  timeReadout: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.medium,
  },
});
