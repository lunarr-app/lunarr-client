import { Platform } from "react-native";

const androidApiLevel = Platform.OS === "android" ? (Platform.Version as number) : 0;

/** Client codec flags for GET /api/playback (web target + capabilities). */
export function clientPlaybackCapabilities() {
  const isTv = Platform.isTV === true;
  return {
    hlsNative: true,
    hlsFmp4: true,
    hevc: Platform.OS === "ios", // iOS and tvOS both have Apple HEVC hardware decode
    av1: !isTv && androidApiLevel >= 29,
    vp9: !isTv,
    vp8: false,
    opus: !isTv,
    vorbis: false,
    webm: false,
  };
}
