import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import MovieItem from "./MovieItem";
import type { ModelsMovieWithFiles } from "@backend/api/lunarr";

interface MovieListProps {
  movies: ModelsMovieWithFiles[];
  title: string;
  width: number;
  onMorePress?: () => void;
}

export default function MovieList({ movies, title, width, onMorePress }: MovieListProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

        {onMorePress && (
          <TouchableOpacity onPress={onMorePress}>
            <Text style={{ color: theme.colors.text }}>View More</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={movies}
        keyExtractor={(item) => item.tmdb_id!.toString()}
        renderItem={({ item }) => <MovieItem movie={item.metadata!} width={width} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    opacity: 0.9,
  },
});
