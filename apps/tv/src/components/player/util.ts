export function formatTime(seconds: number) {
  const totalSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatTimeRange(currentSeconds: number, durationSeconds: number) {
  if (durationSeconds <= 0) {
    return `${formatTime(currentSeconds)} / --:--`;
  }
  return `${formatTime(currentSeconds)} / ${formatTime(durationSeconds)}`;
}

export function streamRelativePlaybackSeconds(input: { absoluteSeconds: number; streamStartSeconds?: number | null }) {
  const absoluteSeconds = Math.max(0, input.absoluteSeconds);
  const streamStartSeconds =
    Number.isFinite(input.streamStartSeconds) && Number(input.streamStartSeconds) > 0
      ? Number(input.streamStartSeconds)
      : 0;
  return Math.max(0, absoluteSeconds - streamStartSeconds);
}

export function absolutePlaybackSeconds(input: { relativeSeconds: number; streamStartSeconds?: number | null }) {
  const relativeSeconds = Math.max(0, input.relativeSeconds);
  const streamStartSeconds =
    Number.isFinite(input.streamStartSeconds) && Number(input.streamStartSeconds) > 0
      ? Number(input.streamStartSeconds)
      : 0;
  return streamStartSeconds + relativeSeconds;
}
