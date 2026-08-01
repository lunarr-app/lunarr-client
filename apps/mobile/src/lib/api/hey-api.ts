import { installAuthInterceptor } from "./auth-interceptor";
import { clearApiConfigState, getApiConfig, setApiConfigState } from "./client-config";
import { client } from "./generated/client.gen";

installAuthInterceptor();

export function configureApi(baseUrl: string, apiKey: string) {
  setApiConfigState(baseUrl, apiKey);
  const { baseUrl: resolvedBaseUrl } = getApiConfig();
  client.setConfig({
    baseUrl: resolvedBaseUrl,
    auth: () => getApiConfig().apiKey,
  });
}

export function clearApiConfig() {
  clearApiConfigState();
  client.setConfig({
    baseUrl: "",
    auth: undefined,
  });
}
