import type { TranscodePolicy } from "@lunarr/api";

export function readPolicyString(
  policy: TranscodePolicy | undefined,
  key: "preferredAudioLanguage" | "preferredSubtitleLanguage",
) {
  const value = policy?.[key];
  return typeof value === "string" ? value : "";
}
