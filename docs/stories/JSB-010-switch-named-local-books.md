# JSB-010: Switch between named local books

- **Status:** Todo
- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002, JSB-003, JSB-004

## Description

As a user, I want to create, name, open and delete multiple books stored in my browser so that I can keep separate notebooks and switch between them.

## Acceptance Criteria

- [ ] Book title input in `top-menu.tsx` (currently `disabled`, with a 1s debounced `updateTitle`) is editable and renames the book
- [ ] Renaming does not leave an orphan entry: `saveCells` stores under `cells.title` in the localforage `cellcache`, so a rename must delete the old key (and handle name collisions)
- [ ] A book list/selector (using `getCachedBooks`, which returns `cellsCache.keys()`) shows all locally stored books
- [ ] Selecting a book dispatches `fetchCells(title)`; `CellList`'s hard-coded `fetchCells("default")` becomes "last opened book" (persisted choice)
- [ ] "New book" creates an empty, uniquely named book; "Delete book" removes it with confirmation
- [ ] Bundles state (`state.bundles`) is reset or recomputed when switching books so previews do not show stale output
- [ ] Unsaved/pending debounced save (250ms in `persist-middleware.ts`) is flushed before switching
- [ ] Imported books (`importCells`) are saved under their title and appear in the list; title collisions handled
- [ ] Unit tests for new reducers/action creators; `docs/architecture.md` state shape and persistence sections updated

## Notes

Existing code already has partial scaffolding: `fetchCells(bookTitle)`, `getCachedBooks`, title in state. Also uses the `files` reducer stub (`localFiles`) that may be repurposed for the book list.
