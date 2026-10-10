# ADR-011: Bundle Monaco locally via Vite workers (no CDN loader)

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-004

**Context:** `@monaco-editor/react` 3.x loads Monaco from a CDN at runtime, even though `monaco-editor` is a dependency.
The esbuild wasm is already self-hosted ([ADR-009](ADR-009-self-host-esbuild-wasm-via-vite-url-and-memoize-initialize.md)).

**Decision:** Bundle `monaco-editor` with Vite and configure the wrapper with `loader.config({ monaco })`; workers are
imported with Vite's `?worker` suffix and provided through `MonacoEnvironment.getWorker`. No CDN loader.

**Consequences:** The app works without the Monaco CDN and the editor version always matches the installed package.
The build grows and needs worker configuration; verify both dev and the `/js-browser/` production build.
