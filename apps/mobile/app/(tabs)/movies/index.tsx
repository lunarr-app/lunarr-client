import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function MoviesScreen() {
  return (
    <MovieListScreen
      title="Movies"
      description="Browse, search, and filter your movie library."
      initialSort="recent"
      showFilters
      browseImmediately
      showBack={false}
      refreshOnFocus
    />
  );
}
