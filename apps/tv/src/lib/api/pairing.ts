import { normalizeBaseUrl } from "@/src/lib/api/client-config";
import {
  getHealth,
  pollDevicePairing,
  startDevicePairing,
  type DevicePairingStartResponse,
} from "@/src/lib/api/generated";
import { client } from "@/src/lib/api/generated/client.gen";
import { readApiError } from "@/src/lib/api/parse";
import { isServerVersionSupported, MIN_SUPPORTED_SERVER_VERSION } from "@/src/lib/api/serverVersion";

type PairingApproval = {
  apiKey: string;
  apiKeyId: string;
  name: string;
};

function configurePairingClient(serverUrl: string) {
  const baseUrl = normalizeBaseUrl(serverUrl);
  client.setConfig({ baseUrl, auth: undefined });
}

type ClientConfig = ReturnType<typeof client.getConfig>;

function restoreClientConfig(saved: Pick<ClientConfig, "baseUrl" | "auth">) {
  client.setConfig({ baseUrl: saved.baseUrl ?? "", auth: saved.auth });
}

export async function checkServerHealth(serverUrl: string): Promise<void> {
  const saved = client.getConfig();
  configurePairingClient(serverUrl);
  try {
    const { data, error } = await getHealth();
    if (error) {
      throw new Error(readApiError(error, "Could not reach Lunarr server"));
    }
    if (!data?.ok) {
      throw new Error("Lunarr server is not ready");
    }
    if (!data.setupComplete) {
      throw new Error("Lunarr server setup is not complete yet");
    }
    if (!isServerVersionSupported(data.version)) {
      throw new Error(
        `This app requires Lunarr server ${MIN_SUPPORTED_SERVER_VERSION} or newer${
          data.version ? ` (your server is ${data.version})` : ""
        }.`,
      );
    }
  } finally {
    restoreClientConfig({ baseUrl: saved.baseUrl, auth: saved.auth });
  }
}

export async function startPairingSession(serverUrl: string, deviceName?: string): Promise<DevicePairingStartResponse> {
  const saved = client.getConfig();
  configurePairingClient(serverUrl);
  try {
    const { data, error } = await startDevicePairing({
      body: { deviceName: deviceName?.trim() || undefined },
    });
    if (error || !data) {
      throw new Error(readApiError(error, "Could not start device pairing"));
    }
    return data;
  } finally {
    restoreClientConfig({ baseUrl: saved.baseUrl, auth: saved.auth });
  }
}

export type PairingWakeHandle = {
  wake?: () => void;
};

function sleep(ms: number, signal?: AbortSignal, wakeHandle?: PairingWakeHandle): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Pairing cancelled"));
      return;
    }

    let settled = false;
    const finish = (next: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (wakeHandle) wakeHandle.wake = undefined;
      signal?.removeEventListener("abort", onAbort);
      next();
    };

    const timer = setTimeout(() => finish(resolve), ms);
    const onAbort = () => finish(() => reject(new Error("Pairing cancelled")));
    signal?.addEventListener("abort", onAbort, { once: true });

    if (wakeHandle) {
      wakeHandle.wake = () => finish(resolve);
    }
  });
}

function classifyPairingPollError(error: unknown): {
  message: string;
  retryable: boolean;
} {
  const message = readApiError(error, "");
  const lower = message.toLowerCase();

  if (lower.includes("expired")) {
    return { message: "Pairing code expired. Start again.", retryable: false };
  }
  if (lower.includes("already completed")) {
    return {
      message:
        "Pairing finished while the app was away, but this device missed the key. Start again and remove the duplicate device in Lunarr if needed.",
      retryable: false,
    };
  }
  if (lower.includes("not found")) {
    return {
      message: "Pairing request not found. Start again.",
      retryable: false,
    };
  }
  if (lower.includes("too many requests")) {
    return { message, retryable: true };
  }

  if (error instanceof TypeError) {
    return {
      message: message || error.message || "Network error",
      retryable: true,
    };
  }

  const networkHint =
    lower.includes("network") || lower.includes("fetch") || lower.includes("timeout") || lower.includes("connection");

  if (networkHint || !message) {
    return {
      message: message || "Could not reach server while waiting for approval",
      retryable: true,
    };
  }

  return { message: message || "Pairing poll failed", retryable: false };
}

function isExpired(expiresAt: string): boolean {
  const expiresMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresMs)) return false;
  return Date.now() >= expiresMs;
}

async function waitBeforeNextPoll(
  pollIntervalMs: number,
  options: {
    signal?: AbortSignal;
    wakeHandle?: PairingWakeHandle;
    onPending?: () => void;
    retry?: boolean;
  },
): Promise<void> {
  options.onPending?.();
  const delay = options.retry ? Math.min(pollIntervalMs, 3000) : pollIntervalMs;
  await sleep(delay, options.signal, options.wakeHandle);
}

export async function pollPairingUntilApproved(
  deviceCode: string,
  serverUrl: string,
  options: {
    expiresAt: string;
    pollIntervalMs: number;
    signal?: AbortSignal;
    wakeHandle?: PairingWakeHandle;
    onPending?: () => void;
  },
): Promise<PairingApproval> {
  const saved = client.getConfig();
  configurePairingClient(serverUrl);
  try {
    let pollIntervalMs = Math.max(1000, options.pollIntervalMs);

    while (!options.signal?.aborted) {
      if (isExpired(options.expiresAt)) {
        throw new Error("Pairing code expired. Start again.");
      }

      const { data, error } = await pollDevicePairing({
        query: { deviceCode },
      });

      if (options.signal?.aborted) throw new Error("Pairing cancelled");

      if (error) {
        const classification = classifyPairingPollError(error);
        if (classification.retryable) {
          await waitBeforeNextPoll(pollIntervalMs, {
            ...options,
            retry: true,
          });
          continue;
        }
        throw new Error(classification.message);
      }

      if (!data) {
        await waitBeforeNextPoll(pollIntervalMs, {
          ...options,
          retry: true,
        });
        continue;
      }

      if (data.status === "approved") {
        return {
          apiKey: data.apiKey,
          apiKeyId: data.apiKeyId,
          name: data.name,
        };
      }

      if (data.status === "expired") {
        throw new Error("Pairing code expired. Start again.");
      }

      if (typeof data.pollIntervalMs === "number" && data.pollIntervalMs > 0) {
        pollIntervalMs = Math.max(1000, data.pollIntervalMs);
      }
      if (typeof data.expiresAt === "string") {
        options.expiresAt = data.expiresAt;
      }

      await waitBeforeNextPoll(pollIntervalMs, options);
    }

    throw new Error("Pairing cancelled");
  } finally {
    restoreClientConfig({ baseUrl: saved.baseUrl, auth: saved.auth });
  }
}
