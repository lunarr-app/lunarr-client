import { View, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { createDrawerNavigator, DrawerNavigationOptions } from "@react-navigation/drawer";
import { withLayoutContext } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { List, Divider } from "react-native-paper";

const { Navigator } = createDrawerNavigator();

const Drawer = withLayoutContext<DrawerNavigationOptions, typeof Navigator>(Navigator);

export default function Layout() {
  const theme = useTheme();

  return (
    <Drawer
      drawerContent={() => (
        <SafeAreaView style={styles.drawerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo_transparent.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Divider style={styles.divider} />

          <List.Item title="Movies" left={(props) => <List.Icon {...props} icon="movie" />} />
          <Divider style={styles.divider} />

          <List.Item title="TV Shows" left={(props) => <List.Icon {...props} icon="television" />} />
          <Divider style={styles.divider} />
        </SafeAreaView>
      )}
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <MaterialCommunityIcons
            name="menu"
            size={24}
            color={theme.colors.text}
            onPress={() => {
              navigation.toggleDrawer();
            }}
            style={styles.menuIcon}
          />
        ),
        gestureEnabled: true,
        drawerType: "slide",
      })}
    />
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: "100%",
    maxWidth: 200,
    height: undefined,
    aspectRatio: 3.569,
  },
  menuIcon: {
    marginLeft: 10,
  },
  divider: {
    marginHorizontal: 10,
  },
});
