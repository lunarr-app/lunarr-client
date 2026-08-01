// Shared API client for the Lunarr client apps.
// Re-exported through the apps' tsconfig `paths` + Metro resolver alias.

export * from "./generated";
export { client, type CreateClientConfig } from "./generated/client.gen";
export {
  clearApiConfigState,
  createClientConfig,
  getApiConfig,
  normalizeBaseUrl,
  setApiConfigState,
} from "./client-config";
export { isAuthFailure, readApiError } from "./parse";
export { isServerVersionSupported, MIN_SUPPORTED_SERVER_VERSION } from "./serverVersion";
export { checkServerHealth, pollPairingUntilApproved, startPairingSession, type PairingWakeHandle } from "./pairing";
export { clearApiConfig, configureApi } from "./hey-api";
export { installAuthInterceptor, registerUnauthorizedHandler, runWithUnauthorizedSuppressed } from "./auth-interceptor";
