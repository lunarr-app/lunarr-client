import { ScrollView, StyleSheet, View } from "react-native";

import { SectionRail } from "@/src/components/catalog/SectionRail";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { EmptyState } from "@/src/components/layout/EmptyState";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useDiscoverMovies, useDiscoverShows } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { queryKeys } from "@/src/lib/api/query-keys";
import { TV_CARD_WIDTH } from "@/src/lib/media/grid";
import { useRouter } from "expo-router";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
export default function DiscoverScreen() {
  const router = useRouter();
  const { scale } = useTVScale();
  const cardWidth = TV_CARD_WIDTH * scale;
  const contentStyle = {
    paddingHorizontal: 0,
    paddingTop: tvSafe.vertical * scale,
    paddingBottom: spacing.xxl * scale,
    gap: spacing.xxl * scale,
  };

  const moviesQuery = useDiscoverMovies();
  const showsQuery = useDiscoverShows();

  useRefreshOnFocus([queryKeys.discover.rail("movies"), queryKeys.discover.rail("shows")]);

  const loading = moviesQuery.isLoading || showsQuery.isLoading;
  const error = moviesQuery.error || showsQuery.error;
  const movies = moviesQuery.data?.movies ?? [];
  const shows = showsQuery.data?.shows ?? [];
  const moviesHasNext = moviesQuery.data?.hasNext ?? false;
  const showsHasNext = showsQuery.data?.hasNext ?? false;

  if (loading) return <LoadingView />;

  if (error) {
    return (
      <View style={styles.center}>
        <ErrorView
          layout="centered"
          message="Failed to load discover"
          retryLabel="Reload"
          onRetry={() => {
            moviesQuery.refetch();
            showsQuery.refetch();
          }}
        />
      </View>
    );
  }

  const hasAny = movies.length > 0 || shows.length > 0;

  if (!hasAny) {
    return (
      <EmptyState
        title="No recommendations yet"
        message="Watch a movie or episode and Lunarr will surface similar titles here."
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <SectionRail
        title="Movies"
        data={movies}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <MovieCard movie={item} width={cardWidth} onPress={() => router.push(`/movies/${item.id}`)} />
        )}
        itemWidth={cardWidth}
        onViewAll={moviesHasNext ? () => router.push("/discover/movies") : undefined}
      />
      <SectionRail
        title="Shows"
        data={shows}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <ShowCard show={item} width={cardWidth} onPress={() => router.push(`/shows/${item.id}`)} />
        )}
        itemWidth={cardWidth}
        onViewAll={showsHasNext ? () => router.push("/discover/shows") : undefined}
      />
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
    gap: spacing.sm,
  },
});
