# ADR-004: Upgrade esbuild-wasm to current and rewrite the bundler (full modernization)

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-003, JSB-004

**Context:** The bundler is pinned to esbuild-wasm 0.8.27 and uses `startService`, removed in 0.9. The wasm URL is
hard-coded to the same version on unpkg. The owner chose full modernization over staying on old versions.

**Decision:** Upgrade esbuild-wasm (and editor/UI dependencies) to current majors; rewrite `src/bundler/index.ts`
around `initialize` (once) and `build`, and keep the unpkg-resolving/fetching plugin design.

**Consequences:** Modern syntax support and maintained tooling. Code must be changed alongside the Monaco wrapper
and other dependency upgrades; the IndexedDB `filecache` may contain output from the old setup. Redux Toolkit
adoption is a separate decision to be recorded when made.
