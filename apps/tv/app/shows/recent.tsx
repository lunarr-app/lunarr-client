import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function TvRecentShowsScreen() {
  return (
    <ShowListScreen title="Recently added" description="Shows added to your library most recently." sort="recent" />
  );
}
