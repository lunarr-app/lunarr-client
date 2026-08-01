import { useRouter, type RelativePathString } from "expo-router";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

import { MovieCard } from "@/src/components/catalog/MovieCard";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { EmptyState } from "@/src/components/layout/EmptyState";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useSimilarMovies, useSimilarShows } from "@/src/hooks/queries";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

type Props = {
  kind: "movie" | "show";
  mediaId: string;
};

const { width: screenWidth } = Dimensions.get("window");
const COLUMNS = 5;

export function SimilarMediaScreen({ kind, mediaId }: Props) {
  const router = useRouter();
  const { scale } = useTVScale();
  const gap = spacing.md * scale;
  const itemWidth = (screenWidth - tvSafe.horizontal * 2 * scale - gap * (COLUMNS - 1)) / COLUMNS;

  const movieQuery = useSimilarMovies(kind === "movie" ? mediaId : "");
  const showQuery = useSimilarShows(kind === "show" ? mediaId : "");

  const contentStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingVertical: tvSafe.vertical * scale,
    gap: spacing.xl * scale,
  };
  const headerStyle = { gap: spacing.xs * scale };
  const headingStyle = { fontSize: typography.fontSize.page * scale };
  const subheadingStyle = { fontSize: typography.fontSize.body * scale };
  const gridStyle = { gap, paddingVertical: spacing.md * scale };
  const footerStyle = { paddingVertical: spacing.lg * scale };

  if (kind === "movie") {
    const items = movieQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const title = movieQuery.data?.pages[0]?.title ?? "";
    if (movieQuery.isLoading) return <LoadingView />;
    if (movieQuery.error) {
      return (
        <View style={styles.center}>
          <ErrorView
            layout="centered"
            message="Failed to load"
            retryLabel="Reload"
            onRetry={() => void movieQuery.refetch()}
          />
        </View>
      );
    }
    if (items.length === 0) {
      return <EmptyState title="No similar titles" message="No similar items found in your library." />;
    }
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={contentStyle}
        onScroll={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          const reachedBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;
          if (reachedBottom && movieQuery.hasNextPage && !movieQuery.isFetchingNextPage) {
            movieQuery.fetchNextPage();
          }
        }}
        scrollEventThrottle={16}
      >
        <View style={[styles.header, headerStyle]}>
          <Text style={[styles.heading, headingStyle]}>Similar to {title || "…"}</Text>
          <Text style={[styles.subheading, subheadingStyle]}>
            Based on genres, keywords, and cast from your library.
          </Text>
        </View>
        <View style={[styles.grid, gridStyle]}>
          {items.map((item) => (
            <MovieCard
              key={item.id}
              movie={item}
              width={itemWidth}
              onPress={() => router.push(`/movies/${item.id}` as RelativePathString)}
            />
          ))}
        </View>
        {movieQuery.isFetchingNextPage ? (
          <View style={[styles.footer, footerStyle]}>
            <ActivityIndicator color={darkColors.accent} size="small" />
          </View>
        ) : null}
      </ScrollView>
    );
  }

  const items = showQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const title = showQuery.data?.pages[0]?.title ?? "";
  if (showQuery.isLoading) return <LoadingView />;
  if (showQuery.error) {
    return (
      <View style={styles.center}>
        <ErrorView
          layout="centered"
          message="Failed to load"
          retryLabel="Reload"
          onRetry={() => void showQuery.refetch()}
        />
      </View>
    );
  }
  if (items.length === 0) {
    return <EmptyState title="No similar titles" message="No similar items found in your library." />;
  }
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={contentStyle}
      onScroll={(e) => {
        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
        const reachedBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;
        if (reachedBottom && showQuery.hasNextPage && !showQuery.isFetchingNextPage) {
          showQuery.fetchNextPage();
        }
      }}
      scrollEventThrottle={16}
    >
      <View style={[styles.header, headerStyle]}>
        <Text style={[styles.heading, headingStyle]}>Similar to {title || "…"}</Text>
        <Text style={[styles.subheading, subheadingStyle]}>Based on genres, keywords, and cast from your library.</Text>
      </View>
      <View style={[styles.grid, gridStyle]}>
        {items.map((item) => (
          <ShowCard
            key={item.id}
            show={item}
            width={itemWidth}
            onPress={() => router.push(`/shows/${item.id}` as RelativePathString)}
          />
        ))}
      </View>
      {showQuery.isFetchingNextPage ? (
        <View style={[styles.footer, footerStyle]}>
          <ActivityIndicator color={darkColors.accent} size="small" />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {},
  heading: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  subheading: {
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
