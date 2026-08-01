import { useLocalSearchParams, useRouter, type RelativePathString } from "expo-router";
import { Check, Play, RotateCcw, Tv } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HeroFactChip, HeroFactsRow } from "@/src/components/catalog/HeroFactChip";
import { PosterImage } from "@/src/components/catalog/PosterImage";
import { ProgressTrack } from "@/src/components/catalog/ProgressTrack";
import { WatchProgressSummary } from "@/src/components/catalog/WatchProgressSummary";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useSeasonDetail, useSetSeasonWatched } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { readApiError } from "@lunarr/api";
import { queryKeys } from "@/src/lib/api/query-keys";
import { formatDuration } from "@/src/lib/media/format";
import { episodeProgressLabel, inProgressWatchPercent } from "@/src/lib/media/progress";
import { episodeCode, seasonStats } from "@/src/lib/media/tv";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

import { ActionButton } from "./ActionButton";
import { DetailHero } from "./DetailHero";

export function SeasonDetail() {
  const { id, seasonId: routeSeasonId } = useLocalSearchParams<{ id: string; seasonId: string }>();
  const router = useRouter();
  const { scale } = useTVScale();
  const [activeSeasonId, setActiveSeasonId] = useState(routeSeasonId ?? "");

  const { data, isLoading, error, refetch } = useSeasonDetail(id, activeSeasonId);
  const setSeasonWatched = useSetSeasonWatched(id ?? "", activeSeasonId);

  useRefreshOnFocus([queryKeys.shows.season(id ?? "", activeSeasonId)]);

  useEffect(() => {
    if (routeSeasonId) setActiveSeasonId(routeSeasonId);
  }, [routeSeasonId]);

  const selectSeason = (nextSeasonId: string) => {
    if (nextSeasonId === activeSeasonId) return;
    setActiveSeasonId(nextSeasonId);
  };

  const show = data?.show ?? null;
  const seasonTabs = data?.seasons ?? [];
  const season = data?.season
    ? {
        id: data.season.id,
        title: data.season.title,
        seasonNumber: data.season.seasonNumber ?? null,
        overview: data.season.overview ?? null,
        posterUrl: data.season.posterUrl ?? null,
        episodes: data.season.episodes,
      }
    : null;

  const stats = season ? seasonStats(season.episodes) : null;

  const nextEpisode = season ? (season.episodes.find((ep) => !ep.completed && ep.fileId) ?? null) : null;

  const seasonComplete = Boolean(stats && stats.playable > 0 && stats.watched === stats.playable);

  const seasonTitle = (() => {
    if (season) {
      return season.title || `Season ${season.seasonNumber ?? "?"}`;
    }
    const tab = seasonTabs.find((entry) => entry.id === activeSeasonId);
    if (tab?.title) return tab.title;
    if (tab?.seasonNumber != null) return `Season ${tab.seasonNumber}`;
    return "Season";
  })();

  const toggleSeasonWatched = (completed: boolean) => {
    if (!show || !season) return;
    setSeasonWatched.mutate({ completed });
  };

  const playEpisode = (episode: NonNullable<typeof season>["episodes"][number]) => {
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

  if (isLoading) return <LoadingView />;

  if (!season || !show) {
    return (
      <ErrorView
        layout="centered"
        message={error ? readApiError(error, "Failed to load season") : "Season not found"}
        retryLabel="Reload"
        onRetry={() => void refetch()}
      />
    );
  }

  const ratingLabel = show.voteAverage != null ? Number(show.voteAverage).toFixed(1) : null;
  const nextEpisodeCode = nextEpisode ? episodeCode(nextEpisode.seasonNumber, nextEpisode.episodeNumber) : "";

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
  const seasonsRowStyle = { gap: spacing.md * scale };
  const seasonTabStyle = {
    paddingHorizontal: spacing.lg * scale,
    paddingVertical: spacing.md * scale,
    borderRadius: radii.control * scale,
    borderWidth: Math.max(1, 3 * scale),
  };
  const seasonTabLabelStyle = { fontSize: typography.fontSize.body * scale };
  const episodesStyle = { gap: spacing.md * scale };
  const episodeRowStyle = {
    gap: spacing.lg * scale,
    paddingVertical: spacing.lg * scale,
    paddingHorizontal: spacing.md * scale,
    borderRadius: radii.card * scale,
    borderWidth: Math.max(1, 2 * scale),
  };
  const episodeStillStyle = { width: tvSize(240, scale), borderRadius: radii.card * scale };
  const episodeStillFallbackStyle = { fontSize: typography.fontSize.heading * scale };
  const episodeProgressStyle = {
    left: spacing.sm * scale,
    right: spacing.sm * scale,
    bottom: spacing.sm * scale,
  };
  const episodeMainStyle = { gap: spacing.xs * scale };
  const episodeHeadingStyle = { gap: spacing.sm * scale };
  const episodeCodeStyle = { fontSize: typography.fontSize.body * scale };
  const episodeTitleStyle = { fontSize: typography.fontSize.title * scale };
  const episodeFactsStyle = { gap: spacing.sm * scale };
  const episodeFactStyle = { fontSize: typography.fontSize.body * scale };
  const episodeBadgeStyle = { fontSize: typography.fontSize.body * scale };
  const episodeOverviewStyle = {
    fontSize: typography.fontSize.body * scale,
    lineHeight: typography.lineHeight.relaxed * scale,
  };
  const episodeProgressHeight = Math.max(2, 4 * scale);

  const heroFacts = (
    <HeroFactsRow>
      {show.year ? <HeroFactChip>{String(show.year)}</HeroFactChip> : null}
      {show.status ? <HeroFactChip>{show.status}</HeroFactChip> : null}
      {ratingLabel ? <HeroFactChip>{ratingLabel}</HeroFactChip> : null}
      {stats ? <HeroFactChip>{`${stats.total} episodes · ${stats.watched} watched`}</HeroFactChip> : null}
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
      {nextEpisode?.fileId ? (
        <ActionButton
          label={nextEpisodeCode || "Episode"}
          icon={Tv}
          onPress={() => router.push(`/episodes/${nextEpisode.id}` as RelativePathString)}
        />
      ) : null}
      {stats && stats.playable > 0 ? (
        <ActionButton
          label={seasonComplete ? "Unwatch season" : "Watched season"}
          icon={seasonComplete ? RotateCcw : Check}
          onPress={() => toggleSeasonWatched(!seasonComplete)}
        />
      ) : null}
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <DetailHero
        backdropUrl={show.backdropUrl}
        posterUrl={season.posterUrl ?? show.posterUrl}
        title={`${show.title} · ${seasonTitle}`}
        genres={show.genres ?? []}
        facts={heroFacts}
        actions={heroActions}
      />

      <View style={[styles.body, bodyStyle]}>
        {stats && stats.total > 0 ? (
          <View style={styles.progressRow}>
            <WatchProgressSummary watched={stats.watched} total={stats.total} />
          </View>
        ) : null}

        {(season.overview ?? show.overview) ? (
          <View style={[styles.section, sectionStyle]}>
            <Text style={[styles.sectionTitle, sectionTitleStyle]}>Synopsis</Text>
            <Text style={[styles.overview, overviewStyle]}>{season.overview ?? show.overview}</Text>
          </View>
        ) : null}

        <View style={[styles.section, sectionStyle]}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Seasons</Text>
          <View style={[styles.seasonsRow, seasonsRowStyle]}>
            {seasonTabs.map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => selectSeason(tab.id)}
                focusable
                accessibilityRole="button"
                accessibilityLabel={`Switch to ${tab.title || `Season ${tab.seasonNumber ?? "?"}`}`}
                style={({ focused }) => [
                  styles.seasonTab,
                  seasonTabStyle,
                  tab.id === activeSeasonId && styles.seasonTabActive,
                  focused && styles.seasonTabFocused,
                ]}
              >
                <Text
                  style={[
                    styles.seasonTabLabel,
                    seasonTabLabelStyle,
                    tab.id === activeSeasonId && styles.seasonTabActiveLabel,
                  ]}
                >
                  {tab.title || `Season ${tab.seasonNumber ?? "?"}`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.episodes, episodesStyle]}>
          {season.episodes.map((episode) => {
            const code = episodeCode(episode.seasonNumber, episode.episodeNumber);
            const isMissing = !episode.fileId;
            const hasProgress = episode.progressSeconds > 0 && !episode.completed;
            const progressPercent = hasProgress
              ? inProgressWatchPercent(episode.progressSeconds, episode.durationSeconds)
              : 0;
            const progressLabel = episodeProgressLabel(episode);

            return (
              <Pressable
                key={episode.id}
                onPress={() => router.push(`/episodes/${episode.id}` as RelativePathString)}
                focusable
                accessibilityRole="button"
                accessibilityLabel={episode.title || code}
                style={({ focused }) => [
                  styles.episodeRow,
                  episodeRowStyle,
                  isMissing && styles.episodeRowMissing,
                  focused && styles.episodeRowFocused,
                ]}
              >
                <View style={[styles.episodeStill, episodeStillStyle]}>
                  {episode.stillUrl ? (
                    <PosterImage uri={episode.stillUrl} />
                  ) : (
                    <Text style={[styles.episodeStillFallback, episodeStillFallbackStyle]}>{code || "?"}</Text>
                  )}
                  {hasProgress ? (
                    <View style={[styles.episodeProgress, episodeProgressStyle]}>
                      <ProgressTrack percent={progressPercent} height={episodeProgressHeight} />
                    </View>
                  ) : null}
                </View>

                <View style={[styles.episodeMain, episodeMainStyle]}>
                  <View style={[styles.episodeHeading, episodeHeadingStyle]}>
                    <Text style={[styles.episodeCode, episodeCodeStyle]}>{code}</Text>
                    <Text style={[styles.episodeTitle, episodeTitleStyle]} numberOfLines={1}>
                      {episode.title}
                    </Text>
                  </View>

                  <View style={[styles.episodeFacts, episodeFactsStyle]}>
                    {episode.runtimeSeconds ? (
                      <Text style={[styles.episodeFact, episodeFactStyle]}>
                        {formatDuration(episode.runtimeSeconds)}
                      </Text>
                    ) : null}
                    {episode.fileId ? (
                      <Text style={[styles.episodeFact, episodeFactStyle]}>
                        {episode.fileCount ?? 1} {(episode.fileCount ?? 1) === 1 ? "file" : "files"}
                      </Text>
                    ) : (
                      <Text style={[styles.episodeMissingBadge, episodeBadgeStyle]}>Missing</Text>
                    )}
                    {episode.completed ? (
                      <Text style={[styles.episodeWatchedBadge, episodeBadgeStyle]}>Watched</Text>
                    ) : null}
                    {progressLabel ? (
                      <Text style={[styles.episodeProgressBadge, episodeBadgeStyle]}>{progressLabel}</Text>
                    ) : null}
                  </View>

                  {episode.overview ? (
                    <Text style={[styles.episodeOverview, episodeOverviewStyle]} numberOfLines={2}>
                      {episode.overview}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.bg,
  },
  body: {},
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {},
  sectionTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  overview: {
    color: darkColors.textSoft,
  },
  seasonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  seasonTab: {
    backgroundColor: darkColors.surfaceStrong,
    borderColor: "transparent",
  },
  seasonTabActive: {
    backgroundColor: darkColors.accentStrong,
  },
  seasonTabFocused: {
    borderColor: darkColors.accent,
    transform: [{ scale: 1.02 }],
  },
  seasonTabLabel: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  seasonTabActiveLabel: {
    color: darkColors.buttonText,
  },
  episodes: {},
  episodeRow: {
    flexDirection: "row",
    borderColor: "transparent",
  },
  episodeRowFocused: {
    borderColor: darkColors.accent,
  },
  episodeRowMissing: {
    opacity: 0.55,
  },
  episodeStill: {
    aspectRatio: 16 / 9,
    overflow: "hidden",
    backgroundColor: darkColors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  episodeStillFallback: {
    color: darkColors.subtle,
    fontWeight: typography.fontWeight.bold,
  },
  episodeProgress: {
    position: "absolute",
  },
  episodeMain: {
    flex: 1,
    minWidth: 0,
  },
  episodeHeading: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  episodeCode: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.bold,
  },
  episodeTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  episodeFacts: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  episodeFact: {
    color: darkColors.muted,
  },
  episodeMissingBadge: {
    color: darkColors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  episodeWatchedBadge: {
    color: darkColors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  episodeProgressBadge: {
    color: darkColors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  episodeOverview: {
    color: darkColors.textSoft,
  },
});
