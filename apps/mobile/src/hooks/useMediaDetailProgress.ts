import {
  type PlaybackProgressRecord,
  findCompletedProgress,
  findResumeProgress,
  indexPlaybackProgress,
  pickPrimaryPlaybackFile,
  primaryPlaybackActionLabel,
  resumePlaybackLabel,
  watchProgressPercent,
} from "@lunarr/core";

export type MediaDetailProgress<F extends { id: string }, P extends PlaybackProgressRecord> = {
  progressByFile: Map<string, P>;
  primaryFile: F | undefined;
  resumeProgress: P | undefined;
  completedProgress: P | undefined;
  primaryActionLabel: string;
  resumeLabel: string | null;
  resumePercent: number;
};

export function useMediaDetailProgress<F extends { id: string }, P extends PlaybackProgressRecord>(
  files: F[],
  progress: P[],
): MediaDetailProgress<F, P> {
  const progressByFile = indexPlaybackProgress(progress);
  const primaryFile = pickPrimaryPlaybackFile(files, progress);
  const resumeProgress = findResumeProgress(progress);
  const completedProgress = findCompletedProgress(progress);
  const primaryActionLabel = primaryPlaybackActionLabel(resumeProgress, completedProgress);
  const resumeLabel = resumeProgress
    ? resumePlaybackLabel(resumeProgress.position_seconds, resumeProgress.duration_seconds)
    : null;
  const resumePercent = resumeProgress
    ? watchProgressPercent({
        completed: false,
        progressSeconds: resumeProgress.position_seconds,
        durationSeconds: resumeProgress.duration_seconds ?? null,
      })
    : 0;

  return {
    progressByFile,
    primaryFile,
    resumeProgress,
    completedProgress,
    primaryActionLabel,
    resumeLabel,
    resumePercent,
  };
}
