import { Slot } from "expo-router";
import { useProtectedRoute } from "@store/auth";

export default function Root() {
  useProtectedRoute();

  return <Slot />;
}
