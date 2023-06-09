import { useState } from "react";
import {
  View,
  Image,
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
    router.push("/sign-up");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Login - Lunarr" }} />

      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="cover"
      />

      <Text style={styles.title}>Welcome to Lunarr</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#ccc"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#ccc"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.signupText}>
        Don't have an account?{" "}
        <Text style={styles.signupLink} onPress={handleSignup}>
          Signup
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#262833", // Dark background color
  },
  logo: {
    width: "100%",
    maxWidth: 300,
    height: 100,
    marginBottom: 16,
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
    height: 40,
    backgroundColor: "#444", // Dark input background color
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "#fff", // White text color
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
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
    color: "#2196F3",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default SignIn;
