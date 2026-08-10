# AGENTS.md

## Repo layout

pnpm workspace monorepo for the Lunarr client apps. Root `pnpm-workspace.yaml` defines the
workspace (`apps/*` and `packages/*`). All dependencies are installed from the repo root with a
single `pnpm-lock.yaml`; `node_modules` is hoisted into the root `.pnpm` virtual store, and each
workspace package is symlinked into the app that needs it. Expo/Metro auto-detects the monorepo
(SDK 52+), so there is no manual `metro.config.js` wiring.

- `apps/mobile` — phone/tablet app. Expo SDK 57 / React Native 0.86 / React 19.2.3 / TypeScript 6.
  Expo Router (typed routes enabled), TanStack Query, Zustand-style auth store, expo-video player.
- `apps/tv` — TV app. Expo SDK 57 / React Native 0.86 (`react-native-tvos`) / React 19.2.3 / TypeScript 6.
  Expo Router (typed routes enabled), TV-optimized UI. TanStack Query, React Context auth store,
  expo-video player.
- `packages/api` — shared API client (generated from the Lunarr backend OpenAPI spec) plus the
  app-agnostic API modules. No build step. Declared as a `workspace:*` dependency of the apps and
  resolved through their `node_modules` symlinks. Edit `packages/api/src/**`, never the per-app copies.
- `packages/core` — shared app-agnostic business logic plus the TanStack query hooks and
  unified `queryKeys`: media/playback/profile modules (formatting, progress, episode/tv helpers,
  playback decision + session, profile policy) and `src/hooks/**` (query hooks + useRefreshOnFocus).
  Declared as a `workspace:*` dependency of the apps. Its dev-dependencies (`react`, `react-native`,
  `@lunarr/api`, `@tanstack/react-query`, `expo-router`) exist only for standalone typechecking —
  at runtime Metro resolves imports from each app's own `node_modules` (isolated `nodeLinker`
  prevents duplicate instances). Edit `packages/core/src/**`, never the per-app copies.

Because `nodeLinker` is `isolated`, every package must declare the packages it imports from for
both typecheck and runtime. `@tanstack/react-query`/`expo-router` are in `packages/core`'s
`devDependencies` for standalone typecheck but resolve from the app at runtime. The TV app's
`react-native` tsconfig `path` maps to its own `react-native-tvos` install so TS picks up the TV
type augmentations.

React Compiler is **enabled** in both apps (see below).

## React Compiler (DO NOT write manual memoization)

The React Compiler is enabled via `app.json` → `experiments.reactCompiler: true`. The Babel
plugin (`babel-plugin-react-compiler`, wired in through `babel-preset-expo`) runs on all app
code and automatically memoizes components, hooks, and derived values.

Because the compiler does the memoization:

- **NEVER** use `React.memo`, `useCallback`, or `useMemo`. The compiler handles these and manual
  usage is redundant (and in some cases actively wrong). The codebase has been stripped of them;
  do not reintroduce them.
- Do not "optimize" by pre-binding callbacks or hoisting JSX constants manually. Write plain
  functions and computed values.
- If you find yourself reaching for `useCallback`/`useMemo`/`memo`, stop — write the plain code
  and trust the compiler.

### Compiler limitations — write code the compiler can compile

The compiler **silently skips** any component/hook it cannot compile (production default is
`panicThreshold: "none"`). A skipped component is emitted as plain, **unmemoized** code with no
warning. Since we rely on the compiler for all memoization, a skipped component is a silent
performance regression. Keep code compiler-friendly:

- **No render-time ref writes**: never assign `ref.current = ...` during render. Sync refs in a
  `useEffect` instead:
  ```tsx
  const latestRef = useRef(value);
  useEffect(() => {
    latestRef.current = value;
  }, [value]);
  ```
- **Do not mutate values returned from hooks** (e.g. `player.currentTime = x` where `player`
  comes from `useVideoPlayer`). Route mutations through a ref that is synced in an effect.
- **Avoid value blocks inside `try/catch`**: logical `&&`, `||`, `??`, optional chaining, and
  ternary expressions inside a `try`/`catch` body are not supported. Hoist them out of the
  `try` block, or convert to nested `if` statements / `if/else`:
  ```tsx
  // Avoid:
  try {
    if (a && b) { ... }
  } catch (e) { ... }
  // Prefer:
  try {
    if (a != null) {
      if (b != null) { ... }
    }
  } catch (e) { ... }
  ```
- **Avoid `finally` clauses** that share state with the `try`/`catch` (not supported). Move
  cleanup after the `try/catch` instead.
- **Avoid catch bindings referenced inside a callback within the `catch` block** (causes an
  `[Invariant]` error). Read the value into a local variable first:
  ```tsx
  } catch (apiError) {
    const message = readApiError(apiError, "Failed to save preferences");
    setErrors((current) => ({ ...current, [section]: message }));
  }
  ```
- **Avoid `useRef(new Animated.Value(0)).current`** in components (e.g. sliders). Use a lazy
  `useState` initializer instead: `const [value] = useState(() => new Animated.Value(0))`.
- Do not write a self-referencing function that returns itself (e.g. `const f = () => { return f; }`).

### How to verify a component compiles

The healthcheck (`npx react-compiler-healthcheck`) only reports hard compile errors; it misses
silent bailouts. Use a one-off transform with `panicThreshold: "all_errors"` to surface any
errors that the production build would silently skip:

```bash
node -e "
const babel = require('@babel/core');
const fs = require('fs');
const plugin = require('babel-plugin-react-compiler');
const file = process.argv[1];
const code = fs.readFileSync(file, 'utf8');
try {
  const out = babel.transformSync(code, {
    filename: file, babelrc: false, configFile: false,
    parserOpts: { plugins: ['jsx','typescript'] },
    plugins: [[plugin, { target: '19', panicThreshold: 'all_errors' }]],
  }).code;
  console.log('COMPILED runtime-refs:', (out.match(/compiler-runtime/g) || []).length);
} catch (e) {
  console.log('ERROR:', e.printedMessage.split('\n').slice(0, 20).join('\n'));
}
" <file>
```

A component that compiled imports `react/compiler-runtime`. An empty error means it compiled.
Run this after editing any component/hook.

## Commands

Install once from the repo root. Run inside an app directory, or via the root helpers (both work):

| Task          | In-app command                 | Root helper            |
| ------------- | ------------------------------ | ---------------------- |
| start         | `pnpm start`                   | `pnpm mobile` / `pnpm tv` |
| typecheck     | `pnpm typecheck`               | `pnpm mobile:typecheck` / `pnpm tv:typecheck` |
| format        | `pnpm format`                  | `pnpm mobile:format` / `pnpm tv:format` |
| format:check  | `pnpm format:check`            | —                      |
| gen:api       | `pnpm gen:api`                 | —                      |
| gen:openapi   | `pnpm gen:openapi`             | —                      |

- `pnpm install` — install all workspace deps (run once from the repo root)
- `pnpm --filter <pkg> <script>` — run a script in a specific workspace package
- `pnpm typecheck` — runs `tsc --noEmit --noUnusedLocals --noUnusedParameters` (run before committing)
- `pnpm format:check` — prettier check
- `pnpm format` — prettier write
- `pnpm gen:api` — regenerate the shared API client in `packages/api` (delegates from each app)
- `pnpm gen:openapi` — regenerate `packages/api/openapi.json` from the lunarr-go server (resolved via `../../../lunarr-go`)

## Verification before committing

1. Run the typecheck and `format:check` commands above for the app(s) you touched.
2. For any touched component/hook, run the compiler scan above and confirm `COMPILED`.
