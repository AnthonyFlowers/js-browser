# JSB-004: Upgrade editor and UI dependencies

- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002

## Description

As a developer, I want editor and UI libraries on current majors so that the app is maintainable, secure and works with Vite and React 18.

## Acceptance Criteria

- [x] `@monaco-editor/react` upgraded to 4.x; `src/components/code-editor.tsx` migrated from the 3.x `editorDidMount(getValue, editor)` prop and `EditorDidMount` type to `onMount(editor, monaco)`; `window.monaco` usage removed
- [x] `monaco-editor` upgraded to current and bundled locally via Vite (no CDN loader): `loader.config({ monaco })` from `@monaco-editor/react` with `import * as monaco from "monaco-editor"`, and `editor.worker`/`ts.worker` (and json/css/html as needed) imported with Vite's `?worker` suffix and registered on `self.MonacoEnvironment.getWorker`; verified in `npm run dev` and in the production build served from `/js-browser/` (note: the 3.x wrapper currently loads Monaco from a CDN)
- [x] JSX highlighting: `monaco-jsx-highlighter@0.0.15` (+ `jscodeshift` 0.11, `declare module` in `src/types.d.ts`) either upgraded and verified working, or replaced (e.g. Monaco's built-in JS/JSX tokenization via language `javascript` with JSX enabled). Decision required: record as ADR
- [x] Dark theme still applied (`theme="dark"` currently; verify valid theme name in 4.x, i.e. `vs-dark`) and `syntax.css` JSX classes still relevant
- [x] Format button still works: prettier upgraded (current major, ESM plugin API: `prettier/standalone` + `prettier/plugins/babel` + `estree`) and `@types/prettier` removed
- [x] `@uiw/react-md-editor` upgraded from 2.1.1 to current; `text-editor.tsx` (edit/preview toggle, click-outside handling, `MDEditor.Markdown`) verified; any required CSS import added
- [x] `@fortawesome/fontawesome-free` upgraded (5 -> current); icons used (`fa-plus`, `fa-arrow-up`, `fa-arrow-down`, `fa-times`, `fa-upload`) still render, or class names updated
- [x] `bulmaswatch` 0.8.1 (latest; Bulma 0.9-era theme "superhero") checked: still works, visual check of buttons, inputs, cards, progress via screenshots
- [x] `axios` (^1.3.2) bumped to current; `react-resizable`, `localforage`, `streamsaver`, `immer`, `react`, `react-dom`, `react-redux` bumped to current compatible versions
- [x] Redux Toolkit: decided to adopt it as a separate story, JSB-014 (ADR-012); this story keeps the hand-written `createStore` + thunk + immer state layer, but moves off deprecated imports where the upgraded `redux`/`redux-thunk` require it (e.g. `legacy_createStore`, `redux-thunk` named export)
- [x] `npm run build` and `tsc --noEmit` pass; manual smoke test of code cell, text cell, resize, move/delete, save/load book
- [x] `docs/architecture.md` and `CLAUDE.md` updated

## Notes

Decisions: Monaco is bundled locally via Vite workers with no CDN loader, matching the self-hosted esbuild wasm (ADR-011). Redux Toolkit migration is JSB-014 (ADR-012). `ActionButto` (typo) in `src/components/action-button.tsx` can be fixed here or in JSB-007.

Done. Versions (before -> after): @monaco-editor/react 3.7.5 -> 4.7.0, monaco-editor 0.34.1 -> 0.57.0, @uiw/react-md-editor 2.1.1 -> 4.1.2,
prettier 2.8 -> 3.9.9, react/react-dom 18.2 -> 19.3.0 (all deps support 19), react-redux 8.0.5 -> 9.3.0, redux 4.2.1 -> 5.0.1,
redux-thunk 2.3.0 -> 3.1.0, immer 9 -> 11.1.21, axios 1.3 -> 1.20.0, react-resizable 3.0.4 -> 4.0.2 (ships its own types; `@types/react-resizable` removed),
@fortawesome/fontawesome-free 5.15 -> 7.3.1 (icon class names unchanged, verified rendering), @types/react(-dom) 18 -> 19.
localforage 1.10.0, streamsaver 2.0.6 and bulmaswatch 0.8.1 were already current. Removed: jscodeshift, monaco-jsx-highlighter, assert, lodash, `@types/jscodeshift`, `@types/prettier`, `syntax.css`, `src/types.d.ts`, package.json `overrides`. TypeScript stays 5.9 (typescript-eslint support).

Decisions: JSX highlighting via Shiki (ADR-013); React 19/Redux 5/Prettier 3 (ADR-014). Other changes: the editor is `React.lazy`-loaded (main chunk 3.7 MB -> 1.5 MB; Monaco in its own chunks);
`vite.config.ts` `define.global` removed (only jscodeshift needed it); preview `show()` uses `createRoot` (unpkg `react-dom@latest` has no `render`); react-redux 9 selector warnings fixed.
`npm audit`: 10 (7 moderate, 3 high) -> 2 low (monaco-editor 0.57 bundles a vulnerable dompurify; no fixed monaco release yet).
Verified with Chromium/Playwright on dev and the preview build: no requests to jsDelivr (only Google Fonts from the bulmaswatch CSS), editor and ts workers start, JSX tokens are colored, Format works, markdown edit/render, `show(<h1>)` preview, resize (both axes), reload persistence and book import. "Save Book" (streamsaver, needs an external service worker host) was not exercised.
