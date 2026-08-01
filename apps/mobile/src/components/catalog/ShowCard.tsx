import { usePosterGridItemWidth } from "@/src/components/catalog/PosterGridMetricsContext";
import { PosterImage } from "@/src/components/catalog/PosterImage";
import type { ShowSummary } from "@/src/lib/api/generated";
import { RAIL_POSTER_WIDTH } from "@/src/lib/media/grid";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  show: ShowSummary;
  onPress: () => void;
};

export function ShowCard({ show, onPress }: Props) {
  const gridItemWidth = usePosterGridItemWidth();

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
        {show.posterUrl ? (
          <PosterImage key={`${show.id}:${show.posterUrl}`} uri={show.posterUrl} />
        ) : (
          <Text style={styles.fallback}>{show.title}</Text>
        )}
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {show.title}
        </Text>
        <Text style={styles.detail}>
          {show.year ?? "Unknown year"} · {show.seasonCount} seasons
        </Text>
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
  },
  fallback: {
    color: darkColors.subtle,
    textAlign: "center",
    padding: spacing.lg,
  },
  meta: { gap: 4 },
  title: { color: darkColors.text, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.body },
  detail: { color: darkColors.muted, fontSize: typography.fontSize.caption },
});
