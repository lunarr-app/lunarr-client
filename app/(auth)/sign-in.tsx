import { Text, View, StyleSheet } from "react-native";
import { useAuth } from "../../context/auth";

const SignIn: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text onPress={() => signIn()}>Sign In</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignIn;
