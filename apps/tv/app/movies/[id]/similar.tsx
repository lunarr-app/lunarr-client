import { useLocalSearchParams } from "expo-router";

import { SimilarMediaScreen } from "@/src/components/catalog/SimilarMediaScreen";

export default function SimilarMoviesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SimilarMediaScreen kind="movie" mediaId={id ?? ""} />;
}
