import { Platform, useWindowDimensions } from "react-native";

/**
 * Design baseline: Apple TV 4K / 1080p tvOS reports a logical viewport of
 * 1920 × 1080 dp. Many Android TV / Fire TV devices report a smaller logical
 * viewport (commonly 960 × 540 dp), which makes fixed-size dp layouts look
 * zoomed. Scaling every dp value against this baseline makes the same UI
 * occupy the same screen fraction on both platforms.
 */
export const TV_BASELINE_WIDTH = 1920;
export const TV_BASELINE_HEIGHT = 1080;

export type TVScale = {
  /** Width-based scale relative to the 1920 dp tvOS baseline. */
  scale: number;
  /** Raw window width in dp from useWindowDimensions(). */
  width: number;
  /** Raw window height in dp from useWindowDimensions(). */
  height: number;
  /** System font scale reported by useWindowDimensions(). */
  fontScale: number;
};

/**
 * Hook to get a TV-normalized scale factor. Returns `1` for tvOS (and any
 * device at or above the baseline). Returns a value between 0.5 and 1 for
 * Android TV / Fire TV devices that report a smaller logical width.
 */
export function useTVScale(): TVScale {
  const { width, height, fontScale } = useWindowDimensions();
  const rawScale = width / TV_BASELINE_WIDTH;
  // Clamp: never shrink below 0.5 (extremely low-density Android TV) and never
  // grow above baseline so the UI never exceeds the tvOS 10-foot size.
  const scale = Platform.isTV ? Math.min(1, Math.max(0.5, rawScale)) : 1;
  return { scale, width, height, fontScale };
}

/** Scale a dp size value. */
export function tvSize(size: number, scale: number): number {
  return size * scale;
}

/** Scale a font size by the TV scale factor. */
export function tvFontSize(size: number, scale: number): number {
  return size * scale;
}

/**
 * Compute a proportional width for a centered card. Mirrors the ratio the
 * original 640 dp card had on a 1920 dp tvOS screen (≈33%), clamped between
 * sensible minimum and maximum values.
 */
export function tvCardWidth(scale: number, { max = 640, min = 300 }: { max?: number; min?: number } = {}): number {
  return Math.max(min, Math.min(max, TV_BASELINE_WIDTH * 0.333 * scale));
}
