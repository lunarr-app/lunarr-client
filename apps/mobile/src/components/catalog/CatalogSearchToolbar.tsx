import { FilterButton } from "@/src/components/catalog/FilterButton";
import { SearchField } from "@/src/components/catalog/SearchField";
import { compactControlHeight, spacing } from "@/src/theme/spacing";
import { StyleSheet, View } from "react-native";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onOpenFilters: () => void;
  filterAccessibilityLabel?: string;
  loading?: boolean;
};

export function CatalogSearchToolbar({
  search,
  onSearchChange,
  placeholder = "Search",
  onOpenFilters,
  filterAccessibilityLabel = "Open filters",
  loading = false,
}: Props) {
  return (
    <View style={styles.row}>
      <SearchField
        value={search}
        onChangeText={onSearchChange}
        placeholder={placeholder}
        containerStyle={styles.search}
        dense
        loading={loading}
      />
      <FilterButton onPress={onOpenFilters} accessibilityLabel={filterAccessibilityLabel} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: compactControlHeight,
  },
  search: {
    flex: 1,
    paddingHorizontal: 0,
  },
});
