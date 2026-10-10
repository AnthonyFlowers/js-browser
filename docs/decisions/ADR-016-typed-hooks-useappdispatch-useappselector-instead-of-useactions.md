# ADR-016: Typed hooks `useAppDispatch` / `useAppSelector` instead of `useActions`

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-014

**Context:** `useActions` bound a bag of hand-written action creators with `bindActionCreators`. Slice actions and `createAsyncThunk` thunks are plain exports, and bound thunk typing is awkward.

**Decision:** Drop `useActions` and `useTypedSelector`; provide `useAppDispatch` and `useAppSelector` built with react-redux's `.withTypes<AppDispatch>()` / `.withTypes<RootState>()`, the pattern recommended by RTK. Components import action creators from `src/state` and call `dispatch(...)`.

**Consequences:** Call sites are slightly more verbose but fully typed, including thunk results (`unwrap()`); `dispatch` is stable so it replaces the bound actions in effect dependency lists.
