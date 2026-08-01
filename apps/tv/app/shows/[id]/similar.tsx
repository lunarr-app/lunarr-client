import { useLocalSearchParams } from "expo-router";

import { SimilarMediaScreen } from "@/src/components/catalog/SimilarMediaScreen";

export default function SimilarShowsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SimilarMediaScreen kind="show" mediaId={id ?? ""} />;
}
