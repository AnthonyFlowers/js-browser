# JSB-004: Upgrade editor and UI dependencies

- **Status:** Todo
- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002

## Description

As a developer, I want editor and UI libraries on current majors so that the app is maintainable, secure and works with Vite and React 18.

## Acceptance Criteria

- [ ] `@monaco-editor/react` upgraded to 4.x; `src/components/code-editor.tsx` migrated from the 3.x `editorDidMount(getValue, editor)` prop and `EditorDidMount` type to `onMount(editor, monaco)`; `window.monaco` usage removed
- [ ] `monaco-editor` upgraded to current and bundled locally via Vite (no CDN loader): `loader.config({ monaco })` from `@monaco-editor/react` with `import * as monaco from "monaco-editor"`, and `editor.worker`/`ts.worker` (and json/css/html as needed) imported with Vite's `?worker` suffix and registered on `self.MonacoEnvironment.getWorker`; verified in `npm run dev` and in the production build served from `/js-browser/` (note: the 3.x wrapper currently loads Monaco from a CDN)
- [ ] JSX highlighting: `monaco-jsx-highlighter@0.0.15` (+ `jscodeshift` 0.11, `declare module` in `src/types.d.ts`) either upgraded and verified working, or replaced (e.g. Monaco's built-in JS/JSX tokenization via language `javascript` with JSX enabled). Decision required: record as ADR
- [ ] Dark theme still applied (`theme="dark"` currently; verify valid theme name in 4.x, i.e. `vs-dark`) and `syntax.css` JSX classes still relevant
- [ ] Format button still works: prettier upgraded (current major, ESM plugin API: `prettier/standalone` + `prettier/plugins/babel` + `estree`) and `@types/prettier` removed
- [ ] `@uiw/react-md-editor` upgraded from 2.1.1 to current; `text-editor.tsx` (edit/preview toggle, click-outside handling, `MDEditor.Markdown`) verified; any required CSS import added
- [ ] `@fortawesome/fontawesome-free` upgraded (5 -> current); icons used (`fa-plus`, `fa-arrow-up`, `fa-arrow-down`, `fa-times`, `fa-upload`) still render, or class names updated
- [ ] `bulmaswatch` (^0.8.1, Bulma 0.9-era theme "superhero") checked: still works with current setup, or an alternative is chosen; visual check of buttons, inputs, cards, progress
- [ ] `axios` (^1.3.2) bumped to current; `react-resizable`, `localforage`, `streamsaver`, `immer`, `react`, `react-dom`, `react-redux` bumped to current compatible versions
- [x] Redux Toolkit: decided to adopt it as a separate story, JSB-014 (ADR-012); this story keeps the hand-written `createStore` + thunk + immer state layer, but moves off deprecated imports where the upgraded `redux`/`redux-thunk` require it (e.g. `legacy_createStore`, `redux-thunk` named export)
- [ ] `npm run build` and `tsc --noEmit` pass; manual smoke test of code cell, text cell, resize, move/delete, save/load book
- [ ] `docs/architecture.md` and `CLAUDE.md` updated

## Notes

Decisions: Monaco is bundled locally via Vite workers with no CDN loader, matching the self-hosted esbuild wasm (ADR-011). Redux Toolkit migration is JSB-014 (ADR-012). `ActionButto` (typo) in `src/components/action-button.tsx` can be fixed here or in JSB-007.
