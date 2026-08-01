import { PreferencesForm } from "@/src/components/settings/PreferencesForm";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function TvPreferencesScreen() {
  const { scale } = useTVScale();
  const contentStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingVertical: tvSafe.vertical * scale,
    gap: spacing.xxl * scale,
  };
  const headerStyle = { gap: spacing.xs * scale };
  const titleStyle = { fontSize: typography.fontSize.page * scale };
  const subtitleStyle = { fontSize: typography.fontSize.body * scale };

  return (
    <ScrollView contentContainerStyle={contentStyle}>
      <View style={headerStyle}>
        <Text style={[styles.title, titleStyle]}>Preferences</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>
          Manage playback, languages, continue watching, and skip behavior.
        </Text>
      </View>
      <PreferencesForm />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    color: darkColors.muted,
  },
});
