import { CatalogInfiniteGrid } from "@/src/components/catalog/CatalogInfiniteGrid";
import { CatalogSearchToolbar } from "@/src/components/catalog/CatalogSearchToolbar";
import { ChipGroup } from "@/src/components/catalog/ChipGroup";
import { EmptyState } from "@/src/components/catalog/EmptyState";
import { FiltersDrawer } from "@/src/components/catalog/FiltersDrawer";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { SectionHeading } from "@/src/components/catalog/SectionHeading";
import { SectionRail } from "@/src/components/catalog/SectionRail";
import { SectionRailSkeleton } from "@/src/components/catalog/SectionRailSkeleton";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Button } from "@/src/components/ui/Button";
import { useDiscoverMovies, useMovieList, MOVIE_LIST_STALE_TIME } from "@/src/hooks/queries";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useRefreshFirstPageOnFocus } from "@/src/hooks/useRefreshFirstPageOnFocus";
import { useRefreshOnFocus } from "@lunarr/core";
import { readApiError } from "@lunarr/api";
import { queryKeys } from "@lunarr/core";
import { readCatalogQueryParam } from "@/src/lib/media/catalogRoutes";
import { spacing } from "@/src/theme/spacing";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

type MovieSort = "title" | "recent" | "year_desc" | "rating" | "release_date";
type MovieStatusFilter = "all" | "watched" | "unwatched";

const MOVIE_STATUS_OPTIONS: { value: MovieStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unwatched", label: "Unwatched" },
  { value: "watched", label: "Watched" },
];

const MOVIE_SORT_OPTIONS: { value: MovieSort; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "recent", label: "Recently added" },
  { value: "year_desc", label: "Release year" },
  { value: "rating", label: "Rating" },
  { value: "release_date", label: "Release date" },
];

type Props = {
  title: string;
  description: string;
  initialSort: MovieSort;
  showFilters?: boolean;
  browseImmediately?: boolean;
  showBack?: boolean;
  refreshOnFocus?: boolean;
};

const MOVIE_SORTS = new Set<MovieSort>(["title", "recent", "year_desc", "rating", "release_date"]);
const MOVIE_STATUSES = new Set<MovieStatusFilter>(["all", "watched", "unwatched"]);

const libraryHeadingStyle = { paddingHorizontal: spacing.md, paddingTop: spacing.xs } as const;

function parseMovieSort(value: string, fallback: MovieSort): MovieSort {
  return MOVIE_SORTS.has(value as MovieSort) ? (value as MovieSort) : fallback;
}

function parseMovieStatus(value: string): MovieStatusFilter {
  return MOVIE_STATUSES.has(value as MovieStatusFilter) ? (value as MovieStatusFilter) : "all";
}

export function MovieListScreen({
  title,
  description,
  initialSort,
  showFilters = false,
  browseImmediately = false,
  showBack = true,
  refreshOnFocus = false,
}: Props) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    q?: string | string[];
    sort?: string | string[];
    status?: string | string[];
  }>();
  const [search, setSearch] = useState(() => (showFilters ? readCatalogQueryParam(params.q) : ""));
  const [status, setStatus] = useState<MovieStatusFilter>(() =>
    showFilters ? parseMovieStatus(readCatalogQueryParam(params.status)) : "all",
  );
  const [sort, setSort] = useState<MovieSort>(() =>
    showFilters ? parseMovieSort(readCatalogQueryParam(params.sort), initialSort) : initialSort,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const urlSearch = readCatalogQueryParam(params.q);
  const urlSort = parseMovieSort(readCatalogQueryParam(params.sort), initialSort);
  const urlStatus = parseMovieStatus(readCatalogQueryParam(params.status));

  useEffect(() => {
    if (!showFilters) return;
    setSearch(urlSearch);
    setSort(urlSort);
    setStatus(urlStatus);
  }, [showFilters, urlSearch, urlSort, urlStatus]);

  const debouncedSearch = useDebouncedValue(search);
  const browseEnabled = browseImmediately || !showFilters || debouncedSearch.trim().length > 0;
  const awaitingSearchQuery = !browseImmediately && showFilters && debouncedSearch.trim().length === 0;
  const searchPending = showFilters && search !== debouncedSearch;

  const listKey = queryKeys.movies.list(sort, showFilters ? status : undefined, debouncedSearch || undefined);
  const listQuery = useMovieList(sort, showFilters ? status : undefined, debouncedSearch || undefined, browseEnabled);

  useRefreshFirstPageOnFocus(listKey, refreshOnFocus, MOVIE_LIST_STALE_TIME);
  useRefreshOnFocus([queryKeys.discover.rail("movies")], refreshOnFocus);

  const movies = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const loading = listQuery.isLoading;
  const errorMessage = listQuery.error ? readApiError(listQuery.error, "Failed to load movies") : "";
  const showGridLoading = loading || searchPending;

  const loadMore = () => {
    if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
      void listQuery.fetchNextPage();
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    if (!browseEnabled) return;
    setRefreshing(true);
    await listQuery.refetch();
    setRefreshing(false);
  };

  const hasActiveFilters = debouncedSearch.trim().length > 0 || status !== "all" || sort !== initialSort;

  const discoverRailEnabled = showFilters && !hasActiveFilters;
  const discoverRailQuery = useDiscoverMovies(discoverRailEnabled);
  const discoverMovies = discoverRailQuery.data?.movies ?? [];
  const discoverHasNext = discoverRailQuery.data?.hasNext ?? false;
  const discoverLoading = discoverRailQuery.isLoading;

  const discoverRail = discoverRailEnabled ? (
    discoverLoading ? (
      <SectionRailSkeleton variant="movie" columns={5} />
    ) : (
      <SectionRail
        title="Movies for you"
        data={discoverMovies}
        kind="movie"
        keyExtractor={(movie) => movie.id}
        renderItem={(movie) => <MovieCard movie={movie} onPress={() => router.push(`/movies/${movie.id}`)} />}
        onViewAll={discoverHasNext ? () => router.push("/movies/discover") : undefined}
      />
    )
  ) : null;

  const libraryHeading =
    discoverRailEnabled && (discoverLoading || discoverMovies.length > 0) ? (
      <View style={libraryHeadingStyle}>
        <SectionHeading>Your library</SectionHeading>
      </View>
    ) : null;

  const pageHeader = showBack ? (
    <PageHeader title={title} subtitle={description} showBack backLabel="Movies" />
  ) : (
    <PageHeader title={title} subtitle={description} />
  );

  const header = (
    <>
      {pageHeader}
      {showFilters ? (
        <>
          <CatalogSearchToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search movies"
            onOpenFilters={() => setFiltersOpen(true)}
            filterAccessibilityLabel="Open movie filters"
            loading={showGridLoading}
          />
          <FiltersDrawer visible={filtersOpen} onClose={() => setFiltersOpen(false)} subtitle="Status and sort order">
            <View style={{ gap: spacing.md }}>
              <ChipGroup label="Status" value={status} options={MOVIE_STATUS_OPTIONS} onChange={setStatus} />
              <ChipGroup label="Sort" value={sort} options={MOVIE_SORT_OPTIONS} onChange={setSort} />
            </View>
          </FiltersDrawer>
        </>
      ) : null}
      {discoverRail}
      {libraryHeading}
    </>
  );

  const listEmpty =
    errorMessage && !showGridLoading && movies.length === 0 ? (
      <ErrorView message={errorMessage} retryLabel="Reload" onRetry={refresh} />
    ) : (
      <EmptyState
        title={awaitingSearchQuery ? "Search your library" : hasActiveFilters ? "No matching movies" : "No movies yet"}
        message={
          awaitingSearchQuery
            ? "Enter a movie title to find matches in your library."
            : hasActiveFilters
              ? "Adjust the search or watch-status filter to broaden the results."
              : "Scan a movie library on your Lunarr server to populate this page."
        }
        actions={
          awaitingSearchQuery || browseImmediately ? null : (
            <Button mode="outlined" onPress={() => router.push("/(tabs)/movies")}>
              Back to movies
            </Button>
          )
        }
      />
    );

  const renderItem = ({ item: movie }: { item: (typeof movies)[number] }) => (
    <MovieCard movie={movie} onPress={() => router.push(`/movies/${movie.id}`)} />
  );

  return (
    <CatalogInfiniteGrid
      items={movies}
      keyExtractor={(movie) => movie.id}
      renderItem={renderItem}
      header={header}
      loading={showGridLoading}
      loadingMore={listQuery.isFetchingNextPage}
      refreshing={refreshing}
      onRefresh={refresh}
      onEndReached={loadMore}
      listError={errorMessage && movies.length > 0 && !showGridLoading ? errorMessage : undefined}
      onRetryList={refresh}
      empty={listEmpty}
    />
  );
}
