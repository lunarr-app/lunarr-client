import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { SectionRail } from "@/src/components/catalog/SectionRail";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { EpisodeCard } from "@/src/components/catalog/EpisodeCard";
import { EmptyState } from "@/src/components/layout/EmptyState";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useContinueWatchingMovies, useContinueWatchingEpisodes } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@lunarr/core";
import { queryKeys } from "@lunarr/core";
import { TV_CARD_WIDTH } from "@/src/lib/media/grid";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";

export default function TvContinueScreen() {
  const router = useRouter();
  const { scale } = useTVScale();
  const cardWidth = TV_CARD_WIDTH * scale;
  const episodeCardWidth = cardWidth * 1.4;
  const contentStyle = {
    paddingHorizontal: 0,
    paddingTop: tvSafe.vertical * scale,
    paddingBottom: spacing.xxl * scale,
    gap: spacing.xxl * scale,
  };

  const moviesQuery = useContinueWatchingMovies();
  const episodesQuery = useContinueWatchingEpisodes();

  useRefreshOnFocus([queryKeys.continueWatching.all]);

  const loading = moviesQuery.isLoading || episodesQuery.isLoading;
  const error = moviesQuery.error || episodesQuery.error;
  const continueMovies = moviesQuery.data?.movies ?? [];
  const continueEpisodes = episodesQuery.data?.episodes ?? [];
  const nextUp = episodesQuery.data?.nextUp ?? [];

  if (loading) return <LoadingView />;

  if (error) {
    return (
      <View style={styles.center}>
        <ErrorView
          layout="centered"
          message="Failed to load continue watching"
          retryLabel="Reload"
          onRetry={() => {
            moviesQuery.refetch();
            episodesQuery.refetch();
          }}
        />
      </View>
    );
  }

  const hasAny = continueMovies.length > 0 || continueEpisodes.length > 0 || nextUp.length > 0;

  if (!hasAny) {
    return (
      <EmptyState title="Nothing in progress" message="Start watching a movie or episode and it will appear here." />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <SectionRail
        title="Continue Watching"
        data={continueMovies}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <MovieCard movie={item} width={cardWidth} onPress={() => router.push(`/movies/${item.id}`)} />
        )}
        itemWidth={cardWidth}
      />
      <SectionRail
        title="Continue TV"
        data={continueEpisodes}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <EpisodeCard episode={item} width={episodeCardWidth} onPress={() => router.push(`/episodes/${item.id}`)} />
        )}
        itemWidth={episodeCardWidth}
      />
      <SectionRail
        title="Next Up"
        data={nextUp}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <EpisodeCard episode={item} width={episodeCardWidth} onPress={() => router.push(`/episodes/${item.id}`)} />
        )}
        itemWidth={episodeCardWidth}
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
