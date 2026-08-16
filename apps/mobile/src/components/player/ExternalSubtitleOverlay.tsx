import { resolveMediaUri } from "@lunarr/core";
import type { SubtitleTrack } from "@lunarr/api";
import {
  createSubtitleIndex,
  parseSubtitleDocument,
  subtitleTextAtTime,
  type SubtitleCueIndex,
} from "@/src/lib/playback/subtitles";
import { darkColors } from "@/src/theme/colors";
import { typography } from "@/src/theme/typography";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  track: SubtitleTrack | null;
  currentTimeSeconds: number;
  controlsVisible?: boolean;
};

export function ExternalSubtitleOverlay({ track, currentTimeSeconds, controlsVisible = false }: Props) {
  const indexRef = useRef<SubtitleCueIndex | null>(null);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    indexRef.current = null;
    setText(null);
    if (!track?.src) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(resolveMediaUri(track.src));
        if (!response.ok) return;
        const body = await response.text();
        if (cancelled) return;
        const cues = parseSubtitleDocument(body);
        indexRef.current = createSubtitleIndex(cues);
        setText(subtitleTextAtTime(cues, currentTimeSeconds, indexRef.current));
      } catch {
        if (!cancelled) {
          indexRef.current = null;
          setText(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [track?.id, track?.src]);

  useEffect(() => {
    if (!indexRef.current) return;
    setText(subtitleTextAtTime(indexRef.current.cues, currentTimeSeconds, indexRef.current));
  }, [currentTimeSeconds]);

  if (!text) return null;

  return (
    <View style={[styles.container, controlsVisible && styles.containerControlsVisible]} pointerEvents="none">
      <Text style={styles.caption}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: "6%",
    alignItems: "center",
    zIndex: 2,
  },
  containerControlsVisible: {
    bottom: "28%",
  },
  caption: {
    color: darkColors.text,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
    lineHeight: typography.lineHeight.normal,
    backgroundColor: darkColors.overlay,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: "hidden",
  },
});
