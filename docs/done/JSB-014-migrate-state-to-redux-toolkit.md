# JSB-014: Migrate state to Redux Toolkit

- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-004, JSB-006

## Description

As a developer, I want the Redux state layer on Redux Toolkit so that reducers, thunks and the store use the maintained, less boilerplate-heavy API instead of the deprecated `createStore` with hand-written action types.

Current state (`src/state`): `store.ts` uses `createStore(reducers, {}, applyMiddleware(persistMiddleware, thunk))`; `reducers/cellsReducer.ts` and `bundlesReducer.ts` wrap a `switch` in immer `produce`; `action-types/`, `actions/` and `action-creators/` hold hand-written action types, shapes and creators; thunks are `createBundle` (`bundlesCreator.ts`) and `fetchCells`/`saveCells`/`exportCells`/`importCells` (`fetchCellsCreator.ts`); `middlewares/persist-middleware.ts` debounces `saveCells` by 250 ms on cell-mutating actions; `hooks/use-actions.ts` and `hooks/use-typed-selector.ts` expose the typed API used by components.

## Acceptance Criteria

- [x] `@reduxjs/toolkit` added; `src/state/store.ts` uses `configureStore` with the persist middleware appended after the defaults (thunk is included by default); `RootState` and `AppDispatch` types exported
- [x] `cells` reducer rewritten with `createSlice` (reducers for update, delete, move incl. boundary no-op, insert-after incl. unshift when the id is not found, update title, import/fetch complete); behaviour identical to `cellsReducer.ts` (3-character random ids, same state shape)
- [x] `bundles` reducer rewritten with `createSlice` (bundle start/complete keyed by `cellId`)
- [x] The `files` reducer is migrated or dropped in coordination with JSB-007 (it is a placeholder that only handles `EXPORT_BOOK`); do not migrate it if JSB-007 removes it first
- [x] `createBundle`, `fetchCells`, `saveCells`, `exportCells`, `importCells` converted to `createAsyncThunk` (pending/fulfilled/rejected replace `BUNDLE_START/COMPLETE`, `FETCH_CELLS*`, `IMPORT_BOOK*`, `SAVE_CELLS_ERROR`, `EXPORT_BOOK_*`), error messages still surfaced in `cells.error`
- [x] Persist middleware behaviour kept: the same set of mutating actions (move, update, insert, delete, title) triggers a debounced (250 ms) save of the whole `cells` slice to the `cellcache` localforage key `cells.title`; fetch/import must still not trigger a save
- [x] Typed hooks API decided and applied: either keep `useTypedSelector`/`useActions` (updated for slice actions) or replace with `useAppSelector`/`useAppDispatch` and update every call site (`grep` for `useTypedSelector`/`useActions` in `src/components` and `src/hooks`)
- [x] Hand-written `action-types/` and `actions/` removed once unused; direct `redux-thunk` and `immer` dependencies (and `redux` if unneeded) removed from package.json when nothing imports them
- [x] Reducer tests from JSB-006 (`cellsReducer`, `bundlesReducer`) still pass, updated to the slice reducers/actions without weakening the assertions
- [x] `npm run lint`, `format:check`, `typecheck`, `test` and `build` pass; manual smoke test: add/edit/move/delete cells, reload (autosave restored), save and load a `.book`
- [x] `docs/architecture.md` (state shape, persistence) and `CLAUDE.md` (tech stack, conventions) updated

## Notes

Decision: ADR-012 (separate story from JSB-004, which must not change the state layer). Depends on JSB-006 so the reducer tests exist as a safety net, and on JSB-004 so react-redux/react are already on current versions. Coordinate with JSB-007 (removes or keeps the `files` reducer) and JSB-010 (named books will touch `fetchCells`/`getCachedBooks`).

Resolution:

- `@reduxjs/toolkit` 2.13 added; `redux`, `redux-thunk` and `immer` removed as direct dependencies (still installed transitively by RTK/react-redux). `store.ts` uses `configureStore` with the default middleware plus the persist listener appended; `RootState` is exported from `src/state/reducers.ts` (via `combineReducers`, which avoids a type cycle through the thunks) and `AppDispatch` from `store.ts`.
- `src/state/slices/cellsSlice.ts` and `bundlesSlice.ts` replace the switch reducers; same state shape, 3-character ids, boundary no-op and unshift-when-not-found behaviour. Action creators are the slice actions with object payloads (`moveCell({ id, direction })`, `insertCellAfter({ id, type })`, `updateCell({ id, content })`).
- `src/state/thunks/` holds `createBundle` (arg `{ cellId, input }`), `fetchCells`, `saveCells`, `exportCells`, `importCells` as `createAsyncThunk`s; the slices handle pending/fulfilled/rejected and rejections write `action.error.message` to `cells.error` (bundle rejections write it to the bundle's `err`). `getCachedBooks` stays a plain function for JSB-010. The `files` reducer was already removed in JSB-007.
- Differences from the old behaviour, all error paths: a failed `exportCells` and a malformed/unparseable import now surface in `cells.error` (previously the export error was dispatched but unhandled and `JSON.parse` threw); a thrown bundler error now ends loading instead of leaving the cell loading forever. `cells.loading` is still not cleared by a successful fetch (unchanged, and unused by the UI).
- Persist: `src/state/persist-listener.ts` is a listener middleware matching `moveCell`, `updateCell`, `insertCellAfter`, `deleteCell` and `updateTitle`; it cancels the previous run, waits 250 ms and dispatches `saveCells()`. Fetch/import do not match, so they do not save. See ADR-015.
- Hooks: replaced `useActions`/`useTypedSelector` with `useAppDispatch`/`useAppSelector` (`src/hooks/use-app-dispatch.ts`, `use-app-selector.ts`, built with `.withTypes`); components call `dispatch(action(...))`. See ADR-016.
- Removed `action-types/`, `actions/`, `action-creators/`, `reducers/*Reducer.ts` and `middlewares/`. Reducer tests ported to `slices/cellsSlice.test.ts` and `slices/bundlesSlice.test.ts` with the same assertions plus rejected-path cases; new `thunks/cellsThunks.test.ts` (import) and `persist-listener.test.ts` (debounce, no save after fetch). 40 tests pass.
- Verified on Node 24: `npm ci`, lint, format:check, typecheck, test, build; Chromium smoke test against `npm run preview` and `npm run dev` (JSX preview, add code/text cells, edit, move, delete, reload restores cells, import a `.book`); no react-redux or RTK serializability/immutability/selector warnings in the dev run.
