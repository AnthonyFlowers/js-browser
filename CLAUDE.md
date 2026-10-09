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

Current (as of start of the refresh):
- React 18, Redux 4 (`createStore`, redux-thunk, immer `produce` reducers), TypeScript 4.9
- Create React App 4 (react-scripts 4.0.1), needs `--openssl-legacy-provider` on modern Node
- Monaco via @monaco-editor/react 3.7.5 (+ monaco-jsx-highlighter, jscodeshift, prettier 2 for Format)
- esbuild-wasm 0.8.27 (old `startService` API), axios + localforage (IndexedDB) for fetch/cache
- Bulma (bulmaswatch superhero) + Font Awesome 5; streamsaver for book download
- Deployed manually with the `gh-pages` package. No tests, no lint/prettier config, no CI.

Target (see stories JSB-002..JSB-006): Vite, current esbuild-wasm (`initialize`/`build`), current
Monaco/md-editor/other deps, Node 24 + npm, ESLint + Prettier + Vitest, GitHub Actions -> GitHub Pages.

## Commands

Current scripts are Windows-only (`SET NODE_OPTIONS=... && ...`) and WILL BE REPLACED by JSB-002.
On Linux/macOS the working equivalents are:

```
npm install
NODE_OPTIONS=--openssl-legacy-provider npx react-scripts start    # dev server
NODE_OPTIONS=--openssl-legacy-provider npx react-scripts build    # production build -> build/
npx tsc --noEmit                                                  # typecheck
```

Do not use `npm run deploy` (see Deployment). After JSB-002/006 land, update this section with
`npm run dev|build|lint|format|test` etc.

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
src/bundler/                index.ts (esbuild service) + plugins/unpkg-path-plugin.ts, fetch-plugin.ts
public/                     static assets, index.html (CRA; moves in JSB-002)
docs/                       stories/, done/, architecture.md, decisions.md
```

## Bundling pipeline (brief)

Cell edit -> `useCumulativeCode` -> debounced (1s) `createBundle` thunk -> `bundler/index.ts` runs
esbuild with `unpkgPathPlugin` (resolve) + `fetchPlugin` (load, localforage cache) -> bundle code stored
in `state.bundles[cellId]` -> `Preview` posts it to a `sandbox="allow-scripts"` iframe which `eval`s it.
Full description: `docs/architecture.md`.

## Deployment

Target: GitHub Actions workflow on push to `main` using `actions/upload-pages-artifact` +
`actions/deploy-pages` (JSB-005). Repo Pages source must be "GitHub Actions" (owner action). Vite
`base` must be `/js-browser/`. Until JSB-005 is done the site is deployed manually from the `gh-pages`
branch. Do NOT reintroduce the manual `gh-pages` package deploy.

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
