import { PosterImage } from "@/src/components/catalog/PosterImage";
import type { EpisodeSummary } from "@lunarr/api";
import { watchProgressPercent, watchStatusLabel } from "@/src/lib/media/progress";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  episode: EpisodeSummary;
  onPress: () => void;
  disabled?: boolean;
};

export function EpisodeCard({ episode, onPress, disabled = false }: Props) {
  const isMissing = !episode.fileId;
  const isDisabled = disabled;
  const progress = {
    completed: episode.completed,
    progressSeconds: episode.progressSeconds,
    durationSeconds: episode.durationSeconds,
  };
  const percent = watchProgressPercent(progress);
  const hasProgress = episode.completed || percent > 0;
  const imageUrl = episode.stillUrl ?? episode.showPosterUrl;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.fillWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <View style={styles.still}>
        {imageUrl ? (
          <PosterImage key={`${episode.id}:${imageUrl}`} uri={imageUrl} />
        ) : (
          <Text style={styles.fallback}>{episode.title}</Text>
        )}
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.showTitle}>
          {episode.showTitle}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          S{episode.seasonNumber ?? "?"}E{episode.episodeNumber ?? "?"} · {episode.title}
        </Text>
        <Text style={[styles.detail, hasProgress && !isMissing && styles.statusActive, isMissing && styles.missing]}>
          {isMissing ? "Missing" : watchStatusLabel(progress)}
        </Text>
        {hasProgress ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fillWidth: { width: "100%", gap: spacing.sm },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.72 },
  still: {
    aspectRatio: 16 / 9,
    borderRadius: radii.card,
    overflow: "hidden",
    backgroundColor: darkColors.card,
  },
  fallback: {
    color: darkColors.subtle,
    textAlign: "center",
    padding: spacing.lg,
  },
  meta: { gap: 4 },
  showTitle: { color: darkColors.muted, fontSize: typography.fontSize.caption },
  title: { color: darkColors.text, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.body },
  detail: { color: darkColors.muted, fontSize: typography.fontSize.caption },
  missing: { color: darkColors.warning, fontWeight: typography.fontWeight.bold },
  statusActive: { color: darkColors.accent },
  progressTrack: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: darkColors.accentSoft,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: darkColors.accent,
  },
});
