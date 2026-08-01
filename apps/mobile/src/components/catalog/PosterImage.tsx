import { darkColors } from "@/src/theme/colors";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

const LOAD_TIMEOUT_MS = 8000;

type Props = {
  uri: string;
};

export function PosterImage({ uri }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [uri]);

  return (
    <>
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={darkColors.accent} size="small" />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: "100%" },
  loader: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.card,
  },
});
