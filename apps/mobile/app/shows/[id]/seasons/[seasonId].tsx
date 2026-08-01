import { HeroActions } from "@/src/components/catalog/HeroActions";
import { HeroFactChip, heroChipIconColor } from "@/src/components/catalog/HeroFactChip";
import { MediaHero } from "@/src/components/catalog/MediaHero";
import { SeasonEpisodeList } from "@/src/components/catalog/SeasonEpisodeList";
import { SeasonEpisodeListSkeleton } from "@/src/components/catalog/SeasonEpisodeListSkeleton";
import {
  SeasonHeroActionsSkeleton,
  SeasonHeroFactsSkeleton,
  SeasonHeroProgressSkeleton,
} from "@/src/components/catalog/SeasonHeroMetaSkeleton";
import { SeasonTabs } from "@/src/components/catalog/SeasonTabs";
import { WatchProgressSummary } from "@/src/components/catalog/WatchProgressSummary";
import { DetailScreenSkeleton } from "@/src/components/layout/DetailScreenSkeleton";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { Screen } from "@/src/components/layout/Screen";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { useSeasonDetail, useSetEpisodeWatched, useSetSeasonWatched } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { type SeasonDetailWithEpisodes, type SeasonEpisodeDetail } from "@lunarr/api";
import { readApiError } from "@lunarr/api";
import { queryKeys } from "@/src/lib/api/query-keys";
import { episodeCode, findNextEpisode, seasonStats } from "@lunarr/core";
import { detailContentInset, spacing } from "@/src/theme/spacing";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Play, RotateCcw, Star, Tv } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function SeasonDetailScreen() {
  const { id, seasonId: routeSeasonId } = useLocalSearchParams<{
    id: string;
    seasonId: string;
  }>();
  const router = useRouter();
  const [activeSeasonId, setActiveSeasonId] = useState(routeSeasonId ?? "");
  const [seasonSwitching, setSeasonSwitching] = useState(false);

  const { data, isLoading, isFetching, error, refetch } = useSeasonDetail(id, activeSeasonId);
  const setSeasonWatchedMutation = useSetSeasonWatched(id ?? "", activeSeasonId);
  const setEpisodeWatchedMutation = useSetEpisodeWatched(id ?? "", id ?? "");

  useRefreshOnFocus([queryKeys.shows.season(id ?? "", activeSeasonId)]);

  useEffect(() => {
    if (routeSeasonId) setActiveSeasonId(routeSeasonId);
  }, [routeSeasonId]);

  useEffect(() => {
    if (!seasonSwitching) return;
    if (error) {
      setSeasonSwitching(false);
      return;
    }
    if (data?.season.id === activeSeasonId && !isFetching) {
      setSeasonSwitching(false);
    }
  }, [activeSeasonId, data, error, isFetching, seasonSwitching]);

  const selectSeason = (nextSeasonId: string) => {
    if (nextSeasonId === activeSeasonId) return;
    setSeasonSwitching(true);
    setActiveSeasonId(nextSeasonId);
  };

  const show = data?.show ?? null;

  const seasonTabs = data?.seasons ?? [];

  const season: SeasonDetailWithEpisodes | null = data
    ? {
        id: data.season.id,
        title: data.season.title,
        seasonNumber: data.season.seasonNumber ?? null,
        overview: data.season.overview ?? null,
        posterUrl: data.season.posterUrl ?? null,
        episodes: data.season.episodes,
      }
    : null;

  const displayedSeason = season?.id === activeSeasonId ? season : null;

  const stats = displayedSeason ? seasonStats(displayedSeason.episodes) : null;

  const nextEpisode = displayedSeason ? findNextEpisode(displayedSeason.episodes) : null;

  const activeSeasonTab = seasonTabs.find((entry) => entry.id === activeSeasonId) ?? null;

  const seasonTitle = (() => {
    if (displayedSeason) {
      return displayedSeason.title || `Season ${displayedSeason.seasonNumber ?? "?"}`;
    }
    if (activeSeasonTab?.title) return activeSeasonTab.title;
    if (activeSeasonTab?.seasonNumber != null) return `Season ${activeSeasonTab.seasonNumber}`;
    return "Season";
  })();

  const seasonProgressLabel = (() => {
    if (!stats) return "";
    if (stats.total === 0) return "No episodes";
    if (stats.missing > 0) {
      return `${stats.total} episodes · ${stats.missing} missing · ${stats.watched} watched`;
    }
    if (stats.watched === stats.total) return `${stats.total} episodes · complete`;
    return `${stats.total} episodes · ${stats.watched} watched`;
  })();

  const seasonComplete = Boolean(stats && stats.playable > 0 && stats.watched === stats.playable);

  const toggleSeasonWatched = (completed: boolean) => {
    if (!show || !displayedSeason) return;
    setSeasonWatchedMutation.mutate({ completed });
  };

  const toggleEpisodeWatched = (episode: SeasonEpisodeDetail) => {
    if (!episode.fileId) return;
    setEpisodeWatchedMutation.mutate({
      fileId: episode.fileId,
      completed: !episode.completed,
    });
  };

  const playEpisode = (episode: SeasonEpisodeDetail) => {
    if (!episode.fileId || !show) return;
    router.push({
      pathname: "/player",
      params: {
        mediaItemId: episode.id,
        title: `${show.title} · ${episode.title}`,
        fileId: episode.fileId,
        startSeconds: String(episode.progressSeconds ?? 0),
      },
    });
  };

  const episodeSkeletonRows = Math.min(
    Math.max(displayedSeason?.episodes.length ?? season?.episodes.length ?? 5, 3),
    8,
  );

  const mutationError = setSeasonWatchedMutation.error ?? setEpisodeWatchedMutation.error;

  const retryMutation = () => {
    if (setSeasonWatchedMutation.error && setSeasonWatchedMutation.variables) {
      setSeasonWatchedMutation.mutate(setSeasonWatchedMutation.variables);
      return;
    }
    if (setEpisodeWatchedMutation.error && setEpisodeWatchedMutation.variables) {
      setEpisodeWatchedMutation.mutate(setEpisodeWatchedMutation.variables);
    }
  };

  if (isLoading) {
    return <DetailScreenSkeleton heroHeaderMode bodyVariant="episodes" listRows={5} />;
  }

  if (!season || !show) {
    return (
      <Screen>
        <ErrorView
          layout="centered"
          message={error ? readApiError(error, "Failed to load season") : "Season not found"}
          retryLabel="Reload"
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  const ratingLabel = show.voteAverage != null ? Number(show.voteAverage).toFixed(1) : null;
  const nextEpisodeCode = nextEpisode ? episodeCode(nextEpisode.seasonNumber, nextEpisode.episodeNumber) : "";

  const heroSeason = displayedSeason;

  return (
    <ScreenScrollView wrapScreen={false}>
      <MediaHero
        title={`${show.title} · ${seasonTitle}`}
        posterUrl={heroSeason?.posterUrl ?? show.posterUrl ?? null}
        backdropUrl={show.backdropUrl ?? null}
        overview={heroSeason?.overview ?? show.overview ?? null}
        year={show.year ?? null}
        genres={(show.genres ?? []).slice(0, 4)}
        onBack={() => router.back()}
        backLabel={show.title}
        facts={
          seasonSwitching ? (
            <SeasonHeroFactsSkeleton />
          ) : (
            <>
              {show.status ? <HeroFactChip>{show.status}</HeroFactChip> : null}
              {ratingLabel ? (
                <HeroFactChip icon={<Star size={13} color={heroChipIconColor} />}>{ratingLabel}</HeroFactChip>
              ) : null}
              <HeroFactChip>{seasonProgressLabel}</HeroFactChip>
            </>
          )
        }
        actions={
          seasonSwitching ? (
            <SeasonHeroActionsSkeleton />
          ) : (
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
                ...(stats && stats.playable > 0
                  ? [
                      {
                        key: "season-watched",
                        label: seasonComplete ? "Unwatch season" : "Watched season",
                        onPress: () => toggleSeasonWatched(!seasonComplete),
                        icon: seasonComplete ? RotateCcw : Check,
                      },
                    ]
                  : []),
              ]}
            />
          )
        }
        below={
          seasonSwitching ? (
            <SeasonHeroProgressSkeleton />
          ) : stats && stats.total > 0 ? (
            <WatchProgressSummary watched={stats.watched} total={stats.total} />
          ) : null
        }
      />

      <View style={styles.body}>
        {error && data ? (
          <ErrorView
            layout="footer"
            title="Couldn't load season"
            message={readApiError(error, "Failed to load season")}
            retryLabel="Retry"
            onRetry={() => void refetch()}
          />
        ) : null}

        {mutationError ? (
          <ErrorView
            layout="footer"
            message={readApiError(mutationError, "Failed to update watch status")}
            retryLabel="Retry"
            onRetry={retryMutation}
          />
        ) : null}

        <SeasonTabs seasons={seasonTabs} activeSeasonId={activeSeasonId} onSelect={selectSeason} />

        {seasonSwitching ? (
          <SeasonEpisodeListSkeleton rows={episodeSkeletonRows} />
        ) : (
          <SeasonEpisodeList
            episodes={displayedSeason?.episodes ?? []}
            onOpenEpisode={(episode) => router.push(`/episodes/${episode.id}`)}
            onPlayEpisode={playEpisode}
            onToggleWatched={(episode) => void toggleEpisodeWatched(episode)}
          />
        )}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: detailContentInset,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
