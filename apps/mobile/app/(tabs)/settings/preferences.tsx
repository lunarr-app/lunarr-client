import { PageHeader } from "@/src/components/layout/PageHeader";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { ProfilePreferencesForm } from "@/src/components/profile/ProfilePreferencesForm";
import { useAuth } from "@/src/store/auth";
import { spacing } from "@/src/theme/spacing";
import { useFocusEffect } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PreferencesScreen() {
  const { refreshUser } = useAuth();

  useFocusEffect(() => {
    void refreshUser().catch(() => undefined);
  });

  return (
    <ScreenScrollView avoidKeyboard reserveBottomInset>
      <PageHeader title="Preferences" showBack backLabel="Settings" />
      <View style={styles.body}>
        <ProfilePreferencesForm />
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
});
