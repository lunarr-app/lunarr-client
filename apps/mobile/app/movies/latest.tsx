import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function LatestMoviesScreen() {
  return (
    <MovieListScreen title="Latest releases" description="Movies sorted by release date." initialSort="release_date" />
  );
}
