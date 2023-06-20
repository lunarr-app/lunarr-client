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
import { LunarrApi, setBaseUrl as addBaseUrl } from "@backend/api";

const SignUp: React.FC = () => {
  const router = useRouter();

  const [displayname, setDisplayname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (baseUrl) {
        addBaseUrl(baseUrl);
      }

      const { data } = await LunarrApi.auth.signupCreate({
        displayname,
        username,
        email,
        password,
        sex: (gender as any) || "unknown",
      });
      setSuccessMessage(data.message as string);

      // After successful signup, navigate to the login page
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message);
    }

    setIsLoading(false);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background_signup.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Signup - Lunarr" }} />

        <Text style={styles.title}>Create an Account</Text>
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
            placeholder="Display Name"
            value={displayname}
            onChangeText={setDisplayname}
            placeholderTextColor="#ccc"
          />

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#ccc"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#ccc"
            keyboardType="email-address"
          />

          <TextInput
            secureTextEntry
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#ccc"
            keyboardType="visible-password"
          />

          <View style={styles.genderContainer}>
            <Text style={styles.genderLabel}>Gender:</Text>

            <View style={styles.genderButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "male" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("male")}
              >
                <Text style={styles.genderButtonText}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "female" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("female")}
              >
                <Text style={styles.genderButtonText}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>
              {isLoading ? "Signing up..." : "Sign up"}
            </Text>
          </TouchableOpacity>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {successMessage ? (
            <Text style={styles.successText}>{successMessage}</Text>
          ) : null}

          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginLink} onPress={handleLogin}>
              Sign in
            </Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  form: {
    width: "90%",
    maxWidth: 500, // Maximum width for the signup container
  },
  input: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 40,
    color: "#fff",
  },
  genderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  genderLabel: {
    marginRight: 8,
    color: "#fff",
  },
  genderButtonsContainer: {
    flexDirection: "row",
  },
  genderButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  genderButtonActive: {
    backgroundColor: "#6495ED",
  },
  genderButtonText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#6495ED",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 8,
  },
  successText: {
    color: "green",
    marginTop: 8,
  },
  loginText: {
    marginTop: 16,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  loginLink: {
    color: "#6495ED",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default SignUp;
