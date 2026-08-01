import { HeroFactChip } from "@/src/components/catalog/HeroFactChip";
import { MediaHero } from "@/src/components/catalog/MediaHero";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { PosterFlexGrid, PosterFlexGridCell } from "@/src/components/catalog/PosterFlexGrid";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { DetailScreenSkeleton } from "@/src/components/layout/DetailScreenSkeleton";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { Screen } from "@/src/components/layout/Screen";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { usePersonDetail } from "@/src/hooks/queries";
import { readApiError } from "@/src/lib/api/parse";
import { formatYearSpan } from "@/src/lib/media/format";
import { darkColors } from "@/src/theme/colors";
import { detailContentInset, radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function PersonScreen() {
  const router = useRouter();
  const { provider, id } = useLocalSearchParams<{
    provider: string;
    id: string;
  }>();
  const { data, isLoading, error, refetch } = usePersonDetail(provider, id);

  const person = data?.person ?? null;
  const stats = data?.stats ?? null;
  const movies = data?.movies ?? [];
  const shows = data?.shows ?? [];

  if (isLoading) {
    return <DetailScreenSkeleton heroHeaderMode bodyVariant="none" showCastRail={false} showCreditGrids />;
  }

  if (!person || !stats) {
    return (
      <Screen>
        <ErrorView
          layout="centered"
          message={error ? readApiError(error, "Failed to load person") : "Person not found"}
          retryLabel="Reload"
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  const yearLabel = formatYearSpan(stats.yearMin, stats.yearMax);
  const alternateName = person.originalName && person.originalName !== person.name ? person.originalName : null;
  const characters = stats.characters.slice(0, 6);

  return (
    <ScreenScrollView wrapScreen={false} reserveBottomInset>
      <MediaHero
        title={person.name}
        posterUrl={person.profileUrl}
        overview={alternateName}
        overviewFallback={false}
        contentPlacement="below"
        eyebrow="Cast"
        onBack={() => router.back()}
        backLabel="Back"
        facts={
          <>
            <HeroFactChip>{`${stats.movieCount} ${stats.movieCount === 1 ? "movie" : "movies"}`}</HeroFactChip>
            <HeroFactChip>{`${stats.showCount} ${stats.showCount === 1 ? "show" : "shows"}`}</HeroFactChip>
            {yearLabel ? <HeroFactChip>{yearLabel}</HeroFactChip> : null}
          </>
        }
        below={
          characters.length > 0 ? (
            <View style={styles.characters}>
              {characters.map((character) => (
                <Text key={character} style={styles.characterChip}>
                  {character}
                </Text>
              ))}
            </View>
          ) : null
        }
      />

      <View style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movies</Text>
          {movies.length === 0 ? (
            <Text style={styles.empty}>No movies found for this cast member.</Text>
          ) : (
            <PosterFlexGrid kind="movie">
              {movies.map((movie) => (
                <PosterFlexGridCell key={movie.id}>
                  <MovieCard movie={movie} onPress={() => router.push(`/movies/${movie.id}`)} />
                </PosterFlexGridCell>
              ))}
            </PosterFlexGrid>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TV shows</Text>
          {shows.length === 0 ? (
            <Text style={styles.empty}>No shows found for this cast member.</Text>
          ) : (
            <PosterFlexGrid kind="show">
              {shows.map((show) => (
                <PosterFlexGridCell key={show.id}>
                  <View style={styles.creditItem}>
                    <ShowCard show={show} onPress={() => router.push(`/shows/${show.id}`)} />
                    {show.character ? <Text style={styles.role}>{show.character}</Text> : null}
                  </View>
                </PosterFlexGridCell>
              ))}
            </PosterFlexGrid>
          )}
        </View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: detailContentInset,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  section: { gap: spacing.md },
  sectionTitle: {
    color: darkColors.text,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
  },
  empty: { color: darkColors.muted, fontSize: typography.fontSize.body },
  creditItem: { gap: spacing.xs },
  role: { color: darkColors.muted, fontSize: typography.fontSize.meta, fontWeight: typography.fontWeight.semibold },
  characters: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  characterChip: {
    color: darkColors.text,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: darkColors.surfaceStrong,
  },
});
