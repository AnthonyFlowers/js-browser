# JSB-003: Upgrade esbuild-wasm and rewrite bundler

- **Status:** Todo
- **Type:** Story
- **Priority:** High
- **Depends on:** JSB-002

## Description

As a user, I want the in-browser bundler to use a current esbuild-wasm so that modern syntax and packages bundle correctly and the app is not stuck on the removed 0.8 `startService` API.

## Acceptance Criteria

- [ ] `esbuild-wasm` upgraded to the current release, pinned to an exact version in package.json
- [ ] `src/bundler/index.ts` no longer uses `esbuild.startService`; calls `esbuild.initialize({ wasmURL })` exactly once (memoize the promise so concurrent bundles do not double-initialize) and then `esbuild.build(...)`
- [ ] `wasmURL` version matches the installed package version (derive from package.json/`esbuild.version` or import the wasm via Vite `?url` so they cannot drift); removed `worker: true` option behaviour re-checked against the new API
- [ ] Build options carried over and still valid: `entryPoints: ["index.js"]`, `bundle`, `write: false`, `define` (`process.env.NODE_ENV`, `global: "window"`), `jsxFactory: "_React.createElement"`, `jsxFragment: "_React.Fragment"`
- [ ] `unpkg-path-plugin.ts` and `fetch-plugin.ts` verified against the current plugin API (`onResolve`/`onLoad` args and results); `any` args typed with `esbuild.OnResolveArgs`/`OnLoadArgs`
- [ ] Bare-import resolution still works for nested relative imports and packages with `main`/`module` redirects on unpkg
- [ ] `/.css$/` regex in `fetch-plugin.ts` fixed to `/\.css$/`; the redundant unescaped `/.*/` filters reviewed
- [ ] CSS injection (`style.innerText`, manual quote/newline escaping) replaced with a safe approach (e.g. `JSON.stringify` of the CSS) and verified with a package that imports CSS
- [ ] Cache behaviour preserved: localforage `filecache` still hit before network; consider keying/invalidation if esbuild output format changed (note in decisions if cache is versioned)
- [ ] Error path unchanged for the UI: bundle failures surface as `bundles[cellId].err` and render in `Preview`
- [ ] Manually verified: plain JS, JSX with React import, an npm package import (e.g. `axios`), a CSS import, a syntax error, and `show()` with JSX
- [ ] `docs/architecture.md` bundler section updated

## Notes

Decision: see ADR-004. The `jsxFactory` setting relies on `_React` being imported by the injected `show()` prelude in `src/hooks/use-cumulative-code.ts`; keep that coupling in mind (esbuild also offers `jsx: "automatic"` options).
