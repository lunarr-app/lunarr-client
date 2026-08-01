import { Skeleton } from "@/src/components/layout/Skeleton";
import { detailContentInset, radii, spacing } from "@/src/theme/spacing";
import { StyleSheet, View } from "react-native";

type Props = {
  count?: number;
};

export function SeasonTabsSkeleton({ count = 5 }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} height={34} width={index % 2 === 0 ? 88 : 72} borderRadius={radii.control} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: -detailContentInset,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: detailContentInset,
  },
});
