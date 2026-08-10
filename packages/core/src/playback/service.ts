import { getApiConfig, normalizeBaseUrl } from "@lunarr/api";
import { getPlayback, type PlaybackDataResponse, type PlaybackSegment, type SegmentSkipPreferences } from "@lunarr/api";
import { readApiError } from "@lunarr/api";
import { clientPlaybackCapabilities, maybeNativePlaybackTarget } from "./capabilities";

export type PlaybackSubtitleTrack = {
  id: string;
  label: string;
  language: string;
  src: string;
  default: boolean;
};

export const DEFAULT_SEGMENT_SKIP_PREFERENCES: SegmentSkipPreferences = {
  enabled: true,
  automatic: false,
};

const SIGNED_PLAYBACK_TOKEN_PARAM = "remoteToken";

export type PlaybackDecision = {
  mode: "direct" | "remux" | "transcode" | "unavailable";
  status: "ready" | "preparing" | "unavailable";
  playbackSessionId: string | null;
  streamUrl: string | null;
  streamStartSeconds: number;
  durationSeconds: number | null;
  message: string | null;
  mediaFileId: string | null;
  tracks: PlaybackSubtitleTrack[];
};

export type PlaybackData = {
  item: {
    id: string;
    kind: string;
    title: string;
  };
  playback: PlaybackDecision;
  startSeconds: number;
  segments: PlaybackSegment[];
  segmentSkip: SegmentSkipPreferences;
};

export function isStreamRelativePlaybackMode(mode: PlaybackDecision["mode"] | null | undefined) {
  return mode === "remux" || mode === "transcode";
}

export type PlaybackPreference = "auto" | "prefer_direct" | "prefer_transcode";

export function readPlaybackPreference(
  policy: { playbackPreference?: string | null } | null | undefined,
): PlaybackPreference | undefined {
  const value = policy?.playbackPreference;
  if (value === "auto" || value === "prefer_direct" || value === "prefer_transcode") {
    return value;
  }
  return undefined;
}

function parseSubtitleTracks(tracks: PlaybackDataResponse["playback"]["tracks"]): PlaybackSubtitleTrack[] {
  return tracks.map((track) => ({
    id: track.id,
    label: track.label,
    language: track.language,
    src: track.src,
    default: track.default,
  }));
}

function parsePlaybackPayload(payload: PlaybackDataResponse): PlaybackData {
  const { item, playback } = payload;
  return {
    item: {
      id: item.id,
      kind: item.kind,
      title: item.title,
    },
    playback: {
      mode: playback.mode,
      status: playback.status,
      playbackSessionId: playback.playbackSessionId,
      streamUrl: playback.streamUrl,
      streamStartSeconds: playback.streamStartSeconds,
      durationSeconds:
        playback.file.duration_seconds != null && Number.isFinite(playback.file.duration_seconds)
          ? Math.floor(playback.file.duration_seconds)
          : null,
      message: playback.message,
      mediaFileId: playback.file.id,
      tracks: parseSubtitleTracks(playback.tracks),
    },
    startSeconds: Math.max(0, Math.floor(payload.startSeconds)),
    segments: payload.segments,
    segmentSkip: payload.segmentSkip,
  };
}

async function fetchPlayback(
  mediaItemId: string,
  options?: {
    fileId?: string;
    startSeconds?: number;
    forceTranscode?: boolean;
    supportsAv1HardwareDecode?: boolean;
  },
): Promise<PlaybackData> {
  const startSeconds = options?.startSeconds && options.startSeconds > 0 ? Math.floor(options.startSeconds) : undefined;

  const { data, error } = await getPlayback({
    path: { id: mediaItemId },
    query: {
      file: options?.fileId,
      start: startSeconds,
      transcode: options?.forceTranscode ? true : undefined,
      target: maybeNativePlaybackTarget(undefined),
      ...clientPlaybackCapabilities({ av1: options?.supportsAv1HardwareDecode }),
    },
  });

  if (error || !data) {
    throw new Error(readApiError(error, "Playback unavailable"));
  }

  return parsePlaybackPayload(data);
}

export async function pollPlaybackUntilReady(
  mediaItemId: string,
  options?: {
    fileId?: string;
    startSeconds?: number;
    forceTranscode?: boolean;
    signal?: AbortSignal;
    supportsAv1HardwareDecode?: boolean;
  },
  maxAttempts = 30,
): Promise<PlaybackData> {
  const signal = options?.signal;
  let abortHandler: (() => void) | null = null;
  const onAbort = () => abortHandler?.();
  signal?.addEventListener("abort", onAbort);

  try {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (signal?.aborted) throw new Error("Playback cancelled");
      const result = await fetchPlayback(mediaItemId, options);
      if (result.playback.status === "ready") return result;
      if (result.playback.status === "unavailable") {
        throw new Error(result.playback.message ?? "Playback unavailable");
      }
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          abortHandler = null;
          resolve();
        }, 1000);
        abortHandler = () => {
          clearTimeout(timer);
          reject(new Error("Playback cancelled"));
        };
      });
    }
    throw new Error("Playback is still preparing");
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}

function resolveSignedMediaUri(streamUrl: string): string {
  const absoluteUrl =
    streamUrl.startsWith("http://") || streamUrl.startsWith("https://")
      ? streamUrl
      : `${normalizeBaseUrl(getApiConfig().baseUrl)}${streamUrl.startsWith("/") ? streamUrl : `/${streamUrl}`}`;

  const parsed = new URL(absoluteUrl, getApiConfig().baseUrl || "http://localhost");
  if (!parsed.searchParams.has(SIGNED_PLAYBACK_TOKEN_PARAM)) {
    throw new Error("Playback URL is missing a signed access token");
  }

  return parsed.toString();
}

export function resolveMediaUri(streamUrl: string): string {
  if (!streamUrl) {
    throw new Error("Missing media URL");
  }
  return resolveSignedMediaUri(streamUrl);
}

export function resolvePlayableUri(playback: PlaybackDecision): string {
  if (!playback.streamUrl) {
    throw new Error("Missing stream URL");
  }
  return resolveSignedMediaUri(playback.streamUrl);
}

export function resolveSubtitleUri(track: PlaybackSubtitleTrack): string {
  if (!track.src) {
    throw new Error("Missing subtitle URL");
  }
  return resolveSignedMediaUri(track.src);
}
