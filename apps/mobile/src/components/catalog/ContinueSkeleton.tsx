import { usePosterGridMetrics } from "@/src/components/catalog/PosterGridMetricsContext";
import { SectionRailSkeleton } from "@/src/components/catalog/SectionRailSkeleton";
import { spacing } from "@/src/theme/spacing";
import { StyleSheet, View } from "react-native";

export function ContinueSkeleton() {
  const { itemWidth: episodeItemWidth } = usePosterGridMetrics("episode");

  return (
    <View style={styles.rails}>
      <SectionRailSkeleton variant="movie" columns={5} />
      <SectionRailSkeleton variant="episode" itemWidth={episodeItemWidth} columns={4} />
      <SectionRailSkeleton variant="episode" itemWidth={episodeItemWidth} columns={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  rails: { paddingTop: spacing.lg, gap: spacing.xl },
});
