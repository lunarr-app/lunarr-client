import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { SectionRail } from "@/src/components/catalog/SectionRail";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { EmptyState } from "@/src/components/layout/EmptyState";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useMoviesBrowse } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { queryKeys } from "@/src/lib/api/query-keys";
import { TV_CARD_WIDTH } from "@/src/lib/media/grid";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";

export default function TvMoviesScreen() {
  const router = useRouter();
  const { scale } = useTVScale();
  const cardWidth = TV_CARD_WIDTH * scale;
  const contentStyle = {
    paddingHorizontal: 0,
    paddingTop: tvSafe.vertical * scale,
    paddingBottom: spacing.xxl * scale,
    gap: spacing.xxl * scale,
  };

  const { data: rows, isLoading, error, refetch } = useMoviesBrowse();

  useRefreshOnFocus([queryKeys.movies.browse("recent,latest,popular")]);

  if (isLoading) return <LoadingView />;

  if (error || !rows) {
    return (
      <View style={styles.center}>
        <ErrorView
          layout="centered"
          message="Failed to load movies"
          retryLabel="Reload"
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  const hasAny = (rows.recent?.length ?? 0) > 0 || (rows.latest?.length ?? 0) > 0 || (rows.popular?.length ?? 0) > 0;

  if (!hasAny) {
    return <EmptyState title="No movies yet" message="Add a movie library to get started." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <SectionRail
        title="Recent"
        data={rows.recent ?? []}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <MovieCard movie={item} width={cardWidth} onPress={() => router.push(`/movies/${item.id}`)} />
        )}
        itemWidth={cardWidth}
        onViewAll={() => router.push("/movies/recent")}
      />
      <SectionRail
        title="Latest"
        data={rows.latest ?? []}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <MovieCard movie={item} width={cardWidth} onPress={() => router.push(`/movies/${item.id}`)} />
        )}
        itemWidth={cardWidth}
        onViewAll={() => router.push("/movies/latest")}
      />
      <SectionRail
        title="Popular"
        data={rows.popular ?? []}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <MovieCard movie={item} width={cardWidth} onPress={() => router.push(`/movies/${item.id}`)} />
        )}
        itemWidth={cardWidth}
        onViewAll={() => router.push("/movies/popular")}
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
  },
});
