import { CatalogInfiniteGrid } from "@/src/components/catalog/CatalogInfiniteGrid";
import { EmptyState } from "@/src/components/catalog/EmptyState";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Button } from "@/src/components/ui/Button";
import { useSimilarMovies, useSimilarShows } from "@/src/hooks/queries";
import { type MovieSummary, type ShowSummary } from "@lunarr/api";
import { readApiError } from "@lunarr/api";
import { useRouter } from "expo-router";
import { useState } from "react";

type Props = {
  kind: "movie" | "show";
  mediaId: string;
};

export function SimilarMediaScreen({ kind, mediaId }: Props) {
  const router = useRouter();
  const movieQuery = useSimilarMovies(mediaId, kind === "movie");
  const showQuery = useSimilarShows(mediaId, kind === "show");
  const query = kind === "movie" ? movieQuery : showQuery;

  const items =
    kind === "movie"
      ? (movieQuery.data?.pages.flatMap((page) => page.items) ?? [])
      : (showQuery.data?.pages.flatMap((page) => page.items) ?? []);
  const loading = query.isLoading;
  const errorMessage = query.error
    ? readApiError(query.error, kind === "movie" ? "Failed to load similar movies" : "Failed to load similar shows")
    : "";
  const title = query.data?.pages[0]?.title ?? "";

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

  const emptyMessage =
    kind === "movie" ? "No similar movies were found in your library." : "No similar shows were found in your library.";
  const backLabel = kind === "movie" ? "Movie" : "Show";
  const subtitle = "Based on genres, keywords, and cast from your library.";

  const pageHeader = (
    <PageHeader title={`Similar to ${title || "…"}`} subtitle={subtitle} showBack backLabel={backLabel} />
  );

  const fallbackHeader = <PageHeader title="Similar" subtitle={subtitle} showBack backLabel={backLabel} />;

  const goToDetail = () => {
    if (!mediaId) return;
    if (kind === "movie") {
      router.push(`/movies/${mediaId}`);
      return;
    }
    router.push(`/shows/${mediaId}`);
  };

  const header = <>{!mediaId || (errorMessage && !title && !loading) ? fallbackHeader : pageHeader}</>;

  const isEmpty = !loading && items.length === 0 && !errorMessage;

  const listEmpty = !mediaId ? (
    <ErrorView message="Title not found" />
  ) : errorMessage && !loading && items.length === 0 ? (
    <ErrorView message={errorMessage} retryLabel="Reload" onRetry={refresh} />
  ) : isEmpty ? (
    <EmptyState
      title="No similar titles"
      message={emptyMessage}
      actions={
        <Button mode="outlined" onPress={goToDetail}>
          Return to {title || backLabel.toLowerCase()}
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
