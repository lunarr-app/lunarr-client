import { HeroActions } from "@/src/components/catalog/HeroActions";
import { HeroFactChip, heroChipIconColor } from "@/src/components/catalog/HeroFactChip";
import { MediaFileList } from "@/src/components/catalog/MediaFileList";
import { MediaHero } from "@/src/components/catalog/MediaHero";
import { PlaybackProgressBar } from "@/src/components/catalog/PlaybackProgressBar";
import { DetailScreenSkeleton } from "@/src/components/layout/DetailScreenSkeleton";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { Screen } from "@/src/components/layout/Screen";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { useEpisodeDetail, useSetEpisodeWatched } from "@/src/hooks/queries";
import { useMediaDetailProgress } from "@/src/hooks/useMediaDetailProgress";
import { useRefreshOnFocus } from "@lunarr/core";
import { type EpisodeDetailResponse } from "@lunarr/api";
import { readApiError } from "@lunarr/api";
import { queryKeys } from "@lunarr/core";
import { movieFileMeta } from "@lunarr/core";
import { formatDuration, formatReleaseDate } from "@lunarr/core";
import { playbackStartSeconds } from "@lunarr/core";
import { episodeCode as formatEpisodeCode, seasonTabLabel } from "@lunarr/core";
import { darkColors } from "@/src/theme/colors";
import { detailContentInset, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Check, Clock3, EyeOff, Play, RotateCcw, Star, Tv } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

type EpisodeFile = EpisodeDetailResponse["files"][number];

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useEpisodeDetail(id);
  const setWatched = useSetEpisodeWatched(id ?? "", data?.show?.id ?? "");

  useRefreshOnFocus([queryKeys.episodes.detail(id ?? "")]);

  const episode = data?.episode ?? null;
  const show = data?.show ?? null;
  const season = data?.season ?? null;
  const files = data?.files ?? [];
  const progress = data?.progress ?? [];

  const {
    progressByFile,
    primaryFile,
    resumeProgress,
    completedProgress,
    primaryActionLabel,
    resumeLabel,
    resumePercent,
  } = useMediaDetailProgress(files, progress);

  const code = formatEpisodeCode(episode?.seasonNumber ?? null, episode?.episodeNumber ?? null);

  const play = (file: EpisodeFile) => {
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

  const toggleWatched = (file: EpisodeFile, completed: boolean) => {
    if (!episode) return;
    setWatched.mutate({ fileId: file.id, completed });
  };

  const mutationError = setWatched.error;

  if (isLoading) {
    return <DetailScreenSkeleton heroHeaderMode bodyVariant="files" />;
  }

  if (!episode) {
    return (
      <Screen>
        <ErrorView
          layout="centered"
          message={error ? readApiError(error, "Failed to load episode") : "Episode not found"}
          retryLabel="Reload"
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  const ratingLabel = episode.voteAverage != null ? Number(episode.voteAverage).toFixed(1) : null;
  const releaseLabel = formatReleaseDate(episode.releaseDate);
  const isMissing = files.length === 0;

  return (
    <ScreenScrollView wrapScreen={false}>
      <MediaHero
        title={episode.title}
        backdropUrl={episode.stillUrl ?? show?.backdropUrl ?? null}
        overview={episode.overview ?? null}
        contentPlacement="below"
        eyebrow={show?.title ?? null}
        onEyebrowPress={show ? () => router.push(`/shows/${show.id}`) : undefined}
        eyebrowSecondary={season ? seasonTabLabel(season) : null}
        onEyebrowSecondaryPress={
          season && show ? () => router.push(`/shows/${show.id}/seasons/${season.id}`) : undefined
        }
        onBack={() => router.back()}
        backLabel={show?.title ?? "Shows"}
        facts={
          <>
            {code ? <HeroFactChip>{code}</HeroFactChip> : null}
            {releaseLabel ? (
              <HeroFactChip icon={<Calendar size={13} color={heroChipIconColor} />}>{releaseLabel}</HeroFactChip>
            ) : null}
            {episode.runtimeSeconds ? (
              <HeroFactChip icon={<Clock3 size={13} color={heroChipIconColor} />}>
                {formatDuration(episode.runtimeSeconds)}
              </HeroFactChip>
            ) : null}
            {ratingLabel ? (
              <HeroFactChip icon={<Star size={13} color={heroChipIconColor} />}>{ratingLabel}</HeroFactChip>
            ) : null}
            {isMissing ? <HeroFactChip>Missing</HeroFactChip> : null}
          </>
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
              ...(season
                ? [
                    {
                      key: "season",
                      label: season.title,
                      onPress: () => router.push(`/shows/${show?.id}/seasons/${season.id}`),
                      icon: Tv,
                    },
                  ]
                : []),
            ]}
          />
        }
        below={resumeLabel ? <PlaybackProgressBar label={resumeLabel} percent={resumePercent} /> : null}
      />

      <View style={styles.body}>
        {mutationError ? (
          <ErrorView
            layout="footer"
            message={readApiError(mutationError, "Failed to update watch status")}
            retryLabel="Retry"
            onRetry={() => setWatched.variables && setWatched.mutate(setWatched.variables)}
          />
        ) : null}

        {isMissing ? (
          <Text style={styles.missingMessage}>This episode is not available in your library yet.</Text>
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
  missingMessage: {
    color: darkColors.muted,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.normal,
  },
});
