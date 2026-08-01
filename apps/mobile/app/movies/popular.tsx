import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function PopularMoviesScreen() {
  return (
    <MovieListScreen title="Popular" description="Top-rated and popular movies in your library." initialSort="rating" />
  );
}
