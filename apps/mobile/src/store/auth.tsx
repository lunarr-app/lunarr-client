import { registerUnauthorizedHandler, runWithUnauthorizedSuppressed } from "@lunarr/api";
import { normalizeBaseUrl } from "@lunarr/api";
import { getCurrentUser, type MeResponse } from "@lunarr/api";
import { clearApiConfig, configureApi } from "@lunarr/api";
import { isAuthFailure, readApiError } from "@lunarr/api";
import { queryClient } from "@/src/lib/api/query-client";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Alert } from "react-native";

const SERVER_URL_KEY = "lunarr.serverUrl";
const API_KEY_KEY = "lunarr.apiKey";

class AuthError extends Error {
  response?: Response;
  constructor(message: string, response?: Response) {
    super(message);
    this.name = "AuthError";
    this.response = response;
  }
}

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  serverUrl: string;
  apiKey: string;
  user: MeResponse | null;
  connect: (serverUrl: string, apiKey: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [user, setUser] = useState<MeResponse | null>(null);

  const refreshUser = async () => {
    const { data, error, response } = await getCurrentUser();
    if (error || !data) {
      throw new AuthError(readApiError(error, "Failed to load profile"), response);
    }
    setUser(data);
  };

  const connect = async (nextServerUrl: string, nextApiKey: string) => {
    const normalizedUrl = normalizeBaseUrl(nextServerUrl);
    const normalizedKey = nextApiKey.trim();
    configureApi(normalizedUrl, normalizedKey);
    const { data, error, response } = await runWithUnauthorizedSuppressed(() => getCurrentUser());
    if (error || !data) {
      clearApiConfig();
      throw new AuthError(readApiError(error, "Could not connect to server. Check URL and API key."), response);
    }
    await SecureStore.setItemAsync(SERVER_URL_KEY, normalizedUrl);
    await SecureStore.setItemAsync(API_KEY_KEY, normalizedKey);
    setServerUrl(normalizedUrl);
    setApiKey(normalizedKey);
    setUser(data);
  };

  const disconnect = async () => {
    await SecureStore.deleteItemAsync(SERVER_URL_KEY);
    await SecureStore.deleteItemAsync(API_KEY_KEY);
    clearApiConfig();
    queryClient.clear();
    setServerUrl("");
    setApiKey("");
    setUser(null);
  };

  const restoreSession = async () => {
    try {
      const savedUrl = await SecureStore.getItemAsync(SERVER_URL_KEY);
      const savedKey = await SecureStore.getItemAsync(API_KEY_KEY);
      if (savedUrl != null) {
        if (savedKey != null) {
          configureApi(savedUrl, savedKey);
          setServerUrl(savedUrl);
          setApiKey(savedKey);
          await runWithUnauthorizedSuppressed(() => refreshUser());
        }
      }
    } catch (error) {
      if (error instanceof AuthError && isAuthFailure(error.response)) {
        await disconnect();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      await disconnect();
      Alert.alert(
        "Session expired",
        "Your API key was revoked or is no longer valid. Connect again with a new key or pair this device.",
      );
    });
  }, [disconnect]);

  const value: AuthState = {
    isLoading,
    isAuthenticated: Boolean(user),
    serverUrl,
    apiKey,
    user,
    connect,
    disconnect,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
