import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LARGE_TABLET_MIN_WIDTH, isTabletClassDevice, type DeviceTier } from "./device";

/**
 * Resolves the current device tier from live window dimensions. Tablets are
 * subclassed by effective content width so a 13" iPad Pro gets larger type than
 * an iPad Mini, instead of both collapsing to one "wide" bucket.
 */
export function useDeviceTier(): DeviceTier {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const effectiveWidth = width - insets.left - insets.right;

  if (!isTabletClassDevice()) return "phone";
  if (effectiveWidth >= LARGE_TABLET_MIN_WIDTH) return "large-tablet";
  return "compact-tablet";
}
