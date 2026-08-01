const CONTINUE_AGE_PRESETS = [0, 7, 30, 90] as const;

export type ContinueAgePreset = (typeof CONTINUE_AGE_PRESETS)[number] | "custom";

function isContinueAgePreset(days: number): days is (typeof CONTINUE_AGE_PRESETS)[number] {
  return (CONTINUE_AGE_PRESETS as readonly number[]).includes(days);
}

export function continueAgePresetFromDays(days: number): ContinueAgePreset {
  return isContinueAgePreset(days) ? days : "custom";
}

function formatContinueAgePresetLabel(days: (typeof CONTINUE_AGE_PRESETS)[number]) {
  return days === 0 ? "Off" : `${days}d`;
}

export function parseCustomContinueMaxAgeDays(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.min(parsed, 3650);
}

export const CONTINUE_AGE_OPTIONS: { value: ContinueAgePreset; label: string }[] = [
  ...CONTINUE_AGE_PRESETS.map((days) => ({
    value: days,
    label: formatContinueAgePresetLabel(days),
  })),
  { value: "custom", label: "Custom" },
];
