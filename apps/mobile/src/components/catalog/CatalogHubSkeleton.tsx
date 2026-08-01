import { usePosterGridMetrics } from "@/src/components/catalog/PosterGridMetricsContext";
import { SectionRailSkeleton } from "@/src/components/catalog/SectionRailSkeleton";
import { Skeleton } from "@/src/components/layout/Skeleton";
import { compactControlHeight, radii, spacing } from "@/src/theme/spacing";
import { StyleSheet, View } from "react-native";

type Props = {
  railCount?: number;
  episodeRails?: boolean;
};

function CatalogHubToolbarSkeleton() {
  return (
    <>
      <View style={styles.discoverAction}>
        <Skeleton height={compactControlHeight} width="100%" borderRadius={radii.control} />
      </View>
      <View style={styles.toolbar}>
        <Skeleton height={compactControlHeight} style={styles.search} borderRadius={radii.control} />
        <Skeleton height={compactControlHeight} width={compactControlHeight} borderRadius={radii.control} />
      </View>
    </>
  );
}

export function CatalogHubSkeleton({ railCount = 4, episodeRails = false }: Props) {
  const { itemWidth: episodeItemWidth } = usePosterGridMetrics("episode");

  return (
    <>
      <CatalogHubToolbarSkeleton />
      <View style={styles.rails}>
        {episodeRails ? (
          <>
            <SectionRailSkeleton variant="episode" itemWidth={episodeItemWidth} columns={4} />
            <SectionRailSkeleton variant="episode" itemWidth={episodeItemWidth} columns={4} />
          </>
        ) : null}
        {Array.from({ length: railCount }).map((_, index) => (
          <SectionRailSkeleton key={index} columns={5} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  discoverAction: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    minHeight: compactControlHeight,
  },
  search: { flex: 1 },
  rails: { paddingTop: spacing.lg, gap: spacing.xl },
});
