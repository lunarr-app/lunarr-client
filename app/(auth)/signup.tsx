import { useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Stack, useRouter } from "expo-router";

interface SignupData {
  displayName: string;
  username: string;
  password: string;
  gender: string;
}

const SignUp: React.FC = () => {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const signupData: SignupData = {
      displayName,
      username,
      password,
      gender,
    };

    // Perform signup logic here, such as calling an API to register the user
    // Use the signupData object to send the required data

    // After successful signup, navigate to the login page
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Signup - Lunarr" }} />

      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="cover"
      />

      <Text style={styles.title}>Create an Account</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
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
          secureTextEntry
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#ccc"
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

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "unknown" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("unknown")}
            >
              <Text style={styles.genderButtonText}>Unknown</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#262833",
  },
  logo: {
    width: "100%",
    maxWidth: 300,
    height: 100,
    marginBottom: 16,
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
    backgroundColor: "#444",
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
    backgroundColor: "#555",
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
