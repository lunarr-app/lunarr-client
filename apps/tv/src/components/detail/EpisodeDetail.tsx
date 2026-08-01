import { useLocalSearchParams, useRouter, type RelativePathString } from "expo-router";
import { Check, EyeOff, Play, RotateCcw, Tv } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { HeroFactChip, HeroFactsRow } from "@/src/components/catalog/HeroFactChip";
import { MediaFileList } from "@/src/components/catalog/MediaFileList";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useEpisodeDetail, useSetEpisodeWatched } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { readApiError } from "@lunarr/api";
import { queryKeys } from "@/src/lib/api/query-keys";
import { episodeFileDetails } from "@lunarr/core";
import { formatDuration } from "@lunarr/core";
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
import { episodeCode as formatEpisodeCode } from "@lunarr/core";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

import { ActionButton } from "./ActionButton";
import { DetailHero } from "./DetailHero";

export function EpisodeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { scale } = useTVScale();

  const { data, isLoading, error, refetch } = useEpisodeDetail(id);
  const setWatched = useSetEpisodeWatched(id ?? "", data?.show?.id ?? "");

  useRefreshOnFocus([queryKeys.episodes.detail(id ?? "")]);

  const episode = data?.episode ?? null;
  const show = data?.show ?? null;
  const season = data?.season ?? null;
  const files = data?.files ?? [];
  const progress = data?.progress ?? [];

  const progressByFile = indexPlaybackProgress(progress);
  const primaryFile = pickPrimaryPlaybackFile(files, progress);
  const resumeProgress = findResumeProgress(progress);
  const completedProgress = findCompletedProgress(progress);

  const code = formatEpisodeCode(episode?.seasonNumber ?? null, episode?.episodeNumber ?? null);

  const resumeLabel = resumeProgress
    ? resumePlaybackLabel(resumeProgress.position_seconds, resumeProgress.duration_seconds)
    : null;

  const resumePercent = resumeProgress
    ? resumePlaybackPercent(resumeProgress.position_seconds, resumeProgress.duration_seconds)
    : 0;

  const play = (file: (typeof files)[number]) => {
    router.push({
      pathname: "/player",
      params: {
        mediaItemId: episode?.id ?? id,
        title: `${show?.title ?? "Show"} · ${episode?.title ?? "Episode"}`,
        fileId: file.id,
        startSeconds: String(playbackStartSeconds(file.id, progressByFile)),
      },
    });
  };

  const toggleWatched = (file: (typeof files)[number], completed: boolean) => {
    if (!episode) return;
    setWatched.mutate({ fileId: file.id, completed });
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (!episode) {
    return (
      <ErrorView
        layout="centered"
        message={error ? readApiError(error, "Failed to load episode") : "Episode not found"}
        retryLabel="Reload"
        onRetry={() => void refetch()}
      />
    );
  }

  const primaryActionLabel = primaryPlaybackActionLabel(resumeProgress, completedProgress);
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

  const heroFacts = (
    <HeroFactsRow>
      {season?.title ? <HeroFactChip>{season.title}</HeroFactChip> : null}
      {episode.runtimeSeconds ? <HeroFactChip>{formatDuration(episode.runtimeSeconds)}</HeroFactChip> : null}
      {episode.voteAverage != null ? <HeroFactChip>{Number(episode.voteAverage).toFixed(1)}</HeroFactChip> : null}
    </HeroFactsRow>
  );

  const heroActions = (
    <>
      {primaryFile ? (
        <ActionButton label={primaryActionLabel} icon={primaryIcon} onPress={() => play(primaryFile)} autoFocus />
      ) : null}
      {primaryFile ? (
        <ActionButton
          label={completedProgress ? "Unwatch" : "Watched"}
          icon={completedProgress ? EyeOff : Check}
          onPress={() => toggleWatched(primaryFile, !completedProgress)}
        />
      ) : null}
      <ActionButton label="Show" icon={Tv} onPress={() => router.push(`/shows/${show?.id}` as RelativePathString)} />
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <DetailHero
        backdropUrl={episode.stillUrl ?? show?.posterUrl}
        posterUrl={show?.posterUrl}
        title={`${show?.title ?? "Show"} · ${code} · ${episode.title}`}
        facts={heroFacts}
        resumeLabel={resumeLabel}
        resumePercent={resumePercent}
        actions={heroActions}
      />

      <View style={[styles.body, bodyStyle]}>
        {episode.overview ? (
          <View style={[styles.section, sectionStyle]}>
            <Text style={[styles.sectionTitle, sectionTitleStyle]}>Synopsis</Text>
            <Text style={[styles.overview, overviewStyle]}>{episode.overview}</Text>
          </View>
        ) : null}

        <View style={[styles.section, sectionStyle]}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Files</Text>
          <MediaFileList
            files={files}
            progressByFile={progressByFile}
            primaryFileId={primaryFile?.id}
            formatDetails={episodeFileDetails}
            onPlay={play}
            onToggleWatched={(file, completed) => toggleWatched(file, completed)}
            showFeaturedBadge
            bordered={false}
          />
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
});
