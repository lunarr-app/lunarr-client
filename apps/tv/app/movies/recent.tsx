import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function TvRecentMoviesScreen() {
  return (
    <MovieListScreen title="Recently added" description="Movies added to your library most recently." sort="recent" />
  );
}
