# Decisions

ADR-style log. Add new entries at the end; never rewrite history (supersede with a new ADR instead).

## Template

```markdown
## ADR-NNN: Title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded by ADR-NNN
- **Story:** JSB-NNN

**Context:** Why a decision is needed.

**Decision:** What we chose.

**Consequences:** Trade-offs, follow-up work.
```

## ADR-001: Use Vite instead of Create React App

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-002

**Context:** The app uses CRA 4 (react-scripts 4.0.1), which is unmaintained and requires
`NODE_OPTIONS=--openssl-legacy-provider` on modern Node. The npm scripts use Windows-only `SET`.

**Decision:** Migrate to Vite with `@vitejs/plugin-react`, `base: "/js-browser/"`, output in `dist/`.

**Consequences:** Faster dev server and builds, no OpenSSL workaround, cross-platform scripts. Requires moving
`index.html` to the repo root, updating tsconfig and `.gitignore`, and handling env vars via `import.meta.env`.
Monaco worker handling must be revisited (JSB-004).

## ADR-002: Deploy to GitHub Pages with GitHub Actions

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-005

**Context:** Deployment is manual (`npm run deploy` via the `gh-pages` package pushing to the `gh-pages` branch),
so it depends on one machine and is easy to forget.

**Decision:** A workflow on push to `main` builds and deploys with `actions/upload-pages-artifact` and
`actions/deploy-pages`. The `gh-pages` package and branch become obsolete and are removed.

**Consequences:** Reproducible deploys from CI. The owner must set Pages source to "GitHub Actions" in repo
settings. The `gh-pages` branch must only be deleted after the new deployment is verified live.

## ADR-003: Node 24 and npm

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-002

**Context:** The project had no pinned Node version; builds only worked with a legacy OpenSSL flag.

**Decision:** Target Node 24 (`.nvmrc`, `engines`) and use npm with the committed `package-lock.json`.

**Consequences:** CI and local environments match. Contributors need Node 24+. No yarn/pnpm lockfiles.

## ADR-004: Upgrade esbuild-wasm to current and rewrite the bundler (full modernization)

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

## ADR-005: ESLint, Prettier and Vitest, enforced in CI

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-006

**Context:** No tests, lint or format configuration, and no CI exist.

**Decision:** Add ESLint (flat config, typescript-eslint, react-hooks), Prettier and Vitest; run lint, format check,
typecheck, test and build in a GitHub Actions workflow on pull requests and pushes to `main`. Seed tests cover
reducers and the bundler plugins' path resolution.

**Consequences:** Consistent style and a regression safety net; one-off repo-wide format commit; small ongoing
maintenance of tooling.

## ADR-006: MIT license

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-009

**Context:** The repository has no license.

**Decision:** License under MIT, copyright Anthony Flowers.

**Consequences:** Permissive reuse. Add `LICENSE`, the package.json `license` field and a README section.

## ADR-007: Story-based tracking in docs/

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-001

**Context:** The refresh spans many changes that should be traceable, and Claude Code sessions need durable context.

**Decision:** Track all work as Jira-style stories (`JSB-NNN`) in `docs/stories/`, move completed ones to
`docs/done/`, reference IDs in commit messages, and keep `docs/architecture.md` and `docs/decisions.md` current.
Rules are summarised in `CLAUDE.md`.

**Consequences:** Small documentation overhead per change; clear history and status in-repo without an external tracker.

## ADR-008: Per-model auto-compact windows in project settings

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-013

**Context:** Long sessions benefit from model-specific auto-compaction: a small window suits Haiku (context-pulling
tasks) while Opus can keep much more context. Claude Code supports `modelSettings.<model>.autoCompactWindow`.

**Decision:** Commit `.claude/settings.json` with `autoCompactWindow` of 100000 for `claude-haiku-5-5` and 600000
for `claude-opus-5-5`. Values are capped at the model's context window (both have 1M).

**Consequences:** Consistent compaction behaviour for anyone using the repo, if honored. Unverified: the docs only
show `modelSettings` written to user settings via `/autocompact`, so project-file scope and the exact model-key
format are undocumented; whether it applies to subagents is unknown (subagent frontmatter cannot set compaction).
If project-level settings are ignored, fall back to user-level `/autocompact` per model. Verification is tracked in
JSB-013.

## ADR-009: Self-host esbuild.wasm via Vite `?url` and memoize `initialize`

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

