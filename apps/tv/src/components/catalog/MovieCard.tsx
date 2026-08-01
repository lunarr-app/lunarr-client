import { PosterImage } from "@/src/components/catalog/PosterImage";
import { FocusRing } from "@/src/components/ui/FocusRing";
import type { MovieSummary } from "@/src/lib/api/generated";
import { watchProgressPercent, watchStatusLabel } from "@/src/lib/media/progress";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  movie: MovieSummary;
  width: number;
  onPress: () => void;
};

export function MovieCard({ movie, width, onPress }: Props) {
  const [focused, setFocused] = useState(false);
  const { scale } = useTVScale();
  const progress = {
    completed: movie.completed,
    progressSeconds: movie.progressSeconds,
    durationSeconds: movie.durationSeconds,
  };
  const percent = watchProgressPercent(progress);
  const hasProgress = movie.completed || percent > 0;
  const posterHeight = (width * 3) / 2;

  const wrapStyle = { gap: spacing.sm * scale };
  const posterStyle = { width, height: posterHeight, borderRadius: radii.card * scale };
  const fallbackStyle = { padding: spacing.lg * scale };
  const fallbackTextStyle = { fontSize: typography.fontSize.body * scale };
  const metaStyle = { gap: Math.max(2, 4 * scale) };
  const titleStyle = { fontSize: typography.fontSize.body * scale };
  const detailsStyle = { gap: spacing.sm * scale };
  const detailStyle = { fontSize: typography.fontSize.caption * scale };
  const progressTrackStyle = { height: Math.max(2, 3 * scale), borderRadius: radii.pill * scale };

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      focusable
      accessibilityRole="button"
      accessibilityLabel={movie.title}
      style={[styles.wrap, wrapStyle, { width }]}
    >
      <FocusRing focused={focused} width={Math.max(2, 4 * scale)} color={darkColors.accent} radius={radii.card * scale}>
        <View style={[styles.poster, posterStyle]}>
          {movie.posterUrl ? (
            <PosterImage uri={movie.posterUrl} />
          ) : (
            <View style={[styles.fallback, fallbackStyle]}>
              <Text style={[styles.fallbackText, fallbackTextStyle]}>{movie.title}</Text>
            </View>
          )}
        </View>
      </FocusRing>

      <View style={[styles.meta, metaStyle]}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1} ellipsizeMode="tail">
          {movie.title}
        </Text>
        <View style={[styles.details, detailsStyle]}>
          <Text style={[styles.detail, detailStyle]} numberOfLines={1}>
            {movie.year ?? "Unknown year"}
          </Text>
          <Text style={[styles.detail, detailStyle, hasProgress && styles.statusActive]} numberOfLines={1}>
            {watchStatusLabel(progress)}
          </Text>
        </View>
        {hasProgress ? (
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
  poster: {
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
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detail: {
    color: darkColors.muted,
    flexShrink: 1,
  },
  statusActive: {
    color: darkColors.accent,
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
