import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function TvPopularShowsScreen() {
  return <ShowListScreen title="Popular" description="Shows ordered by popularity and rating." sort="popular" />;
}
