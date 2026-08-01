import { scaleNum } from "./scale";

export type Typography = {
  fontSize: {
    xs: number;
    sm: number;
    caption: number;
    meta: number;
    body: number;
    label: number;
    title: number;
    heading: number;
    large: number;
    page: number;
    hero: number;
    display: number;
  };
  fontWeight: {
    regular: "400";
    medium: "500";
    semibold: "600";
    bold: "700";
    heavy: "800";
  };
  lineHeight: {
    tight: number;
    small: number;
    normal: number;
    relaxed: number;
    display: number;
  };
};

const FONT_WEIGHT = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
} as const;

const typographyBase: Typography = {
  fontSize: {
    xs: 10,
    sm: 11,
    caption: 12,
    meta: 13,
    body: 14,
    label: 15,
    title: 16,
    heading: 18,
    large: 22,
    page: 24,
    hero: 30,
    display: 32,
  },
  fontWeight: FONT_WEIGHT,
  lineHeight: {
    tight: 12,
    small: 18,
    normal: 20,
    relaxed: 22,
    display: 28,
  },
};

export const typography: Typography = {
  fontSize: {
    xs: scaleNum(typographyBase.fontSize.xs),
    sm: scaleNum(typographyBase.fontSize.sm),
    caption: scaleNum(typographyBase.fontSize.caption),
    meta: scaleNum(typographyBase.fontSize.meta),
    body: scaleNum(typographyBase.fontSize.body),
    label: scaleNum(typographyBase.fontSize.label),
    title: scaleNum(typographyBase.fontSize.title),
    heading: scaleNum(typographyBase.fontSize.heading),
    large: scaleNum(typographyBase.fontSize.large),
    page: scaleNum(typographyBase.fontSize.page),
    hero: scaleNum(typographyBase.fontSize.hero),
    display: scaleNum(typographyBase.fontSize.display),
  },
  fontWeight: FONT_WEIGHT,
  lineHeight: {
    tight: scaleNum(typographyBase.lineHeight.tight),
    small: scaleNum(typographyBase.lineHeight.small),
    normal: scaleNum(typographyBase.lineHeight.normal),
    relaxed: scaleNum(typographyBase.lineHeight.relaxed),
    display: scaleNum(typographyBase.lineHeight.display),
  },
};
