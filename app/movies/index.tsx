import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator, Button } from "react-native";
import { Text } from "react-native-paper";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MovieList from "@components/MovieList";
import { LunarrApi } from "@backend/api";
import { findClosestWidth } from "@helpers/tmdb";
import type { ModelsMovieWithFiles } from "@backend/api/lunarr";

interface ResultsProps {
  recent: ModelsMovieWithFiles[];
  latest: ModelsMovieWithFiles[];
  popular: ModelsMovieWithFiles[];
}

const MoviePage: React.FC = () => {
  const [results, setResults] = useState<ResultsProps | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [recent, latest, popular] = await Promise.all([
        LunarrApi.api.moviesList({
          page: 1,
          limit: 20,
          sortBy: "recent",
        }),
        LunarrApi.api.moviesList({
          page: 1,
          limit: 20,
          sortBy: "latest",
        }),
        LunarrApi.api.moviesList({
          page: 1,
          limit: 20,
          sortBy: "popular",
        }),
      ]);

      setResults({
        recent: recent.data.results || [],
        latest: latest.data.results || [],
        popular: popular.data.results || [],
      });
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const imageWidth = findClosestWidth(120);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
        <Stack.Screen
          options={{
            title: "Movies",
            headerShown: true,
          }}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={styles.loadingText}>Loading movies...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Oops! Something went wrong {":("}</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <Button title="Retry" onPress={fetchMovies} />
          </View>
        ) : results ? (
          <ScrollView>
            <MovieList title="Recently Added" movies={results.recent} width={120} imageWidth={imageWidth} />
            <MovieList title="Latest Releases" movies={results.latest} width={120} imageWidth={imageWidth} />
            <MovieList title="Most Popular" movies={results.popular} width={120} imageWidth={imageWidth} />
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No movies available.</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MoviePage;
