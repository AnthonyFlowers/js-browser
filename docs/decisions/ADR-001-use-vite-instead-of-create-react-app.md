# ADR-001: Use Vite instead of Create React App

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-002

**Context:** The app uses CRA 4 (react-scripts 4.0.1), which is unmaintained and requires
`NODE_OPTIONS=--openssl-legacy-provider` on modern Node. The npm scripts use Windows-only `SET`.

**Decision:** Migrate to Vite with `@vitejs/plugin-react`, `base: "/js-browser/"`, output in `dist/`.

**Consequences:** Faster dev server and builds, no OpenSSL workaround, cross-platform scripts. Requires moving
`index.html` to the repo root, updating tsconfig and `.gitignore`, and handling env vars via `import.meta.env`.
Monaco worker handling must be revisited (JSB-004).
