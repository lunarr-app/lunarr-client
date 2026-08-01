import { FocusRing } from "@/src/components/ui/FocusRing";
import { RAIL_POSTER_WIDTH } from "@/src/lib/media/grid";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { ChevronRight } from "lucide-react-native";
import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TVFocusGuideView, View } from "react-native";

type Props<T> = {
  title: string;
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onViewAll?: () => void;
  itemWidth?: number;
};

export function SectionRail<T>({
  title,
  data,
  keyExtractor,
  renderItem,
  onViewAll,
  itemWidth = RAIL_POSTER_WIDTH,
}: Props<T>) {
  const { scale } = useTVScale();
  if (data.length === 0) return null;

  const itemGap = spacing.md * scale;
  const snapInterval = itemWidth + itemGap;

  const sectionStyle = { gap: spacing.md * scale };
  const headingStyle = { paddingHorizontal: tvSafe.horizontal * scale };
  const titleStyle = { fontSize: typography.fontSize.heading * scale };
  const railContentStyle = { paddingLeft: tvSafe.horizontal * scale, paddingVertical: tvSize(12, scale) };
  const itemWrapStyle = { width: itemWidth, marginRight: itemGap };
  const viewAllInnerStyle = {
    gap: spacing.sm * scale,
    borderRadius: radii.card * scale,
  };
  const viewAllTextStyle = { fontSize: typography.fontSize.body * scale };

  return (
    <TVFocusGuideView autoFocus style={[styles.section, sectionStyle]}>
      <View style={[styles.heading, headingStyle]}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      </View>
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        contentContainerStyle={railContentStyle}
      >
        {data.map((item) => (
          <View key={keyExtractor(item)} style={itemWrapStyle}>
            {renderItem(item)}
          </View>
        ))}
        {onViewAll ? (
          <View style={itemWrapStyle}>
            <Pressable
              onPress={onViewAll}
              focusable
              accessibilityRole="button"
              accessibilityLabel={`View more ${title}`}
              style={styles.viewAllPressable}
            >
              {({ focused }) => (
                <FocusRing
                  focused={focused}
                  width={Math.max(2, 4 * scale)}
                  color={darkColors.accent}
                  radius={radii.card * scale}
                  style={styles.viewAllRing}
                >
                  <View style={[styles.viewAllInner, viewAllInnerStyle]}>
                    <ChevronRight color={focused ? darkColors.text : darkColors.muted} size={tvSize(32, scale)} />
                    <Text style={[styles.viewAllText, viewAllTextStyle, focused && styles.viewAllTextFocused]}>
                      View more
                    </Text>
                  </View>
                </FocusRing>
              )}
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </TVFocusGuideView>
  );
}

const styles = StyleSheet.create({
  section: {},
  heading: {},
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  viewAllPressable: {
    flex: 1,
  },
  viewAllRing: {
    flex: 1,
  },
  viewAllInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surfaceStrong,
  },
  viewAllText: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.semibold,
  },
  viewAllTextFocused: {
    color: darkColors.text,
  },
});
