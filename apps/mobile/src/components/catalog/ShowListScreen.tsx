import { CatalogInfiniteGrid } from "@/src/components/catalog/CatalogInfiniteGrid";
import { CatalogSearchToolbar } from "@/src/components/catalog/CatalogSearchToolbar";
import { ChipGroup } from "@/src/components/catalog/ChipGroup";
import { EmptyState } from "@/src/components/catalog/EmptyState";
import { FiltersDrawer } from "@/src/components/catalog/FiltersDrawer";
import { SectionHeading } from "@/src/components/catalog/SectionHeading";
import { SectionRail } from "@/src/components/catalog/SectionRail";
import { SectionRailSkeleton } from "@/src/components/catalog/SectionRailSkeleton";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { Button } from "@/src/components/ui/Button";
import { useDiscoverShowsRail, useShowList, SHOW_LIST_STALE_TIME } from "@/src/hooks/queries";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useRefreshFirstPageOnFocus } from "@/src/hooks/useRefreshFirstPageOnFocus";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { readApiError } from "@/src/lib/api/parse";
import { queryKeys } from "@/src/lib/api/query-keys";
import { readCatalogQueryParam } from "@/src/lib/media/catalogRoutes";
import { spacing } from "@/src/theme/spacing";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

type ShowSort = "title" | "recent" | "latest" | "popular";

const SHOW_SORT_OPTIONS: { value: ShowSort; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "recent", label: "Recently added" },
  { value: "latest", label: "Latest aired" },
  { value: "popular", label: "Popular" },
];

type Props = {
  title: string;
  description: string;
  initialSort: ShowSort;
  showFilters?: boolean;
  browseImmediately?: boolean;
  showBack?: boolean;
  refreshOnFocus?: boolean;
};

const SHOW_SORTS = new Set<ShowSort>(["title", "recent", "latest", "popular"]);

const libraryHeadingStyle = { paddingHorizontal: spacing.md, paddingTop: spacing.xs } as const;

function parseShowSort(value: string, fallback: ShowSort): ShowSort {
  return SHOW_SORTS.has(value as ShowSort) ? (value as ShowSort) : fallback;
}

export function ShowListScreen({
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
  }>();
  const [search, setSearch] = useState(() => (showFilters ? readCatalogQueryParam(params.q) : ""));
  const [sort, setSort] = useState<ShowSort>(() =>
    showFilters ? parseShowSort(readCatalogQueryParam(params.sort), initialSort) : initialSort,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const urlSearch = readCatalogQueryParam(params.q);
  const urlSort = parseShowSort(readCatalogQueryParam(params.sort), initialSort);

  useEffect(() => {
    if (!showFilters) return;
    setSearch(urlSearch);
    setSort(urlSort);
  }, [showFilters, urlSearch, urlSort]);

  const debouncedSearch = useDebouncedValue(search);
  const browseEnabled = browseImmediately || !showFilters || debouncedSearch.trim().length > 0;
  const awaitingSearchQuery = !browseImmediately && showFilters && debouncedSearch.trim().length === 0;
  const searchPending = showFilters && search !== debouncedSearch;

  const listKey = queryKeys.shows.list(sort, debouncedSearch || undefined);
  const listQuery = useShowList(sort, debouncedSearch || undefined, browseEnabled);

  useRefreshFirstPageOnFocus(listKey, refreshOnFocus, SHOW_LIST_STALE_TIME);
  useRefreshOnFocus([queryKeys.discover.rail("shows")], refreshOnFocus);

  const shows = listQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const loading = listQuery.isLoading;
  const errorMessage = listQuery.error ? readApiError(listQuery.error, "Failed to load shows") : "";
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

  const hasActiveFilters = debouncedSearch.trim().length > 0 || sort !== initialSort;

  const discoverRailEnabled = showFilters && !hasActiveFilters;
  const discoverRailQuery = useDiscoverShowsRail(discoverRailEnabled);
  const discoverShows = discoverRailQuery.data?.shows ?? [];
  const discoverHasNext = discoverRailQuery.data?.hasNext ?? false;
  const discoverLoading = discoverRailQuery.isLoading;

  const discoverRail = discoverRailEnabled ? (
    discoverLoading ? (
      <SectionRailSkeleton variant="show" columns={5} />
    ) : (
      <SectionRail
        title="Shows for you"
        data={discoverShows}
        kind="show"
        keyExtractor={(show) => show.id}
        renderItem={(show) => <ShowCard show={show} onPress={() => router.push(`/shows/${show.id}`)} />}
        onViewAll={discoverHasNext ? () => router.push("/shows/discover") : undefined}
      />
    )
  ) : null;

  const libraryHeading =
    discoverRailEnabled && (discoverLoading || discoverShows.length > 0) ? (
      <View style={libraryHeadingStyle}>
        <SectionHeading>Your library</SectionHeading>
      </View>
    ) : null;

  const pageHeader = showBack ? (
    <PageHeader title={title} subtitle={description} showBack backLabel="Shows" />
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
            placeholder="Search shows"
            onOpenFilters={() => setFiltersOpen(true)}
            filterAccessibilityLabel="Open show filters"
            loading={showGridLoading}
          />
          <FiltersDrawer visible={filtersOpen} onClose={() => setFiltersOpen(false)} subtitle="Sort order">
            <View style={{ gap: spacing.sm }}>
              <ChipGroup label="Sort" value={sort} options={SHOW_SORT_OPTIONS} onChange={setSort} />
            </View>
          </FiltersDrawer>
        </>
      ) : null}
      {discoverRail}
      {libraryHeading}
    </>
  );

  const listEmpty =
    errorMessage && !showGridLoading && shows.length === 0 ? (
      <ErrorView message={errorMessage} retryLabel="Reload" onRetry={refresh} />
    ) : (
      <EmptyState
        title={awaitingSearchQuery ? "Search your library" : hasActiveFilters ? "No matching shows" : "No shows yet"}
        message={
          awaitingSearchQuery
            ? "Enter a show title to find matches in your library."
            : hasActiveFilters
              ? "Adjust the search or sort filter to broaden the results."
              : "Scan a TV library on your Lunarr server to populate this page."
        }
        actions={
          awaitingSearchQuery || browseImmediately ? null : (
            <Button mode="outlined" onPress={() => router.push("/(tabs)/shows")}>
              Back to shows
            </Button>
          )
        }
      />
    );

  const renderItem = ({ item: show }: { item: (typeof shows)[number] }) => (
    <ShowCard show={show} onPress={() => router.push(`/shows/${show.id}`)} />
  );

  return (
    <CatalogInfiniteGrid
      items={shows}
      keyExtractor={(show) => show.id}
      renderItem={renderItem}
      header={header}
      loading={showGridLoading}
      loadingMore={listQuery.isFetchingNextPage}
      refreshing={refreshing}
      onRefresh={refresh}
      onEndReached={loadMore}
      listError={errorMessage && shows.length > 0 && !showGridLoading ? errorMessage : undefined}
      onRetryList={refresh}
      skeletonVariant="show"
      empty={listEmpty}
    />
  );
}
