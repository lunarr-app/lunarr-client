import { useRouter, useSegments, type RelativePathString } from "expo-router";
import { Image, Pressable, StyleSheet, Text, TVFocusGuideView, View } from "react-native";

import { FocusRing } from "@/src/components/ui/FocusRing";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

const TABS = [
  { key: "index", label: "Continue", href: "/(tabs)" as RelativePathString },
  { key: "movies", label: "Movies", href: "/(tabs)/movies" as RelativePathString },
  { key: "shows", label: "Shows", href: "/(tabs)/shows" as RelativePathString },
  { key: "watchlist", label: "Watchlist", href: "/(tabs)/watchlist" as RelativePathString },
  { key: "discover", label: "Discover", href: "/(tabs)/discover" as RelativePathString },
  { key: "search", label: "Search", href: "/search" as RelativePathString },
  { key: "settings", label: "Settings", href: "/(tabs)/settings" as RelativePathString },
] as const;

export function TopMenu() {
  const router = useRouter();
  const segments = useSegments();
  const active = (segments as string[])[1] ?? "index";
  const { scale } = useTVScale();

  const barStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingTop: tvSafe.top * scale,
    paddingBottom: spacing.md * scale,
    gap: spacing.xl * scale,
  };
  const brandStyle = { width: tvSize(160, scale), height: tvSize(46, scale) };
  const tabsStyle = { gap: spacing.xl * scale };
  const itemStyle = { borderRadius: radii.control * scale };
  const itemInnerStyle = { paddingHorizontal: spacing.lg * scale, paddingVertical: spacing.md * scale };
  const labelStyle = { fontSize: typography.fontSize.label * scale };

  return (
    <View style={[styles.bar, barStyle]}>
      <Image source={require("@/assets/images/lunarr-logo.png")} style={brandStyle} resizeMode="contain" />
      <TVFocusGuideView autoFocus style={[styles.tabs, tabsStyle]}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={({ focused }) => [itemStyle, (isActive || focused) && styles.itemHighlighted]}
              onPress={() => (tab.key === "search" ? router.push(tab.href) : router.replace(tab.href))}
              focusable
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              {({ focused }) => (
                <FocusRing
                  focused={focused}
                  width={Math.max(2, 4 * scale)}
                  color={darkColors.accent}
                  radius={radii.control * scale}
                >
                  <View style={itemInnerStyle}>
                    <Text style={[styles.label, labelStyle, isActive && styles.labelActive]}>{tab.label}</Text>
                  </View>
                </FocusRing>
              )}
            </Pressable>
          );
        })}
      </TVFocusGuideView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: darkColors.bg,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemHighlighted: {
    backgroundColor: darkColors.surfaceStrong,
  },
  label: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.semibold,
  },
  labelActive: {
    color: darkColors.text,
  },
});
