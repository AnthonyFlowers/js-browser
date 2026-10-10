# JSB-016: Code cell preview sometimes stays on the loading bar

- **Status:** Todo
- **Type:** Bug
- **Priority:** Medium
- **Depends on:** none

## Description

As a user, I want every code cell's preview to finish bundling and render so that I am not left looking at a loading bar
with no output or error.

Reported by the owner on the live site (iPhone, mobile Safari, 5G) right after the JSB-004/JSB-014 release on 2026-10-10.
A book with four code cells and one text cell:

1. `show(nums.map(...))` rendered `[1,4,9,16]`.
2. A React `useState` counter rendered and worked.
3. `import { format } from "date-fns"` stayed on the grey indeterminate progress bar.
4. `import "bulma/css/bulma.css"` stayed on the grey indeterminate progress bar.

The owner then deleted cells 3 and 4 and added them back with the same code; the new cells rendered
correctly ("Today is Friday, Oct 9 and nums has 4 items" and a styled Bulma button). No error was shown in either state.

| Stuck | Loaded later |
|-------|--------------|
| ![Cells 3 and 4 stuck on the loading bar](assets/JSB-016-stuck-loading.png) | ![All cells rendered](assets/JSB-016-loaded.png) |

Steps to reproduce: not yet known. Likely conditions are the first import of a package that is not yet cached in
IndexedDB, on a slow or mobile connection. Workaround: delete the cell and add it again.

## Acceptance Criteria

- [ ] Root cause identified and documented in Notes (reproduced locally, e.g. with throttled or stalled network for unpkg)
- [ ] A bundle that cannot complete ends in a visible error in the preview instead of an indefinite loading bar
- [ ] A slow but progressing first fetch still completes and renders
- [ ] Regression test covering the failure mode (thunk/plugin level)
- [ ] Verified on the live site on mobile after release

## Notes

The grey bar is the Bulma `progress` element in `src/components/code-cell.tsx`, shown while `!bundle || bundle.loading`.

Hypotheses to check:

- **Slow first fetch:** `date-fns` resolves to many module files and `bulma.css` is about 750 KB; each unpkg file is
  fetched sequentially by `fetch-plugin` with no progress feedback, so a slow mobile connection could look stuck.
- **Hung request:** axios in `fetch-plugin` has no timeout, so a stalled unpkg request keeps `createBundle` pending and
  the cell on the loading bar forever, until a later edit or reload starts a new bundle.
- **Concurrent bundling on load:** after a reload every cell bundles at once and the esbuild `initialize` promise is
  shared; check for a race or a bundle result arriving for an outdated input.
- **Missing dispatch:** a cell whose bundle is never started (`bundle` undefined) also shows the bar; check the
  debounce/effect in `code-cell.tsx` for a path that skips `createBundle`.

Recovery (owner, 2026-10-10): the stuck cells recovered only after being deleted and re-added. A new cell gets a new id
and a fresh `createBundle` run, and by then the packages were likely cached. This points away from "just slow" and
toward a bundle for the original cell ids that never settled (hung request) or was never started; it is not yet known
whether waiting longer would have recovered them.
