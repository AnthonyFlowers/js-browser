# JSB-012: Add CSS cell type

- **Status:** Todo
- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002, JSB-003, JSB-004, JSB-006

## Description

As a user, I want a CSS cell so that I can style the output of my code cells.

## Acceptance Criteria

- [ ] `CellTypes` in `src/state/cell.ts` extended with `"css"`; `AddCell` offers a "CSS" button; `CellListItem` renders a CSS cell (Monaco with `css` language, no preview pane of its own)
- [ ] Existing persisted books (types `code` | `text`) and imported `.book` files still load; `importCells` accepts books containing `css` cells
- [ ] `useCumulativeCode` includes CSS cells that precede (or all of) the code cell, injecting them into the iframe (e.g. a `<style>` element created in the prelude, or via esbuild's css loader as in `fetch-plugin`); behaviour (cumulative vs. global) decided and documented
- [ ] CSS changes re-trigger bundling/preview of dependent code cells through the existing debounce
- [ ] Preview iframe styles are isolated from the app (sandbox preserved)
- [ ] Reducer tests for inserting/updating css cells; test for cumulative-code output with a CSS cell
- [ ] Per-cell save (JSB-011) handles `.css`
- [ ] `docs/architecture.md` and README updated

## Notes

README future-feature item: "Add cell for css styling". The preview iframe's `srcDoc` in `preview.tsx` has a fixed white background style.
