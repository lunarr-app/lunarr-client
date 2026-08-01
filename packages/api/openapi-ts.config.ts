import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.json",
  output: "src/generated",
  plugins: [
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/client-config.ts",
    },
  ],
});
