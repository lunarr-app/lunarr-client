import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function AllShowsScreen() {
  return (
    <ShowListScreen title="All shows" description="Browse every scanned show in your library." initialSort="title" />
  );
}
