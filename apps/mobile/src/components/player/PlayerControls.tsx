import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import Slider from "@react-native-community/slider";
import { FastForward, Maximize, Minimize, Pause, Play, Rewind } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatTimeRange } from "./util";

const CONTROL_SIZE = 44;

const playerTheme = {
  text: darkColors.text,
  controlBg: "rgba(8, 12, 16, 0.58)",
  controlBgSoft: "rgba(8, 12, 16, 0.38)",
  accent: "#f8fafc",
  trackMax: "rgba(248, 250, 252, 0.34)",
};

type Props = {
  displayedSeconds: number;
  duration: number;
  playbackButton: { action: "play" | "pause"; label: string };
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSeekStart: (value: number) => void;
  onSeekChange: (value: number) => void;
  onSeekComplete: (value: number) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
};

function SkipButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.skipButton, pressed && styles.controlPressed]}
      accessibilityRole="button"
    >
      {children}
      <Text style={styles.skipLabel}>{label}</Text>
    </Pressable>
  );
}

export function PlayerControls({
  displayedSeconds,
  duration,
  playbackButton,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  onSeekStart,
  onSeekChange,
  onSeekComplete,
  fullscreen,
  onToggleFullscreen,
}: Props) {
  const chromeTimelineTime = duration > 0 ? displayedSeconds : 0;

  return (
    <>
      <Slider
        value={chromeTimelineTime}
        minimumValue={0}
        maximumValue={Math.max(duration, 1)}
        thumbSize={16}
        minimumTrackTintColor={playerTheme.accent}
        maximumTrackTintColor={playerTheme.trackMax}
        thumbTintColor={playerTheme.accent}
        onSlidingStart={onSeekStart}
        onValueChange={onSeekChange}
        onSlidingComplete={onSeekComplete}
      />

      <View style={styles.controlRow}>
        <View style={styles.primaryControls}>
          <Pressable
            onPress={onTogglePlay}
            style={({ pressed }) => [styles.controlButton, styles.playButton, pressed && styles.controlPressed]}
            accessibilityRole="button"
            accessibilityLabel={playbackButton.label}
          >
            {playbackButton.action === "pause" ? (
              <Pause color={playerTheme.text} size={24} fill={playerTheme.text} />
            ) : (
              <Play color={playerTheme.text} size={24} fill={playerTheme.text} />
            )}
          </Pressable>

          <SkipButton label="10" onPress={onSkipBack}>
            <Rewind color={playerTheme.text} size={20} />
          </SkipButton>

          <SkipButton label="30" onPress={onSkipForward}>
            <FastForward color={playerTheme.text} size={20} />
          </SkipButton>

          <Text style={styles.timeReadout}>{formatTimeRange(chromeTimelineTime, duration)}</Text>
        </View>

        <View style={styles.trailingControls}>
          <Pressable
            onPress={() => void onToggleFullscreen()}
            style={({ pressed }) => [styles.controlButton, pressed && styles.controlPressed]}
            accessibilityRole="button"
            accessibilityLabel={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {fullscreen ? (
              <Minimize color={playerTheme.text} size={20} />
            ) : (
              <Maximize color={playerTheme.text} size={20} />
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  controlRow: {
    minHeight: CONTROL_SIZE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  primaryControls: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  trailingControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  controlButton: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  controlPressed: {
    opacity: 0.82,
  },
  playButton: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: CONTROL_SIZE / 2,
    backgroundColor: playerTheme.controlBg,
  },
  skipButton: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: CONTROL_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: playerTheme.controlBgSoft,
    paddingTop: 4,
  },
  skipLabel: {
    color: playerTheme.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    lineHeight: typography.lineHeight.tight,
    marginTop: 1,
  },
  timeReadout: {
    color: playerTheme.text,
    fontSize: typography.fontSize.meta,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.xs,
    flexShrink: 1,
  },
});
