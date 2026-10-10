# ADR-014: React 19, Redux 5 and Prettier 3 with minimal code changes

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-004

**Context:** Every dependency used by the app (md-editor 4, react-redux 9, react-resizable 4, @monaco-editor/react 4.7)
supports React 19, so staying on 18 would only defer the upgrade.

**Decision:** Move to React 19, Redux 5 (`legacy_createStore`, `redux-thunk` named `thunk` export, `Middleware` typing),
react-redux 9, immer 11 (named `produce`) and Prettier 3 (`prettier/standalone` with the babel and estree plugins; `format` is
async) for both the Format button and dev tooling. The state layer is otherwise unchanged (Redux Toolkit is JSB-014).
Preview `show()` now renders JSX with `react-dom/client` `createRoot`, because unpkg's latest `react-dom` (19) removed
`ReactDOM.render`. Selectors that returned new references were fixed for react-redux 9.

**Consequences:** One version of Prettier serves tool and runtime. User code that pins React 18 from unpkg and calls
`ReactDOM.render` itself still works; only the helper changed. The unpinned `react`/`react-dom` imports resolve to the latest versions.
