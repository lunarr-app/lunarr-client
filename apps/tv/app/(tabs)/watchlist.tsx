import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { SectionRail } from "@/src/components/catalog/SectionRail";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { EmptyState } from "@/src/components/layout/EmptyState";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useWatchlist } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { queryKeys } from "@/src/lib/api/query-keys";
import { TV_CARD_WIDTH } from "@/src/lib/media/grid";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";

export default function WatchlistScreen() {
  const router = useRouter();
  const { scale } = useTVScale();
  const cardWidth = TV_CARD_WIDTH * scale;
  const contentStyle = {
    paddingHorizontal: 0,
    paddingTop: tvSafe.vertical * scale,
    paddingBottom: spacing.xxl * scale,
    gap: spacing.xxl * scale,
  };

  const { data, isLoading, error, refetch } = useWatchlist();

  useRefreshOnFocus([queryKeys.watchlist.all]);

  if (isLoading) return <LoadingView />;

  if (error) {
    return (
      <View style={styles.center}>
        <ErrorView
          layout="centered"
          message="Failed to load watchlist"
          retryLabel="Reload"
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  const hasMovies = data && data.movies.length > 0;
  const hasShows = data && data.shows.length > 0;

  if (!hasMovies && !hasShows) {
    return <EmptyState title="Watchlist is empty" message="Add movies and shows from their detail pages." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      {hasMovies && (
        <SectionRail
          title="Movies"
          data={data?.movies ?? []}
          keyExtractor={(item) => item.id}
          renderItem={(item) => (
            <MovieCard movie={item} width={cardWidth} onPress={() => router.push(`/movies/${item.id}`)} />
          )}
          itemWidth={cardWidth}
        />
      )}
      {hasShows && (
        <SectionRail
          title="Shows"
          data={data?.shows ?? []}
          keyExtractor={(item) => item.id}
          renderItem={(item) => (
            <ShowCard show={item} width={cardWidth} onPress={() => router.push(`/shows/${item.id}`)} />
          )}
          itemWidth={cardWidth}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
