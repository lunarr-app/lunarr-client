import { useState } from "react";
import {
  View,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../context/auth";
import { Stack, useRouter } from "expo-router";

const SignIn: React.FC = () => {
  const { signIn } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    signIn();
    // perform any additional login logic here
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background_login.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Login - Lunarr" }} />

        <Text style={styles.title}>Welcome to Lunarr</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#fff"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#fff"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.signupText}>
          New to Lunarr?{" "}
          <Text style={styles.signupLink} onPress={handleSignup}>
            Sign up now
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background overlay
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff", // White text color
    marginBottom: 40,
  },
  form: {
    width: "80%",
    alignItems: "center",
    maxWidth: 400, // Maximum width for the login container
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Semi-transparent input background color
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#fff", // White text color
  },
  button: {
    backgroundColor: "#e50914", // Red color for the button
    borderRadius: 4,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#fff", // White text color
  },
  signupLink: {
    color: "#e50914", // Red color for the link
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default SignIn;
