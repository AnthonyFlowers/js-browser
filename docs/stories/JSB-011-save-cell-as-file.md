# JSB-011: Save an individual cell as a file

- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002, JSB-003, JSB-004

## Description

As a user, I want to download a single cell as a file so that I can reuse its code or notes outside the notebook.

## Acceptance Criteria

- [ ] Each cell's action bar (`action-bar.tsx`, currently up/down/delete) has a "save" button
- [ ] Code cells download as `.jsx` (or `.js` if no JSX is detected - decide and document); text cells as `.md`; CSS cells (JSB-012) as `.css`
- [ ] File name derives from book title + cell position/id, sanitised for the file system
- [ ] Saved content is the cell's own content, not the cumulative code from `use-cumulative-code`
- [ ] Implemented via the same mechanism as book export (`streamsaver` in `exportCells`) or a simple Blob download; decision noted
- [ ] Works in current Chrome, Firefox and Safari; empty cell handled
- [ ] Unit test for file name/extension helper; README feature list updated

## Notes

README future-feature item: "Add save feature for each markup/code cell. Would save a cell as a js/jsx/md file".
