import { PosterImage } from "@/src/components/catalog/PosterImage";
import { usePosterGridMetrics } from "@/src/components/catalog/PosterGridMetricsContext";
import { ProgressTrack } from "@/src/components/catalog/ProgressTrack";
import { Button } from "@/src/components/ui/Button";
import type { SeasonEpisodeDetail } from "@/src/lib/api/generated";
import { useDeviceTier } from "@/src/lib/layout/responsive";
import { formatDuration } from "@/src/lib/media/format";
import { episodeProgressLabel, inProgressWatchPercent } from "@/src/lib/media/progress";
import { episodeCode } from "@/src/lib/media/tv";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SeasonEpisode = SeasonEpisodeDetail;

type Props = {
  episodes: SeasonEpisode[];
  onOpenEpisode: (episode: SeasonEpisode) => void;
  onPlayEpisode: (episode: SeasonEpisode) => void;
  onToggleWatched: (episode: SeasonEpisode) => void;
};

export function SeasonEpisodeList({ episodes, onOpenEpisode, onPlayEpisode, onToggleWatched }: Props) {
  const isWide = useDeviceTier() !== "phone";
  const { itemWidth: episodeItemWidth } = usePosterGridMetrics("episode");
  const stillWidth = isWide ? episodeItemWidth : STILL_WIDTH;

  return (
    <View style={styles.list}>
      {episodes.map((episode) => {
        const code = episodeCode(episode.seasonNumber, episode.episodeNumber);
        const progressLabel = episodeProgressLabel(episode);
        const fileCount = episode.fileCount ?? 1;
        const showProgress = episode.progressSeconds > 0 && !episode.completed;
        const progressPercent = showProgress
          ? inProgressWatchPercent(episode.progressSeconds, episode.durationSeconds)
          : 0;

        return (
          <View
            key={episode.id}
            style={[styles.row, episode.completed && styles.rowWatched, !episode.fileId && styles.rowMissing]}
          >
            {episode.fileId ? (
              <Pressable onPress={() => onOpenEpisode(episode)} style={[styles.still, { width: stillWidth }]}>
                {episode.stillUrl ? (
                  <PosterImage uri={episode.stillUrl} />
                ) : (
                  <Text style={styles.stillFallback}>{code || episode.episodeNumber || ""}</Text>
                )}
                {showProgress ? (
                  <View style={styles.episodeProgress}>
                    <ProgressTrack percent={progressPercent} height={4} />
                  </View>
                ) : null}
              </Pressable>
            ) : (
              <View
                style={[styles.still, styles.stillMissing, { width: stillWidth }]}
                accessibilityLabel={`${episode.title} is missing a file`}
              >
                {episode.stillUrl ? (
                  <PosterImage uri={episode.stillUrl} />
                ) : (
                  <Text style={styles.stillFallback}>{code || episode.episodeNumber || ""}</Text>
                )}
              </View>
            )}

            <View style={styles.main}>
              <View style={styles.heading}>
                <Text style={styles.code}>{code}</Text>
                {episode.fileId ? (
                  <Pressable onPress={() => onOpenEpisode(episode)}>
                    <Text style={styles.title}>{episode.title}</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.title}>{episode.title}</Text>
                )}
              </View>

              <View style={styles.facts}>
                {episode.releaseDate ? <Text style={styles.fact}>{episode.releaseDate}</Text> : null}
                {episode.runtimeSeconds ? (
                  <Text style={styles.fact}>{formatDuration(episode.runtimeSeconds)}</Text>
                ) : null}
                {episode.fileId ? (
                  <Text style={styles.fact}>
                    {fileCount} {fileCount === 1 ? "file" : "files"}
                  </Text>
                ) : (
                  <Text style={styles.missingBadge}>Missing</Text>
                )}
                {episode.completed ? <Text style={styles.watchedBadge}>Watched</Text> : null}
                {progressLabel ? <Text style={styles.progressBadge}>{progressLabel}</Text> : null}
              </View>

              {episode.overview ? (
                <Text style={styles.overview} numberOfLines={3}>
                  {episode.overview}
                </Text>
              ) : null}

              <View style={styles.actions}>
                {episode.fileId ? (
                  <>
                    <Button compact mode="contained" onPress={() => onPlayEpisode(episode)}>
                      {showProgress ? "Resume" : "Play"}
                    </Button>
                    <Button compact mode="outlined" onPress={() => onToggleWatched(episode)}>
                      {episode.completed ? "Unwatch" : "Watched"}
                    </Button>
                  </>
                ) : (
                  <Text style={styles.missingNote}>No file</Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const STILL_WIDTH = 128;

const styles = StyleSheet.create({
  list: {
    gap: 0,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
    paddingVertical: spacing.md,
  },
  rowWatched: {
    opacity: 0.72,
  },
  rowMissing: {
    opacity: 0.9,
  },
  still: {
    aspectRatio: 16 / 9,
    borderRadius: radii.card,
    overflow: "hidden",
    backgroundColor: darkColors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  stillMissing: {
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  stillFallback: {
    color: darkColors.subtle,
    fontWeight: typography.fontWeight.heavy,
    fontSize: typography.fontSize.meta,
  },
  episodeProgress: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  heading: {
    gap: 2,
  },
  code: {
    color: darkColors.muted,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.heavy,
  },
  title: {
    color: darkColors.text,
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.bold,
  },
  facts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  fact: {
    color: darkColors.muted,
    fontSize: typography.fontSize.meta,
  },
  overview: {
    color: darkColors.textSoft,
    lineHeight: typography.lineHeight.normal,
    fontSize: typography.fontSize.body,
  },
  missingBadge: {
    color: darkColors.warning,
    fontSize: typography.fontSize.meta,
    fontWeight: typography.fontWeight.bold,
  },
  watchedBadge: {
    color: darkColors.success,
    fontSize: typography.fontSize.meta,
    fontWeight: typography.fontWeight.bold,
  },
  progressBadge: {
    color: darkColors.warning,
    fontSize: typography.fontSize.meta,
    fontWeight: typography.fontWeight.bold,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  missingNote: {
    color: darkColors.muted,
    fontSize: typography.fontSize.meta,
    fontWeight: typography.fontWeight.bold,
  },
});
