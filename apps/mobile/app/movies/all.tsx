import { MovieListScreen } from "@/src/components/catalog/MovieListScreen";

export default function AllMoviesScreen() {
  return <MovieListScreen title="All movies" description="Browse your full movie library." initialSort="title" />;
}
