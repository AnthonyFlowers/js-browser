# ADR-012: Migrate to Redux Toolkit as a separate story

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-014

**Context:** The state layer uses the deprecated `createStore` with hand-written action types, switch reducers wrapped in
immer `produce`, and plain thunks. JSB-004 raised whether to adopt Redux Toolkit.

**Decision:** Adopt Redux Toolkit (`configureStore`, `createSlice`, `createAsyncThunk`) in its own story, JSB-014, after
JSB-004 (dependency upgrades) and JSB-006 (reducer tests as a safety net). JSB-004 does not change the state layer.

**Consequences:** Less boilerplate and a maintained API; a contained refactor of `src/state` and its call sites, with
direct `redux-thunk` and `immer` dependencies likely removed. Must be coordinated with JSB-010.
