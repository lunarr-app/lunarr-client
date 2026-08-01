import { seasonTabLabel } from "@/src/lib/media/tv";
import { darkColors } from "@/src/theme/colors";
import { detailContentInset, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export type SeasonTab = {
  id: string;
  title?: string | null;
  seasonNumber?: number | null;
};

type Props = {
  seasons: SeasonTab[];
  activeSeasonId: string;
  onSelect: (seasonId: string) => void;
};

export function SeasonTabs({ seasons, activeSeasonId, onSelect }: Props) {
  if (seasons.length === 0) return null;

  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.list}
      >
        {seasons.map((season) => {
          const isActive = season.id === activeSeasonId;
          const label = seasonTabLabel(season);

          return (
            <Pressable
              key={season.id}
              onPress={() => onSelect(season.id)}
              style={[styles.tab, isActive && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: -detailContentInset,
  },
  list: {
    flexDirection: "row",
    paddingHorizontal: detailContentInset,
    gap: spacing.sm,
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabActive: {
    borderBottomColor: darkColors.accent,
  },
  tabText: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.body,
  },
  tabTextActive: {
    color: darkColors.text,
  },
});
