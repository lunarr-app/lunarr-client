import { Api } from "./lunarr";

export const LunarrApi = new Api({
  baseURL: "http://127.0.0.1:3000",
});

export const setApiKeyHeader = (apiKey: string) => {
  LunarrApi.instance.defaults.headers.common["x-api-key"] = apiKey;
};

export const clearApiKeyHeader = () => {
  delete LunarrApi.instance.defaults.headers.common["x-api-key"];
};
