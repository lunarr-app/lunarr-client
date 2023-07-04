import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { Stack } from "expo-router";

const ToDoPage = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "To-do",
          headerShown: true,
        }}
      />

      <Text style={styles.text}>To-Do</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default ToDoPage;
