import { ShowListScreen } from "@/src/components/catalog/ShowListScreen";

export default function LatestShowsScreen() {
  return (
    <ShowListScreen
      title="Recently aired"
      description="Shows ordered by the latest aired episode."
      initialSort="latest"
    />
  );
}
