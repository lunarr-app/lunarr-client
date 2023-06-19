import { useState } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getImageURL } from "../helpers/tmdb";
import type { ModelsMovieMetadata } from "@backend/api/lunarr";

interface MovieItemProps {
  movie: ModelsMovieMetadata;
  width: number;
}

export default function MovieItem({ movie, width }: MovieItemProps) {
  const [loading, setLoading] = useState(true);

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => {
        Alert.alert("To-do");
      }}
    >
      <Image
        style={[styles.image, { width, height: width * 1.5 }]}
        source={{
          uri: getImageURL(movie.poster_path!, width),
        }}
        resizeMode="cover"
        onLoadEnd={() => setLoading(false)}
      />

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
  },
  imageProgress: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
