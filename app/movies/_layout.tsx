import { StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { createDrawerNavigator, DrawerNavigationOptions } from "@react-navigation/drawer";
import { withLayoutContext } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { Navigator } = createDrawerNavigator();

const Drawer = withLayoutContext<DrawerNavigationOptions, typeof Navigator>(Navigator);

export default function Layout() {
  const theme = useTheme();

  return (
    <Drawer
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
  menuIcon: {
    marginLeft: 10,
  },
});
