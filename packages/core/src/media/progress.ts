import { formatClockDuration, formatDuration } from "./format";

export type WatchProgressInput = {
  completed: boolean;
  progressSeconds: number;
  durationSeconds: number | null | undefined;
};

export function watchProgressPercent(input: WatchProgressInput): number {
  if (input.completed) return 100;
  if (!input.durationSeconds || input.durationSeconds <= 0) {
    return input.progressSeconds > 0 ? 4 : 0;
  }
  return Math.min(99, Math.max(0, Math.round((input.progressSeconds / input.durationSeconds) * 100)));
}

export function episodeProgressLabel(episode: {
  completed: boolean;
  progressSeconds: number;
  durationSeconds: number | null | undefined;
}): string | null {
  if (episode.completed || episode.progressSeconds <= 0) return null;
  if (!episode.durationSeconds) return "In progress";
  return `${inProgressWatchPercent(episode.progressSeconds, episode.durationSeconds)}%`;
}

/** Season episode rows: caller ensures in-progress and progressSeconds > 0. */
export function inProgressWatchPercent(progressSeconds: number, durationSeconds: number | null | undefined): number {
  if (!durationSeconds || durationSeconds <= 0) return 4;
  return Math.min(99, Math.max(1, Math.round((progressSeconds / durationSeconds) * 100)));
}

export function watchStatusLabel(input: WatchProgressInput): string {
  const percent = watchProgressPercent(input);
  if (input.completed) return "Watched";
  if (percent > 0) return `Resume ${percent}%`;
  return "Unwatched";
}

export type MediaFileProgress = {
  position_seconds: number;
  duration_seconds?: number | null;
  completed: boolean | number;
};

export type PlaybackProgressRecord = MediaFileProgress & {
  media_file_id: string;
};

export function indexPlaybackProgress<T extends PlaybackProgressRecord>(progress: T[]): Map<string, T> {
  const rows = new Map<string, T>();
  for (const item of progress) {
    rows.set(item.media_file_id, item);
  }
  return rows;
}

export function findResumeProgress<T extends PlaybackProgressRecord>(progress: T[]): T | undefined {
  return progress.find((item) => !item.completed && item.position_seconds > 0);
}

export function findCompletedProgress<T extends PlaybackProgressRecord>(progress: T[]): T | undefined {
  return progress.find((item) => Boolean(item.completed));
}

export function pickPrimaryPlaybackFile<T extends PlaybackProgressRecord, F extends { id: string }>(
  files: F[],
  progress: T[],
): F | undefined {
  const resume = findResumeProgress(progress);
  if (resume) {
    return files.find((file) => file.id === resume.media_file_id) ?? files[0];
  }
  const completed = findCompletedProgress(progress);
  if (completed) {
    return files.find((file) => file.id === completed.media_file_id) ?? files[0];
  }
  return files[0];
}

export function primaryPlaybackActionLabel(
  resume?: PlaybackProgressRecord,
  completed?: PlaybackProgressRecord,
): "Resume" | "Play again" | "Play" {
  if (resume) return "Resume";
  if (completed) return "Play again";
  return "Play";
}

export function playbackStartSeconds(fileId: string, progressByFile: Map<string, MediaFileProgress>): number {
  const row = progressByFile.get(fileId);
  if (!row || row.completed) return 0;
  return row.position_seconds;
}

export function mediaFileProgressLabel(progress: MediaFileProgress | undefined): string {
  if (!progress) return "Unwatched";
  if (Boolean(progress.completed)) return "Watched";

  const position = Math.max(0, Math.floor(Number(progress.position_seconds ?? 0)));
  const duration =
    progress.duration_seconds === null || progress.duration_seconds === undefined
      ? null
      : Math.max(0, Math.floor(Number(progress.duration_seconds)));
  if (position <= 0) return "Unwatched";
  if (!duration) return formatClockDuration(position);
  const percent = Math.min(99, Math.max(1, Math.round((position / duration) * 100)));
  return `${formatClockDuration(position)} / ${formatClockDuration(duration)} · ${percent}%`;
}

export function resumePlaybackLabel(
  positionSeconds: number,
  durationSeconds: number | null | undefined,
): string | null {
  const position = Math.max(0, Math.floor(Number(positionSeconds ?? 0)));
  if (position <= 0) return null;
  const duration =
    durationSeconds === null || durationSeconds === undefined ? null : Math.max(0, Math.floor(Number(durationSeconds)));
  if (!duration) return `Resume at ${formatDuration(position)}`;
  return `Resume at ${formatDuration(position)} of ${formatDuration(duration)}`;
}

export function resumePlaybackPercent(positionSeconds: number, durationSeconds: number | null | undefined): number {
  return watchProgressPercent({
    completed: false,
    progressSeconds: positionSeconds,
    durationSeconds: durationSeconds ?? null,
  });
}
