import { PosterGridCardSkeleton } from "@/src/components/catalog/CatalogCardSkeleton";
import {
  PosterGridItemWidthProvider,
  usePosterGridItemWidth,
  usePosterGridMetrics,
} from "@/src/components/catalog/PosterGridMetricsContext";
import { type PosterGridKind } from "@/src/lib/media/grid";
import { spacing } from "@/src/theme/spacing";
import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type GridProps = {
  kind: PosterGridKind;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function PosterFlexGrid({ kind, style, children }: GridProps) {
  const { itemWidth, columnGap } = usePosterGridMetrics(kind);

  return (
    <PosterGridItemWidthProvider itemWidth={itemWidth}>
      <View style={[styles.grid, { gap: columnGap }, style]}>{children}</View>
    </PosterGridItemWidthProvider>
  );
}

type CellProps = {
  children: ReactNode;
};

export function PosterFlexGridCell({ children }: CellProps) {
  const itemWidth = usePosterGridItemWidth();

  return <View style={{ width: itemWidth ?? "100%" }}>{children}</View>;
}

type SkeletonProps = {
  kind: PosterGridKind;
  count?: number;
  style?: StyleProp<ViewStyle>;
  numColumns?: number;
  itemWidth?: number;
  columnGap?: number;
};

export function CatalogFlexGridSkeleton({
  kind,
  count = kind === "episode" ? 3 : 8,
  style,
  numColumns,
  itemWidth,
  columnGap,
}: SkeletonProps) {
  if (numColumns != null && itemWidth != null) {
    const rows = Math.ceil(count / numColumns);
    const gap = columnGap ?? spacing.sm;
    return (
      <View style={style}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={rowIndex} style={[styles.skeletonRow, { gap }]}>
            {Array.from({ length: numColumns }).map((_, columnIndex) => {
              const index = rowIndex * numColumns + columnIndex;
              if (index >= count) {
                return <View key={columnIndex} style={{ width: itemWidth }} />;
              }
              return (
                <View key={columnIndex} style={{ width: itemWidth }}>
                  <PosterGridCardSkeleton variant={kind} />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  }

  return (
    <PosterFlexGrid kind={kind} style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <PosterFlexGridCell key={index}>
          <PosterGridCardSkeleton variant={kind} />
        </PosterFlexGridCell>
      ))}
    </PosterFlexGrid>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skeletonRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
});
