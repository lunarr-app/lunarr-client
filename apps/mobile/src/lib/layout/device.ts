import { Dimensions, Platform } from "react-native";

export type DeviceTier = "phone" | "compact-tablet" | "large-tablet";

export const COMPACT_TABLET_MIN_WIDTH = 600;
export const LARGE_TABLET_MIN_WIDTH = 960;

/**
 * True when the physical device is tablet-class. On iOS we trust
 * `Platform.isPad` (phones never report as pads). On Android there is no such
 * flag, so we use the shortest physical screen dimension: a phone's short edge
 * is well under 600dp even in landscape, while tablets are >= 600dp.
 */
export function isTabletClassDevice(): boolean {
  if (Platform.OS === "ios") return Platform.isPad === true;
  if (Platform.OS === "android") {
    const screen = Dimensions.get("screen");
    return Math.min(screen.width, screen.height) >= 600;
  }
  return Dimensions.get("window").width >= COMPACT_TABLET_MIN_WIDTH;
}
