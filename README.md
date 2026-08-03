# Lunarr Clients

Monorepo for the Lunarr client apps (the mobile and TV frontends for the Lunarr media server).

Available on [Google Play](https://play.google.com/store/apps/details?id=app.lunarr.mobile) for mobile, tablets, and TV.

[<img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" alt="Get it on Google Play" width="200">](https://play.google.com/store/apps/details?id=app.lunarr.mobile)

iOS and tvOS apps are available in [TestFlight](https://github.com/lunarr-app/lunarr-go/issues/150).

## Apps

| App   | Path        | Description                          |
| ----- | ----------- | ------------------------------------ |
| Mobile| `apps/mobile`| Expo SDK 57 phone/tablet app (iOS, Android, web) |
| TV    | `apps/tv`   | Expo SDK 57 TV app (Apple TV, Android TV)         |
| API   | `packages/api` | Shared API client (generated from the Lunarr backend OpenAPI spec) |
| Core  | `packages/core` | Shared app-agnostic logic + query hooks (media/playback/profile, `queryKeys`, hooks) |

Each app is a fully independent Expo project with its own `package.json`, `bun.lock`,
`node_modules`, and EAS config. They are intentionally **not** bun workspaces: the TV app
must neutralize `react-native-reanimated` / `react-native-gesture-handler` / `react-native-worklets`
via `overrides` for the tvOS build, which bun only supports at the root — incompatible with
the mobile app that requires those packages. So install and run each app from its own directory.

`packages/api` and `packages/core` are shared TypeScript source — no build step. The apps
resolve them via their `tsconfig.json` `paths` (for typecheck) and `metro.config.js` resolver
alias + `nodeModulesPaths` (for bundling). `packages/api` needs no install; `packages/core`
has dev-dependencies (react/react-native/@lunarr/api) only so its own `bun run typecheck`
resolves types — at bundle time everything resolves to each app's single `node_modules`.
To (re)install the core package's dev-deps: `bun install --cwd packages/core`.

## Requirements

- [Bun](https://bun.sh) (package manager)
- The Lunarr backend at `../lunarr-go` (used by `gen:openapi`)

## Quick start

```bash
# Install dependencies (per app)
bun install --cwd apps/mobile
bun install --cwd apps/tv

# Run the mobile app (via root helpers)
bun run mobile:start
bun run mobile:ios
bun run mobile:android

# Run the TV app
bun run tv:start
bun run tv:ios
bun run tv:android
```

Or from inside each app:

```bash
cd apps/mobile && bun run start
cd apps/tv && bun run start
```

## Commands per app

See the root `AGENTS.md` for repo conventions, typecheck, and formatting commands.
Typical per-app workflow:

```bash
bun run typecheck      # tsc --noEmit
bun run format:check   # prettier check
bun run format         # prettier write
bun run gen:api        # regenerate the shared API client (delegates to packages/api)
bun run gen:openapi    # regenerate packages/api/openapi.json from the lunarr-go server
```

`gen:openapi` reaches the backend at `../../../lunarr-go` (relative to `packages/api`), and both
app-level `gen:*` scripts delegate to `packages/api` — the API client has a single source of truth.
