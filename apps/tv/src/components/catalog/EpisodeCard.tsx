import { PosterImage } from "@/src/components/catalog/PosterImage";
import { FocusRing } from "@/src/components/ui/FocusRing";
import type { EpisodeSummary } from "@lunarr/api";
import { watchProgressPercent, watchStatusLabel } from "@lunarr/core";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  episode: EpisodeSummary;
  width: number;
  onPress: () => void;
};

export function EpisodeCard({ episode, width, onPress }: Props) {
  const [focused, setFocused] = useState(false);
  const { scale } = useTVScale();
  const isMissing = !episode.fileId;
  const progress = {
    completed: episode.completed,
    progressSeconds: episode.progressSeconds,
    durationSeconds: episode.durationSeconds,
  };
  const percent = watchProgressPercent(progress);
  const hasProgress = episode.completed || percent > 0;
  const imageUrl = episode.stillUrl ?? episode.showPosterUrl;
  const stillHeight = (width * 9) / 16;

  const wrapStyle = { gap: spacing.sm * scale };
  const stillStyle = { width, height: stillHeight, borderRadius: radii.card * scale };
  const fallbackStyle = { padding: spacing.lg * scale };
  const fallbackTextStyle = { fontSize: typography.fontSize.body * scale };
  const metaStyle = { gap: Math.max(2, 4 * scale) };
  const showTitleStyle = { fontSize: typography.fontSize.caption * scale };
  const titleStyle = { fontSize: typography.fontSize.body * scale };
  const detailStyle = { fontSize: typography.fontSize.caption * scale };
  const progressTrackStyle = { height: Math.max(2, 3 * scale), borderRadius: radii.pill * scale };

  return (
    <Pressable
      onPress={isMissing ? undefined : onPress}
      disabled={isMissing}
      focusable={!isMissing}
      accessibilityRole={isMissing ? undefined : "button"}
      accessibilityLabel={isMissing ? undefined : episode.title}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.wrap, wrapStyle, { width }, isMissing && styles.disabled]}
    >
      <FocusRing
        focused={focused && !isMissing}
        width={Math.max(2, 4 * scale)}
        color={darkColors.accent}
        radius={radii.card * scale}
      >
        <View style={[styles.still, stillStyle]}>
          {imageUrl ? (
            <PosterImage uri={imageUrl} />
          ) : (
            <View style={[styles.fallback, fallbackStyle]}>
              <Text style={[styles.fallbackText, fallbackTextStyle]}>{episode.title}</Text>
            </View>
          )}
        </View>
      </FocusRing>

      <View style={[styles.meta, metaStyle]}>
        <Text style={[styles.showTitle, showTitleStyle]} numberOfLines={1} ellipsizeMode="tail">
          {episode.showTitle}
        </Text>
        <Text style={[styles.title, titleStyle]} numberOfLines={1} ellipsizeMode="tail">
          S{String(episode.seasonNumber ?? "?").padStart(2, "0")}E
          {String(episode.episodeNumber ?? "?").padStart(2, "0")} · {episode.title}
        </Text>
        <Text
          style={[
            styles.detail,
            detailStyle,
            hasProgress && !isMissing && styles.statusActive,
            isMissing && styles.missing,
          ]}
          numberOfLines={1}
        >
          {isMissing ? "Missing" : watchStatusLabel(progress)}
        </Text>
        {hasProgress && !isMissing ? (
          <View style={[styles.progressTrack, progressTrackStyle]}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  disabled: {
    opacity: 0.55,
  },
  still: {
    overflow: "hidden",
    backgroundColor: darkColors.card,
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    color: darkColors.subtle,
    textAlign: "center",
  },
  meta: {},
  showTitle: {
    color: darkColors.muted,
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  detail: {
    color: darkColors.muted,
  },
  statusActive: {
    color: darkColors.accent,
  },
  missing: {
    color: darkColors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  progressTrack: {
    backgroundColor: darkColors.accentSoft,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: darkColors.accent,
  },
});
