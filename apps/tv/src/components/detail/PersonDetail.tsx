import { useRouter, useLocalSearchParams, type RelativePathString } from "expo-router";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TVFocusGuideView, View } from "react-native";

import { HeroFactChip, HeroFactsRow } from "@/src/components/catalog/HeroFactChip";
import { MovieCard } from "@/src/components/catalog/MovieCard";
import { PosterImage } from "@/src/components/catalog/PosterImage";
import { ShowCard } from "@/src/components/catalog/ShowCard";
import { FocusRing } from "@/src/components/ui/FocusRing";
import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { usePersonDetail } from "@/src/hooks/queries";
import { readApiError } from "@/src/lib/api/parse";
import { formatYearSpan } from "@/src/lib/media/format";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

const { width: screenWidth } = Dimensions.get("window");
const CREDIT_COLUMNS = 5;

export function PersonDetail() {
  const router = useRouter();
  const { scale } = useTVScale();
  const { provider, id } = useLocalSearchParams<{ provider: string; id: string }>();

  const { data, isLoading, error, refetch } = usePersonDetail(provider, id);

  const creditGap = spacing.md * scale;
  const creditWidth = (screenWidth - tvSafe.horizontal * 2 * scale - creditGap * (CREDIT_COLUMNS - 1)) / CREDIT_COLUMNS;

  const headerStyle = {
    gap: spacing.xxl * scale,
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingVertical: tvSafe.vertical * scale,
  };
  const profileWrapStyle = { width: tvSize(320, scale), borderRadius: radii.card * scale };
  const profileFallbackTextStyle = { fontSize: typography.fontSize.display * scale };
  const infoStyle = { gap: spacing.lg * scale, maxWidth: tvSize(760, scale) };
  const titleStyle = { fontSize: typography.fontSize.hero * scale, lineHeight: typography.lineHeight.display * scale };
  const subtitleStyle = { fontSize: typography.fontSize.title * scale };
  const charactersStyle = { gap: spacing.sm * scale };
  const characterChipStyle = {
    fontSize: typography.fontSize.body * scale,
    borderWidth: Math.max(1, 1 * scale),
    borderRadius: tvSize(999, scale),
    paddingHorizontal: spacing.md * scale,
    paddingVertical: spacing.xs * scale,
  };
  const bodyStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingBottom: tvSafe.vertical * scale,
    gap: spacing.xl * scale,
  };
  const sectionStyle = { gap: spacing.md * scale, marginHorizontal: -tvSafe.horizontal * scale };
  const sectionTitleStyle = {
    fontSize: typography.fontSize.heading * scale,
    paddingHorizontal: tvSafe.horizontal * scale,
  };
  const emptyStyle = { fontSize: typography.fontSize.body * scale, paddingHorizontal: tvSafe.horizontal * scale };
  const railStyle = {
    paddingVertical: tvSize(12, scale),
    paddingLeft: tvSafe.horizontal * scale,
    paddingRight: creditGap,
    gap: creditGap,
  };

  if (isLoading) return <LoadingView />;

  const person = data?.person ?? null;
  const stats = data?.stats ?? null;
  const movies = data?.movies ?? [];
  const shows = data?.shows ?? [];

  if (!person || !stats) {
    return (
      <ErrorView
        layout="centered"
        message={error ? readApiError(error, "Failed to load person") : "Person not found"}
        retryLabel="Reload"
        onRetry={() => void refetch()}
      />
    );
  }

  const yearLabel = formatYearSpan(stats.yearMin, stats.yearMax);
  const alternateName = person.originalName && person.originalName !== person.name ? person.originalName : null;
  const characters = stats.characters.slice(0, 6);

  return (
    <ScrollView style={styles.container}>
      <TVFocusGuideView autoFocus style={[styles.header, headerStyle]}>
        <Pressable
          hasTVPreferredFocus
          focusable
          accessibilityRole="button"
          accessibilityLabel={`${person.name} profile`}
          style={({ focused }) => [styles.profileWrap, profileWrapStyle, focused && styles.profileFocused]}
        >
          {({ focused }) => (
            <FocusRing
              focused={focused}
              width={Math.max(2, 4 * scale)}
              color={darkColors.accent}
              radius={radii.card * scale}
              style={styles.profileRing}
            >
              {person.profileUrl ? (
                <PosterImage uri={person.profileUrl} />
              ) : (
                <View style={styles.profileFallback}>
                  <Text style={[styles.profileFallbackText, profileFallbackTextStyle]}>{person.name.charAt(0)}</Text>
                </View>
              )}
            </FocusRing>
          )}
        </Pressable>

        <View style={[styles.info, infoStyle]}>
          <Text style={[styles.title, titleStyle]}>{person.name}</Text>
          {alternateName ? <Text style={[styles.subtitle, subtitleStyle]}>Also known as {alternateName}</Text> : null}
          <HeroFactsRow>
            <HeroFactChip>{`${stats.movieCount} ${stats.movieCount === 1 ? "movie" : "movies"}`}</HeroFactChip>
            <HeroFactChip>{`${stats.showCount} ${stats.showCount === 1 ? "show" : "shows"}`}</HeroFactChip>
            {yearLabel ? <HeroFactChip>{yearLabel}</HeroFactChip> : null}
          </HeroFactsRow>
          {characters.length > 0 ? (
            <View style={[styles.characters, charactersStyle]}>
              {characters.map((character) => (
                <Text key={character} style={[styles.characterChip, characterChipStyle]}>
                  {character}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </TVFocusGuideView>

      <View style={[styles.body, bodyStyle]}>
        <View style={[styles.section, sectionStyle]}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>Movies</Text>
          {movies.length === 0 ? (
            <Text style={[styles.empty, emptyStyle]}>No movies found.</Text>
          ) : (
            <TVFocusGuideView autoFocus>
              <ScrollView
                horizontal
                nestedScrollEnabled
                directionalLockEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={creditWidth + creditGap}
                snapToAlignment="start"
                contentContainerStyle={railStyle}
              >
                {movies.map((item) => (
                  <MovieCard
                    key={item.id}
                    movie={item}
                    width={creditWidth}
                    onPress={() => router.push(`/movies/${item.id}` as RelativePathString)}
                  />
                ))}
              </ScrollView>
            </TVFocusGuideView>
          )}
        </View>

        <View style={[styles.section, sectionStyle]}>
          <Text style={[styles.sectionTitle, sectionTitleStyle]}>TV shows</Text>
          {shows.length === 0 ? (
            <Text style={[styles.empty, emptyStyle]}>No shows found.</Text>
          ) : (
            <TVFocusGuideView autoFocus>
              <ScrollView
                horizontal
                nestedScrollEnabled
                directionalLockEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={creditWidth + creditGap}
                snapToAlignment="start"
                contentContainerStyle={railStyle}
              >
                {shows.map((item) => (
                  <ShowCard
                    key={item.id}
                    show={item}
                    width={creditWidth}
                    onPress={() => router.push(`/shows/${item.id}` as RelativePathString)}
                  />
                ))}
              </ScrollView>
            </TVFocusGuideView>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileWrap: {
    aspectRatio: 2 / 3,
    overflow: "hidden",
    backgroundColor: darkColors.card,
  },
  profileFocused: {
    transform: [{ scale: 1.02 }],
  },
  profileRing: {
    flex: 1,
  },
  profileFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.surfaceStrong,
  },
  profileFallbackText: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  info: {
    flex: 1,
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    color: darkColors.muted,
  },
  characters: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  characterChip: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.medium,
    borderColor: darkColors.border,
    backgroundColor: darkColors.surfaceStrong,
  },
  body: {},
  section: {},
  sectionTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  empty: {
    color: darkColors.muted,
  },
  rail: {
    flexDirection: "row",
  },
});
