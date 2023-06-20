import { Api } from "./lunarr";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

export const LunarrApi = new Api({
  baseURL: DEFAULT_BASE_URL,
});

export const setBaseUrl = (baseUrl: string) => {
  LunarrApi.instance.defaults.baseURL = baseUrl;
};

export const setApiKeyHeader = (apiKey: string) => {
  LunarrApi.instance.defaults.headers.common["x-api-key"] = apiKey;
};

export const clearApiKeyHeader = () => {
  delete LunarrApi.instance.defaults.headers.common["x-api-key"];
};
