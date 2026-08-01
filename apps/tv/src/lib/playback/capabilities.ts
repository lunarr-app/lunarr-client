import { Platform } from "react-native";

/** Client codec flags for GET /api/playback (web target + capabilities). */
export function clientPlaybackCapabilities() {
  return {
    hlsNative: true,
    hlsFmp4: true,
    hevc: Platform.OS === "ios", // iOS and tvOS both have Apple HEVC hardware decode
    av1: false,
    vp9: false,
    vp8: false,
    opus: false,
    vorbis: false,
    webm: false,
  };
}
