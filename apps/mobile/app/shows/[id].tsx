import { CastRail } from "@/src/components/catalog/CastRail";
import { HeroActions } from "@/src/components/catalog/HeroActions";
import { HeroFactChip, heroChipIconColor } from "@/src/components/catalog/HeroFactChip";
import { MediaHero } from "@/src/components/catalog/MediaHero";
import { PosterFlexGrid, PosterFlexGridCell } from "@/src/components/catalog/PosterFlexGrid";
import { SeasonCard } from "@/src/components/catalog/SeasonCard";
import { WatchProgressSummary } from "@/src/components/catalog/WatchProgressSummary";
import { DetailScreenSkeleton } from "@/src/components/layout/DetailScreenSkeleton";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { Screen } from "@/src/components/layout/Screen";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { useShowDetail, useToggleShowWatchlist } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { readApiError } from "@/src/lib/api/parse";
import { queryKeys } from "@/src/lib/api/query-keys";
import { episodeCode, pickShowResumeFromSeasons, seasonStats, type ShowResumeEpisode } from "@/src/lib/media/tv";
import { darkColors } from "@/src/theme/colors";
import { detailContentInset, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bookmark, BookmarkCheck, Compass, Play, Star, Tv } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function ShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useShowDetail(id);
  const toggleWatchlist = useToggleShowWatchlist();

  useRefreshOnFocus([queryKeys.shows.detail(id ?? "")]);

  const show = data?.show ?? null;

  const seasons = (data?.seasons ?? []).map((season) => {
    const stats = seasonStats(season.episodes);
    return {
      id: season.id,
      title: season.title,
      seasonNumber: season.seasonNumber ?? null,
      overview: season.overview ?? null,
      posterUrl: season.posterUrl ?? null,
      episodeCount: stats.total,
      playableCount: stats.playable,
      watchedCount: stats.watched,
    };
  });

  const nextEpisode = data ? pickShowResumeFromSeasons(data.seasons) : null;
  const inWatchlist = data?.inWatchlist ?? false;
  const cast = (data?.cast ?? []).map((person) => ({
    name: person.name,
    character: person.character ?? null,
    profilePath: person.profilePath ?? null,
    provider: person.provider ?? null,
    providerId: person.providerId ?? null,
  }));

  const watchedCount = seasons.reduce((total, season) => total + season.watchedCount, 0);
  const episodeCount = seasons.reduce((total, season) => total + season.episodeCount, 0);

  const playEpisode = (episode: ShowResumeEpisode) => {
    if (!episode.fileId) return;
    router.push({
      pathname: "/player",
      params: {
        mediaItemId: episode.id,
        title: `${show?.title ?? "Show"} · ${episode.title}`,
        fileId: episode.fileId,
        startSeconds: String(episode.progressSeconds ?? 0),
      },
    });
  };

  const toggleWatchlistItem = () => {
    if (!show) return;
    toggleWatchlist.mutate({ mediaItemId: show.id });
  };

  const mutationError = toggleWatchlist.error;

  if (isLoading) {
    return <DetailScreenSkeleton heroHeaderMode bodyVariant="seasons" />;
  }

  if (!show) {
    return (
      <Screen>
        <ErrorView
          layout="centered"
          message={error ? readApiError(error, "Failed to load show") : "Show not found"}
          retryLabel="Reload"
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  const ratingLabel = show.voteAverage != null ? Number(show.voteAverage).toFixed(1) : null;
  const nextEpisodeCode = nextEpisode ? episodeCode(nextEpisode.seasonNumber, nextEpisode.episodeNumber) : "";

  return (
    <ScreenScrollView wrapScreen={false}>
      <MediaHero
        title={show.title}
        posterUrl={show.posterUrl ?? null}
        backdropUrl={show.backdropUrl ?? null}
        overview={show.overview ?? null}
        year={show.year ?? null}
        genres={(show.genres ?? []).slice(0, 4)}
        onBack={() => router.back()}
        backLabel="Shows"
        facts={
          <>
            {show.status ? <HeroFactChip>{show.status}</HeroFactChip> : null}
            {ratingLabel ? (
              <HeroFactChip icon={<Star size={13} color={heroChipIconColor} />}>{ratingLabel}</HeroFactChip>
            ) : null}
          </>
        }
        actions={
          <HeroActions
            primary={
              nextEpisode?.fileId
                ? {
                    key: "play",
                    label: nextEpisode.progressSeconds > 0 ? "Resume" : "Play",
                    onPress: () => playEpisode(nextEpisode),
                    icon: Play,
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
              ...(nextEpisode?.fileId
                ? [
                    {
                      key: "episode",
                      label: nextEpisodeCode || "Episode",
                      onPress: () => router.push(`/episodes/${nextEpisode.id}`),
                      icon: Tv,
                    },
                  ]
                : []),
              {
                key: "similar",
                label: "Similar",
                onPress: () => router.push(`/shows/${show.id}/similar`),
                icon: Compass,
              },
            ]}
          />
        }
        below={episodeCount > 0 ? <WatchProgressSummary watched={watchedCount} total={episodeCount} /> : null}
      />

      <View style={styles.body}>
        {mutationError ? (
          <ErrorView
            layout="footer"
            message={readApiError(mutationError, "Failed to update watchlist")}
            retryLabel="Retry"
            onRetry={() => toggleWatchlist.variables && toggleWatchlist.mutate(toggleWatchlist.variables)}
          />
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seasons</Text>
            <Text style={styles.sectionSubtitle}>Choose a season to browse episodes.</Text>
          </View>
          <PosterFlexGrid kind="show">
            {seasons.map((season) => (
              <PosterFlexGridCell key={season.id}>
                <SeasonCard
                  title={season.title || `Season ${season.seasonNumber ?? "?"}`}
                  posterUrl={season.posterUrl}
                  fallbackPosterUrl={show.posterUrl}
                  counts={{
                    episodeCount: season.episodeCount,
                    playableCount: season.playableCount,
                    watchedCount: season.watchedCount,
                  }}
                  onPress={() => router.push(`/shows/${show.id}/seasons/${season.id}`)}
                />
              </PosterFlexGridCell>
            ))}
          </PosterFlexGrid>
        </View>

        <CastRail cast={cast} />
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: detailContentInset,
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  section: { gap: spacing.md },
  sectionHeader: { gap: 2 },
  sectionTitle: {
    color: darkColors.text,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
  },
  sectionSubtitle: { color: darkColors.muted, fontSize: typography.fontSize.body },
});
