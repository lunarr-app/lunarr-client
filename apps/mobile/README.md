# Lunarr Mobile

React Native + Expo client for [lunarr-sveltekit](../lunarr-sveltekit). iOS and Android only.

See [RELEASE.md](./RELEASE.md) for v1 scope (what is and is not included).

## Stack

- Expo SDK 57 + expo-dev-client
- expo-router
- [@hey-api/openapi-ts](https://heyapi.dev) + Fetch client
- `expo-video` for playback (AVPlayer / ExoPlayer)
- pnpm package manager

## Prerequisites

- pnpm (from the repo root: `pnpm --filter lunarr-mobile <script>`)
- Xcode (iOS) and/or Android Studio
- A running lunarr-sveltekit server

## Setup

```bash
pnpm install
pnpm gen:api   # regenerate SDK when backend OpenAPI changes
npx expo prebuild
```

`gen:api` reads `openapi.json` (exported from lunarr-sveltekit). To refresh the spec:

```bash
pnpm gen:openapi
```

Or manually:

```bash
cd ../lunarr-sveltekit
node -e "import { openApiDocument } from './src/lib/server/openapi.ts'; await Bun.write('../lunarr-mobile/openapi.json', JSON.stringify(openApiDocument, null, 2));"
cd ../lunarr-mobile
pnpm gen:api
```

## Development

```bash
pnpm start     # Metro + dev client
pnpm ios       # build & run iOS
pnpm android   # build & run Android
pnpm exec tsc --noEmit --noUnusedLocals --noUnusedParameters
```

On first launch, open **Connect**:

1. **Pair device** (recommended) — enter your server URL, approve the code in Lunarr web
2. **API key** — enter server URL + personal API key from Lunarr web → Profile → API Keys (`lunarr_...`)

If your API key is revoked while signed in, the app signs out automatically and prompts you to reconnect.

## EAS builds

```bash
# Local development client (simulator / device + Metro)
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile development --platform android

# Internal / production builds (no Metro required)
npx eas-cli build --profile preview --platform all
npx eas-cli build --profile production --platform all
```

## Project layout

- `app/` — expo-router screens
- `src/theme/` — colors from lunarr-sveltekit `app.css`
- `src/lib/api/generated/` — Hey API output (do not edit)
- `src/components/` — catalog + player UI
- `src/lib/playback/` — playback sessions, heartbeat, progress
- `src/store/auth.tsx` — connection state, secure credential storage, 401 handling

## Notes

- Requires a **development build** for day-to-day native work (`expo-dev-client`). Preview/production EAS profiles produce standalone installs.
- Self-hosted HTTP servers are allowed for local/LAN testing (see `app.json` ATS / cleartext settings).
- App and server version are shown on the Settings tab for support/debugging.
