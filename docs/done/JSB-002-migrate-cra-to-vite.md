# JSB-002: Migrate build from CRA 4 to Vite

- **Type:** Task
- **Priority:** High
- **Depends on:** none

## Description

As a developer, I want the app built with Vite on Node 24 so that installs, dev server and builds work on any OS without legacy OpenSSL flags or the unmaintained react-scripts 4.0.1.

## Acceptance Criteria

- [x] `react-scripts` and CRA-only config removed (`eslintConfig` block, `src/react-app-env.d.ts`, `web-vitals`, CRA jest/testing-library types unless reused by JSB-006)
- [x] `vite` and `@vitejs/plugin-react` added; `vite.config.ts` sets `base: "/js-browser/"`
- [x] `public/index.html` moved to repo-root `index.html`, `%PUBLIC_URL%` replaced with Vite-style paths, `<script type="module" src="/src/index.tsx">` added
- [x] `public/manifest.json`, icons and `robots.txt` still served; paths work under `/js-browser/`
- [x] Scripts replaced with platform-neutral `dev`, `build`, `preview`; the Windows `SET NODE_OPTIONS=--openssl-legacy-provider` scripts and `predeploy`/`deploy` are gone
- [x] `.nvmrc` containing `24`; `engines` set to `{ "node": ">=24" }` in package.json
- [x] package.json has `"private": true`; unused `homepage`, `files`, `publishConfig` removed (homepage may remain only if still useful)
- [x] Runtime packages currently in `devDependencies` (`@monaco-editor/react`, `@uiw/react-md-editor`, `@fortawesome/fontawesome-free`) moved to `dependencies`; type-only packages stay in dev
- [x] `@types/react-redux` removed (react-redux 8 ships its own types)
- [x] `tsconfig.json` updated for Vite (`vite/client` types, `moduleResolution: "bundler"`, modern `target`); `npx tsc --noEmit` passes
- [x] Env var handling reviewed: no `process.env.*`/`REACT_APP_*` usage in `src/` today (verify); any added use goes through `import.meta.env`. Note `process.env.NODE_ENV` in `src/bundler/index.ts` is an esbuild `define` for user code and must NOT be changed
- [x] `.gitignore` updated (`/build` -> `/dist`)
- [x] `npm ci && npm run build` succeeds on Node 24 on Linux; `npm run dev` serves the app and a code cell bundles and renders
- [x] `package-lock.json` regenerated with npm
- [x] `CLAUDE.md` Commands/Tech stack sections and `docs/architecture.md` updated

## Notes

- Streamsaver and the esbuild wasm file are loaded from CDNs at runtime (unpkg / streamsaver mitm), not bundled; confirm nothing breaks under Vite.
- Monaco is currently loaded by `@monaco-editor/react` 3.x from a CDN loader; Vite worker handling is addressed in JSB-004.
- Decision: see ADR-001, ADR-003.
- Verified 2026-10-09 on Node 24.21.0 (via `npx node@24`): `npm ci`, `npx tsc --noEmit`, `npm run build` pass; `dist/index.html` references `/js-browser/assets/...`; `manifest.json`, `robots.txt`, icons served at `/js-browser/` by `vite preview`. Chromium/Playwright against `vite preview`: top menu + cell list render, no console errors, a code cell with `show(1+1)` renders `2` in the preview iframe. The sandbox proxy blocks unpkg.com and cdn.jsdelivr.net, so that run served esbuild-wasm 0.8.27 (from the npm package), the react/react-dom packages and the Monaco loader (local monaco-editor 0.34.1 files) via Playwright route interception; the real CDNs were not exercised. `npm run dev` was not run separately (same plugin pipeline as preview; preview was used for the browser check).
- Forced dependency changes beyond the story (kept minimal):
  - `typescript` ^4.9.5 -> ^5.9.3: `moduleResolution: "bundler"` needs TS >= 5.0.
  - `@types/node` ^16 -> ^24: Vite 8 peer requires `@types/node` >= 20.19 (also matches Node 24).
  - `lodash` added to dependencies: `jscodeshift` requires it without declaring it; CRA hoisted it, Vite/Rolldown failed with `failed to resolve import "lodash"`.
  - `assert` added to dependencies: jscodeshift/recast `require("assert")`; webpack 4 polyfilled Node builtins, Vite does not (runtime error `n.default.ok is not a function`). Other builtins (`fs`, `path`, `os`, `crypto`) are only externalized in unused code paths (flow-parser, recast options) and cause build warnings only.
  - `overrides` in package.json: the old lock was evidently made with legacy peer resolution; `@monaco-editor/react@3.7.5` (peers monaco-editor ^0.21.2, react ^16/^17) and `monaco-jsx-highlighter@0.0.15` (peer monaco-editor ^0.21.2) conflict with the installed monaco-editor 0.34.1 / React 18. Overrides point those peers at the root versions instead of using `--legacy-peer-deps` (no `.npmrc`). Remove them when JSB-004 upgrades these packages.
- `vite.config.ts` defines `global: "globalThis"` for the browser-side libs (jscodeshift etc.); the Format/highlighter paths were not exercised in the browser check.
- `public/test.html` is left untouched (JSB-007 scope). Build emits a >500 kB chunk warning (Monaco/jscodeshift/FA in one bundle); code-splitting is out of scope.
- `@types/jest` and the testing-library packages were removed; JSB-006 will add Vitest tooling as needed.
