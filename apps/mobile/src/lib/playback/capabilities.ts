import { Platform } from "react-native";

const androidApiLevel = Platform.OS === "android" ? (Platform.Version as number) : 0;

/** Client codec flags for GET /api/playback (web target + capabilities). */
export function clientPlaybackCapabilities() {
  return {
    hlsNative: true,
    hlsFmp4: true,
    hevc: Platform.OS === "ios", // iOS has Apple HEVC hardware decode
    av1: androidApiLevel >= 29,
    vp9: true,
    vp8: false,
    opus: true,
    vorbis: false,
    webm: false,
  };
}
