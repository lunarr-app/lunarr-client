# AGENTS.md

## Stack

- Expo SDK 57 / React Native 0.86 (react-native-tvos) / React 19.2.3 / TypeScript 6
- Expo Router (typed routes enabled), TV-optimized UI
- TanStack Query, React Context auth store, expo-video player
- React Compiler is **enabled** (see below)

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

- `bunx tsc --noEmit --noUnusedLocals --noUnusedParameters` — typecheck (run before committing)
- `bun run format:check` — prettier check
- `bun run format` — prettier write
- `bun run gen:api` — regenerate API client from `openapi.json`
- `bun run gen:openapi` — regenerate `openapi.json` from the lunarr-go server

## Verification before committing

1. Run the typecheck and `format:check` commands above.
2. For any touched component/hook, run the compiler scan above and confirm `COMPILED`.
