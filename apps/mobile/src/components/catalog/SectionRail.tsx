import { PosterGridItemWidthProvider, usePosterWidth } from "@/src/components/catalog/PosterGridMetricsContext";
import { SectionHeading } from "@/src/components/catalog/SectionHeading";
import { RAIL_POSTER_WIDTH, type PosterGridKind } from "@/src/lib/media/grid";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props<T> = {
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onViewAll?: () => void;
  itemWidth?: number;
  kind?: PosterGridKind;
};

export function SectionRail<T>({
  title,
  data,
  keyExtractor,
  renderItem,
  onViewAll,
  itemWidth,
  kind = "movie",
}: Props<T>) {
  const resolvedWidth = itemWidth ?? usePosterWidth(kind, RAIL_POSTER_WIDTH);

  if (data.length === 0) return null;

  return (
    <PosterGridItemWidthProvider itemWidth={resolvedWidth}>
      <View style={styles.section}>
        <View style={styles.heading}>
          <SectionHeading>{title}</SectionHeading>
          {onViewAll ? (
            <Pressable onPress={onViewAll} style={styles.viewAll}>
              <Text style={styles.viewAllText}>View all</Text>
              <ChevronRight color={darkColors.muted} size={16} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          contentContainerStyle={styles.railContent}
        >
          {data.map((item) => (
            <View key={keyExtractor(item)} style={{ width: resolvedWidth, marginRight: spacing.md }}>
              {renderItem(item)}
            </View>
          ))}
        </ScrollView>
      </View>
    </PosterGridItemWidthProvider>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewAllText: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.body,
  },
  railContent: { paddingHorizontal: spacing.md },
});
