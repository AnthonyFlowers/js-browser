# JSB-017: End-to-end tests in CI with Playwright

- **Type:** Task
- **Priority:** High
- **Depends on:** JSB-006

## Description

As the owner, I want browser-level tests of the core flows running in CI so that regressions in the editor, bundler and persistence are caught before a release.

Unit tests cover slices and plugins in isolation (Vitest, node environment); nothing exercises the real app, esbuild-wasm and the preview iframe together.

## Acceptance Criteria

- [ ] Playwright added as a dev dependency with a config that serves the production build (`npm run build` then `vite preview`, base `/js-browser/`) and runs Chromium
- [ ] All requests to `unpkg.com` are fulfilled by route interception with small fixture packages (e.g. a stub `react`, `react-dom/client`, a CSS file and a small helper module), so tests need no network
- [ ] Test: add a code cell, type code that calls `show()`, and see the output inside the preview iframe
- [ ] Test: JSX cell renders through `show(<Component />)` and a text cell can be edited and re-rendered as markdown
- [ ] Test: a bare npm import resolves through the mocked unpkg and renders; a failing import shows the bundling error in the preview
- [ ] Test: move up/down and delete a cell via the action bar; cumulative scope follows the new order
- [ ] Test: reload the page and the book (cells and title) is restored from IndexedDB
- [ ] Test: load a `.book` file through Load Book and its cells appear
- [ ] `.github/workflows/ci.yml` runs the e2e job (installs browsers, uploads the Playwright report on failure) and it is green on `dev`
- [ ] `npm run test:e2e` script added; CLAUDE.md commands and tech stack, README scripts table and `docs/architecture.md` updated; ADR recorded for the choice of Playwright

## Notes

Part of the stability sweep. Fixture routing also gives a deterministic way to simulate slow or stalled unpkg responses for JSB-018 and JSB-016. Monaco is lazy loaded, so tests should wait for the editor before typing. Phone-sized viewport checks can be added once JSB-019 lands.
