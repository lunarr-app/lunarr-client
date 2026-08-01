import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function TvPopularMoviesScreen() {
  return <MovieListScreen title="Popular" description="Top-rated and popular movies in your library." sort="rating" />;
}
