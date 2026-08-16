import { type AudioTrack, type SubtitleTrack } from "@lunarr/api";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { AudioLines, Captions, Ratio } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type PlayerContentFit = "contain" | "cover";

const CONTROL_SIZE = 44;

const playerTheme = {
  text: darkColors.text,
  accent: "#f8fafc",
  trackMax: "rgba(248, 250, 252, 0.34)",
  controlBg: "rgba(8, 12, 16, 0.58)",
};

type Props = {
  subtitleTracks: SubtitleTrack[];
  selectedSubtitleId: string;
  subtitleMenuOpen: boolean;
  onToggleSubtitleMenu: () => void;
  onSubtitleSelect: (id: string) => void;
  audioTracks: AudioTrack[];
  selectedAudioId: number | null;
  audioMenuOpen: boolean;
  onToggleAudioMenu: () => void;
  onAudioSelect: (id: number) => void;
  contentFit: PlayerContentFit;
  contentFitLabel: string;
  onCycleContentFit: () => void;
};

export function PlayerTopControls({
  subtitleTracks,
  selectedSubtitleId,
  subtitleMenuOpen,
  onToggleSubtitleMenu,
  onSubtitleSelect,
  audioTracks,
  selectedAudioId,
  audioMenuOpen,
  onToggleAudioMenu,
  onAudioSelect,
  contentFit,
  contentFitLabel,
  onCycleContentFit,
}: Props) {
  return (
    <View style={styles.container}>
      {subtitleTracks.length > 0 ? (
        <View style={styles.subtitleControl}>
          <Pressable
            onPress={onToggleSubtitleMenu}
            style={({ pressed }) => [
              styles.controlButton,
              selectedSubtitleId !== "off" && styles.controlButtonActive,
              pressed && styles.controlPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Subtitles"
            accessibilityState={{ expanded: subtitleMenuOpen }}
          >
            <Captions color={selectedSubtitleId !== "off" ? playerTheme.accent : playerTheme.text} size={20} />
          </Pressable>
          {subtitleMenuOpen ? (
            <View style={styles.subtitleMenu}>
              <Pressable
                onPress={() => onSubtitleSelect("off")}
                style={({ pressed }) => [
                  styles.subtitleOption,
                  selectedSubtitleId === "off" && styles.subtitleOptionActive,
                  pressed && styles.controlPressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{
                  selected: selectedSubtitleId === "off",
                }}
              >
                <Text style={styles.subtitleOptionText}>Off</Text>
              </Pressable>
              {subtitleTracks.map((track) => (
                <Pressable
                  key={track.id}
                  onPress={() => onSubtitleSelect(track.id)}
                  style={({ pressed }) => [
                    styles.subtitleOption,
                    selectedSubtitleId === track.id && styles.subtitleOptionActive,
                    pressed && styles.controlPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: selectedSubtitleId === track.id,
                  }}
                >
                  <Text style={styles.subtitleOptionText}>{track.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {audioTracks.length > 1 ? (
        <View style={styles.subtitleControl}>
          <Pressable
            onPress={onToggleAudioMenu}
            style={({ pressed }) => [styles.controlButton, pressed && styles.controlPressed]}
            accessibilityRole="button"
            accessibilityLabel="Audio track"
            accessibilityState={{ expanded: audioMenuOpen }}
          >
            <AudioLines color={playerTheme.text} size={20} />
          </Pressable>
          {audioMenuOpen ? (
            <View style={styles.subtitleMenu}>
              {audioTracks.map((track) => (
                <Pressable
                  key={track.id}
                  onPress={() => onAudioSelect(track.id)}
                  style={({ pressed }) => [
                    styles.subtitleOption,
                    selectedAudioId === track.id && styles.subtitleOptionActive,
                    pressed && styles.controlPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedAudioId === track.id }}
                >
                  <Text style={styles.subtitleOptionText}>{track.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable
        onPress={onCycleContentFit}
        style={({ pressed }) => [
          styles.controlButton,
          contentFit !== "contain" && styles.controlButtonActive,
          pressed && styles.controlPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={contentFitLabel}
        accessibilityState={{ selected: contentFit !== "contain" }}
      >
        <Ratio color={contentFit !== "contain" ? playerTheme.accent : playerTheme.text} size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  subtitleControl: {
    position: "relative",
  },
  subtitleMenu: {
    position: "absolute",
    right: 0,
    top: CONTROL_SIZE + spacing.sm,
    minWidth: 168,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: playerTheme.trackMax,
    backgroundColor: "rgba(8, 12, 16, 0.94)",
    overflow: "hidden",
    zIndex: 10,
  },
  subtitleOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  subtitleOptionActive: {
    backgroundColor: playerTheme.controlBg,
  },
  subtitleOptionText: {
    color: playerTheme.text,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
  controlButtonActive: {
    borderWidth: 1,
    borderColor: playerTheme.accent,
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
});
