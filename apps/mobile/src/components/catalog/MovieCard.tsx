import { usePosterGridItemWidth } from "@/src/components/catalog/PosterGridMetricsContext";
import { PosterImage } from "@/src/components/catalog/PosterImage";
import type { MovieSummary } from "@lunarr/api";
import { RAIL_POSTER_WIDTH } from "@/src/lib/media/grid";
import { watchProgressPercent, watchStatusLabel } from "@/src/lib/media/progress";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  movie: MovieSummary;
  onPress: () => void;
};

export function MovieCard({ movie, onPress }: Props) {
  const gridItemWidth = usePosterGridItemWidth();
  const progress = {
    completed: movie.completed,
    progressSeconds: movie.progressSeconds,
    durationSeconds: movie.durationSeconds,
  };
  const percent = watchProgressPercent(progress);
  const hasProgress = movie.completed || percent > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fillWidth,
        gridItemWidth != null ? null : { width: RAIL_POSTER_WIDTH },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.poster}>
        {movie.posterUrl ? (
          <PosterImage key={`${movie.id}:${movie.posterUrl}`} uri={movie.posterUrl} />
        ) : (
          <Text style={styles.fallback}>{movie.title}</Text>
        )}
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {movie.title}
        </Text>
        <View style={styles.details}>
          <Text style={styles.detail}>{movie.year ?? "Unknown year"}</Text>
          <Text style={[styles.detail, hasProgress && styles.statusActive]}>{watchStatusLabel(progress)}</Text>
        </View>
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
  poster: {
    aspectRatio: 2 / 3,
    borderRadius: radii.card,
    overflow: "hidden",
    backgroundColor: darkColors.card,
    borderWidth: 1,
    borderColor: "transparent",
  },
  fallback: {
    color: darkColors.subtle,
    textAlign: "center",
    padding: spacing.lg,
  },
  meta: { gap: 4 },
  title: { color: darkColors.text, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.body },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  detail: { color: darkColors.muted, flexShrink: 1, fontSize: typography.fontSize.caption },
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
