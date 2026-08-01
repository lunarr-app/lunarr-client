import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function TvLatestShowsScreen() {
  return (
    <ShowListScreen title="Latest episodes" description="Shows ordered by the latest aired episode." sort="latest" />
  );
}
