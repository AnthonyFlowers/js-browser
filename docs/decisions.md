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
typecheck, test and build in a GitHub Actions workflow on pull requests (to `dev` and `main`) and pushes to `dev` (see ADR-010). Seed tests cover
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

## ADR-010: Branching model with long-lived `dev` and release PRs into `main`

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-015

**Context:** A merge to `main` deploys to GitHub Pages, so `main` should only change deliberately. Work was previously
committed on a single working branch.

**Amended by ADR-017** (story work merges into `dev` without a PR).

**Decision:** `dev` is a long-lived branch holding in-progress work (created from `main`). Story/feature branches open
PRs into `dev` and are merged once CI is green. Releases are `dev` -> `main` PRs, opened by Claude and merged by the
owner; the merge deploys to GitHub Pages. Nobody pushes directly to `main` or `dev`. Deleting branches (`gh-pages`,
`local-serve`) requires explicit owner confirmation after Claude shows what is on them.

**Consequences:** CI (JSB-006) must run on PRs into `dev` and `main`. Releases are batched and owner-gated. Slightly more
PR overhead per story.

## ADR-011: Bundle Monaco locally via Vite workers (no CDN loader)

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-004

**Context:** `@monaco-editor/react` 3.x loads Monaco from a CDN at runtime, even though `monaco-editor` is a dependency.
The esbuild wasm is already self-hosted (ADR-009).

**Decision:** Bundle `monaco-editor` with Vite and configure the wrapper with `loader.config({ monaco })`; workers are
imported with Vite's `?worker` suffix and provided through `MonacoEnvironment.getWorker`. No CDN loader.

**Consequences:** The app works without the Monaco CDN and the editor version always matches the installed package.
The build grows and needs worker configuration; verify both dev and the `/js-browser/` production build.

## ADR-012: Migrate to Redux Toolkit as a separate story

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-014

**Context:** The state layer uses the deprecated `createStore` with hand-written action types, switch reducers wrapped in
immer `produce`, and plain thunks. JSB-004 raised whether to adopt Redux Toolkit.

**Decision:** Adopt Redux Toolkit (`configureStore`, `createSlice`, `createAsyncThunk`) in its own story, JSB-014, after
JSB-004 (dependency upgrades) and JSB-006 (reducer tests as a safety net). JSB-004 does not change the state layer.

**Consequences:** Less boilerplate and a maintained API; a contained refactor of `src/state` and its call sites, with
direct `redux-thunk` and `immer` dependencies likely removed. Must be coordinated with JSB-010.

## ADR-013: Highlight JSX in Monaco with Shiki (TextMate) instead of monaco-jsx-highlighter

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-004

**Context:** Monaco's built-in JavaScript tokenizer (Monarch) does not understand JSX. `monaco-jsx-highlighter` 0.0.15 is
unmaintained, peers on `monaco-editor` ^0.21, parses with jscodeshift/Babel on every edit and depends on `window.monaco`.

**Decision:** Use `shiki` + `@shikijs/monaco` with the `dark-plus` theme and the `javascript` grammar (which includes JSX)
on the pure-JS regex engine (no oniguruma wasm). `src/monaco-setup.ts` creates the highlighter and calls `shikiToMonaco`;
the editor theme is `dark-plus`. `jscodeshift`, `monaco-jsx-highlighter`, `assert`, `lodash` and `syntax.css` were removed.

**Consequences:** Tokenization is TextMate-based and correct for JSX, with no per-edit AST parsing. Only one theme and one
grammar are bundled, loaded with dynamic imports. The module uses top-level await, so it is loaded lazily with the editor.

## ADR-014: React 19, Redux 5 and Prettier 3 with minimal code changes

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-004

**Context:** Every dependency used by the app (md-editor 4, react-redux 9, react-resizable 4, @monaco-editor/react 4.7)
supports React 19, so staying on 18 would only defer the upgrade.

**Decision:** Move to React 19, Redux 5 (`legacy_createStore`, `redux-thunk` named `thunk` export, `Middleware` typing),
react-redux 9, immer 11 (named `produce`) and Prettier 3 (`prettier/standalone` with the babel and estree plugins; `format` is
async) for both the Format button and dev tooling. The state layer is otherwise unchanged (Redux Toolkit is JSB-014).
Preview `show()` now renders JSX with `react-dom/client` `createRoot`, because unpkg's latest `react-dom` (19) removed
`ReactDOM.render`. Selectors that returned new references were fixed for react-redux 9.

**Consequences:** One version of Prettier serves tool and runtime. User code that pins React 18 from unpkg and calls
`ReactDOM.render` itself still works; only the helper changed. The unpinned `react`/`react-dom` imports resolve to the latest versions.

## ADR-015: Persist with a listener middleware

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-014

**Context:** The hand-written persist middleware debounced `saveCells` by 250 ms after cell-mutating actions using a module-level timer.

**Decision:** Use RTK's `createListenerMiddleware` (`src/state/persist-listener.ts`) with `isAnyOf(moveCell, updateCell, insertCellAfter, deleteCell, updateTitle)`; the effect calls `cancelActiveListeners()`, `delay(250)` and dispatches `saveCells()`. It is appended after the default middleware in `configureStore`. Thunk-based fetch/import do not match, so they do not trigger saves.

**Consequences:** No manual timer or action-type list; matching is by action creator, so a new mutating reducer must be added to the matcher.

## ADR-016: Typed hooks `useAppDispatch` / `useAppSelector` instead of `useActions`

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-014

**Context:** `useActions` bound a bag of hand-written action creators with `bindActionCreators`. Slice actions and `createAsyncThunk` thunks are plain exports, and bound thunk typing is awkward.

**Decision:** Drop `useActions` and `useTypedSelector`; provide `useAppDispatch` and `useAppSelector` built with react-redux's `.withTypes<AppDispatch>()` / `.withTypes<RootState>()`, the pattern recommended by RTK. Components import action creators from `src/state` and call `dispatch(...)`.

**Consequences:** Call sites are slightly more verbose but fully typed, including thunk results (`unwrap()`); `dispatch` is stable so it replaces the bound actions in effect dependency lists.

## ADR-017: Merge story work into `dev` without PRs

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-015

**Context:** PRs into `dev` added a round trip per story without a reviewer in the loop; CI already runs on every push
to `dev`.

**Decision:** Story branches are merged directly into `dev` and pushed once lint, format check, typecheck, tests and
build pass locally. `dev` -> `main` release PRs remain, opened by Claude and merged by the owner. Amends ADR-010.

**Consequences:** Faster integration; a red CI run on `dev` must be fixed immediately since there is no PR gate.

