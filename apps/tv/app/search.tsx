import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Search, SearchX } from "lucide-react-native";

import { SectionRail } from "@/src/components/catalog/SectionRail";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { SearchField } from "@/src/components/catalog/SearchField";
import { EmptyState } from "@/src/components/layout/EmptyState";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { useSearchMovies, useSearchShows } from "@/src/hooks/queries";
import { TV_CARD_WIDTH } from "@/src/lib/media/grid";
import { useRouter } from "expo-router";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";

export default function SearchScreen() {
  const router = useRouter();
  const { scale } = useTVScale();
  const cardWidth = TV_CARD_WIDTH * scale;
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const movieQuery = useSearchMovies(submitted);
  const showQuery = useSearchShows(submitted);

  const isLoading = movieQuery.isLoading || showQuery.isLoading;
  const error = movieQuery.error ?? showQuery.error;
  const movies = movieQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const shows = showQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const hasResults = movies.length > 0 || shows.length > 0;
  const hasQuery = submitted.trim().length >= 2;

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setSubmitted(trimmed);
  };

  const contentStyle = {
    paddingHorizontal: 0,
    paddingTop: tvSafe.vertical * scale,
    paddingBottom: spacing.xxl * scale,
    gap: spacing.xxl * scale,
  };
  const searchStyle = { paddingHorizontal: tvSafe.horizontal * scale };

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <View style={searchStyle}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          placeholder="Search movies & shows…"
        />
      </View>

      {isLoading ? (
        <LoadingView />
      ) : error ? (
        <View style={styles.center}>
          <ErrorView layout="centered" message="Search failed" retryLabel="Retry" onRetry={handleSubmit} />
        </View>
      ) : !hasQuery ? (
        <EmptyState icon={Search} title="Search Lunarr" message="Type at least 2 characters to search your library." />
      ) : !hasResults ? (
        <EmptyState icon={SearchX} title="No results found" message={`No matches for "${submitted}".`} />
      ) : (
        <View style={styles.results}>
          <SectionRail
            title="Movies"
            data={movies}
            keyExtractor={(item) => item.id}
            renderItem={(item) => (
              <MovieCard movie={item} width={cardWidth} onPress={() => router.push(`/movies/${item.id}`)} />
            )}
            itemWidth={cardWidth}
            onViewAll={() => router.push({ pathname: "/search/results", params: { query: submitted, type: "movies" } })}
          />
          <SectionRail
            title="Shows"
            data={shows}
            keyExtractor={(item) => item.id}
            renderItem={(item) => (
              <ShowCard show={item} width={cardWidth} onPress={() => router.push(`/shows/${item.id}`)} />
            )}
            itemWidth={cardWidth}
            onViewAll={() => router.push({ pathname: "/search/results", params: { query: submitted, type: "shows" } })}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  results: {
    gap: spacing.xxl,
  },
});
