import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { QrCodeSvg } from "react-native-qr-svg";

import { Button } from "@/src/components/ui/Button";
import { PresetChipRow } from "@/src/components/ui/PresetChipRow";
import { TextField } from "@/src/components/ui/TextField";
import { darkColors } from "@/src/theme/colors";
import { normalizeBaseUrl } from "@lunarr/api";
import type { DevicePairingStartResponse } from "@lunarr/api";
import { checkServerHealth, pollPairingUntilApproved, startPairingSession } from "@lunarr/api";
import { useKeyboardVisible } from "@/src/hooks/useKeyboard";
import { useAuth } from "@/src/store/auth";
import { radii, spacing, tvSafe } from "@/src/theme/spacing";
import { tvCardWidth, tvFontSize, tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";

type Phase = "idle" | "starting" | "waiting" | "connecting";
type ConnectMode = "pair" | "apiKey";

function defaultDeviceName() {
  const appName = Constants.expoConfig?.name ?? "Lunarr";
  const platform = Platform.isTVOS ? "tvOS" : "Android TV";
  return `${appName} (${platform})`;
}

export default function TvConnectScreen() {
  const { connect, serverUrl: savedServerUrl, apiKey: savedApiKey } = useAuth();
  const [serverUrl, setServerUrl] = useState(savedServerUrl);
  const [apiKey, setApiKey] = useState(savedApiKey);
  const [mode, setMode] = useState<ConnectMode>("pair");
  const [connecting, setConnecting] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [session, setSession] = useState<DevicePairingStartResponse | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const { scale } = useTVScale();
  const keyboardOpen = useKeyboardVisible();

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const reset = () => {
    setPhase("idle");
    setSession(null);
    setError("");
  };

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    reset();
  };

  const startPairing = async () => {
    const normalizedUrl = normalizeBaseUrl(serverUrl);
    if (!normalizedUrl) {
      setError("Enter your Lunarr server URL");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError("");
    setPhase("starting");
    setSession(null);

    try {
      await checkServerHealth(normalizedUrl);
      const nextSession = await startPairingSession(normalizedUrl, defaultDeviceName());
      if (!controller.signal.aborted) {
        setSession(nextSession);
        setPhase("waiting");

        const approval = await pollPairingUntilApproved(nextSession.deviceCode, normalizedUrl, {
          expiresAt: nextSession.expiresAt,
          pollIntervalMs: nextSession.pollIntervalMs,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setPhase("connecting");
          await connect(normalizedUrl, approval.apiKey);
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        reset();
        let message = "Pairing failed";
        if (err instanceof Error) message = err.message;
        setError(message);
      }
    }

    if (abortRef.current === controller) {
      abortRef.current = null;
    }
  };

  const onConnect = async () => {
    const normalizedUrl = normalizeBaseUrl(serverUrl);
    if (!normalizedUrl) {
      setError("Enter your Lunarr server URL");
      return;
    }
    setError("");
    setConnecting(true);
    try {
      await checkServerHealth(normalizedUrl);
      await connect(normalizedUrl, apiKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
    setConnecting(false);
  };

  const cardWidth = tvCardWidth(scale);
  const allowFontScaling = Platform.isTVOS;

  const cardStyle = {
    width: cardWidth,
    gap: spacing.lg * scale,
    padding: spacing.xxl * scale,
    borderRadius: radii.card * scale,
    borderWidth: Math.max(1, 2 * scale),
  };

  const shouldAnchorTop = keyboardOpen && Platform.OS === "android";

  const contentStyle: ViewStyle = {
    paddingHorizontal: tvSafe.horizontal * scale,
    paddingTop: shouldAnchorTop ? tvSafe.top * scale : tvSafe.vertical * scale,
    paddingBottom: tvSafe.vertical * scale,
    gap: spacing.xxl * scale,
    justifyContent: shouldAnchorTop ? "flex-start" : "center",
  };

  return (
    <ImageBackground
      source={require("@/assets/images/lunarr-auth-background.png")}
      style={styles.screen}
      resizeMode="cover"
    >
      <LinearGradient colors={["rgba(2,8,12,0.6)", "rgba(2,8,12,0.88)"]} style={StyleSheet.absoluteFill} />
      <View style={[styles.content, contentStyle]}>
        <Image
          source={require("@/assets/images/lunarr-logo.png")}
          style={{ width: tvSize(200, scale), height: tvSize(60, scale) }}
          resizeMode="contain"
        />

        {phase === "idle" ? (
          <View style={[styles.card, cardStyle]}>
            <Text
              style={[styles.title, { fontSize: tvFontSize(typography.fontSize.page, scale) }]}
              allowFontScaling={allowFontScaling}
            >
              Connect to Lunarr
            </Text>
            <PresetChipRow<ConnectMode>
              value={mode}
              options={[
                { value: "pair", label: "Pair device" },
                { value: "apiKey", label: "API key" },
              ]}
              onValueChange={(next) => {
                setMode(next);
                setError("");
              }}
              style={styles.modeSwitch}
            />
            {mode === "pair" ? (
              <>
                <Text
                  style={[
                    styles.help,
                    {
                      fontSize: tvFontSize(typography.fontSize.body, scale),
                      lineHeight: tvSize(typography.lineHeight.relaxed, scale),
                    },
                  ]}
                  allowFontScaling={allowFontScaling}
                >
                  Enter your server URL, then approve this device in Lunarr web under Profile → Devices.
                </Text>
                <TextField
                  label="Server URL"
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  placeholder="https://lunarr.example.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  allowFontScaling={allowFontScaling}
                />
                <Button
                  mode="contained"
                  onPress={() => void startPairing()}
                  block
                  allowFontScaling={allowFontScaling}
                  disabled={!serverUrl.trim()}
                >
                  Pair this device
                </Button>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.help,
                    {
                      fontSize: tvFontSize(typography.fontSize.body, scale),
                      lineHeight: tvSize(typography.lineHeight.relaxed, scale),
                    },
                  ]}
                  allowFontScaling={allowFontScaling}
                >
                  Enter your server URL and a personal API key from Lunarr web Profile → API Keys.
                </Text>
                <TextField
                  label="Server URL"
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  placeholder="https://lunarr.example.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  allowFontScaling={allowFontScaling}
                />
                <TextField
                  label="API key"
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="lunarr_..."
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  allowFontScaling={allowFontScaling}
                />
                <Button
                  mode="contained"
                  onPress={() => void onConnect()}
                  loading={connecting}
                  disabled={connecting || !serverUrl.trim() || !apiKey.trim()}
                  block
                  allowFontScaling={allowFontScaling}
                >
                  Connect
                </Button>
              </>
            )}
            {error ? (
              <Text
                style={[styles.error, { fontSize: tvFontSize(typography.fontSize.body, scale) }]}
                allowFontScaling={allowFontScaling}
              >
                {error}
              </Text>
            ) : null}
          </View>
        ) : phase === "starting" ? (
          <View style={[styles.card, cardStyle]}>
            <ActivityIndicator color={darkColors.accent} size="large" />
            <Text
              style={[styles.statusText, { fontSize: tvFontSize(typography.fontSize.body, scale) }]}
              allowFontScaling={allowFontScaling}
            >
              Starting pairing…
            </Text>
          </View>
        ) : (
          <View style={[styles.card, cardStyle]}>
            <Text
              style={[styles.codeLabel, { fontSize: tvFontSize(typography.fontSize.body, scale) }]}
              allowFontScaling={allowFontScaling}
            >
              Pairing code
            </Text>
            <Text
              style={[
                styles.codeValue,
                { fontSize: tvFontSize(typography.fontSize.display, scale), letterSpacing: 6 * scale },
              ]}
              numberOfLines={1}
              allowFontScaling={allowFontScaling}
            >
              {session?.userCode}
            </Text>
            {session?.pairingUrl ? (
              <View style={[styles.qrWrap, { padding: spacing.md * scale, borderRadius: radii.card * scale }]}>
                <QrCodeSvg
                  value={session.pairingUrl}
                  frameSize={tvSize(280, scale)}
                  backgroundColor={darkColors.bg}
                  dotColor={darkColors.text}
                />
              </View>
            ) : null}
            <Text
              style={[styles.hint, { fontSize: tvFontSize(typography.fontSize.body, scale) }]}
              allowFontScaling={allowFontScaling}
            >
              Approve this code in Lunarr web under Profile → Devices before it expires.
            </Text>
            <Button mode="outlined" onPress={cancel} block allowFontScaling={allowFontScaling}>
              Cancel
            </Button>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: darkColors.surface,
    borderColor: darkColors.border,
    alignItems: "center",
  },
  modeSwitch: {
    alignSelf: "stretch",
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
  },
  help: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.regular,
    textAlign: "center",
  },
  statusText: {
    color: darkColors.muted,
  },
  codeLabel: {
    color: darkColors.muted,
    fontWeight: typography.fontWeight.medium,
    textTransform: "uppercase",
  },
  codeValue: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.bold,
  },
  qrWrap: {
    backgroundColor: darkColors.surfaceStrong,
  },
  hint: {
    color: darkColors.muted,
    textAlign: "center",
  },
  error: {
    color: darkColors.error,
    textAlign: "center",
  },
});
