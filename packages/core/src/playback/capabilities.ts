import { Platform } from "react-native";

/**
 * Client codec flags for GET /api/playback (native target + capabilities).
 *
 * The app plays media through the mpv-backed @lunarr/mpv-player, which bundles
 * FFmpeg and can hardware or software-decode essentially every codec this
 * backend produces (HEVC, AV1, VP9, VP8, Opus, Vorbis, WebM). Advertising all
 * of them lets the backend choose "direct" playback instead of transcoding to
 * HLS, which is smoother and avoids transcode related audio issues.
 *
 * AV1 is the one exception. On iOS/tvOS without a hardware AV1 decoder
 * (every current Apple TV), mpv falls back to dav1d software decode whose
 * 10-bit planar output stalls the `vo_avfoundation` display path, so the
 * player hangs instead of playing. Pass `av1: false` (from
 * `MpvPlayerModule.supportsAv1HardwareDecode()`) so the backend transcodes
 * for those devices. Android and web decode AV1 in software without that
 * stall, so they keep `av1: true`.
 */
export function clientPlaybackCapabilities(options?: { av1?: boolean }) {
  return {
    hlsNative: true,
    hlsFmp4: true,
    hevc: true,
    av1: options?.av1 ?? true,
    vp9: true,
    vp8: true,
    opus: true,
    vorbis: true,
    webm: true,
  };
}

/** Playback target reported to the backend for native (non-web) players. */
export const NATIVE_PLAYBACK_TARGET = "native";

export type PlaybackTargetParam = "web" | "cast" | "airplay" | "native";

export function maybeNativePlaybackTarget(current: PlaybackTargetParam | undefined): PlaybackTargetParam | undefined {
  return Platform.OS === "web" ? current : NATIVE_PLAYBACK_TARGET;
}
