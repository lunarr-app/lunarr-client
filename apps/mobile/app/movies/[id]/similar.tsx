import { SimilarMediaScreen } from "@/src/components/catalog/SimilarMediaScreen";
import { useLocalSearchParams } from "expo-router";

export default function SimilarMoviesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SimilarMediaScreen kind="movie" mediaId={id ?? ""} />;
}
