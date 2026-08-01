import { formatDuration, formatFileSize } from "@/src/lib/media/format";

export type MediaFileLike = {
  id: string;
  basename?: string | null;
  label?: string | null;
  size_bytes?: number | null;
  duration_seconds?: number | null;
  video_codec?: string | null;
  audio_codec?: string | null;
  container?: string | null;
  extension?: string | null;
};

export function mediaFileLabel(file: MediaFileLike): string {
  return file.basename ?? file.label ?? file.id;
}

function mediaFileDetails(file: MediaFileLike): string {
  const parts = [
    file.container?.toUpperCase() ?? file.extension?.replace(/^\./, "").toUpperCase(),
    file.duration_seconds ? formatDuration(file.duration_seconds) : null,
    file.video_codec ? `Video ${file.video_codec}` : null,
    file.audio_codec ? `Audio ${file.audio_codec}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function movieFileMeta(file: MediaFileLike): string {
  const size = formatFileSize(file.size_bytes);
  const details = mediaFileDetails(file);
  return details ? `${size} · ${details}` : size;
}
