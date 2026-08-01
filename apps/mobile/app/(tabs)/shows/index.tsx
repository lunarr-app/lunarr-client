import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function ShowsScreen() {
  return (
    <ShowListScreen
      title="Shows"
      description="Browse, search, and filter your TV library."
      initialSort="latest"
      showFilters
      browseImmediately
      showBack={false}
      refreshOnFocus
    />
  );
}
