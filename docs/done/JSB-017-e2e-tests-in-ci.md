# JSB-017: End-to-end tests in CI with Playwright

- **Type:** Task
- **Priority:** High
- **Depends on:** JSB-006

## Description

As the owner, I want browser-level tests of the core flows running in CI so that regressions in the editor, bundler and persistence are caught before a release.

Unit tests cover slices and plugins in isolation (Vitest, node environment); nothing exercises the real app, esbuild-wasm and the preview iframe together.

## Acceptance Criteria

- [x] Playwright added as a dev dependency with a config that serves the production build (`npm run build` then `vite preview`, base `/js-browser/`) and runs Chromium
- [x] All requests to `unpkg.com` are fulfilled by route interception with small fixture packages (e.g. a stub `react`, `react-dom/client`, a CSS file and a small helper module), so tests need no network
- [x] Test: add a code cell, type code that calls `show()`, and see the output inside the preview iframe
- [x] Test: JSX cell renders through `show(<Component />)` and a text cell can be edited and re-rendered as markdown
- [x] Test: a bare npm import resolves through the mocked unpkg and renders; a failing import shows the bundling error in the preview
- [x] Test: move up/down and delete a cell via the action bar; cumulative scope follows the new order
- [x] Test: reload the page and the book (cells and title) is restored from IndexedDB
- [x] Test: load a `.book` file through Load Book and its cells appear
- [x] `.github/workflows/ci.yml` runs the e2e job (installs browsers, uploads the Playwright report on failure) and it is green on `dev`
- [x] `npm run test:e2e` script added; CLAUDE.md commands and tech stack, README scripts table and `docs/architecture.md` updated; ADR recorded for the choice of Playwright

## Notes

Part of the stability sweep. Fixture routing also gives a deterministic way to simulate slow or stalled unpkg responses for JSB-018 and JSB-016. Monaco is lazy loaded, so tests should wait for the editor before typing. Phone-sized viewport checks can be added once JSB-019 lands.

### Outcome

- Suite: `e2e/notebook.spec.ts` (7 tests), helpers `e2e/app.ts`, router `e2e/mock-unpkg.ts`, fixtures `e2e/fixtures/`. See ADR-021 and `docs/architecture.md`.
- The stalled-package test reproduces JSB-016/018 by capping the XHR timeout (`requestTimeoutMs`), so the 3 attempts finish in seconds with the app unchanged.
- Local run: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`. The CI criterion is met by the `e2e` job (validated with actionlint); confirm it is green on `dev` after the first push.
- Observed, not fixed: the Book Title input is `disabled` and keeps its initial state, so after Load Book it still shows the old title (and its 1 s debounce dispatches `updateTitle` with it). The tests therefore assert the title only after a reload of the default book.
