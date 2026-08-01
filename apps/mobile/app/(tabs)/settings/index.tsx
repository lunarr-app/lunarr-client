import { PageHeader } from "@/src/components/layout/PageHeader";
import { ScreenScrollView } from "@/src/components/layout/ScreenScrollView";
import { SettingsRow } from "@/src/components/settings/SettingsRow";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { useHealth } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { queryKeys } from "@/src/lib/api/query-keys";
import { useAuth } from "@/src/store/auth";
import { spacing } from "@/src/theme/spacing";
import Constants from "expo-constants";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import {
  Info,
  LogOut,
  Mail,
  ScrollText,
  Server,
  Shield,
  SlidersHorizontal,
  Smartphone,
  User,
} from "lucide-react-native";
import { useRef } from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";

const USER_REFRESH_INTERVAL_MS = 10 * 60_000;

function formatAppVersion() {
  const version = Constants.expoConfig?.version ?? "unknown";
  const build = Constants.nativeBuildVersion;
  return build ? `${version} (${build})` : version;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, serverUrl, disconnect, refreshUser } = useAuth();
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth();
  const appVersion = formatAppVersion();

  useRefreshOnFocus([queryKeys.health.all]);

  const firstFocusRef = useRef(true);
  const lastUserRefreshRef = useRef(0);

  useFocusEffect(() => {
    if (firstFocusRef.current) {
      firstFocusRef.current = false;
      return;
    }
    const now = Date.now();
    if (now - lastUserRefreshRef.current < USER_REFRESH_INTERVAL_MS) return;
    lastUserRefreshRef.current = now;
    void refreshUser().catch(() => undefined);
  });

  const confirmDisconnect = () => {
    Alert.alert("Disconnect from server?", "You will need your server URL to reconnect or pair this device again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: () => void disconnect(),
      },
    ]);
  };

  const serverVersion = health?.version ?? null;
  const serverVersionDescription = serverVersion ?? (healthLoading && !healthError ? "Loading…" : "Unavailable");

  return (
    <ScreenScrollView avoidKeyboard>
      <PageHeader title="Settings" subtitle="Connection, account, and playback." />

      <View style={styles.body}>
        <SettingsSection title="Connection">
          <SettingsRow icon={Server} title="Server" description={serverUrl} showChevron={false} isLast={false} />
          <SettingsRow
            icon={Info}
            title="Server version"
            description={serverVersionDescription}
            showChevron={false}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsRow
            icon={User}
            title="Name"
            description={user?.user.name ?? "—"}
            showChevron={false}
            isLast={!user?.user.email}
          />
          {user?.user.email ? (
            <SettingsRow icon={Mail} title="Email" description={user.user.email} showChevron={false} isLast />
          ) : null}
          <SettingsRow
            icon={LogOut}
            title="Disconnect"
            description="Sign out on this device"
            destructive
            onPress={confirmDisconnect}
            showChevron={false}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsRow
            icon={SlidersHorizontal}
            title="Playback & profile"
            description="Playback mode, languages, continue watching"
            onPress={() => router.push("/settings/preferences")}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow icon={Smartphone} title="App version" description={appVersion} showChevron={false} isLast />
        </SettingsSection>

        <SettingsSection title="Legal">
          <SettingsRow
            icon={Shield}
            title="Privacy Policy"
            onPress={() => void Linking.openURL("https://lunarr-app.netlify.app/privacy.html")}
            isLast={false}
          />
          <SettingsRow
            icon={ScrollText}
            title="Terms of Service"
            onPress={() => void Linking.openURL("https://lunarr-app.netlify.app/terms.html")}
            isLast
          />
        </SettingsSection>

        {__DEV__ ? (
          <SettingsSection title="Dev">
            <SettingsRow
              icon={Info}
              title="Test invalid route"
              description="Opens the global not-found screen for layout testing."
              onPress={() => router.push("/this-route-does-not-exist" as Href)}
              showChevron={false}
              isLast
            />
          </SettingsSection>
        ) : null}
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
