import type { DeviceTier } from "@/src/lib/layout/device";
import { spacing } from "@/src/theme/spacing";

export const RAIL_POSTER_WIDTH = 140;

export type PosterGridKind = "movie" | "show" | "episode";

export type PosterGridMetrics = {
  numColumns: number;
  itemWidth: number;
  /** Column gap the item widths were computed against. Renderers must use this to avoid short rows. */
  columnGap: number;
};

type PosterGridBounds = {
  minWidth: number;
  maxWidth: number;
};

type GridConfig = {
  bounds: PosterGridBounds;
  target: number;
};

const MOVIE_GRID: Record<DeviceTier, GridConfig> = {
  phone: { bounds: { minWidth: 104, maxWidth: 152 }, target: 140 },
  "compact-tablet": { bounds: { minWidth: 120, maxWidth: 184 }, target: 160 },
  "large-tablet": { bounds: { minWidth: 140, maxWidth: 216 }, target: 192 },
};

const SHOW_GRID: Record<DeviceTier, GridConfig> = {
  phone: { bounds: { minWidth: 100, maxWidth: 136 }, target: 140 },
  "compact-tablet": { bounds: { minWidth: 116, maxWidth: 164 }, target: 156 },
  "large-tablet": { bounds: { minWidth: 140, maxWidth: 200 }, target: 184 },
};

const EPISODE_GRID: Record<DeviceTier, GridConfig> = {
  phone: { bounds: { minWidth: 168, maxWidth: 240 }, target: 200 },
  "compact-tablet": { bounds: { minWidth: 200, maxWidth: 296 }, target: 232 },
  "large-tablet": { bounds: { minWidth: 240, maxWidth: 344 }, target: 272 },
};

function gridConfig(kind: PosterGridKind, tier: DeviceTier): GridConfig {
  if (kind === "episode") return EPISODE_GRID[tier];
  if (kind === "show") return SHOW_GRID[tier];
  return MOVIE_GRID[tier];
}

function itemWidthForColumns(contentWidth: number, columnGap: number, numColumns: number) {
  return (contentWidth - columnGap * (numColumns - 1)) / numColumns;
}

function maxColumnCount(contentWidth: number, columnGap: number) {
  return Math.max(1, Math.floor((contentWidth + columnGap) / (columnGap + 1)));
}

function pickColumnCount(contentWidth: number, columnGap: number, minWidth: number, maxWidth: number) {
  const upperBound = maxColumnCount(contentWidth, columnGap);
  let bestInRange = 0;
  let bestInRangeWidth = contentWidth;
  let bestUnderMax = 0;
  let bestUnderMaxWidth = contentWidth;

  for (let numColumns = 1; numColumns <= upperBound; numColumns += 1) {
    const itemWidth = itemWidthForColumns(contentWidth, columnGap, numColumns);
    if (itemWidth <= maxWidth) {
      bestUnderMax = numColumns;
      bestUnderMaxWidth = itemWidth;
      if (itemWidth >= minWidth) {
        bestInRange = numColumns;
        bestInRangeWidth = itemWidth;
      }
    }
  }

  if (bestInRange > 0) {
    return { numColumns: bestInRange, itemWidth: bestInRangeWidth };
  }

  if (bestUnderMax > 0) {
    return { numColumns: bestUnderMax, itemWidth: bestUnderMaxWidth };
  }

  return { numColumns: 1, itemWidth: contentWidth };
}

function pickColumnCountForTarget(contentWidth: number, columnGap: number, target: number) {
  const upperBound = maxColumnCount(contentWidth, columnGap);
  let bestColumns = 1;
  let bestWidth = contentWidth;
  let bestDiff = Math.abs(contentWidth - target);

  for (let numColumns = 2; numColumns <= upperBound; numColumns += 1) {
    const itemWidth = itemWidthForColumns(contentWidth, columnGap, numColumns);
    const diff = Math.abs(itemWidth - target);
    if (diff < bestDiff) {
      bestColumns = numColumns;
      bestWidth = itemWidth;
      bestDiff = diff;
    }
    if (itemWidth < target) break;
  }

  return { numColumns: bestColumns, itemWidth: bestWidth };
}

export function posterGridMetrics(
  screenWidth: number,
  kind: PosterGridKind,
  extraHorizontalInset: number,
  tier: DeviceTier,
): PosterGridMetrics {
  const outerInset = spacing.md;
  const contentWidth = Math.max(0, screenWidth - outerInset * 2 - extraHorizontalInset);
  const { bounds, target } = gridConfig(kind, tier);
  const gap = spacing.sm;
  const picked =
    tier !== "phone"
      ? pickColumnCountForTarget(contentWidth, gap, target)
      : pickColumnCount(contentWidth, gap, bounds.minWidth, bounds.maxWidth);
  return { ...picked, columnGap: gap };
}
