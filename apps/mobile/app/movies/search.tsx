import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function SearchMoviesScreen() {
  return (
    <MovieListScreen
      title="Search movies"
      description="Find movies in your library by title."
      initialSort="title"
      showFilters
    />
  );
}
