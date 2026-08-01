import { DevicePairingPanel } from "@/src/components/auth/DevicePairingPanel";
import { checkServerHealth } from "@lunarr/api";
import { Button } from "@/src/components/ui/Button";
import { SegmentedControl } from "@/src/components/ui/SegmentedControl";
import { TextField } from "@/src/components/ui/TextField";
import { useAuth } from "@/src/store/auth";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

type ConnectMode = "pair" | "apiKey";

export default function ConnectScreen() {
  const { connect, serverUrl, apiKey } = useAuth();
  const [mode, setMode] = useState<ConnectMode>("pair");
  const [url, setUrl] = useState(serverUrl);
  const [key, setKey] = useState(apiKey);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onConnect = async () => {
    setLoading(true);
    setError("");
    try {
      await checkServerHealth(url);
      await connect(url, key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
    setLoading(false);
  };

  const onPaired = async (pairedServerUrl: string, pairedApiKey: string) => {
    setLoading(true);
    setError("");
    try {
      await connect(pairedServerUrl, pairedApiKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require("@/assets/images/lunarr-auth-background.png")}
      style={styles.screen}
      resizeMode="cover"
    >
      <LinearGradient colors={["rgba(2,8,12,0.54)", "rgba(2,8,12,0.78)"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={["top", "right", "bottom", "left"]}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Image
                source={require("@/assets/images/lunarr-logo.png")}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Lunarr"
              />

              <SegmentedControl
                value={mode}
                onValueChange={setMode}
                options={[
                  { value: "pair", label: "Pair device" },
                  { value: "apiKey", label: "API key" },
                ]}
                style={styles.modeSwitch}
              />

              {mode === "pair" ? (
                <DevicePairingPanel serverUrl={url} onServerUrlChange={setUrl} onPaired={onPaired} />
              ) : (
                <>
                  <Text style={styles.subtitle}>
                    Enter your server URL and a personal API key from Lunarr web Profile → API Keys.
                  </Text>

                  <TextField
                    label="Server URL"
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://lunarr.example.com"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    style={styles.input}
                  />
                  <TextField
                    label="API key"
                    value={key}
                    onChangeText={setKey}
                    placeholder="lunarr_..."
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    style={styles.input}
                  />

                  <Button mode="contained" onPress={onConnect} loading={loading} disabled={loading || !url || !key}>
                    Connect
                  </Button>
                </>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.bg,
  },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    gap: spacing.md,
    backgroundColor: darkColors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: darkColors.border,
    padding: spacing.xl,
    maxWidth: 448,
    width: "100%",
    alignSelf: "center",
  },
  logo: {
    width: "72%",
    maxWidth: 208,
    height: 48,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  modeSwitch: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: darkColors.muted,
    fontSize: typography.fontSize.label,
    lineHeight: typography.lineHeight.relaxed,
    textAlign: "center",
  },
  input: {
    backgroundColor: darkColors.inputBg,
  },
  error: {
    color: darkColors.error,
    fontSize: typography.fontSize.body,
  },
});
