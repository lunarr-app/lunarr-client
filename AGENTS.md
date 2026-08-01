# AGENTS.md

## Repo layout

Monorepo for the Lunarr client apps. Each app is an independent Expo project with its own
`package.json`, `bun.lock`, `node_modules`, and `eas.json` — there is **no** root workspace.

- `apps/mobile` — phone/tablet app. Expo SDK 57 / React Native 0.86 / React 19.2.3 / TypeScript 6.
  Expo Router (typed routes enabled), TanStack Query, Zustand-style auth store, expo-video player.
- `apps/tv` — TV app. Expo SDK 57 / React Native 0.86 (`react-native-tvos`) / React 19.2.3 / TypeScript 6.
  Expo Router (typed routes enabled), TV-optimized UI. TanStack Query, React Context auth store,
  expo-video player.
- `packages/api` — shared API client (generated from the Lunarr backend OpenAPI spec) plus the
  app-agnostic API modules. No build step: the apps resolve it via `tsconfig` `paths` and a
  Metro `resolver.alias`. Edit `packages/api/src/**`, never the per-app copies.
- `packages/core` — shared app-agnostic business logic plus the TanStack query hooks and
  unified `queryKeys`: media/playback/profile modules (formatting, progress, episode/tv helpers,
  playback decision + session, profile policy) and `src/hooks/**` (query hooks + useRefreshOnFocus).
  Same resolution mechanism as `packages/api`. Its dev-dependencies (`react`, `react-native`,
  `@lunarr/api`) exist only for standalone typechecking — Metro resolves runtime imports from
  each app's own `node_modules` (`nodeModulesPaths` + `disableHierarchicalLookup`), so there is no
  duplicate-instance risk. `@tanstack/react-query`/`expo-router` in the shared hooks are mapped
  via the apps' tsconfig `paths` (and resolve from the app's `node_modules` at runtime). Edit
  `packages/core/src/**`, never the per-app copies.

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

Run inside an app directory, or via the root helpers (both work):

| Task          | In-app command                | Root helper            |
| ------------- | ----------------------------- | ---------------------- |
| start         | `bun run start`               | `bun run mobile` / `bun run tv` |
| typecheck     | `bun run typecheck`           | `bun run mobile:typecheck` / `bun run tv:typecheck` |
| format        | `bun run format`              | `bun run mobile:format` / `bun run tv:format` |
| format:check  | `bun run format:check`        | —                      |
| gen:api       | `bun run gen:api`             | —                      |
| gen:openapi   | `bun run gen:openapi`         | —                      |

- `bun run typecheck` — runs `tsc --noEmit --noUnusedLocals --noUnusedParameters` (run before committing)
- `bun run format:check` — prettier check
- `bun run format` — prettier write
- `bun run gen:api` — regenerate the shared API client in `packages/api` (delegates from each app)
- `bun run gen:openapi` — regenerate `packages/api/openapi.json` from the lunarr-go server (resolved via `../../../lunarr-go`)

## Verification before committing

1. Run the typecheck and `format:check` commands above for the app(s) you touched.
2. For any touched component/hook, run the compiler scan above and confirm `COMPILED`.
