# JSB-012: Add CSS cell type

- **Status:** Todo
- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002, JSB-003, JSB-004, JSB-006

## Description

As a user, I want a CSS cell so that I can style the output of my code cells.

Owner decision: CSS applies cumulatively, to the previews of code cells after the CSS cell, mirroring how JS scope is cumulative. A CSS cell does not affect cells above it.

## Acceptance Criteria

- [ ] `CellTypes` in `src/state/cell.ts` extended with `"css"`; `AddCell` offers a "CSS" button; `CellListItem` renders a CSS cell (Monaco with `css` language, no preview pane of its own)
- [ ] Existing persisted books (types `code` | `text`) and imported `.book` files still load; `importCells` accepts books containing `css` cells
- [ ] `useCumulativeCode` includes the CSS of every css cell that precedes the code cell in `order` (and none that follow), injected into the preview iframe (e.g. generated JS that appends a `<style>` element with `JSON.stringify`d content, like the css branch of `fetch-plugin.ts`); a code cell above a CSS cell is unaffected
- [ ] CSS changes re-trigger bundling/preview of dependent code cells through the existing debounce
- [ ] Preview iframe styles are isolated from the app (sandbox preserved)
- [ ] Reducer tests for inserting/updating css cells; test for cumulative-code output with a CSS cell
- [ ] Per-cell save (JSB-011) handles `.css`
- [ ] `docs/architecture.md` and README updated

## Notes

Decided (owner interview, 2026-10-10): cumulative, not global.

README future-feature item: "Add cell for css styling". The preview iframe's `srcDoc` in `preview.tsx` has a fixed white background style.
