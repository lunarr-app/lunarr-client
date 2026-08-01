import { usePosterGridMetrics } from "@/src/components/catalog/PosterGridMetricsContext";
import { Skeleton } from "@/src/components/layout/Skeleton";
import { useDeviceTier } from "@/src/lib/layout/responsive";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { StyleSheet, View } from "react-native";

const STILL_WIDTH = 128;

type Props = {
  rows?: number;
};

function SeasonEpisodeRowSkeleton({ stillWidth }: { stillWidth: number }) {
  return (
    <View style={styles.row}>
      <Skeleton width={stillWidth} style={styles.still} borderRadius={radii.card} />
      <View style={styles.main}>
        <Skeleton height={12} width={56} borderRadius={radii.control} />
        <Skeleton height={16} width="82%" borderRadius={radii.control} />
        <Skeleton height={12} width="58%" borderRadius={radii.control} />
        <View style={styles.actions}>
          <Skeleton height={36} width={72} borderRadius={radii.control} />
          <Skeleton height={36} width={88} borderRadius={radii.control} />
        </View>
      </View>
    </View>
  );
}

export function SeasonEpisodeListSkeleton({ rows = 5 }: Props) {
  const isWide = useDeviceTier() !== "phone";
  const { itemWidth: episodeItemWidth } = usePosterGridMetrics("episode");
  const stillWidth = isWide ? episodeItemWidth : STILL_WIDTH;

  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, index) => (
        <SeasonEpisodeRowSkeleton key={index} stillWidth={stillWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
    paddingVertical: spacing.md,
  },
  still: {
    aspectRatio: 16 / 9,
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
