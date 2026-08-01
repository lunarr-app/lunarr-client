import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { MovieCard } from "@/src/components/catalog/MovieCard";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { EmptyState } from "@/src/components/layout/EmptyState";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useSearchMovies, useSearchShows } from "@/src/hooks/queries";
import { TV_CARD_WIDTH } from "@/src/lib/media/grid";
import { useRouter, useLocalSearchParams } from "expo-router";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

export default function SearchResultsScreen() {
  const router = useRouter();
  const { scale } = useTVScale();
  const cardWidth = TV_CARD_WIDTH * scale;
  const { query, type } = useLocalSearchParams<{ query: string; type: "movies" | "shows" }>();
  const isMovies = type === "movies";

  const movieQuery = useSearchMovies(isMovies ? (query ?? "") : "");
  const showQuery = useSearchShows(!isMovies ? (query ?? "") : "");

  const contentStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingVertical: tvSafe.vertical * scale,
    gap: spacing.xxl * scale,
  };
  const headerStyle = { gap: spacing.xs * scale };
  const headingStyle = { fontSize: typography.fontSize.page * scale };
  const descriptionStyle = { fontSize: typography.fontSize.label * scale };
  const gridStyle = { gap: spacing.lg * scale };
  const gridItemStyle = { width: cardWidth };
  const footerStyle = { paddingVertical: spacing.lg * scale };

  const resultLabel = isMovies ? "Movies" : "Shows";

  if (isMovies) {
    const items = movieQuery.data?.pages.flatMap((page) => page.items) ?? [];
    if (movieQuery.isLoading) return <LoadingView />;
    if (movieQuery.error) {
      return (
        <View style={styles.center}>
          <ErrorView
            layout="centered"
            message="Search failed"
            retryLabel="Reload"
            onRetry={() => void movieQuery.refetch()}
          />
        </View>
      );
    }
    if (items.length === 0) {
      return <EmptyState title="No results found" message="Try a different search term." />;
    }
    return (
      <ScrollView
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
        <View style={headerStyle}>
          <Text style={[styles.heading, headingStyle]}>{resultLabel}</Text>
          <Text style={[styles.description, descriptionStyle]}>
            {items.length} result{items.length !== 1 ? "s" : ""} for "{query}"
          </Text>
        </View>
        <View style={[styles.grid, gridStyle]}>
          {items.map((item) => (
            <View key={item.id} style={gridItemStyle}>
              <MovieCard movie={item} width={cardWidth} onPress={() => router.push(`/movies/${item.id}`)} />
            </View>
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
  if (showQuery.isLoading) return <LoadingView />;
  if (showQuery.error) {
    return (
      <View style={styles.center}>
        <ErrorView
          layout="centered"
          message="Search failed"
          retryLabel="Reload"
          onRetry={() => void showQuery.refetch()}
        />
      </View>
    );
  }
  if (items.length === 0) {
    return <EmptyState title="No results found" message="Try a different search term." />;
  }
  return (
    <ScrollView
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
      <View style={headerStyle}>
        <Text style={[styles.heading, headingStyle]}>{resultLabel}</Text>
        <Text style={[styles.description, descriptionStyle]}>
          {items.length} result{items.length !== 1 ? "s" : ""} for "{query}"
        </Text>
      </View>
      <View style={[styles.grid, gridStyle]}>
        {items.map((item) => (
          <View key={item.id} style={gridItemStyle}>
            <ShowCard show={item} width={cardWidth} onPress={() => router.push(`/shows/${item.id}`)} />
          </View>
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
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
