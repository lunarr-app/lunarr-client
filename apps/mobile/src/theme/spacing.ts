import { scaleNum } from "./scale";

export const spacing = {
  xs: scaleNum(4),
  sm: scaleNum(8),
  md: scaleNum(12),
  lg: scaleNum(16),
  xl: scaleNum(24),
  xxl: scaleNum(32),
};

export const compactControlHeight = scaleNum(40);

/** Small control height for compact buttons and segmented-control segments. */
export const compactControlHeightSmall = compactControlHeight - 4;

export const radii = {
  control: 6,
  card: 8,
  pill: 999,
} as const;

/** Horizontal inset for detail screen sections below the hero (files, cast header, metadata). */
export const detailContentInset = spacing.md;

/** Hero overlay padding when the cover uses negative `spacing.md` horizontal margin. */
export const detailHeroOverlayInset = spacing.md + spacing.md;
