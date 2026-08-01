import { CatalogHubSkeleton } from "@/src/components/catalog/CatalogHubSkeleton";
import { EmptyState } from "@/src/components/catalog/EmptyState";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { SectionRail } from "@/src/components/catalog/SectionRail";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { Button } from "@/src/components/ui/Button";
import { useWatchlist } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { readApiError } from "@/src/lib/api/parse";
import { queryKeys } from "@/src/lib/api/query-keys";
import { spacing } from "@/src/theme/spacing";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function WatchlistScreen() {
  const router = useRouter();
  const watchlistQuery = useWatchlist();

  useRefreshOnFocus([queryKeys.watchlist.all]);

  const movies = watchlistQuery.data?.movies ?? [];
  const shows = watchlistQuery.data?.shows ?? [];
  const loading = watchlistQuery.isLoading;
  const errorMessage = watchlistQuery.error ? readApiError(watchlistQuery.error, "Failed to load watchlist") : "";

  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    await watchlistQuery.refetch();
    setRefreshing(false);
  };

  const openMovie = (movie: (typeof movies)[number]) => router.push(`/movies/${movie.id}`);
  const openShow = (show: (typeof shows)[number]) => router.push(`/shows/${show.id}`);

  const isEmpty = movies.length === 0 && shows.length === 0;

  if (loading) {
    return (
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <PageHeader title="Watchlist" subtitle="Movies and shows you saved for later." titleGap={spacing.xs} />
        <CatalogHubSkeleton railCount={2} />
      </ScreenScrollView>
    );
  }

  if (errorMessage && isEmpty) {
    return (
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <PageHeader title="Watchlist" subtitle="Movies and shows you saved for later." titleGap={spacing.xs} />
        <ErrorView message={errorMessage} retryLabel="Reload" onRetry={refresh} />
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
      <PageHeader title="Watchlist" subtitle="Movies and shows you saved for later." titleGap={spacing.xs} />
      {errorMessage ? (
        <ErrorView layout="footer" title="Couldn't load" message={errorMessage} retryLabel="Reload" onRetry={refresh} />
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="Your watchlist is empty"
          message="Add movies or shows to your watchlist and they will appear here."
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
          {movies.length > 0 ? (
            <SectionRail
              title="Movies"
              data={movies}
              kind="movie"
              keyExtractor={(movie) => movie.id}
              renderItem={(movie) => <MovieCard movie={movie} onPress={() => openMovie(movie)} />}
            />
          ) : null}
          {shows.length > 0 ? (
            <SectionRail
              title="Shows"
              data={shows}
              kind="show"
              keyExtractor={(show) => show.id}
              renderItem={(show) => <ShowCard show={show} onPress={() => openShow(show)} />}
            />
          ) : null}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  rails: { paddingTop: spacing.lg, gap: spacing.xl },
});
