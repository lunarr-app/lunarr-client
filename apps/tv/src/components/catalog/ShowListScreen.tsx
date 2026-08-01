import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

import { ShowCard } from "@/src/components/catalog/ShowCard";
import { EmptyState } from "@/src/components/layout/EmptyState";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useShowList } from "@/src/hooks/queries";
import { useRouter } from "expo-router";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

type Props = {
  title: string;
  description: string;
  sort: "title" | "recent" | "latest" | "popular";
};

const { width: screenWidth } = Dimensions.get("window");
const COLUMNS = 5;

export function ShowListScreen({ title, description, sort }: Props) {
  const router = useRouter();
  const { scale } = useTVScale();
  const gap = spacing.md * scale;
  const itemWidth = (screenWidth - tvSafe.horizontal * 2 * scale - gap * (COLUMNS - 1)) / COLUMNS;

  const listQuery = useShowList(sort);
  const items = listQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const contentStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingVertical: tvSafe.vertical * scale,
    gap: spacing.xxl * scale,
  };
  const headerStyle = { gap: spacing.xs * scale };
  const headingStyle = { fontSize: typography.fontSize.page * scale };
  const descriptionStyle = { fontSize: typography.fontSize.body * scale };
  const gridStyle = { gap };
  const footerStyle = { paddingVertical: spacing.lg * scale };

  if (listQuery.isLoading) return <LoadingView />;

  if (listQuery.error) {
    return (
      <View style={styles.center}>
        <ErrorView
          layout="centered"
          message="Failed to load shows"
          retryLabel="Reload"
          onRetry={() => void listQuery.refetch()}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return <EmptyState title="No shows" message="No shows match this list." />;
  }

  return (
    <ScrollView
      contentContainerStyle={contentStyle}
      onScroll={(e) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
        const reachedBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;
        if (reachedBottom && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
          listQuery.fetchNextPage();
        }
      }}
      scrollEventThrottle={16}
    >
      <View style={[styles.header, headerStyle]}>
        <Text style={[styles.heading, headingStyle]}>{title}</Text>
        <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      </View>
      <View style={[styles.grid, gridStyle]}>
        {items.map((item) => (
          <ShowCard key={item.id} show={item} width={itemWidth} onPress={() => router.push(`/shows/${item.id}`)} />
        ))}
      </View>
      {listQuery.isFetchingNextPage ? (
        <View style={[styles.footer, footerStyle]}>
          <ActivityIndicator color={darkColors.accent} size="small" />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  header: {},
  heading: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  description: {
    color: darkColors.muted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  footer: {
    alignItems: "center",
  },
});
