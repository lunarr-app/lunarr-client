import { SimilarMediaScreen } from "@/src/components/catalog/SimilarMediaScreen";
import { useLocalSearchParams } from "expo-router";

export default function SimilarShowsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SimilarMediaScreen kind="show" mediaId={id ?? ""} />;
}
