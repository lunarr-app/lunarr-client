import { PosterImage } from "@/src/components/catalog/PosterImage";
import { usePosterGridItemWidth } from "@/src/components/catalog/PosterGridMetricsContext";
import { seasonStats, seasonStubStats } from "@lunarr/core";
import { RAIL_POSTER_WIDTH } from "@/src/lib/media/grid";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Episode = {
  fileId: string | null;
  completed: boolean | number;
};

type SeasonCounts = {
  episodeCount: number;
  playableCount: number;
  watchedCount: number;
};

type Props = {
  title: string;
  posterUrl?: string | null;
  fallbackPosterUrl?: string | null;
  episodes?: Episode[];
  counts?: SeasonCounts;
  onPress: () => void;
};

export function SeasonCard({ title, posterUrl, fallbackPosterUrl, episodes = [], counts, onPress }: Props) {
  const gridItemWidth = usePosterGridItemWidth();
  const stats = counts ? seasonStubStats(counts) : seasonStats(episodes);
  const imageUrl = posterUrl ?? fallbackPosterUrl ?? null;

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
        {imageUrl ? <PosterImage uri={imageUrl} /> : <Text style={styles.fallback}>{title}</Text>}
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta}>
          {stats.total} {stats.total === 1 ? "episode" : "episodes"}
        </Text>
        <Text style={styles.meta}>
          {stats.missing > 0 ? `${stats.playable}/${stats.total} available` : `${stats.watched}/${stats.total} watched`}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${stats.progress}%` }]} />
        </View>
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
    borderColor: darkColors.border,
  },
  fallback: {
    color: darkColors.subtle,
    padding: spacing.md,
    textAlign: "center",
  },
  copy: { gap: 2 },
  title: { color: darkColors.text, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.body },
  meta: { color: darkColors.muted, fontSize: typography.fontSize.caption },
  track: {
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: darkColors.border,
    overflow: "hidden",
    marginTop: 2,
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: darkColors.accent,
  },
});
