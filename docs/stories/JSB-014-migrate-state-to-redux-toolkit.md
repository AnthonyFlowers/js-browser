# JSB-014: Migrate state to Redux Toolkit

- **Status:** Todo
- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-004, JSB-006

## Description

As a developer, I want the Redux state layer on Redux Toolkit so that reducers, thunks and the store use the maintained, less boilerplate-heavy API instead of the deprecated `createStore` with hand-written action types.

Current state (`src/state`): `store.ts` uses `createStore(reducers, {}, applyMiddleware(persistMiddleware, thunk))`; `reducers/cellsReducer.ts` and `bundlesReducer.ts` wrap a `switch` in immer `produce`; `action-types/`, `actions/` and `action-creators/` hold hand-written action types, shapes and creators; thunks are `createBundle` (`bundlesCreator.ts`) and `fetchCells`/`saveCells`/`exportCells`/`importCells` (`fetchCellsCreator.ts`); `middlewares/persist-middleware.ts` debounces `saveCells` by 250 ms on cell-mutating actions; `hooks/use-actions.ts` and `hooks/use-typed-selector.ts` expose the typed API used by components.

## Acceptance Criteria

- [ ] `@reduxjs/toolkit` added; `src/state/store.ts` uses `configureStore` with the persist middleware appended after the defaults (thunk is included by default); `RootState` and `AppDispatch` types exported
- [ ] `cells` reducer rewritten with `createSlice` (reducers for update, delete, move incl. boundary no-op, insert-after incl. unshift when the id is not found, update title, import/fetch complete); behaviour identical to `cellsReducer.ts` (3-character random ids, same state shape)
- [ ] `bundles` reducer rewritten with `createSlice` (bundle start/complete keyed by `cellId`)
- [ ] The `files` reducer is migrated or dropped in coordination with JSB-007 (it is a placeholder that only handles `EXPORT_BOOK`); do not migrate it if JSB-007 removes it first
- [ ] `createBundle`, `fetchCells`, `saveCells`, `exportCells`, `importCells` converted to `createAsyncThunk` (pending/fulfilled/rejected replace `BUNDLE_START/COMPLETE`, `FETCH_CELLS*`, `IMPORT_BOOK*`, `SAVE_CELLS_ERROR`, `EXPORT_BOOK_*`), error messages still surfaced in `cells.error`
- [ ] Persist middleware behaviour kept: the same set of mutating actions (move, update, insert, delete, title) triggers a debounced (250 ms) save of the whole `cells` slice to the `cellcache` localforage key `cells.title`; fetch/import must still not trigger a save
- [ ] Typed hooks API decided and applied: either keep `useTypedSelector`/`useActions` (updated for slice actions) or replace with `useAppSelector`/`useAppDispatch` and update every call site (`grep` for `useTypedSelector`/`useActions` in `src/components` and `src/hooks`)
- [ ] Hand-written `action-types/` and `actions/` removed once unused; direct `redux-thunk` and `immer` dependencies (and `redux` if unneeded) removed from package.json when nothing imports them
- [ ] Reducer tests from JSB-006 (`cellsReducer`, `bundlesReducer`) still pass, updated to the slice reducers/actions without weakening the assertions
- [ ] `npm run lint`, `format:check`, `typecheck`, `test` and `build` pass; manual smoke test: add/edit/move/delete cells, reload (autosave restored), save and load a `.book`
- [ ] `docs/architecture.md` (state shape, persistence) and `CLAUDE.md` (tech stack, conventions) updated

## Notes

Decision: ADR-012 (separate story from JSB-004, which must not change the state layer). Depends on JSB-006 so the reducer tests exist as a safety net, and on JSB-004 so react-redux/react are already on current versions. Coordinate with JSB-007 (removes or keeps the `files` reducer) and JSB-010 (named books will touch `fetchCells`/`getCachedBooks`).
