import { Skeleton } from "@/src/components/layout/Skeleton";
import { radii, spacing } from "@/src/theme/spacing";
import { StyleSheet, View } from "react-native";

export function SeasonHeroFactsSkeleton() {
  return (
    <View style={styles.facts}>
      <Skeleton height={24} width={72} borderRadius={radii.pill} />
      <Skeleton height={24} width={84} borderRadius={radii.pill} />
      <Skeleton height={24} width={128} borderRadius={radii.pill} />
    </View>
  );
}

export function SeasonHeroActionsSkeleton() {
  return (
    <View style={styles.actions}>
      <Skeleton height={46} width="100%" borderRadius={radii.control} />
      <View style={styles.secondaryRow}>
        <Skeleton height={36} width="32%" borderRadius={radii.control} style={styles.actionFlex} />
        <Skeleton height={36} width="32%" borderRadius={radii.control} style={styles.actionFlex} />
        <Skeleton height={36} width="32%" borderRadius={radii.control} style={styles.actionFlex} />
      </View>
    </View>
  );
}

export function SeasonHeroProgressSkeleton() {
  return <Skeleton height={5} width="100%" borderRadius={radii.pill} />;
}

const styles = StyleSheet.create({
  facts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actions: {
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
});
