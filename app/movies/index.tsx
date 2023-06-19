import { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LunarrApi } from "@backend/api";
import MovieItem from ".././../components/MovieItem";
import type { ModelsMovieWithFiles } from "@backend/api/lunarr";

const MoviePage: React.FC = () => {
  const [results, setResults] = useState<ModelsMovieWithFiles[]>([]);
  const [errorMessage, setErrorMessage] = useState<Error>();

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    LunarrApi.api
      .moviesList({
        page: 1,
        limit: 100,
      })
      .then((resp) => {
        console.log(resp.data);
        setResults(resp.data.results!);
      })
      .catch((err: any) => {
        setErrorMessage(err.response?.data?.message || err.message);
      });
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <FlatList
          data={results}
          numColumns={Math.round(screenWidth / 154)}
          keyExtractor={(item) => item.tmdb_id!.toString()}
          renderItem={({ item }) => (
            <MovieItem width={154} movie={item.metadata!} />
          )}
          contentContainerStyle={styles.list}
        />
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
});

export default MoviePage;
