# JSB-010: Switch between named local books

- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002, JSB-003, JSB-004, JSB-014

## Description

As a user, I want to create, name, open and delete multiple books stored in my browser so that I can keep separate notebooks and switch between them.

Owner decision: a book picker plus rename. The title is an editable field, and a dropdown/list shows the books saved in this browser, with create, delete and switch. On mobile the picker must be usable (see JSB-019).

## Acceptance Criteria

- [ ] Book title input in `top-menu.tsx` (currently `disabled`, with a 1s debounced `updateTitle`) is editable and renames the book
- [ ] Renaming does not leave an orphan entry: `saveCells` stores under `cells.title` in the localforage `cellcache`, so a rename must delete the old key (and handle name collisions)
- [ ] A book picker (dropdown or list) in `TopMenu`, built on `getCachedBooks` (returns `cellsCache.keys()`), shows all locally stored books and highlights the current one
- [ ] Selecting a book dispatches `fetchCells(title)`; `CellList`'s hard-coded `fetchCells("default")` becomes "last opened book" (persisted choice)
- [ ] "New book" creates an empty, uniquely named book; "Delete book" removes it with confirmation
- [ ] Bundles state (`state.bundles`) is reset or recomputed when switching books so previews do not show stale output
- [ ] Unsaved/pending debounced save (250ms in `persist-listener.ts`) is flushed before switching
- [ ] Imported books (`importCells`) are saved under their title and appear in the list; title collisions handled
- [ ] The title input reflects the loaded or selected book (including after Load Book or a switch) and never dispatches a stale title over it
- [ ] Unit tests for new reducers/action creators; `docs/architecture.md` state shape and persistence sections updated

## Notes

Existing code already has partial scaffolding: `fetchCells(bookTitle)`, `getCachedBooks`, title in state. `getCachedBooks` is not used by any component yet. The book list can live in the cells slice or a small new slice.

Book Title quirk found during JSB-017 (e2e): the input in `top-menu.tsx` is `disabled` and its `title` state is seeded once from the store (`useState(initialTitle)`), so it never follows `state.cells.title`. After Load Book (`importCells` sets the store title) or any other store-side title change, the input still shows the old title. Its effect also re-dispatches `updateTitle(title)` 1 s after mount and after every local title change, using that stale local value, so it can overwrite the title of a book loaded or imported in the meantime. Fix by deriving the value from the store (or syncing local state to it) and dispatching only on user edits.
