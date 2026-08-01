import { Skeleton } from "@/src/components/layout/Skeleton";
import { radii, spacing } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { ScrollView, StyleSheet, View } from "react-native";

type Props = {
  count?: number;
};

export function CastRailSkeleton({ count = 5 }: Props) {
  const { scale } = useTVScale();

  const personWidth = tvSize(160, scale);
  const personGap = spacing.md * scale;

  const sectionStyle = { gap: spacing.md * scale };
  const headingStyle = { gap: spacing.xs * scale };
  const listStyle = { paddingVertical: tvSize(12, scale) };
  const personStyle = { width: personWidth, gap: spacing.xs * scale, marginRight: personGap };
  const profileStyle = { width: "100%" as const, aspectRatio: 2 / 3 };

  return (
    <View style={[styles.section, sectionStyle]}>
      <View style={[styles.heading, headingStyle]}>
        <Skeleton height={tvSize(32, scale)} width={tvSize(80, scale)} borderRadius={radii.control * scale} />
        <Skeleton height={tvSize(22, scale)} width={tvSize(260, scale)} borderRadius={radii.control * scale} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={listStyle}
      >
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={personStyle}>
            <Skeleton style={profileStyle} borderRadius={radii.card * scale} />
            <Skeleton height={tvSize(22, scale)} width="100%" borderRadius={radii.control * scale} />
            <Skeleton height={tvSize(20, scale)} width="82%" borderRadius={radii.control * scale} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
  heading: {},
  list: { flexDirection: "row" },
});
