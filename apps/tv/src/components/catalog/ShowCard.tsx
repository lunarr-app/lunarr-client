import { PosterImage } from "@/src/components/catalog/PosterImage";
import { FocusRing } from "@/src/components/ui/FocusRing";
import type { ShowSummary } from "@lunarr/api";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  show: ShowSummary;
  width: number;
  onPress: () => void;
};

export function ShowCard({ show, width, onPress }: Props) {
  const [focused, setFocused] = useState(false);
  const { scale } = useTVScale();
  const posterHeight = (width * 3) / 2;
  const seasonLabel = `${show.seasonCount} ${show.seasonCount === 1 ? "season" : "seasons"}`;

  const wrapStyle = { gap: spacing.sm * scale };
  const posterStyle = { width, height: posterHeight, borderRadius: radii.card * scale };
  const fallbackStyle = { padding: spacing.lg * scale };
  const fallbackTextStyle = { fontSize: typography.fontSize.body * scale };
  const metaStyle = { gap: Math.max(2, 4 * scale) };
  const titleStyle = { fontSize: typography.fontSize.body * scale };
  const detailStyle = { fontSize: typography.fontSize.caption * scale };

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      focusable
      accessibilityRole="button"
      accessibilityLabel={show.title}
      style={[styles.wrap, wrapStyle, { width }]}
    >
      <FocusRing focused={focused} width={Math.max(2, 4 * scale)} color={darkColors.accent} radius={radii.card * scale}>
        <View style={[styles.poster, posterStyle]}>
          {show.posterUrl ? (
            <PosterImage uri={show.posterUrl} />
          ) : (
            <View style={[styles.fallback, fallbackStyle]}>
              <Text style={[styles.fallbackText, fallbackTextStyle]}>{show.title}</Text>
            </View>
          )}
        </View>
      </FocusRing>

      <View style={[styles.meta, metaStyle]}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1} ellipsizeMode="tail">
          {show.title}
        </Text>
        <Text style={[styles.detail, detailStyle]} numberOfLines={1}>
          {show.year ?? "Unknown year"} · {seasonLabel}
        </Text>
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
  detail: {
    color: darkColors.muted,
  },
});
