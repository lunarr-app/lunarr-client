import { resolveSubtitleUri } from "@lunarr/core";
import type { SubtitleTrack } from "@lunarr/api";
import { parseSubtitleDocument, subtitleTextAtTime, type SubtitleCue } from "@/src/lib/playback/subtitles";
import { darkColors } from "@/src/theme/colors";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  track: SubtitleTrack | null;
  currentTimeSeconds: number;
  controlsVisible?: boolean;
};

export function ExternalSubtitleOverlay({ track, currentTimeSeconds, controlsVisible = false }: Props) {
  const { scale } = useTVScale();
  const cuesRef = useRef<SubtitleCue[]>([]);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    cuesRef.current = [];
    setText(null);
    if (!track?.src) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(resolveSubtitleUri(track));
        if (!response.ok) return;
        const body = await response.text();
        if (cancelled) return;
        cuesRef.current = parseSubtitleDocument(body);
        setText(subtitleTextAtTime(cuesRef.current, currentTimeSeconds));
      } catch {
        if (!cancelled) {
          cuesRef.current = [];
          setText(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [track?.id, track?.src]);

  useEffect(() => {
    setText(subtitleTextAtTime(cuesRef.current, currentTimeSeconds));
  }, [currentTimeSeconds]);

  if (!text) return null;

  const containerStyle = { left: 16 * scale, right: 16 * scale };
  const captionStyle = {
    fontSize: typography.fontSize.heading * scale,
    lineHeight: typography.lineHeight.normal * scale,
    paddingHorizontal: 12 * scale,
    paddingVertical: 6 * scale,
    borderRadius: 6 * scale,
  };

  return (
    <View
      style={[styles.container, containerStyle, controlsVisible && styles.containerControlsVisible]}
      pointerEvents="none"
    >
      <Text style={[styles.caption, captionStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: "10%",
    alignItems: "center",
    zIndex: 2,
  },
  containerControlsVisible: {
    bottom: "24%",
  },
  caption: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.medium,
    textAlign: "center",
    backgroundColor: darkColors.overlay,
    overflow: "hidden",
  },
});
