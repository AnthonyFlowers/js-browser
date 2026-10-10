# CLAUDE.md

Guide for Claude Code working in this repo. Keep it accurate; update it when the stack changes.

## Project overview

js-browser is an in-browser JS/JSX notebook (CodeSandbox/Jupyter-like). Users create a "book" of
code cells (Monaco editor) and markdown cells (@uiw/react-md-editor). Code is bundled in the browser
by esbuild-wasm, bare imports are resolved to unpkg.com, and the result runs in a sandboxed iframe
next to each cell. A `show()` helper renders values/JSX into the cell preview. Cells share scope
cumulatively (cell N sees code from cells 1..N-1). Live site: https://anthonyflowers.github.io/js-browser/

## Project direction

- js-browser is the owner's personal tool for quickly trying JS and npm packages.
- It must work well on both desktop and mobile; mobile is first-class, not an afterthought.
- Current priority: a stability sweep (JSB-017 to JSB-020, plus JSB-016) before new features.

Architecture details: `docs/architecture.md`. Decisions: `docs/decisions/` (one ADR per file). Work tracking: `docs/`.

## Tech stack

Current:
- React 19, Redux Toolkit 2 (`configureStore`, `createSlice`, `createAsyncThunk`, listener middleware; ADR-012/015/016), react-redux 9, TypeScript 5
- Vite 8 + @vitejs/plugin-react (`vite.config.ts`, `base: "/js-browser/"`, output `dist/`), Node 24 + npm
- Monaco 0.57 bundled locally via Vite `?worker` imports + @monaco-editor/react 4.7 (`src/monaco-setup.ts`, ADR-011); JSX highlighting by Shiki (`@shikijs/monaco`, ADR-013); Prettier 3 (`prettier/standalone`) for the Format button; @uiw/react-md-editor 4
- esbuild-wasm 0.28.2 (`initialize`/`build`; wasm self-hosted via Vite `?url`, ADR-009), axios + localforage (IndexedDB) for fetch/cache
- Bulma (bulmaswatch superhero) + Font Awesome 7; streamsaver for book download
- Tooling (JSB-006): ESLint 10 flat config (`eslint.config.js`, typescript-eslint, react-hooks, react-refresh, eslint-config-prettier), Prettier 3 (`.prettierrc`; same package as the in-editor Format runtime dep), Vitest 5 (node environment).
- Deployed by GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages on push to `main`. `.github/workflows/ci.yml` runs lint, format check, typecheck, test and build on PRs to `dev`/`main` and pushes to `dev`.

## Commands

```
npm ci                  # install (Node 24, see .nvmrc)
npm run dev             # Vite dev server, http://localhost:5173/js-browser/
npm run build           # production build -> dist/
npm run preview         # serve dist/ at http://localhost:4173/js-browser/
npm run lint            # ESLint (flat config)
npm run format          # Prettier --write
npm run format:check    # Prettier --check (CI)
npm run typecheck       # tsc --noEmit
npm test                # Vitest (vitest run)
```

CI runs `lint`, `format:check`, `typecheck`, `test` and `build`; run them all before merging into `dev` or opening a PR.
Tests live next to the source as `src/**/*.test.ts` (e.g. `cellsSlice.test.ts` beside `cellsSlice.ts`);
bundler plugin tests call the `onResolve`/`onLoad` callbacks with a fake `PluginBuild` (no esbuild wasm).

There is no manual deploy command (see Deployment).

## Repo layout

```
src/index.tsx, App.tsx      entry; Provider + TopMenu + CellList
src/components/             one .tsx + one .css per component (cell-list, code-cell, code-editor,
                            text-editor, preview, resizable, top-menu, book-importer, add-cell, action-bar...)
src/hooks/                  use-app-dispatch, use-app-selector (typed react-redux hooks),
                            use-cumulative-code (concatenates code of cells 1..N + show() helper)
src/state/                  store.ts (configureStore, AppDispatch), reducers.ts (RootState), slices/ (cells, bundles),
                            thunks/ (createBundle; fetch/save/export/import cells = persistence + book IO),
                            persist-listener.ts (debounced save), cell.ts (Cell, Book types)
src/bundler/                index.ts (esbuild initialize/build) + plugins/unpkg-path-plugin.ts, fetch-plugin.ts
index.html, vite.config.ts  Vite entry HTML (repo root) and config
public/                     static assets (favicon, icons, manifest.json, robots.txt)
eslint.config.js, .prettierrc  lint/format config (tests are `src/**/*.test.ts`, Vitest config in vite.config.ts)
.github/workflows/          deploy.yml (Pages), ci.yml (checks)
.claude/                    settings.json (hooks, permissions), agents/ (subagent definitions)
scripts/claude/             session-start.sh (SessionStart hook: Node from .nvmrc + npm ci)
docs/                       stories/, done/, architecture.md, decisions/ (one ADR per file)
```

## Bundling pipeline (brief)

Cell edit -> `useCumulativeCode` -> debounced (1s) `createBundle` thunk -> `bundler/index.ts` runs
esbuild with `unpkgPathPlugin` (resolve) + `fetchPlugin` (load, localforage cache) -> bundle code stored
in `state.bundles[cellId]` -> `Preview` posts it to a `sandbox="allow-scripts"` iframe which `eval`s it.
Full description: `docs/architecture.md`.

## Deployment

`.github/workflows/deploy.yml` runs on push to `main` (and manually via `workflow_dispatch`): a `build` job
(checkout, setup-node from `.nvmrc` with npm cache, `npm ci`, `npm run build`, `configure-pages`,
`upload-pages-artifact` of `dist/`) and a `deploy` job (`deploy-pages`, environment `github-pages`). Actions
are pinned to major versions. The repo's Pages source must be "GitHub Actions" (owner setting; Settings > Pages).
Vite `base` must stay `/js-browser/`. Do NOT reintroduce the manual `gh-pages` package deploy; the legacy
`gh-pages` branch is to be deleted by the owner only after the Actions deploy is verified live (JSB-005).

## Conventions

- Match existing style: function components (`React.FC`), hooks, TypeScript strict, double quotes,
  semicolons, 2-space indent (enforced by Prettier, `.prettierrc`; ESLint must stay clean).
- State access only through typed hooks in `src/hooks` (`useAppSelector`, `useAppDispatch`); components
  `dispatch(...)` slice actions and thunks imported from `src/state`.
- Reducers are RTK `createSlice` slices in `src/state/slices` (immer is built in); async work uses
  `createAsyncThunk` in `src/state/thunks`. A new cell-mutating action must be added to the matcher in
  `persist-listener.ts` so it is autosaved.
- Keep comments light: only comment code that is genuinely complex or non-obvious; prefer clear names over comments.
- Each component has its own `.css` file next to it; filenames are kebab-case.
- Node 24 and npm only (keep `package-lock.json`); no yarn/pnpm.
- Subagents: use the agents in `.claude/agents` (`context-puller` Haiku for lookups, `implementer` Sonnet for stories, `release-reviewer` Opus for release PRs).
- `.claude/settings.json` sets per-model auto-compact windows (Haiku 100k, Opus 600k) — see JSB-013.

## Workflow rules

1. Every change must be tracked by a story in `docs/stories/` (create one first if none fits).
2. Put the story ID (e.g. `JSB-002`) in every commit message.
3. Keep the story current as you work: tick Acceptance Criteria as they are met. The folder is the status (no Status field); add a `State:` line only for an open story that is In Progress, Blocked or Deferred.
4. When a story is complete, `git mv` it from `docs/stories/` to `docs/done/` and update
   the index in `docs/stories/README.md` (link now points to `docs/done/`).
5. Record any significant technical choice as a new ADR file in `docs/decisions/` (and its index).
6. Keep `docs/architecture.md` current whenever structure or data flow changes.
7. Do not commit unless asked. Never add Claude Code attribution to commits or PRs (no `Co-Authored-By: Claude`,
   `Claude-Session:` trailers, or "Generated with Claude Code" lines). Commit as the owner: before committing, set
   `git config user.name "Anthony Flowers"` and
   `git config user.email "22030883+AnthonyFlowers@users.noreply.github.com"` (the container default is Claude).
8. Branching: `dev` is the long-lived integration branch. Story work goes on a branch; once all local checks pass,
   merge it into `dev` and push (no PR needed; CI runs on every push to `dev` and must stay green). Work proceeds
   story by story. Claude decides when a batch of stories is ready and opens the `dev` -> `main` release PR. Before
   asking the owner to merge, have a fresh Opus subagent review the release PR and address its findings. The owner
   merges; a merge to `main` deploys. Never push directly to `main` (ADR-017, ADR-018).
9. Deleting any branch (e.g. `gh-pages`, `local-serve`) requires explicit owner confirmation after showing the
   owner what is on it.
10. Subagents commit on the story branch before handing back (never leave the tree dirty).
11. Release-review findings are fixed by a fresh Sonnet fixer given the findings and the diff, not by resuming a large-context agent.

## Gotchas

- The container has Node 22; the SessionStart hook puts Node 24 on `PATH` (otherwise `npx -y node@24`).
- unpkg/jsDelivr are blocked in the sandbox: use Playwright route interception / e2e fixtures for browser checks.
- The stop hook flags unpushed or uncommitted work: push right after each commit. Never follow its reset-author or rebase advice; it would rewrite the owner's identity.
- The permission classifier blocks history rewrites in Auto mode; merge instead of rebasing.

See `docs/README.md` for the story lifecycle.
