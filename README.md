# Lunarr Clients

Monorepo for the Lunarr client apps (the mobile and TV frontends for the Lunarr media server).

## Apps

| App   | Path        | Description                          |
| ----- | ----------- | ------------------------------------ |
| Mobile| `apps/mobile`| Expo SDK 57 phone/tablet app (iOS, Android, web) |
| TV    | `apps/tv`   | Expo SDK 57 TV app (Apple TV, Android TV)         |

Each app is a fully independent Expo project with its own `package.json`, `bun.lock`,
`node_modules`, and EAS config. They are intentionally **not** bun workspaces: the TV app
must neutralize `react-native-reanimated` / `react-native-gesture-handler` / `react-native-worklets`
via `overrides` for the tvOS build, which bun only supports at the root — incompatible with
the mobile app that requires those packages. So install and run each app from its own directory.

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

See each app's `AGENTS.md` for its conventions, typecheck, and formatting commands.
Typical per-app workflow:

```bash
bun run typecheck      # tsc --noEmit
bun run format:check   # prettier check
bun run format         # prettier write
bun run gen:api        # regenerate API client from openapi.json
bun run gen:openapi    # regenerate openapi.json from the lunarr-go server
```

The `gen:openapi` scripts reach the backend at `../../../lunarr-go` (relative to each app).
