# JSB-007: Remove stale files and code; refresh README

- **Type:** Chore
- **Priority:** Low
- **Depends on:** JSB-002

## Description

As a maintainer, I want dead files and code removed and the README brought up to date so that the repo reflects what the app actually does.

## Acceptance Criteria

- [x] `public/test.html` deleted
- [x] Stray `console.log("saved")` removed from `exportCells` in `src/state/action-creators/fetchCellsCreator.ts`
- [x] Unused `useState` import removed from `src/App.tsx` (done in JSB-006)
- [x] Other dead code reviewed and removed or justified: unused `files` reducer state (`localFiles`, `loading`, `error`) and the never-dispatched `EXPORT_BOOK` / `SAVE_CELLS_COMPLETE` action types, unused `getCachedBooks` (keep if JSB-010 uses it), typo `ActionButto` in `action-button.tsx`, `as any`/`@ts-ignore` where easily removable
- [x] `/.css$/` fix is handled in JSB-003 (cross-checked: filter is `/\.css$/`)
- [x] README: book loading marked done ("Load Book" via `book-importer.tsx` exists); Future Features list reflects JSB-010/011/012; setup/dev/build/deploy instructions added (Node 24, npm); live link kept; license section added after JSB-009
- [x] README no longer mentions manual gh-pages deploy once JSB-005 lands
- [x] `public/manifest.json` and `index.html` description reviewed for accuracy
- [x] Lint/typecheck/tests still pass (JSB-006)

## Notes

JSB-006 already fixed (do not duplicate): unused `useState` import in `App.tsx`; `Function`/`Boolean` types, `let` -> `const`, and `case` declarations flagged by lint. 

README rewritten: stale checklist removed, book loading documented as a feature, setup/scripts/deploy and workflow sections, roadmap links to JSB-010/011/012/014, License section (completes the JSB-009 README criterion). It does not mention gh-pages; a re-check found no gh-pages mention in README or package.json, so that criterion is met.

Known: the title `<input>` in `top-menu.tsx` is currently `disabled`, which is part of why README item "switch between books" is unfinished (see JSB-010).

Review nits from PR #1 to address here:

- [x] `index.html` hardcodes `/js-browser/` in 4 places (favicon, apple-touch-icon, manifest) duplicating Vite `base`; use root-relative paths and let Vite apply `base`.
- [x] `fetch-plugin` cache version bump leaves old unprefixed/v1 entries in IndexedDB forever; consider a one-time cleanup of non-current keys.
- [x] Cached JSON/non-JS unpkg files are loaded with the `jsx` loader (old behaviour); consider choosing the loader by extension (`.json` -> `json`).
- [x] `unpkg-path-plugin`: root-absolute imports like `/npm/x` become `https://unpkg.com//npm/x`; map `^/` to `https://unpkg.com` + path.
- [x] Bundler `define.global` is `"window"` while the app uses `"globalThis"`; align or document.
- [x] 3.7 MB main chunk warning; consider code-splitting (may be addressed by the JSB-004 Monaco worker setup).

Resolution:

- Dead code removed: `public/test.html`, `console.log("saved")`, the `files` reducer/slice (`localFiles`, `loading`, `error`; `RootState` is now `cells` + `bundles`), `SAVE_CELLS_COMPLETE` and `EXPORT_BOOK` (action types, interfaces, union members; reducer tests used `EXPORT_BOOK` as an unknown action and now use `EXPORT_BOOK_SUCCESS`). `ActionButto` renamed to `ActionButton`. No `as any` / `@ts-ignore` exist. `getCachedBooks` is kept for JSB-010.
- `index.html` uses root-relative `/favicon.ico` etc.; Vite applies `base`, and `dist/index.html` still emits `/js-browser/...` for favicon, icon, manifest and assets.
- fetch-plugin: loader chosen by extension (`.json` -> `json`, else `jsx`); files are requested with `responseType: "text"` so axios does not parse JSON into an object. `CACHE_VERSION` bumped to `v3:` because v2 entries held JSON stored with the `jsx` loader; the first cache lookup per page load removes every key not starting with `v3:`.
- unpkg-path-plugin: `^/` imports map to `https://unpkg.com` + path (new fourth `onResolve`).
- `define.global` changed from `"window"` to `"globalThis"`. The app itself references neither (the nit's premise was slightly off); bundles only run in a sandboxed iframe where both are identical, and `globalThis` is also valid in worker/non-window contexts, so it is the minimal, safer choice.
- Chunk size: Monaco is already split into lazy language chunks (JSB-004); the remaining >500 kB warning comes from Monaco core, and further code-splitting is out of scope here.
- Verified on Node 24: lint, format:check, typecheck, test (33 tests), build; Chromium smoke test against `npm run preview` (JSX preview, npm import, `package.json` JSON import, add/move/delete cells).
