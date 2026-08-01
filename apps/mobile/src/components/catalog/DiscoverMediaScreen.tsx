import { CatalogInfiniteGrid } from "@/src/components/catalog/CatalogInfiniteGrid";
import { EmptyState } from "@/src/components/catalog/EmptyState";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Button } from "@/src/components/ui/Button";
import { useDiscoverMoviesInfinite, useDiscoverShowsInfinite } from "@/src/hooks/queries";
import { type MovieSummary, type ShowSummary } from "@lunarr/api";
import { readApiError } from "@lunarr/api";
import { useRouter } from "expo-router";
import { useState } from "react";

type Props = {
  kind: "movie" | "show";
};

const COPY = {
  movie: {
    title: "Discover movies",
    subtitle: "Picks similar to your recent watches, ranked by shared genres, keywords, cast, and directors.",
    emptyTitle: "No recommendations yet",
    emptyMessage: "Watch a movie and Lunarr will surface similar titles here.",
    loadError: "Failed to load movie recommendations",
    hubRoute: "/(tabs)/movies" as const,
    hubLabel: "Back to movies",
    backLabel: "Movies",
  },
  show: {
    title: "Discover TV shows",
    subtitle: "Picks similar to your recent episode watches, ranked by shared genres, keywords, cast, and creators.",
    emptyTitle: "No recommendations yet",
    emptyMessage: "Watch an episode and Lunarr will surface similar shows here.",
    loadError: "Failed to load show recommendations",
    hubRoute: "/(tabs)/shows" as const,
    hubLabel: "Back to shows",
    backLabel: "Shows",
  },
} as const;

export function DiscoverMediaScreen({ kind }: Props) {
  const router = useRouter();
  const copy = COPY[kind];
  const movieQuery = useDiscoverMoviesInfinite(kind === "movie");
  const showQuery = useDiscoverShowsInfinite(kind === "show");
  const query = kind === "movie" ? movieQuery : showQuery;

  const items =
    kind === "movie"
      ? (movieQuery.data?.pages.flatMap((page) => page.items) ?? [])
      : (showQuery.data?.pages.flatMap((page) => page.items) ?? []);
  const loading = query.isLoading;
  const errorMessage = query.error ? readApiError(query.error, copy.loadError) : "";

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const header = <PageHeader title={copy.title} subtitle={copy.subtitle} showBack backLabel={copy.backLabel} />;

  const isEmpty = !loading && items.length === 0 && !errorMessage;

  const listEmpty =
    errorMessage && !loading && items.length === 0 ? (
      <ErrorView message={errorMessage} retryLabel="Reload" onRetry={refresh} />
    ) : isEmpty ? (
      <EmptyState
        title={copy.emptyTitle}
        message={copy.emptyMessage}
        actions={
          <Button mode="outlined" onPress={() => router.push(copy.hubRoute)}>
            {copy.hubLabel}
          </Button>
        }
      />
    ) : null;

  const renderItem = ({ item }: { item: MovieSummary | ShowSummary }) =>
    kind === "movie" ? (
      <MovieCard movie={item as MovieSummary} onPress={() => router.push(`/movies/${item.id}`)} />
    ) : (
      <ShowCard show={item as ShowSummary} onPress={() => router.push(`/shows/${item.id}`)} />
    );

  return (
    <CatalogInfiniteGrid
      items={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      header={header}
      loading={loading}
      loadingMore={query.isFetchingNextPage}
      refreshing={refreshing}
      onRefresh={refresh}
      onEndReached={loadMore}
      listError={errorMessage && items.length > 0 && !loading ? errorMessage : undefined}
      onRetryList={refresh}
      skeletonVariant={kind === "show" ? "show" : "movie"}
      empty={listEmpty}
    />
  );
}
