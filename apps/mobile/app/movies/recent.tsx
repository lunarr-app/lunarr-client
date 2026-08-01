import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function RecentMoviesScreen() {
  return (
    <MovieListScreen
      title="Recently added"
      description="Movies added to your library most recently."
      initialSort="recent"
    />
  );
}
