import { ReactNode } from "react";
import { ImageBackground, StyleSheet, Text, TVFocusGuideView, View } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";

import { PlaybackProgressBar } from "@/src/components/catalog/PlaybackProgressBar";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

type Props = {
  backdropUrl: string | null | undefined;
  posterUrl?: string | null | undefined;
  title: string;
  subtitle?: string | null;
  genres?: string[];
  facts?: ReactNode;
  resumeLabel?: string | null;
  resumePercent?: number;
  progress?: ReactNode;
  actions: ReactNode;
};

export function DetailHero({
  backdropUrl,
  posterUrl,
  title,
  subtitle,
  genres,
  facts,
  resumeLabel,
  resumePercent,
  progress,
  actions,
}: Props) {
  const { scale } = useTVScale();

  const heroStyle = { height: tvSize(640, scale) };
  const infoStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    gap: spacing.md * scale,
    maxWidth: tvSize(900, scale),
  };
  const titleStyle = {
    fontSize: typography.fontSize.hero * scale,
    lineHeight: typography.lineHeight.display * scale,
  };
  const subtitleStyle = { fontSize: typography.fontSize.title * scale };
  const factsStyle = { gap: spacing.md * scale };
  const genresStyle = { gap: spacing.sm * scale };
  const genreStyle = {
    paddingHorizontal: spacing.md * scale,
    paddingVertical: spacing.xs * scale,
    borderRadius: tvSize(999, scale),
    fontSize: typography.fontSize.body * scale,
    borderWidth: Math.max(1, 1 * scale),
  };
  const progressStyle = { marginTop: spacing.sm * scale };
  const actionsStyle = {
    gap: spacing.md * scale,
    marginTop: spacing.sm * scale,
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingBottom: spacing.xxl * scale,
  };

  return (
    <View style={[styles.hero, heroStyle]}>
      <ImageBackground
        source={{ uri: backdropUrl ?? posterUrl ?? undefined }}
        style={styles.backdrop}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(8,12,17,0.3)", "rgba(8,12,17,0.72)", darkColors.bg]}
          locations={[0, 0.55, 1]}
          style={styles.backdropGradient}
        />
      </ImageBackground>

      <View style={[styles.info, infoStyle]}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}

        {facts ? <View style={[styles.facts, factsStyle]}>{facts}</View> : null}

        {genres && genres.length > 0 ? (
          <View style={[styles.genres, genresStyle]}>
            {genres.map((genre) => (
              <Text key={genre} style={[styles.genre, genreStyle]}>
                {genre}
              </Text>
            ))}
          </View>
        ) : null}

        {resumeLabel ? <PlaybackProgressBar label={resumeLabel} percent={resumePercent ?? 0} /> : null}

        {progress ? <View style={[styles.progress, progressStyle]}>{progress}</View> : null}
      </View>

      <TVFocusGuideView autoFocus style={[styles.actions, actionsStyle]}>
        {actions}
      </TVFocusGuideView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: "relative",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: darkColors.bgSoft,
  },
  backdropGradient: {
    ...StyleSheet.absoluteFill,
  },
  info: {},
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  genre: {
    color: darkColors.heroGenre,
    borderColor: darkColors.heroGenreBorder,
    backgroundColor: darkColors.heroGenreSoft,
    overflow: "hidden",
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    color: darkColors.muted,
  },
  facts: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  progress: {},
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
