function parseSeconds(totalSeconds: number) {
  const safeTotal = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const hours = Math.floor(safeTotal / 3600);
  const minutes = Math.floor((safeTotal % 3600) / 60);
  const seconds = Math.floor(safeTotal % 60);
  return { hours, minutes, seconds };
}

export function formatDuration(totalSeconds: number): string {
  const { hours, minutes, seconds } = parseSeconds(totalSeconds);
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

export function formatClockDuration(totalSeconds: number): string {
  const { hours, minutes, seconds } = parseSeconds(totalSeconds);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatFileSize(bytes: number | string | null | undefined): string {
  const value = Number(bytes ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "Unknown size";
  const gib = value / 1024 / 1024 / 1024;
  if (gib >= 1) return `${gib.toFixed(2)} GB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function formatYearSpan(yearMin: number | null | undefined, yearMax: number | null | undefined): string | null {
  if (yearMin == null) return null;
  if (yearMax == null || yearMin === yearMax) return String(yearMin);
  return `${yearMin}-${yearMax}`;
}

export function formatVoteCount(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(value);
}

export function formatReleaseDate(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!match) return isoDate;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}
