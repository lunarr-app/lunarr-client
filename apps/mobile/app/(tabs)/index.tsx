import { ContinueSkeleton } from "@/src/components/catalog/ContinueSkeleton";
import { EmptyState } from "@/src/components/catalog/EmptyState";
import { EpisodeCard } from "@/src/components/catalog/EpisodeCard";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { SectionRail } from "@/src/components/catalog/SectionRail";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Screen } from "@/src/components/layout/Screen";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { Button } from "@/src/components/ui/Button";
import { useContinueWatchingEpisodes, useContinueWatchingMovies } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@lunarr/core";
import { readApiError } from "@lunarr/api";
import { queryKeys } from "@lunarr/core";
import { spacing } from "@/src/theme/spacing";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function ContinueScreen() {
  const router = useRouter();
  const moviesQuery = useContinueWatchingMovies();
  const episodesQuery = useContinueWatchingEpisodes();

  useRefreshOnFocus([queryKeys.continueWatching.all]);

  const movies = moviesQuery.data?.movies ?? [];
  const episodes = episodesQuery.data?.episodes ?? [];
  const nextUp = episodesQuery.data?.nextUp ?? [];
  const loading = moviesQuery.isLoading || episodesQuery.isLoading;
  const error = moviesQuery.error ?? episodesQuery.error;
  const errorMessage = error ? readApiError(error, "Failed to load continue watching") : "";

  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([moviesQuery.refetch(), episodesQuery.refetch()]);
    setRefreshing(false);
  };

  const openMovie = (movie: (typeof movies)[number]) => router.push(`/movies/${movie.id}`);
  const openEpisode = (episode: (typeof episodes)[number]) => router.push(`/episodes/${episode.id}`);

  if (loading) {
    return (
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <PageHeader title="Continue Watching" subtitle="Pick up where you left off." />
        <ContinueSkeleton />
      </ScreenScrollView>
    );
  }

  const isEmpty = movies.length === 0 && episodes.length === 0 && nextUp.length === 0;

  if (errorMessage && isEmpty) {
    return (
      <Screen>
        <PageHeader title="Continue Watching" subtitle="Pick up where you left off." />
        <ErrorView message={errorMessage} retryLabel="Reload" onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
      <PageHeader title="Continue Watching" subtitle="Pick up where you left off." />
      {errorMessage ? (
        <ErrorView layout="footer" title="Couldn't load" message={errorMessage} retryLabel="Reload" onRetry={refresh} />
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="Nothing to continue"
          message="Start watching a movie or episode and it will appear here."
          actions={
            <>
              <Button mode="contained" onPress={() => router.push("/(tabs)/movies")}>
                Browse movies
              </Button>
              <Button mode="outlined" onPress={() => router.push("/(tabs)/shows")}>
                Browse shows
              </Button>
            </>
          }
        />
      ) : (
        <View style={styles.rails}>
          <SectionRail
            title="Movies"
            data={movies}
            kind="movie"
            keyExtractor={(movie) => movie.id}
            renderItem={(movie) => <MovieCard movie={movie} onPress={() => openMovie(movie)} />}
          />
          <SectionRail
            title="Episodes"
            data={episodes}
            kind="episode"
            keyExtractor={(episode) => episode.id}
            renderItem={(episode) => (
              <EpisodeCard episode={episode} disabled={!episode.fileId} onPress={() => openEpisode(episode)} />
            )}
          />
          <SectionRail
            title="Next up"
            data={nextUp}
            kind="episode"
            keyExtractor={(episode) => episode.id}
            renderItem={(episode) => (
              <EpisodeCard episode={episode} disabled={!episode.fileId} onPress={() => openEpisode(episode)} />
            )}
          />
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  rails: { paddingTop: spacing.lg, gap: spacing.xl },
});
