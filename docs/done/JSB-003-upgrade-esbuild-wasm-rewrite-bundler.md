# JSB-003: Upgrade esbuild-wasm and rewrite bundler

- **Status:** Done
- **Type:** Story
- **Priority:** High
- **Depends on:** JSB-002

## Description

As a user, I want the in-browser bundler to use a current esbuild-wasm so that modern syntax and packages bundle correctly and the app is not stuck on the removed 0.8 `startService` API.

## Acceptance Criteria

- [x] `esbuild-wasm` upgraded to the current release, pinned to an exact version in package.json
- [x] `src/bundler/index.ts` no longer uses `esbuild.startService`; calls `esbuild.initialize({ wasmURL })` exactly once (memoize the promise so concurrent bundles do not double-initialize) and then `esbuild.build(...)`
- [x] `wasmURL` version matches the installed package version (derive from package.json/`esbuild.version` or import the wasm via Vite `?url` so they cannot drift); removed `worker: true` option behaviour re-checked against the new API
- [x] Build options carried over and still valid: `entryPoints: ["index.js"]`, `bundle`, `write: false`, `define` (`process.env.NODE_ENV`, `global: "window"`), `jsxFactory: "_React.createElement"`, `jsxFragment: "_React.Fragment"`
- [x] `unpkg-path-plugin.ts` and `fetch-plugin.ts` verified against the current plugin API (`onResolve`/`onLoad` args and results); `any` args typed with `esbuild.OnResolveArgs`/`OnLoadArgs`
- [x] Bare-import resolution still works for nested relative imports and packages with `main`/`module` redirects on unpkg
- [x] `/.css$/` regex in `fetch-plugin.ts` fixed to `/\.css$/`; the redundant unescaped `/.*/` filters reviewed
- [x] CSS injection (`style.innerText`, manual quote/newline escaping) replaced with a safe approach (e.g. `JSON.stringify` of the CSS) and verified with a package that imports CSS
- [x] Cache behaviour preserved: localforage `filecache` still hit before network; consider keying/invalidation if esbuild output format changed (note in decisions if cache is versioned)
- [x] Error path unchanged for the UI: bundle failures surface as `bundles[cellId].err` and render in `Preview`
- [x] Manually verified: plain JS, JSX with React import, an npm package import (e.g. `axios`), a CSS import, a syntax error, and `show()` with JSX
- [x] `docs/architecture.md` bundler section updated

## Notes

Decision: see ADR-004. The `jsxFactory` setting relies on `_React` being imported by the injected `show()` prelude in `src/hooks/use-cumulative-code.ts`; keep that coupling in mind (esbuild also offers `jsx: "automatic"` options).

## Outcome

- esbuild-wasm pinned to `0.28.2` (current `latest` on the npm registry).
- The wasm is imported through Vite (`esbuild-wasm/esbuild.wasm?url`), so it is self-hosted under `/js-browser/assets/` and always matches the JS API (ADR-009). `worker: true` no longer exists; `initialize` runs in a Web Worker by default in browsers.
- `localforage` `filecache` keys now carry a `v2:` prefix, so entries written by the old setup (including CSS wrapped with the old escaping) are ignored. Stored values are still plain `OnLoadResult` objects.
- Verified in Chromium (Playwright against `npm run preview`) with unpkg/jsdelivr served from local npm tarballs: plain JS, JSX + React import, `tiny-invariant`, `axios` (unpkg `unpkg` field -> `dist/axios.min.js`), `bulma/css/bulma.css` (style appended in the iframe), syntax error (shown in `.preview-error`), and zero unpkg requests on a repeat bundle and after a page reload (cache hit). Wasm/bundle initialization failures are now also reported through `bundles[cellId].err`.
