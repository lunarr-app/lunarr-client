import {
  View,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <ImageBackground
      source={require("../assets/images/sigma-5.gif")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Lunarr" }} />

        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Lunarr!</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={handleSignup}
        >
          <Text style={[styles.buttonText, styles.signupButtonText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    marginVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff", // White text color
  },
  button: {
    width: 220,
    height: 50,
    backgroundColor: "#3b5998",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#3b5998",
  },
  signupButtonText: {
    color: "#3b5998",
  },
});

export default HomePage;
