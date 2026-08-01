import { useLocalSearchParams, useRouter, type RelativePathString } from "expo-router";
import { Bookmark, BookmarkCheck, Check, Compass, EyeOff, Play, RotateCcw } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View, type TextStyle, type ViewStyle } from "react-native";

import { CastRail } from "@/src/components/catalog/CastRail";
import { CastRailSkeleton } from "@/src/components/catalog/CastRailSkeleton";
import { HeroFactChip, HeroFactsRow } from "@/src/components/catalog/HeroFactChip";
import { MediaFileList } from "@/src/components/catalog/MediaFileList";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useMediaCastCredits } from "@/src/hooks/useMediaCastCredits";
import { useMovieDetail, useToggleMovieWatchlist, useSetMovieWatched } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@lunarr/core";
import { readApiError } from "@lunarr/api";
import { queryKeys } from "@lunarr/core";
import { movieFileMeta } from "@lunarr/core";
import { formatDuration, formatFileSize } from "@lunarr/core";
import {
  findCompletedProgress,
  findResumeProgress,
  indexPlaybackProgress,
  pickPrimaryPlaybackFile,
  playbackStartSeconds,
  primaryPlaybackActionLabel,
  resumePlaybackLabel,
  resumePlaybackPercent,
} from "@lunarr/core";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

import { ActionButton } from "./ActionButton";
import { DetailHero } from "./DetailHero";

export function MovieDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { scale } = useTVScale();

  const { data, isLoading, error, refetch } = useMovieDetail(id);
  const toggleWatchlist = useToggleMovieWatchlist();
  const setWatched = useSetMovieWatched(id ?? "");
  const castQuery = useMediaCastCredits("movie", id);

  useRefreshOnFocus([queryKeys.movies.detail(id ?? ""), queryKeys.movies.credits(id ?? "")]);

  const movie = data?.movie ?? null;
  const posterUrl = data?.posterUrl ?? null;
  const backdropUrl = data?.backdropUrl ?? null;
  const genres = data?.genres ?? [];
  const files = data?.files ?? [];
  const progress = data?.progress ?? [];
  const directors = data?.directors ?? [];
  const writers = data?.writers ?? [];
  const inWatchlist = data?.inWatchlist ?? false;

  const progressByFile = indexPlaybackProgress(progress);
  const primaryFile = pickPrimaryPlaybackFile(files, progress);
  const resumeProgress = findResumeProgress(progress);
  const completedProgress = findCompletedProgress(progress);
  const primaryActionLabel = primaryPlaybackActionLabel(resumeProgress, completedProgress);

  const resumeLabel = resumeProgress
    ? resumePlaybackLabel(resumeProgress.position_seconds, resumeProgress.duration_seconds)
    : null;

  const resumePercent = resumeProgress
    ? resumePlaybackPercent(resumeProgress.position_seconds, resumeProgress.duration_seconds)
    : 0;

  const totalSizeBytes = files.reduce((total, file) => total + Number(file.size_bytes ?? 0), 0);

  const ratingLabel =
    movie?.vote_average === null || movie?.vote_average === undefined ? null : Number(movie.vote_average).toFixed(1);

  const releaseLabel = movie?.release_date ?? (movie?.year ? String(movie.year) : null);

  const play = (file: (typeof files)[number]) => {
    router.push({
      pathname: "/player",
      params: {
        mediaItemId: movie?.id ?? id,
        title: movie?.title ?? "Movie",
        fileId: file.id,
        startSeconds: String(playbackStartSeconds(file.id, progressByFile)),
      },
    });
  };

  const toggleWatched = (file: (typeof files)[number], completed: boolean) => {
    if (!movie) return;
    setWatched.mutate({ fileId: file.id, completed });
  };

  const toggleWatchlistItem = () => {
    if (!movie) return;
    const mediaItemId = movie.id;
    toggleWatchlist.mutate({ mediaItemId });
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (!movie) {
    return (
      <ErrorView
        layout="centered"
        message={error ? readApiError(error, "Failed to load movie") : "Movie not found"}
        retryLabel="Reload"
        onRetry={() => void refetch()}
      />
    );
  }

  const primaryIcon = completedProgress && !resumeProgress ? RotateCcw : Play;

  const bodyStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingVertical: spacing.xl * scale,
    gap: spacing.xl * scale,
  };
  const sectionStyle = { gap: spacing.md * scale };
  const sectionTitleStyle = { fontSize: typography.fontSize.heading * scale };
  const overviewStyle = {
    fontSize: typography.fontSize.body * scale,
    lineHeight: typography.lineHeight.relaxed * scale,
  };
  const metaGridStyle = { gap: spacing.xl * scale };
  const metaItemStyle = { gap: spacing.xs * scale, minWidth: tvSize(220, scale) };
  const metaLabelStyle = { fontSize: typography.fontSize.meta * scale, letterSpacing: 0.6 * scale };
  const metaValueStyle = { fontSize: typography.fontSize.title * scale };
  const metaItemProps = { metaItemStyle, metaLabelStyle, metaValueStyle };

  const heroFacts = (
    <HeroFactsRow>
      {releaseLabel ? <HeroFactChip>{releaseLabel}</HeroFactChip> : null}
      {movie.runtime_seconds ? <HeroFactChip>{formatDuration(movie.runtime_seconds)}</HeroFactChip> : null}
      {ratingLabel ? <HeroFactChip>{ratingLabel}</HeroFactChip> : null}
      {directors.length > 0 ? <HeroFactChip>{directors.join(", ")}</HeroFactChip> : null}
    </HeroFactsRow>
  );

  const heroActions = (
    <>
      {primaryFile ? (
        <ActionButton label={primaryActionLabel} icon={primaryIcon} onPress={() => play(primaryFile)} autoFocus />
      ) : null}
      <ActionButton
        label={inWatchlist ? "In Watchlist" : "Watchlist"}
        icon={inWatchlist ? BookmarkCheck : Bookmark}
        onPress={toggleWatchlistItem}
      />
      {primaryFile ? (
        <ActionButton
          label={completedProgress ? "Unwatch" : "Watched"}
          icon={completedProgress ? EyeOff : Check}
          onPress={() => toggleWatched(primaryFile, !completedProgress)}
        />
      ) : null}
      <ActionButton
        label="Similar"
        icon={Compass}
        onPress={() => router.push(`/movies/${movie.id}/similar` as RelativePathString)}
      />
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <DetailHero
        backdropUrl={backdropUrl}
        posterUrl={posterUrl}
        title={movie.title}
        subtitle={movie.tagline}
        genres={genres}
        facts={heroFacts}
        resumeLabel={resumeLabel}
        resumePercent={resumePercent}
        actions={heroActions}
      />

      <View style={[styles.body, bodyStyle]}>
        {movie.overview ? (
          <View style={[styles.section, sectionStyle]}>
            <Text style={[styles.sectionTitle, sectionTitleStyle]}>Synopsis</Text>
            <Text style={[styles.overview, overviewStyle]}>{movie.overview}</Text>
          </View>
        ) : null}

        <View style={[styles.section, sectionStyle]}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Files</Text>
          <MediaFileList
            files={files}
            progressByFile={progressByFile}
            primaryFileId={primaryFile?.id}
            formatDetails={movieFileMeta}
            onPlay={play}
            onToggleWatched={(file, completed) => toggleWatched(file, completed)}
            showFeaturedBadge
            bordered={false}
          />
        </View>

        {castQuery.isLoading ? (
          <CastRailSkeleton />
        ) : castQuery.error ? null : (
          <CastRail cast={castQuery.data?.cast ?? []} />
        )}

        <View style={[styles.metaGrid, metaGridStyle]}>
          {writers.length > 0 ? <MetadataItem label="Writers" value={writers.join(", ")} {...metaItemProps} /> : null}
          {movie.status ? <MetadataItem label="Status" value={movie.status} {...metaItemProps} /> : null}
          {movie.original_language ? (
            <MetadataItem label="Language" value={movie.original_language.toUpperCase()} {...metaItemProps} />
          ) : null}
          {totalSizeBytes > 0 ? (
            <MetadataItem label="Size" value={formatFileSize(totalSizeBytes)} {...metaItemProps} />
          ) : null}
          {files.length > 0 ? <MetadataItem label="Files" value={String(files.length)} {...metaItemProps} /> : null}
        </View>
      </View>
    </ScrollView>
  );
}

function MetadataItem({
  label,
  value,
  metaItemStyle,
  metaLabelStyle,
  metaValueStyle,
}: {
  label: string;
  value: string;
  metaItemStyle: ViewStyle;
  metaLabelStyle: TextStyle;
  metaValueStyle: TextStyle;
}) {
  return (
    <View style={[styles.metaItem, metaItemStyle]}>
      <Text style={[styles.metaLabel, metaLabelStyle]}>{label}</Text>
      <Text style={[styles.metaValue, metaValueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {},
  section: {},
  sectionTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  overview: {
    color: darkColors.textSoft,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {},
  metaLabel: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.medium,
    textTransform: "uppercase",
  },
  metaValue: {
    color: darkColors.text,
  },
});
