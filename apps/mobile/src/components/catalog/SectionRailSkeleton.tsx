import { CatalogCardSkeletonByVariant } from "@/src/components/catalog/CatalogCardSkeleton";
import { usePosterWidth } from "@/src/components/catalog/PosterGridMetricsContext";
import { Skeleton } from "@/src/components/layout/Skeleton";
import { RAIL_POSTER_WIDTH, type PosterGridKind } from "@/src/lib/media/grid";
import { radii, spacing } from "@/src/theme/spacing";
import { ScrollView, StyleSheet, View } from "react-native";

type Props = {
  itemWidth?: number;
  variant?: PosterGridKind;
  columns?: number;
};

export function SectionRailSkeleton({ itemWidth, variant = "movie", columns = 4 }: Props) {
  const resolvedWidth = itemWidth ?? usePosterWidth(variant, RAIL_POSTER_WIDTH);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Skeleton height={18} width={150} borderRadius={radii.control} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {Array.from({ length: columns }).map((_, index) => (
          <View key={index} style={{ width: resolvedWidth, marginRight: spacing.md }}>
            <CatalogCardSkeletonByVariant variant={variant} width={resolvedWidth} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.md,
  },
  rail: {
    paddingHorizontal: spacing.md,
    flexDirection: "row",
  },
});
