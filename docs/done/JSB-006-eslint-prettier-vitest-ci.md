# JSB-006: Add ESLint, Prettier, and Vitest with CI checks

- **Status:** Done
- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002

## Description

As a developer, I want linting, formatting and automated tests enforced in CI so that regressions and style drift are caught on every pull request.

## Acceptance Criteria

- [x] ESLint flat config (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (or equivalent); replaces the CRA `eslintConfig` block (already gone from package.json after JSB-002); the existing `// eslint-disable-next-line react-hooks/exhaustive-deps` in `code-cell.tsx` is still valid (no unused-directive warning)
- [x] Prettier config (`.prettierrc`) and `.prettierignore`; settings match existing style (double quotes, semicolons, 2 spaces); whole repo formatted (the existing source already conformed to Prettier 2 defaults, so no repo-wide reformat was needed; Markdown is ignored)
- [x] `eslint-config-prettier` (or equivalent) so lint and format do not conflict
- [x] Vitest configured (node environment, which is enough for these tests; jsdom and `@testing-library/react` are not needed yet); no `@types/jest` was present
- [x] Seed tests: `cellsReducer` (insert after/at start/at end, update, delete, move up/down incl. boundaries, title, fetch/import complete and errors), `bundlesReducer` (start/complete), `unpkgPathPlugin` path resolution (root `index.js`, relative `./` and `../` against unpkg `resolveDir`, bare package -> `https://unpkg.com/<name>`), and `fetchPlugin` entry-file/cache behaviour with mocked axios/localforage
- [x] npm scripts: `lint`, `format`, `format:check`, `typecheck` (`tsc --noEmit`), `test`
- [x] `.github/workflows/ci.yml` runs on pull requests (to `dev` and `main`) and pushes to `dev`: `npm ci`, lint, format:check, typecheck, test, build on Node from `.nvmrc` (24)
- [x] CI commands all pass locally on Node 24.21.0 and `ci.yml` passes actionlint 1.7.7; first remote run happens on the PR into `dev`; branch protection suggestion noted for the owner (see Notes)
- [x] `CLAUDE.md` Commands section updated

## Notes

Decision: ADR-005. Bundler tests that need the real esbuild wasm are out of scope; plugin callbacks are tested directly with a fake `PluginBuild`. Tests live next to their sources as `src/**/*.test.ts` (documented in `CLAUDE.md`).

Versions: eslint 10.12.0, @eslint/js 10.0.1, typescript-eslint 8.71.1, eslint-plugin-react-hooks 7.1.1, eslint-plugin-react-refresh 0.5.7, eslint-config-prettier 10.1.8, globals 17.13.0, vitest 5.0.3, prettier 2.8.8 (unchanged major).

Prettier conflict: `prettier` is also a runtime dependency (the editor's Format button uses `prettier` + `prettier/parser-babel`, the v2 API, which does not exist in Prettier 3). A second copy under another name would clash on the `prettier` bin, so the dev tooling uses the same Prettier 2.8.x. Lint/format and the Format button therefore share one version. JSB-004 upgrades Prettier to the ESM plugin API; at that point the tool and runtime stay on one version, and `.prettierrc` should be checked against the new defaults (v3 changed `trailingComma` to `all`, so keep it set to `es5` explicitly, which it already is).

Other changes: `"type": "module"` added to package.json (avoids the Node `MODULE_TYPELESS_PACKAGE_JSON` warning for `eslint.config.js`); `vite.config.ts` imports `defineConfig` from `vitest/config` and holds the `test` block.

Lint fixes made (behaviour-preserving, minimal), some of which overlap JSB-007 and need not be repeated there: unused `useState` import in `App.tsx`; unused event parameter in `book-importer.tsx`; `Function` -> `() => void` in `action-button.tsx`; `Boolean` -> `boolean` in `top-menu.tsx`; `let` -> `const` in `use-cumulative-code.ts` and `fetchCellsCreator.ts`; block-scoped `case` declarations in `cellsReducer.ts`; `any` timers typed as `ReturnType<typeof setTimeout>`; `Preview` iframe ref typed as `HTMLIFrameElement`. Left for JSB-004 (that file is rewritten there): `useRef<any>` with an eslint-disable comment and `@ts-ignore` -> `@ts-expect-error` for `window.monaco` in `code-editor.tsx`.

Owner suggestion: after the first green CI run, enable branch protection on `dev` and `main` requiring the `check` status (job in `ci.yml`) before merge.
