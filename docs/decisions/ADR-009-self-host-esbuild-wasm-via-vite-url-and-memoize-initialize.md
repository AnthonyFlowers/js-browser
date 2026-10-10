# ADR-009: Self-host esbuild.wasm via Vite `?url` and memoize `initialize`

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-003

**Context:** The wasm URL was hard-coded to a version on unpkg and could drift from the installed JS package; esbuild
0.9+ requires the binary to match the JS API version exactly, and `initialize` may only be called once per page.

**Decision:** Pin `esbuild-wasm` exactly (0.28.2) and `import wasmURL from "esbuild-wasm/esbuild.wasm?url"` so Vite
emits the binary as a hashed asset under `base` (`/js-browser/assets/`). `bundler/index.ts` memoizes the
`esbuild.initialize({ wasmURL })` promise (cleared on failure so it can retry). The `filecache` keys are prefixed `v2:`
so entries from the old setup are ignored; bump the prefix if the cached `OnLoadResult` shape or the CSS wrapper changes.
The `jsxFactory`/`jsxFragment` (`_React.*`) setting is kept, coupled to the `_React` import in `use-cumulative-code.ts`.

**Consequences:** No runtime unpkg dependency for the wasm; version drift is impossible; the deployed bundle grows by
a ~14 MB (about 3.8 MB gzipped) asset that is fetched on first bundle. User packages are still fetched from unpkg.
