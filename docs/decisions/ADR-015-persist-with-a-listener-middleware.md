# ADR-015: Persist with a listener middleware

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-014

**Context:** The hand-written persist middleware debounced `saveCells` by 250 ms after cell-mutating actions using a module-level timer.

**Decision:** Use RTK's `createListenerMiddleware` (`src/state/persist-listener.ts`) with `isAnyOf(moveCell, updateCell, insertCellAfter, deleteCell, updateTitle)`; the effect calls `cancelActiveListeners()`, `delay(250)` and dispatches `saveCells()`. It is appended after the default middleware in `configureStore`. Thunk-based fetch/import do not match, so they do not trigger saves.

**Consequences:** No manual timer or action-type list; matching is by action creator, so a new mutating reducer must be added to the matcher.
