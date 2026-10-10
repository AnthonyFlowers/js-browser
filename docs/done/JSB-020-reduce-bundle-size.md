# JSB-020: Reduce bundle size (Monaco and other heavy dependencies)

- **Type:** Task
- **Priority:** High
- **Depends on:** none

## Description

As a user (especially on mobile data), I want the app to load fewer bytes so that it starts quickly.

`src/monaco-setup.ts` does `import * as monaco from "monaco-editor"`, which pulls in every language, contribution and worker.

## Acceptance Criteria

- [x] Baseline recorded in Notes before changes: `npm run build` output sizes (per chunk, gzip) and transferred bytes for first load of the app and of opening the first code cell
- [x] `monaco-setup.ts` imports `monaco-editor/esm/vs/editor/editor.api` plus only the needed contributions (e.g. find, bracket matching, clipboard, hover, suggest, folding, comment, multicursor) and only the JavaScript language support; unused basic languages are not bundled (markdown is handled by md-editor, not Monaco)
- [x] The TypeScript/JavaScript worker is still used for the `javascript` label and the editor worker for everything else; editing, completion and Format still work
- [x] Other heavy dependencies reviewed (`@uiw/react-md-editor`, `prettier/standalone` plugins, Shiki, `streamsaver`, Font Awesome, Bulma/bulmaswatch) and each loaded lazily or trimmed where cheap; findings listed in Notes
- [x] After numbers recorded next to the baseline; the reduction is stated and no feature regressed (checked by the e2e suite)
- [x] `docs/architecture.md` Editor section updated; ADR added if Monaco import strategy changes materially (amends ADR-011)

## Notes

Part of the stability sweep. Consider `rollup-plugin-visualizer` as a temporary tool for measuring (not necessarily kept). Do not remove features to save bytes without asking the owner.

### Measurements

Measured with Playwright (Chromium) against `vite preview` at 1280 px desktop and the iPhone 13 profile, unpkg blocked, one
fresh browser context per run. Sizes are KB over all responses (workers and the wasm included); "gzip" gzips each body locally
to approximate GitHub Pages (fonts counted raw). Mobile and desktop transfer the same files, so the numbers are shared (first
load differs by 9 KB of CSS/media only). Script: session scratchpad `measure.mjs`, not kept in the repo.

| Transferred | Before raw | Before gzip | After raw | After gzip | Reduction (gzip) |
| --- | --- | --- | --- | --- | --- |
| First load (empty book) | 2036 | 706 | 829 | 319 | -387 KB (-55%) |
| Opening the first code cell (editor, workers, esbuild wasm) | 25779 | 6506 | 25125 | 6334 | -172 KB (-3%) |
| Same, excluding the esbuild wasm (13651 raw / 3697 gzip) | 12128 | 2809 | 11474 | 2637 | -172 KB (-6%) |

Opening a code cell is dominated by two files that cannot shrink: the wasm and `ts.worker` (6765 raw / 1456 gzip, the
TypeScript compiler that serves completion and hover). Without them the editor itself is 5.4 MB raw / 1.35 MB gzip before and
4.7 MB / 1.18 MB after. A book with a text cell now also fetches the markdown chunk (1147 raw / 375 gzip + 6 CSS) on top of the first load.

`npm run build` chunks (raw / gzip, KB):

| Chunk | Before | After |
| --- | --- | --- |
| `index` (entry: React, Redux, axios, localforage, Bulma) | 1582 / 511 | 246 / 76 |
| `index` CSS (Bulma + Font Awesome + app) | 314 / 56 | 261 / 44 |
| markdown stack `text-editor` (md-editor, refractor, micromark) | in `index` | 1147 / 375 (lazy) + CSS 36 / 6 |
| `editor.api` (Monaco core) | 2736 / 705 | 2736 / 705 |
| `toggleHighContrast` (all Monaco contributions) | 1194 / 303 | gone |
| `register` + `tsMode` (selected contributions, TS language client) | 5 / 2 + 22 / 6 | 804 / 202 + 420 / 110 |
| `code-editor` (wrapper, Shiki core, Prettier excluded) | 853 / 240 | 150 / 49 |
| Prettier `standalone` + `babel` + `estree` | in `code-editor` | 81 / 27 + 316 / 82 + 210 / 61 (lazy, on Format click) |
| `ts.worker` / `editor.worker` | 6928 / 304 (unchanged) | same |
| `esbuild.wasm` | 13979 / 3801 (unchanged) | same |
| JS chunks emitted | 103 | 20 (Monaco basic languages, css/html/json workers no longer built) |

Monaco chunks together (`editor.api` + contributions + TS client + `code-editor`, which held Prettier before) went from
4783 KB raw to 4110 KB raw (Prettier is now separate and lazy). The savings come from the contributions no longer imported (diff
editor, colour picker, code lens, inlay hints, inline completions, peek/reference widgets, sticky scroll, high-contrast toggle
and similar) and from moving Prettier off the editor path. The Monaco core (`editor.api`) cannot shrink further without
forking it.

### Follow-up (JSB-028)

The release review found that go to line, tab focus mode (accessibility), go to definition, the copy/paste contribution and font
zoom had been dropped without asking. They were restored in `monaco-setup.ts`. Measured delta: `register` 803.58 -> 813.19 KB raw
(202.02 -> 204.67 gzip), `tsMode` 419.86 -> 410.13 KB raw (109.94 -> 107.43 gzip) as shared modules moved between chunks; total
`dist/assets/*.js` 13,762,066 -> 13,761,952 bytes. Effectively free.

### Findings per dependency

- Monaco: `monaco-setup.ts` now imports `editor.api`, a list of contribution modules, the JavaScript language definition and the
  TypeScript feature `register`; css/html/json features and workers and all other basic languages are no longer part of the
  build (cut 83 chunks and about 2.3 MB of worker JS from `dist/`, none of which a visitor downloaded before either, since
  Monaco loads them on demand). Workers unchanged (ADR-024).
- `@uiw/react-md-editor`: the single biggest first-load cost (md-editor + `refractor` 729 KB raw / 316 gzip with every Prism
  language + `parse5` + micromark/mdast, about 1.2 MB raw / 500 gzip). `TextEditor` is now `React.lazy`, so a book with only
  code cells never fetches it. Trimming `refractor` to common languages would save about 600 KB raw but needs an alias into
  md-editor's internals; left as follow-up.
- `prettier/standalone` + babel + estree: dynamically imported on the first Format click (about 207 KB gzip off the editor path).
- `streamsaver`: dynamically imported on the first desktop Save Book (tiny, but off the entry chunk).
- Shiki: already loads only `dark-plus` and `javascript` (170 KB raw / 17 gzip) through dynamic imports with the JS regex
  engine (no Oniguruma wasm); nothing to trim.
- Font Awesome: only `fontawesome.min.css` + `solid.min.css` are imported (the app only uses `fa-solid` / `fa` icons); drops the
  brands and regular rules, -17 KB raw CSS. Only `fa-solid-900.woff2` (116 KB) is downloaded on first load.
- Bulma/bulmaswatch superhero: 194 KB raw (~35 gzip) of CSS for a handful of classes; purging needs a build tool
  (PurgeCSS) and risks dropping classes used by md-editor; left as follow-up. It also `@import`s Lato from Google Fonts
  (render-blocking third-party request, 25 KB); self-hosting is a possible follow-up.
- esbuild wasm (13.6 MB raw / 3.7 MB gzip): not preloaded; `ensureInitialized()` runs on the first bundle, so it is fetched
  after the first code cell appears, never on first load of an empty or text-only book. GitHub Pages compression for `.wasm`
  was not checked (out of scope). Prefetching it while the user reads the page is a possible follow-up.
- Verified by hand after the Monaco change: suggest widget with TypeScript hover docs, JSX token colours, line comment
  toggle; e2e covers editing and Format.

### Lazy-load side effects

The lazy `TextEditor` fallback is an empty card (no "Click to edit" text) so a click cannot land on a placeholder and be lost
(this made `I enter the markdown` flaky at first). Added the scenario "Format rewrites the code with Prettier" to
`e2e/features/cells.feature` since Format now loads Prettier on demand.
