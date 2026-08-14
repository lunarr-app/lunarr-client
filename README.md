# Lunarr Clients

Monorepo for the Lunarr client apps (the mobile and TV frontends for the Lunarr media server).

Available on [Google Play](https://play.google.com/store/apps/details?id=app.lunarr.mobile) for mobile, tablets, and TV, and on the [App Store](https://apps.apple.com/app/lunarr/id6790165981) for iOS and tvOS.

[<img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" alt="Get it on Google Play" width="200">](https://play.google.com/store/apps/details?id=app.lunarr.mobile)
[<img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" width="200">](https://apps.apple.com/app/lunarr/id6790165981)

## Apps

| App   | Path        | Description                          |
| ----- | ----------- | ------------------------------------ |
| Mobile| `apps/mobile`| Expo SDK 57 phone/tablet app (iOS, Android, web) |
| TV    | `apps/tv`   | Expo SDK 57 TV app (Apple TV, Android TV)         |
| API   | `packages/api` | Shared API client (generated from the Lunarr backend OpenAPI spec) |
| Core  | `packages/core` | Shared app-agnostic logic + query hooks (media/playback/profile, `queryKeys`, hooks) |

pnpm workspace monorepo. All deps install from the repo root into a single virtual store
(`node_modules/.pnpm`); the apps and `packages/*` are symlinked together. Expo/Metro auto-detects
the workspace (SDK 52+), so no manual `metro.config.js` wiring is needed. The TV app resolves
`react-native` to `react-native-tvos` via its own dependency; `autoInstallPeers` is disabled in
`pnpm-workspace.yaml` so the TV build does not pull in `react-native-reanimated` /
`react-native-gesture-handler` / `react-native-worklets` (optional peers of expo-router) that the
TV app does not use, while the mobile app still gets them as explicit dependencies.

`packages/api` and `packages/core` are shared TypeScript source — no build step. Both apps declare
them as `workspace:*` dependencies, so they resolve through each app's `node_modules` symlink.
`packages/core` has dev-dependencies (react/react-native/@lunarr/api/@tanstack/react-query/expo-router)
only so its own `pnpm typecheck` resolves types — at bundle time everything resolves to each app's
single `node_modules`.

## Requirements

- [pnpm](https://pnpm.io) (package manager)
- [Node.js](https://nodejs.org) (LTS)
- The Lunarr backend at `../lunarr-go` (used by `gen:openapi`)

## Quick start

```bash
# Install all workspace dependencies (from the repo root)
pnpm install

# Run the mobile app (via root helpers)
pnpm mobile:start
pnpm mobile:ios
pnpm mobile:android

# Run the TV app
pnpm tv:start
pnpm tv:ios
pnpm tv:android
```

Or from inside each app:

```bash
cd apps/mobile && pnpm start
cd apps/tv && pnpm start
```

## Commands per app

See the root `AGENTS.md` for repo conventions, typecheck, and formatting commands.
Typical per-app workflow (or use `pnpm --filter <pkg> <script>` from the root):

```bash
pnpm typecheck      # tsc --noEmit
pnpm format:check   # prettier check
pnpm format         # prettier write
pnpm gen:api        # regenerate the shared API client (delegates to packages/api)
pnpm gen:openapi    # regenerate packages/api/openapi.json from the lunarr-go server
```

`gen:openapi` reaches the backend at `../../../lunarr-go` (relative to `packages/api`), and both
app-level `gen:*` scripts delegate to `packages/api` — the API client has a single source of truth.
