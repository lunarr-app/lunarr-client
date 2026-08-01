import { CatalogFlexGridSkeleton } from "@/src/components/catalog/PosterFlexGrid";
import { PosterGridItemWidthProvider, usePosterGridMetrics } from "@/src/components/catalog/PosterGridMetricsContext";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { type ReactElement, type ReactNode } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from "react-native";

import { Screen } from "@/src/components/layout/Screen";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";

type Props<TItem> = {
  items: TItem[];
  renderItem: ListRenderItem<TItem>;
  keyExtractor: (item: TItem) => string;
  header?: ReactNode;
  loading?: boolean;
  loadingMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  listError?: string;
  onRetryList?: () => void;
  skeletonVariant?: "movie" | "show";
  skeletonCount?: number;
  empty?: ReactElement | null;
};

export function CatalogInfiniteGrid<TItem>({
  items,
  renderItem,
  keyExtractor,
  header,
  loading = false,
  loadingMore = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  listError,
  onRetryList,
  skeletonVariant = "movie",
  skeletonCount = 8,
  empty = null,
}: Props<TItem>) {
  const { numColumns, itemWidth, columnGap } = usePosterGridMetrics(skeletonVariant);
  const showInitialSkeleton = loading && items.length === 0;
  const wrappedRenderItem: ListRenderItem<TItem> = (info) => (
    <View style={{ width: itemWidth }}>{renderItem(info)}</View>
  );
  const refreshControl =
    onRefresh != null ? (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={darkColors.accent} />
    ) : undefined;
  const listEmpty = showInitialSkeleton ? (
    <CatalogFlexGridSkeleton
      kind={skeletonVariant}
      count={skeletonCount}
      numColumns={numColumns}
      itemWidth={itemWidth}
      columnGap={columnGap}
    />
  ) : (
    empty
  );
  const footer = loadingMore ? (
    <View style={styles.footer}>
      <ActivityIndicator color={darkColors.accent} />
    </View>
  ) : (
    <View style={styles.footerSpacer} />
  );

  const listHeader =
    header || listError ? (
      <View style={styles.header}>
        {header}
        {listError ? (
          <ErrorView
            layout="footer"
            title="Couldn't load"
            message={listError}
            retryLabel="Reload"
            onRetry={onRetryList}
          />
        ) : null}
      </View>
    ) : undefined;

  return (
    <PosterGridItemWidthProvider itemWidth={itemWidth}>
      <Screen style={styles.screen}>
        <FlatList
          key={numColumns}
          data={items}
          keyExtractor={keyExtractor}
          renderItem={wrappedRenderItem}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? [styles.row, { gap: columnGap }] : undefined}
          contentContainerStyle={[styles.content, items.length === 0 ? styles.emptyContent : null]}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={footer}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        />
      </Screen>
    </PosterGridItemWidthProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    gap: spacing.md,
    marginHorizontal: -spacing.md,
    paddingBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
  },
  row: {
    marginBottom: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  footerSpacer: {
    height: spacing.lg,
  },
});
