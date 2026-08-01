import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function RecentShowsScreen() {
  return (
    <ShowListScreen
      title="Recently added"
      description="Shows added to your library most recently."
      initialSort="recent"
    />
  );
}
