import type { TranscodePolicy } from "@/src/lib/api/generated";

export function readPolicyString(
  policy: TranscodePolicy | undefined,
  key: "preferredAudioLanguage" | "preferredSubtitleLanguage",
) {
  const value = policy?.[key];
  return typeof value === "string" ? value : "";
}
