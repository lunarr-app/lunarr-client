import { View, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { List, Divider, Avatar, Text } from "react-native-paper";
import { useTheme } from "@react-navigation/native";
import { createDrawerNavigator, DrawerNavigationOptions, useDrawerStatus } from "@react-navigation/drawer";
import { withLayoutContext } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { userAtom } from "@store/user";
import { getGravatarFromEmail } from "@helpers/avatar";
import { useIsScreenSizeLarge } from "@hooks/screen";

const { Navigator } = createDrawerNavigator();

const Drawer = withLayoutContext<DrawerNavigationOptions, typeof Navigator>(Navigator);

export default function Layout() {
  const [user] = useAtom(userAtom);
  const isLargeScreen = useIsScreenSizeLarge();

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

          <View style={styles.userContainer}>
            <Avatar.Image source={{ uri: getGravatarFromEmail(user?.email!) }} size={48} />
            <View style={styles.userTextContainer}>
              <Text style={styles.userDisplayName}>{user?.displayname}</Text>
              <Text style={styles.userRole}>{user?.role}</Text>
            </View>
          </View>
          <Divider style={styles.divider} />

          <List.Item title="Movies" left={(props) => <List.Icon {...props} icon="movie" />} />
          <Divider style={styles.divider} />

          <List.Item title="TV Shows" left={(props) => <List.Icon {...props} icon="television" />} />
          <Divider style={styles.divider} />

          <List.Item title="Settings" left={(props) => <List.Icon {...props} icon="cog" />} />
          <Divider style={styles.divider} />
        </SafeAreaView>
      )}
      screenOptions={({ navigation }) => ({
        headerLeft: () => {
          const theme = useTheme();
          const drawerStatus = useDrawerStatus();
          const canGoBack = navigation.canGoBack() && drawerStatus === "closed";

          if (isLargeScreen) {
            if (!canGoBack) {
              return null;
            }

            return (
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={theme.colors.text}
                onPress={() => {
                  navigation.goBack();
                }}
                style={styles.menuIcon}
              />
            );
          }

          return (
            <MaterialCommunityIcons
              name={canGoBack ? "arrow-left" : "menu"}
              size={24}
              color={theme.colors.text}
              onPress={() => {
                if (canGoBack) {
                  navigation.goBack();
                  return;
                }

                navigation.toggleDrawer();
              }}
              style={styles.menuIcon}
            />
          );
        },
        gestureEnabled: true,
        drawerType: isLargeScreen ? "permanent" : "slide",
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
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  userTextContainer: {
    marginLeft: 12,
  },
  userDisplayName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userRole: {
    fontSize: 14,
    color: "gray",
  },
});
