import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function TvLatestMoviesScreen() {
  return (
    <MovieListScreen
      title="Latest releases"
      description="Movies ordered by their original release date."
      sort="release_date"
    />
  );
}
