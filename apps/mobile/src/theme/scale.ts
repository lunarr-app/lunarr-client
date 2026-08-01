import { Dimensions } from "react-native";

import { COMPACT_TABLET_MIN_WIDTH, LARGE_TABLET_MIN_WIDTH, isTabletClassDevice } from "@/src/lib/layout/device";

const effectiveWidth = isTabletClassDevice() ? Dimensions.get("window").width : 0;

const scaleFactor =
  effectiveWidth >= LARGE_TABLET_MIN_WIDTH ? 1.25 : effectiveWidth >= COMPACT_TABLET_MIN_WIDTH ? 1.1 : 1.0;

export function scaleNum(n: number): number {
  return Math.round(n * scaleFactor);
}
