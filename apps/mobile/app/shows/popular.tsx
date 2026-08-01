import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function PopularShowsScreen() {
  return <ShowListScreen title="Popular" description="Shows ordered by popularity and rating." initialSort="popular" />;
}
