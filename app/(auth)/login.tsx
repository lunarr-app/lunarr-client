import { useState } from "react";
import {
  View,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  LunarrApi,
  setApiKeyHeader,
  setBaseUrl as addBaseUrl,
} from "@backend/api";
import { useAtom } from "jotai";
import { userAtom } from "@store/user";

const SignIn: React.FC = () => {
  const router = useRouter();
  const [_, setUser] = useAtom(userAtom);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (baseUrl) {
        addBaseUrl(baseUrl);
      }

      const { data } = await LunarrApi.auth.loginCreate({
        username,
        password,
      });
      if (!data.api_key) {
        throw new Error("Invalid credentials");
      }
      setApiKeyHeader(data.api_key);
      setSuccessMessage("Successfully logged in");

      // Get user account
      const { data: useraccount } = await LunarrApi.api.usersMeList();
      setUser(useraccount);

      setTimeout(() => {
        // Set user in state
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message);
    }

    setIsLoading(false);
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background_login.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Login - Lunarr" }} />

        <Text style={styles.title}>Welcome to Lunarr</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Base URL"
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholderTextColor="#ccc"
            keyboardType="url"
          />

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

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>Signing In...</Text>
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {successMessage ? (
            <Text style={styles.successText}>{successMessage}</Text>
          ) : null}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  errorText: {
    color: "#f00", // Red error text color
    marginBottom: 16,
  },
  successText: {
    color: "#0f0", // Green success text color
    marginBottom: 16,
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
