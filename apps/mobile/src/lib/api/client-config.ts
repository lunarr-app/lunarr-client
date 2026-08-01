import type { CreateClientConfig } from "./generated/client";

let currentBaseUrl = "";
let currentApiKey = "";

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: currentBaseUrl,
  auth: () => currentApiKey,
});

export function getApiConfig() {
  return { baseUrl: currentBaseUrl, apiKey: currentApiKey };
}

export function setApiConfigState(baseUrl: string, apiKey: string) {
  currentBaseUrl = normalizeBaseUrl(baseUrl);
  currentApiKey = apiKey.trim();
  if (!currentApiKey) {
    throw new Error("API key cannot be empty");
  }
}

export function clearApiConfigState() {
  currentBaseUrl = "";
  currentApiKey = "";
}
