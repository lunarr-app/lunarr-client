import { useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getPosterURL, TMDBImageWidthPoster } from "@helpers/tmdb";
import type { ModelsMovieMetadata } from "@backend/api/lunarr";

interface MovieItemProps {
  movie: ModelsMovieMetadata;
  width: TMDBImageWidthPoster;
}

export default function MovieItem({ movie, width }: MovieItemProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => {
        Alert.alert("To-do");
      }}
    >
      <ImageBackground
        style={[styles.image, { width, height: width * 1.5 }]}
        source={{
          uri: getPosterURL(movie.poster_path, width),
        }}
        resizeMode="cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
      >
        {loading && <ActivityIndicator size="large" color="#ccc" />}
        {error && <Text style={styles.errorText}>Image Not Available</Text>}
      </ImageBackground>

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        <Text style={styles.year}>{movie.release_date?.split("-")[0]}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 4,
  },
  image: {
    borderRadius: 5,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  titleContainer: {
    paddingHorizontal: 5,
    alignItems: "center",
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    opacity: 0.95,
  },
  year: {
    fontSize: 12,
    marginTop: 3,
    marginBottom: 10,
    color: "gray",
  },
});
