import { useDeviceTier } from "@/src/lib/layout/responsive";
import type { DeviceTier } from "@/src/lib/layout/device";
import { posterGridMetrics, type PosterGridKind, type PosterGridMetrics } from "@/src/lib/media/grid";
import { createContext, useContext, type ReactNode } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PosterGridItemWidthContext = createContext<number | undefined>(undefined);

function useTierPosterMetrics(kind: PosterGridKind): { metrics: PosterGridMetrics; tier: DeviceTier } {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tier = useDeviceTier();
  return { metrics: posterGridMetrics(width, kind, insets.left + insets.right, tier), tier };
}

export function usePosterGridMetrics(kind: PosterGridKind): PosterGridMetrics {
  return useTierPosterMetrics(kind).metrics;
}

export function usePosterWidth(kind: PosterGridKind, compactFallback: number): number {
  const { metrics, tier } = useTierPosterMetrics(kind);
  return tier !== "phone" || kind === "episode" ? metrics.itemWidth : compactFallback;
}

export function PosterGridItemWidthProvider({ itemWidth, children }: { itemWidth: number; children: ReactNode }) {
  return <PosterGridItemWidthContext.Provider value={itemWidth}>{children}</PosterGridItemWidthContext.Provider>;
}

export function usePosterGridItemWidth() {
  return useContext(PosterGridItemWidthContext);
}
