import { CastRail } from "@/src/components/catalog/CastRail";
import { CastRailSkeleton } from "@/src/components/catalog/CastRailSkeleton";
import { HeroActions } from "@/src/components/catalog/HeroActions";
import { HeroFactChip, heroChipIconColor } from "@/src/components/catalog/HeroFactChip";
import { MediaFileList } from "@/src/components/catalog/MediaFileList";
import { MediaHero } from "@/src/components/catalog/MediaHero";
import { MovieMetadataPanel } from "@/src/components/catalog/MovieMetadataPanel";
import { PlaybackProgressBar } from "@/src/components/catalog/PlaybackProgressBar";
import { DetailScreenSkeleton } from "@/src/components/layout/DetailScreenSkeleton";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { Screen } from "@/src/components/layout/Screen";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { useMovieDetail, useSetMovieWatched, useToggleMovieWatchlist } from "@/src/hooks/queries";
import { useMediaCastCredits } from "@/src/hooks/useMediaCastCredits";
import { useMediaDetailProgress } from "@/src/hooks/useMediaDetailProgress";
import { useRefreshOnFocus } from "@lunarr/core";
import { type MovieFileRecord } from "@lunarr/api";
import { readApiError } from "@lunarr/api";
import { queryKeys } from "@lunarr/core";
import { movieFileMeta } from "@lunarr/core";
import { playbackStartSeconds } from "@lunarr/core";
import { detailContentInset, spacing } from "@/src/theme/spacing";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bookmark, BookmarkCheck, Check, Compass, EyeOff, Play, RotateCcw, Star } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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
  const keywords = data?.keywords ?? [];
  const productionCompanies = data?.productionCompanies ?? [];
  const inWatchlist = data?.inWatchlist ?? false;

  const {
    progressByFile,
    primaryFile,
    resumeProgress,
    completedProgress,
    primaryActionLabel,
    resumeLabel,
    resumePercent,
  } = useMediaDetailProgress(files, progress);

  const totalSizeBytes = files.reduce((total, file) => total + Number(file.size_bytes ?? 0), 0);

  const ratingLabel = (() => {
    if (movie?.vote_average === null || movie?.vote_average === undefined) {
      return null;
    }
    return Number(movie.vote_average).toFixed(1);
  })();

  const yearValue = (() => {
    const raw = movie?.release_date ?? (movie?.year != null ? String(movie.year) : null);
    if (!raw) return null;
    const match = String(raw).match(/\d{4}/);
    return match ? Number(match[0]) : null;
  })();

  const play = (file: MovieFileRecord) => {
    router.push({
      pathname: "/player",
      params: {
        mediaItemId: movie?.id ?? id,
        title: movie?.title ?? "Movie",
        fileId: file.id,
        startSeconds: String(playbackStartSeconds(file.id, progressByFile)),
        artworkUrl: posterUrl ?? backdropUrl ?? undefined,
      },
    });
  };

  const toggleWatched = (file: MovieFileRecord, completed: boolean) => {
    if (!movie) return;
    setWatched.mutate({ fileId: file.id, completed });
  };

  const toggleWatchlistItem = () => {
    if (!movie) return;
    toggleWatchlist.mutate({ mediaItemId: movie.id });
  };

  const mutationError = toggleWatchlist.error ?? setWatched.error;

  const retryMutation = () => {
    if (toggleWatchlist.error && toggleWatchlist.variables) {
      toggleWatchlist.mutate(toggleWatchlist.variables);
      return;
    }
    if (setWatched.error && setWatched.variables) {
      setWatched.mutate(setWatched.variables);
    }
  };

  if (isLoading) {
    return <DetailScreenSkeleton heroHeaderMode bodyVariant="files" />;
  }

  if (!movie) {
    return (
      <Screen>
        <ErrorView
          layout="centered"
          message={error ? readApiError(error, "Failed to load movie") : "Movie not found"}
          retryLabel="Reload"
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  return (
    <ScreenScrollView wrapScreen={false}>
      <MediaHero
        title={movie.title}
        posterUrl={posterUrl}
        backdropUrl={backdropUrl}
        overview={movie.overview ?? null}
        year={yearValue}
        genres={genres}
        onBack={() => router.back()}
        backLabel="Movies"
        facts={
          ratingLabel ? (
            <HeroFactChip icon={<Star size={13} color={heroChipIconColor} />}>{ratingLabel}</HeroFactChip>
          ) : null
        }
        actions={
          <HeroActions
            primary={
              primaryFile
                ? {
                    key: "play",
                    label: primaryActionLabel,
                    onPress: () => play(primaryFile),
                    icon: completedProgress && !resumeProgress ? RotateCcw : Play,
                  }
                : undefined
            }
            secondary={[
              {
                key: "watchlist",
                label: inWatchlist ? "In Watchlist" : "Watchlist",
                onPress: toggleWatchlistItem,
                icon: inWatchlist ? BookmarkCheck : Bookmark,
              },
              ...(primaryFile
                ? [
                    {
                      key: "watched",
                      label: completedProgress ? "Unwatch" : "Watched",
                      onPress: () => toggleWatched(primaryFile, !completedProgress),
                      icon: completedProgress ? EyeOff : Check,
                    },
                  ]
                : []),
              {
                key: "similar",
                label: "Similar",
                onPress: () => router.push(`/movies/${movie.id}/similar`),
                icon: Compass,
              },
            ]}
          />
        }
        below={resumeLabel ? <PlaybackProgressBar label={resumeLabel} percent={resumePercent} /> : null}
      />

      <View style={styles.body}>
        {mutationError ? (
          <ErrorView
            layout="footer"
            message={readApiError(mutationError, "Failed to update")}
            retryLabel="Retry"
            onRetry={retryMutation}
          />
        ) : null}

        <SettingsSection title="Files">
          <View style={styles.filesBody}>
            <MediaFileList
              files={files}
              progressByFile={progressByFile}
              primaryFileId={primaryFile?.id}
              formatDetails={movieFileMeta}
              onPlay={play}
              onToggleWatched={toggleWatched}
              showFeaturedBadge
              bordered={false}
            />
          </View>
        </SettingsSection>

        {castQuery.isLoading ? (
          <CastRailSkeleton />
        ) : castQuery.error ? null : (
          <CastRail cast={castQuery.data?.cast ?? []} />
        )}

        <MovieMetadataPanel
          movie={movie}
          directors={directors}
          writers={writers}
          keywords={keywords}
          productionCompanies={productionCompanies}
          fileCount={files.length}
          totalSizeBytes={totalSizeBytes}
        />
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: detailContentInset,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  filesBody: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
