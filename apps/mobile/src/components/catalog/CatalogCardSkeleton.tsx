import { usePosterGridItemWidth } from "@/src/components/catalog/PosterGridMetricsContext";
import { Skeleton } from "@/src/components/layout/Skeleton";
import { RAIL_POSTER_WIDTH, type PosterGridKind } from "@/src/lib/media/grid";
import { radii, spacing } from "@/src/theme/spacing";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

const META_GAP = 4;
const TITLE_HEIGHT = 14;
const DETAIL_HEIGHT = 12;
const SHOW_TITLE_HEIGHT = 12;
const PROGRESS_HEIGHT = 3;

type CardProps = {
  width?: number;
  style?: StyleProp<ViewStyle>;
  includeProgress?: boolean;
};

function MovieCardSkeleton({ width, style, includeProgress = true }: CardProps) {
  return (
    <View style={[styles.wrap, width != null && { width }, style]}>
      <Skeleton style={styles.poster} borderRadius={radii.card} />
      <View style={styles.meta}>
        <Skeleton height={TITLE_HEIGHT} width="100%" borderRadius={radii.control} />
        <View style={styles.detailsRow}>
          <Skeleton height={DETAIL_HEIGHT} width="42%" borderRadius={radii.control} />
          <Skeleton height={DETAIL_HEIGHT} width="38%" borderRadius={radii.control} />
        </View>
        {includeProgress ? <Skeleton height={PROGRESS_HEIGHT} width="100%" borderRadius={radii.pill} /> : null}
      </View>
    </View>
  );
}

function ShowCardSkeleton({ width, style }: CardProps) {
  return (
    <View style={[styles.wrap, width != null && { width }, style]}>
      <Skeleton style={styles.poster} borderRadius={radii.card} />
      <View style={styles.meta}>
        <Skeleton height={TITLE_HEIGHT} width="100%" borderRadius={radii.control} />
        <Skeleton height={DETAIL_HEIGHT} width="78%" borderRadius={radii.control} />
      </View>
    </View>
  );
}

function EpisodeCardSkeleton({ width, style, includeProgress = true }: CardProps) {
  return (
    <View style={[styles.wrap, width != null ? { width } : styles.fillWidth, style]}>
      <Skeleton style={styles.still} borderRadius={radii.card} />
      <View style={styles.meta}>
        <Skeleton height={SHOW_TITLE_HEIGHT} width="64%" borderRadius={radii.control} />
        <Skeleton height={TITLE_HEIGHT} width="100%" borderRadius={radii.control} />
        <Skeleton height={DETAIL_HEIGHT} width="46%" borderRadius={radii.control} />
        {includeProgress ? <Skeleton height={PROGRESS_HEIGHT} width="100%" borderRadius={radii.pill} /> : null}
      </View>
    </View>
  );
}

type PosterGridSkeletonProps = {
  variant?: PosterGridKind;
  includeProgress?: boolean;
};

type VariantSkeletonProps = {
  variant: PosterGridKind;
  width: number;
  includeProgress?: boolean;
};

export function CatalogCardSkeletonByVariant({ variant, width, includeProgress = false }: VariantSkeletonProps) {
  if (variant === "episode") {
    return <EpisodeCardSkeleton width={width} includeProgress={includeProgress} />;
  }

  if (variant === "show") {
    return <ShowCardSkeleton width={width} />;
  }

  return <MovieCardSkeleton includeProgress={includeProgress} width={width} />;
}

export function PosterGridCardSkeleton({ variant = "movie", includeProgress = false }: PosterGridSkeletonProps) {
  const width = usePosterGridItemWidth() ?? RAIL_POSTER_WIDTH;
  return <CatalogCardSkeletonByVariant variant={variant} width={width} includeProgress={includeProgress} />;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  fillWidth: { width: "100%" },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
  },
  still: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  meta: { gap: META_GAP },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
});
