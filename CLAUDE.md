# CLAUDE.md

Guide for Claude Code working in this repo. Keep it accurate; update it when the stack changes.

## Project overview

js-browser is an in-browser JS/JSX notebook (CodeSandbox/Jupyter-like). Users create a "book" of
code cells (Monaco editor) and markdown cells (@uiw/react-md-editor). Code is bundled in the browser
by esbuild-wasm, bare imports are resolved to unpkg.com, and the result runs in a sandboxed iframe
next to each cell. A `show()` helper renders values/JSX into the cell preview. Cells share scope
cumulatively (cell N sees code from cells 1..N-1). Live site: https://anthonyflowers.github.io/js-browser/

Architecture details: `docs/architecture.md`. Decisions: `docs/decisions.md`. Work tracking: `docs/`.

## Tech stack

Current:
- React 18, Redux 4 (`createStore`, redux-thunk, immer `produce` reducers), TypeScript 5
- Vite 8 + @vitejs/plugin-react (`vite.config.ts`, `base: "/js-browser/"`, output `dist/`), Node 24 + npm
- Monaco via @monaco-editor/react 3.7.5 (+ monaco-jsx-highlighter, jscodeshift, prettier 2 for Format)
- esbuild-wasm 0.28.2 (`initialize`/`build`; wasm self-hosted via Vite `?url`, ADR-009), axios + localforage (IndexedDB) for fetch/cache
- Bulma (bulmaswatch superhero) + Font Awesome 5; streamsaver for book download
- npm `overrides` pin legacy peers (monaco-editor/react) to the installed versions until JSB-004.
- Deployed by GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages. No tests, no lint/prettier config, no CI checks yet.

Target (see stories JSB-004..JSB-006): current
Monaco/md-editor/other deps, Node 24 + npm, ESLint + Prettier + Vitest, GitHub Actions -> GitHub Pages.

## Commands

```
npm ci                  # install (Node 24, see .nvmrc)
npm run dev             # Vite dev server, http://localhost:5173/js-browser/
npm run build           # production build -> dist/
npm run preview         # serve dist/ at http://localhost:4173/js-browser/
npx tsc --noEmit        # typecheck
```

There is no manual deploy command (see Deployment). JSB-006 will add `lint|format|test`; update this
section then.

## Repo layout

```
src/index.tsx, App.tsx      entry; Provider + TopMenu + CellList
src/components/             one .tsx + one .css per component (cell-list, code-cell, code-editor,
                            text-editor, preview, resizable, top-menu, book-importer, add-cell, action-bar...)
src/hooks/                  use-actions (bound action creators), use-typed-selector,
                            use-cumulative-code (concatenates code of cells 1..N + show() helper)
src/state/                  store.ts, reducers/ (cells, bundles, files), actions/, action-types/,
                            action-creators/ (cells, bundles, fetchCells = persistence + book IO),
                            middlewares/persist-middleware.ts (debounced save), cell.ts (Cell type)
src/bundler/                index.ts (esbuild initialize/build) + plugins/unpkg-path-plugin.ts, fetch-plugin.ts
index.html, vite.config.ts  Vite entry HTML (repo root) and config
public/                     static assets (favicon, icons, manifest.json, robots.txt)
docs/                       stories/, done/, architecture.md, decisions.md
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
  semicolons, 2-space indent (Prettier defaults once JSB-006 lands).
- State access only through typed hooks in `src/hooks` (`useTypedSelector`, `useActions`); new action
  creators go in `src/state/action-creators` and are exported from its index.
- Reducers use immer `produce`; action types live in `action-types`, shapes in `actions`.
- Each component has its own `.css` file next to it; filenames are kebab-case.
- Node 24 and npm only (keep `package-lock.json`); no yarn/pnpm.
- Subagents: use Haiku for context-pulling tasks (search, reading, doc lookups, summarizing);
  use Sonnet for implementation and other delegated work.
- `.claude/settings.json` sets per-model auto-compact windows (Haiku 100k, Opus 600k) — see JSB-013.

## Workflow rules

1. Every change must be tracked by a story in `docs/stories/` (create one first if none fits).
2. Put the story ID (e.g. `JSB-002`) in every commit message.
3. Keep the story current as you work: Status field, and tick Acceptance Criteria as they are met.
4. When a story is complete, `git mv` it from `docs/stories/` to `docs/done/` (Status: Done) and update
   the index in `docs/stories/README.md` (link now points to `docs/done/`).
5. Record any significant technical choice as a new ADR in `docs/decisions.md`.
6. Keep `docs/architecture.md` current whenever structure or data flow changes.
7. Do not commit unless asked; do not push to `main` directly.

See `docs/README.md` for the story lifecycle.
