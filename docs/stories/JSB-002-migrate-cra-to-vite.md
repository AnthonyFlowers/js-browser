# JSB-002: Migrate build from CRA 4 to Vite

- **Status:** Todo
- **Type:** Task
- **Priority:** High
- **Depends on:** none

## Description

As a developer, I want the app built with Vite on Node 24 so that installs, dev server and builds work on any OS without legacy OpenSSL flags or the unmaintained react-scripts 4.0.1.

## Acceptance Criteria

- [ ] `react-scripts` and CRA-only config removed (`eslintConfig` block, `src/react-app-env.d.ts`, `web-vitals`, CRA jest/testing-library types unless reused by JSB-006)
- [ ] `vite` and `@vitejs/plugin-react` added; `vite.config.ts` sets `base: "/js-browser/"`
- [ ] `public/index.html` moved to repo-root `index.html`, `%PUBLIC_URL%` replaced with Vite-style paths, `<script type="module" src="/src/index.tsx">` added
- [ ] `public/manifest.json`, icons and `robots.txt` still served; paths work under `/js-browser/`
- [ ] Scripts replaced with platform-neutral `dev`, `build`, `preview`; the Windows `SET NODE_OPTIONS=--openssl-legacy-provider` scripts and `predeploy`/`deploy` are gone
- [ ] `.nvmrc` containing `24`; `engines` set to `{ "node": ">=24" }` in package.json
- [ ] package.json has `"private": true`; unused `homepage`, `files`, `publishConfig` removed (homepage may remain only if still useful)
- [ ] Runtime packages currently in `devDependencies` (`@monaco-editor/react`, `@uiw/react-md-editor`, `@fortawesome/fontawesome-free`) moved to `dependencies`; type-only packages stay in dev
- [ ] `@types/react-redux` removed (react-redux 8 ships its own types)
- [ ] `tsconfig.json` updated for Vite (`vite/client` types, `moduleResolution: "bundler"`, modern `target`); `npx tsc --noEmit` passes
- [ ] Env var handling reviewed: no `process.env.*`/`REACT_APP_*` usage in `src/` today (verify); any added use goes through `import.meta.env`. Note `process.env.NODE_ENV` in `src/bundler/index.ts` is an esbuild `define` for user code and must NOT be changed
- [ ] `.gitignore` updated (`/build` -> `/dist`)
- [ ] `npm ci && npm run build` succeeds on Node 24 on Linux; `npm run dev` serves the app and a code cell bundles and renders
- [ ] `package-lock.json` regenerated with npm
- [ ] `CLAUDE.md` Commands/Tech stack sections and `docs/architecture.md` updated

## Notes

- Streamsaver and the esbuild wasm file are loaded from CDNs at runtime (unpkg / streamsaver mitm), not bundled; confirm nothing breaks under Vite.
- Monaco is currently loaded by `@monaco-editor/react` 3.x from a CDN loader; Vite worker handling is addressed in JSB-004.
- Decision: see ADR-001, ADR-003.
