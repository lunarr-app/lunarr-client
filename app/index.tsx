import { Text, View, StyleSheet } from "react-native";
import { useAuth } from "../context/auth";

const Index: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text onPress={() => signOut()}>Sign Out</Text>
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

export default Index;
