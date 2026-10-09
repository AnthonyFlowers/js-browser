# JSB-006: Add ESLint, Prettier, and Vitest with CI checks

- **Status:** Todo
- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-002

## Description

As a developer, I want linting, formatting and automated tests enforced in CI so that regressions and style drift are caught on every pull request.

## Acceptance Criteria

- [ ] ESLint flat config (`eslint.config.js`) with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (or equivalent); replaces the CRA `eslintConfig` block; the existing `// eslint-disable-next-line react-hooks/exhaustive-deps` in `code-cell.tsx` still valid or resolved
- [ ] Prettier config (`.prettierrc`) and `.prettierignore`; settings match existing style (double quotes, semicolons, 2 spaces); whole repo formatted in a dedicated commit
- [ ] `eslint-config-prettier` (or equivalent) so lint and format do not conflict
- [ ] Vitest configured (jsdom environment, `@testing-library/react` + jest-dom retained or trimmed); unused `@types/jest` removed
- [ ] Seed tests: `cellsReducer` (insert after/at start, update, delete, move up/down incl. boundaries, title, fetch/import complete), `bundlesReducer` (start/complete), `unpkgPathPlugin` path resolution (root `index.js`, relative `./` and `../` against unpkg `resolveDir`, bare package -> `https://unpkg.com/<name>`), and `fetchPlugin` entry-file/cache behaviour with mocked axios/localforage
- [ ] npm scripts: `lint`, `format`, `format:check`, `typecheck` (`tsc --noEmit`), `test`
- [ ] `.github/workflows/ci.yml` runs on pull requests and pushes to main: `npm ci`, lint, format:check, typecheck, test, build on Node 24
- [ ] CI is green on the PR; branch protection suggestion noted for the owner
- [ ] `CLAUDE.md` Commands section updated

## Notes

Decision: ADR-005. Bundler tests that need the real esbuild wasm are out of scope; test plugin callbacks directly with a fake `PluginBuild`.
