import { Server, SlidersHorizontal, User, X, Info, Smartphone } from "lucide-react-native";
import { Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

import { SettingsRow } from "@/src/components/settings/SettingsRow";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { useHealth } from "@/src/hooks/queries";
import { useRefreshOnFocus } from "@/src/hooks/useRefreshOnFocus";
import { queryKeys } from "@/src/lib/api/query-keys";
import { useAuth } from "@/src/store/auth";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";

function formatAppVersion() {
  const version = Constants.expoConfig?.version ?? "unknown";
  const build = Constants.nativeBuildVersion;
  return build ? `${version} (${build})` : version;
}

export default function TvSettingsScreen() {
  const router = useRouter();
  const { scale } = useTVScale();
  const { user, serverUrl, disconnect } = useAuth();
  const appVersion = formatAppVersion();

  const { data, isLoading, error } = useHealth();
  const version = data?.version ?? (isLoading && !error ? "Loading…" : "Unavailable");

  useRefreshOnFocus([queryKeys.health.all]);

  const confirmDisconnect = () => {
    Alert.alert("Disconnect from server?", "You will need your server URL to reconnect.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: () => void disconnect(),
      },
    ]);
  };

  const contentStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingVertical: tvSafe.vertical * scale,
    gap: spacing.xxl * scale,
  };

  return (
    <ScrollView contentContainerStyle={contentStyle}>
      <SettingsSection title="Server">
        <SettingsRow icon={Server} title="Server" description={serverUrl} showChevron={false} isLast={false} />
        <SettingsRow icon={Info} title="Server version" description={version} showChevron={false} isLast />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsRow
          icon={User}
          title={user?.user.name ?? "User"}
          description={user?.user.email ?? ""}
          showChevron={false}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsRow
          icon={SlidersHorizontal}
          title="Preferences"
          description="Playback, languages, continue watching, and skip behavior"
          onPress={() => router.push("/settings/preferences")}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow icon={Smartphone} title="App version" description={appVersion} showChevron={false} isLast />
      </SettingsSection>

      <SettingsSection title="Danger">
        <SettingsRow icon={X} title="Disconnect" onPress={confirmDisconnect} isLast />
      </SettingsSection>
    </ScrollView>
  );
}
