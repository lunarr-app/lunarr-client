import { useLocalSearchParams, useRouter, type RelativePathString } from "expo-router";
import { Bookmark, BookmarkCheck, Compass, Play, Tv } from "lucide-react-native";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, TVFocusGuideView, View } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";

import { CastRail } from "@/src/components/catalog/CastRail";
import { HeroFactChip, HeroFactsRow } from "@/src/components/catalog/HeroFactChip";
import { WatchProgressSummary } from "@/src/components/catalog/WatchProgressSummary";

import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useShowDetail, useToggleShowWatchlist } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { readApiError } from "@/src/lib/api/parse";
import { queryKeys } from "@/src/lib/api/query-keys";
import { episodeCode, pickShowResumeFromSeasons, seasonStats, type ShowResumeEpisode } from "@/src/lib/media/tv";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

import { ActionButton } from "./ActionButton";
import { DetailHero } from "./DetailHero";

const SEASON_WIDTH = 300;
const POSTER_ASPECT = 2 / 3;

export function ShowDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { scale } = useTVScale();

  const { data, isLoading, error, refetch } = useShowDetail(id);
  const toggleWatchlist = useToggleShowWatchlist();

  useRefreshOnFocus([queryKeys.shows.detail(id ?? "")]);

  const show = data?.show ?? null;
  const seasons = data?.seasons
    ? data.seasons.map((season) => {
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
      })
    : [];

  const nextEpisode = data?.seasons ? pickShowResumeFromSeasons(data.seasons) : null;
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
    const mediaItemId = show.id;
    toggleWatchlist.mutate({ mediaItemId });
  };

  const seasonCountLabel = `${seasons.length} ${seasons.length === 1 ? "season" : "seasons"}`;
  const episodeCountLabel = `${episodeCount} ${episodeCount === 1 ? "episode" : "episodes"}`;
  const ratingLabel = show?.voteAverage != null ? Number(show.voteAverage).toFixed(1) : null;
  const nextEpisodeCode = nextEpisode ? episodeCode(nextEpisode.seasonNumber, nextEpisode.episodeNumber) : "";

  const seasonWidth = tvSize(SEASON_WIDTH, scale);
  const bodyStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingVertical: spacing.xl * scale,
    gap: spacing.xl * scale,
  };
  const sectionStyle = { gap: spacing.md * scale };
  const sectionTitleStyle = { fontSize: typography.fontSize.heading * scale };
  const railSectionStyle = { gap: spacing.md * scale, marginHorizontal: -tvSafe.horizontal * scale };
  const railSectionTitleStyle = {
    fontSize: typography.fontSize.heading * scale,
    paddingHorizontal: tvSafe.horizontal * scale,
  };
  const overviewStyle = {
    fontSize: typography.fontSize.body * scale,
    lineHeight: typography.lineHeight.relaxed * scale,
  };
  const seasonsRowStyle = { paddingVertical: tvSize(12, scale), paddingLeft: tvSafe.horizontal * scale };
  const seasonCardStyle = {
    width: seasonWidth,
    borderRadius: radii.card * scale,
    borderWidth: Math.max(1, 3 * scale),
    marginRight: spacing.lg * scale,
  };
  const seasonOverlayStyle = { padding: spacing.lg * scale, gap: spacing.xs * scale };
  const seasonTitleStyle = { fontSize: typography.fontSize.title * scale };
  const seasonMetaStyle = { fontSize: typography.fontSize.body * scale };

  if (isLoading) {
    return <LoadingView />;
  }

  if (!show) {
    return (
      <ErrorView
        layout="centered"
        message={error ? readApiError(error, "Failed to load show") : "Show not found"}
        retryLabel="Reload"
        onRetry={() => void refetch()}
      />
    );
  }

  const heroFacts = (
    <HeroFactsRow>
      {show.year ? <HeroFactChip>{String(show.year)}</HeroFactChip> : null}
      {show.status ? <HeroFactChip>{show.status}</HeroFactChip> : null}
      {ratingLabel ? <HeroFactChip>{ratingLabel}</HeroFactChip> : null}
      <HeroFactChip>{seasonCountLabel}</HeroFactChip>
      <HeroFactChip>{episodeCountLabel}</HeroFactChip>
    </HeroFactsRow>
  );

  const heroActions = (
    <>
      {nextEpisode?.fileId ? (
        <ActionButton
          label={nextEpisode.progressSeconds > 0 ? "Resume" : "Play"}
          icon={Play}
          onPress={() => playEpisode(nextEpisode)}
          autoFocus
        />
      ) : null}
      <ActionButton
        label={inWatchlist ? "In Watchlist" : "Watchlist"}
        icon={inWatchlist ? BookmarkCheck : Bookmark}
        onPress={toggleWatchlistItem}
      />
      {nextEpisode?.fileId ? (
        <ActionButton
          label={nextEpisodeCode || "Episode"}
          icon={Tv}
          onPress={() => router.push(`/episodes/${nextEpisode.id}` as RelativePathString)}
        />
      ) : null}
      <ActionButton
        label="Similar"
        icon={Compass}
        onPress={() => router.push(`/shows/${show.id}/similar` as RelativePathString)}
      />
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <DetailHero
        backdropUrl={show.backdropUrl}
        posterUrl={show.posterUrl}
        title={show.title}
        genres={show.genres ?? []}
        facts={heroFacts}
        progress={episodeCount > 0 ? <WatchProgressSummary watched={watchedCount} total={episodeCount} /> : null}
        actions={heroActions}
      />

      <View style={[styles.body, bodyStyle]}>
        {show.overview ? (
          <View style={[styles.section, sectionStyle]}>
            <Text style={[styles.sectionTitle, sectionTitleStyle]}>Synopsis</Text>
            <Text style={[styles.overview, overviewStyle]}>{show.overview}</Text>
          </View>
        ) : null}

        <View style={[styles.railSection, railSectionStyle]}>
          <Text style={[styles.railSectionTitle, railSectionTitleStyle]}>Seasons</Text>
          <TVFocusGuideView autoFocus>
            <ScrollView
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={seasonWidth + spacing.lg * scale}
              snapToAlignment="start"
              contentContainerStyle={seasonsRowStyle}
            >
              {seasons.map((season) => (
                <Pressable
                  key={season.id}
                  onPress={() => router.push(`/shows/${show.id}/seasons/${season.id}` as RelativePathString)}
                  focusable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${season.title || `Season ${season.seasonNumber ?? "?"}`}`}
                  style={({ focused }) => [styles.seasonCard, seasonCardStyle, focused && styles.seasonCardFocused]}
                >
                  <ImageBackground
                    source={{ uri: season.posterUrl ?? show.posterUrl ?? undefined }}
                    style={styles.seasonPoster}
                    resizeMode="cover"
                  >
                    <LinearGradient colors={["transparent", "rgba(8,12,17,0.95)"]} style={StyleSheet.absoluteFill} />
                    <View style={[styles.seasonOverlay, seasonOverlayStyle]}>
                      <Text style={[styles.seasonTitle, seasonTitleStyle]}>
                        {season.title || `Season ${season.seasonNumber ?? "?"}`}
                      </Text>
                      <Text style={[styles.seasonMeta, seasonMetaStyle]}>
                        {season.watchedCount}/{season.episodeCount} watched
                      </Text>
                    </View>
                  </ImageBackground>
                </Pressable>
              ))}
            </ScrollView>
          </TVFocusGuideView>
        </View>

        <CastRail cast={cast} />
      </View>
    </ScrollView>
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
  railSection: {},
  railSectionTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  overview: {
    color: darkColors.textSoft,
  },
  seasonsRow: {
    flexDirection: "row",
  },
  seasonCard: {
    aspectRatio: POSTER_ASPECT,
    overflow: "hidden",
    backgroundColor: darkColors.bgSoft,
    borderColor: "transparent",
  },
  seasonCardFocused: {
    borderColor: darkColors.accent,
    transform: [{ scale: 1.02 }],
  },
  seasonPoster: {
    flex: 1,
    justifyContent: "flex-end",
  },
  seasonOverlay: {},
  seasonTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  seasonMeta: {
    color: darkColors.muted,
  },
});
