import { Button } from "@/src/components/ui/Button";
import { TextField } from "@/src/components/ui/TextField";
import { normalizeBaseUrl } from "@/src/lib/api/client-config";
import type { DevicePairingStartResponse } from "@/src/lib/api/generated";
import {
  checkServerHealth,
  pollPairingUntilApproved,
  startPairingSession,
  type PairingWakeHandle,
} from "@/src/lib/api/pairing";
import { darkColors } from "@/src/theme/colors";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Platform, StyleSheet, Text, View } from "react-native";

type Props = {
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  onPaired: (serverUrl: string, apiKey: string) => Promise<void>;
};

type PairingPhase = "idle" | "starting" | "waiting" | "connecting";

function defaultDeviceName() {
  const appName = Constants.expoConfig?.name ?? "Lunarr";
  const platform = Platform.OS === "ios" ? "iOS" : "Android";
  return `${appName} (${platform})`;
}

export function DevicePairingPanel({ serverUrl, onServerUrlChange, onPaired }: Props) {
  const [phase, setPhase] = useState<PairingPhase>("idle");
  const [session, setSession] = useState<DevicePairingStartResponse | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const wakeHandleRef = useRef<PairingWakeHandle>({});

  useEffect(() => {
    if (phase !== "waiting") return;

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        wakeHandleRef.current.wake?.();
      }
    });

    return () => subscription.remove();
  }, [phase]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const cancelPairing = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase("idle");
    setSession(null);
    setError("");
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
          wakeHandle: wakeHandleRef.current,
        });

        if (!controller.signal.aborted) {
          setPhase("connecting");
          try {
            await onPaired(normalizedUrl, approval.apiKey);
          } catch (err) {
            setPhase("idle");
            setSession(null);
            let message = "Connection failed";
            if (err instanceof Error) message = err.message;
            setError(message);
          }
        }
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setPhase("idle");
        setSession(null);
        let message = "Pairing failed";
        if (err instanceof Error) message = err.message;
        setError(message);
      }
    }

    if (abortRef.current === controller) {
      abortRef.current = null;
    }
  };

  const openPairingPage = async () => {
    if (!session?.pairingUrl) return;
    const canOpen = await Linking.canOpenURL(session.pairingUrl);
    if (!canOpen) {
      setError("Could not open the pairing page on this device");
      return;
    }
    await Linking.openURL(session.pairingUrl);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.help}>
        Enter your server URL, then approve this device in Lunarr web under Profile → Devices using the code below.
      </Text>

      <TextField
        label="Server URL"
        value={serverUrl}
        onChangeText={onServerUrlChange}
        placeholder="https://lunarr.example.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={styles.input}
        editable={phase === "idle"}
      />

      {session ? (
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Pairing code</Text>
          <Text style={styles.codeValue} selectable>
            {session.userCode}
          </Text>
          <Text style={styles.codeHint}>Approve this code on your Lunarr server before it expires.</Text>
          <Button mode="outlined" onPress={() => void openPairingPage()}>
            Open pairing page
          </Button>
        </View>
      ) : null}

      {phase === "waiting" || phase === "starting" || phase === "connecting" ? (
        <View style={styles.waitingRow}>
          <ActivityIndicator color={darkColors.accent} />
          <Text style={styles.waitingText}>
            {phase === "starting"
              ? "Starting pairing…"
              : phase === "connecting"
                ? "Connecting…"
                : "Waiting for approval…"}
          </Text>
        </View>
      ) : null}

      {phase === "waiting" ? (
        <Text style={styles.help}>Keep this screen open and return here to finish pairing.</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        {phase === "idle" ? (
          <Button mode="contained" onPress={() => void startPairing()} disabled={!serverUrl.trim()}>
            Start pairing
          </Button>
        ) : phase === "connecting" ? (
          <Button mode="outlined" onPress={cancelPairing}>
            Cancel
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  help: {
    color: darkColors.muted,
    fontSize: typography.fontSize.label,
    lineHeight: typography.lineHeight.relaxed,
    textAlign: "center",
  },
  input: {
    backgroundColor: darkColors.inputBg,
  },
  codeCard: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radii.card,
    backgroundColor: darkColors.surfaceStrong,
    padding: spacing.lg,
    alignItems: "center",
  },
  codeLabel: {
    color: darkColors.muted,
    fontSize: typography.fontSize.meta,
    fontWeight: typography.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  codeValue: {
    color: darkColors.text,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 4,
  },
  codeHint: {
    color: darkColors.muted,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.normal,
    textAlign: "center",
  },
  waitingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  waitingText: {
    color: darkColors.muted,
    fontSize: typography.fontSize.body,
  },
  error: {
    color: darkColors.error,
    fontSize: typography.fontSize.body,
    textAlign: "center",
  },
  actions: {
    gap: spacing.sm,
  },
});
