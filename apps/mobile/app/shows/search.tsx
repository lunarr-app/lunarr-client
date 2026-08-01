import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function SearchShowsScreen() {
  return (
    <ShowListScreen
      title="Search shows"
      description="Find TV shows in your library by title."
      initialSort="title"
      showFilters
    />
  );
}
