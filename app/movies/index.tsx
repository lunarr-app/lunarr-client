import { useState, useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Button } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MovieList from "@components/MovieList";
import { LunarrApi } from "@backend/api";
import type { ModelsMovieWithFiles } from "@backend/api/lunarr";

const MoviePage: React.FC = () => {
  const [results, setResults] = useState<ModelsMovieWithFiles[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    setLoading(true);
    setErrorMessage("");

    LunarrApi.api
      .moviesList({
        page: 1,
        limit: 100,
      })
      .then((resp) => {
        setResults(resp.data.results || []);
        setLoading(false);
      })
      .catch((err: any) => {
        setErrorMessage(err.response?.data?.message || err.message);
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
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
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No movies available.</Text>
          </View>
        ) : (
          <MovieList title="Latest Movies" movies={results} width={154} />
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default MoviePage;
