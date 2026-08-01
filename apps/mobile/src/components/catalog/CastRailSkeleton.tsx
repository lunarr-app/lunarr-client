import { Skeleton } from "@/src/components/layout/Skeleton";
import { detailContentInset, radii, spacing } from "@/src/theme/spacing";
import { ScrollView, StyleSheet, View } from "react-native";

type Props = {
  count?: number;
};

export function CastRailSkeleton({ count = 5 }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Skeleton height={18} width={48} borderRadius={radii.control} />
        <Skeleton height={14} width={180} borderRadius={radii.control} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
      >
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.person}>
            <Skeleton style={styles.profile} borderRadius={radii.card} />
            <Skeleton height={14} width="100%" borderRadius={radii.control} />
            <Skeleton height={13} width="82%" borderRadius={radii.control} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginHorizontal: -detailContentInset,
  },
  heading: {
    gap: 2,
    paddingHorizontal: detailContentInset,
  },
  list: { flexDirection: "row", paddingHorizontal: detailContentInset },
  person: { width: 108, gap: spacing.xs, marginRight: spacing.md },
  profile: {
    width: "100%",
    aspectRatio: 2 / 3,
  },
});
