# JSB-007: Remove stale files and code; refresh README

- **Status:** Todo
- **Type:** Chore
- **Priority:** Low
- **Depends on:** JSB-002

## Description

As a maintainer, I want dead files and code removed and the README brought up to date so that the repo reflects what the app actually does.

## Acceptance Criteria

- [ ] `public/test.html` deleted
- [ ] Stray `console.log("saved")` removed from `exportCells` in `src/state/action-creators/fetchCellsCreator.ts`
- [ ] Unused `useState` import removed from `src/App.tsx`
- [ ] Other dead code reviewed and removed or justified: unused `files` reducer state (`localFiles`, `loading`, `error`) and the never-dispatched `EXPORT_BOOK` / `SAVE_CELLS_COMPLETE` action types, unused `getCachedBooks` (keep if JSB-010 uses it), typo `ActionButto` in `action-button.tsx`, `as any`/`@ts-ignore` where easily removable
- [ ] `/.css$/` fix is handled in JSB-003 (cross-check, do not duplicate)
- [ ] README: book loading marked done ("Load Book" via `book-importer.tsx` exists); Future Features list reflects JSB-010/011/012; setup/dev/build/deploy instructions added (Node 24, npm); live link kept; license section added after JSB-009
- [ ] README no longer mentions manual gh-pages deploy once JSB-005 lands
- [ ] `public/manifest.json` and `index.html` description reviewed for accuracy
- [ ] Lint/typecheck/tests still pass (once JSB-006 exists)

## Notes

JSB-006 already fixed (do not duplicate): unused `useState` import in `App.tsx`; `Function`/`Boolean` types, `let` -> `const`, and `case` declarations flagged by lint. `console.log("saved")`, `public/test.html`, the `files` reducer and the `ActionButto` typo are still open.

Known: the title `<input>` in `top-menu.tsx` is currently `disabled`, which is part of why README item "switch between books" is unfinished (see JSB-010).
