import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Text,
  ActivityIndicator,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MovieItem from "@components/MovieItem";
import { LunarrApi } from "@backend/api";
import type { ModelsMovieWithFiles } from "@backend/api/lunarr";

const MoviePage: React.FC = () => {
  const [results, setResults] = useState<ModelsMovieWithFiles[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const screenWidth = Dimensions.get("window").width;

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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={styles.loadingText}>Loading movies...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Oops! Something went wrong {":("}
            </Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <Button title="Retry" onPress={fetchMovies} />
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No movies available.</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            numColumns={Math.round(screenWidth / 154)}
            keyExtractor={(item) => item.tmdb_id!.toString()}
            renderItem={({ item }) => (
              <MovieItem width={154} movie={item.metadata!} />
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 8,
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
