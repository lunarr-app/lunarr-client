import { darkColors } from "@/src/theme/colors";
import { Tabs } from "expo-router";
import { Bookmark, Clock3, Film, Settings, Tv } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: darkColors.surfaceStrong },
        headerTintColor: darkColors.text,
        tabBarStyle: {
          backgroundColor: darkColors.surfaceStrong,
          borderTopColor: darkColors.border,
        },
        tabBarActiveTintColor: darkColors.accent,
        tabBarInactiveTintColor: darkColors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Continue",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Clock3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: "Movies",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Film color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shows"
        options={{
          title: "Shows",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Tv color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
