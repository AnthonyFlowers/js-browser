# Decisions

ADR-style log, one file per decision: `ADR-NNN-kebab-title.md`. Add a new file with the next number; never rewrite
history (supersede or amend with a new ADR instead, and link the related ADRs with relative links).

## Template

```markdown
# ADR-NNN: Title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded by ADR-NNN
- **Story:** JSB-NNN

**Context:** Why a decision is needed.

**Decision:** What we chose.

**Consequences:** Trade-offs, follow-up work.
```

## Index

- [ADR-001: Use Vite instead of Create React App](ADR-001-use-vite-instead-of-create-react-app.md)
- [ADR-002: Deploy to GitHub Pages with GitHub Actions](ADR-002-deploy-to-github-pages-with-github-actions.md)
- [ADR-003: Node 24 and npm](ADR-003-node-24-and-npm.md)
- [ADR-004: Upgrade esbuild-wasm to current and rewrite the bundler (full modernization)](ADR-004-upgrade-esbuild-wasm-to-current-and-rewrite-the-bundler-full-modernization.md)
- [ADR-005: ESLint, Prettier and Vitest, enforced in CI](ADR-005-eslint-prettier-and-vitest-enforced-in-ci.md)
- [ADR-006: MIT license](ADR-006-mit-license.md)
- [ADR-007: Story-based tracking in docs/](ADR-007-story-based-tracking-in-docs.md)
- [ADR-008: Per-model auto-compact windows in project settings](ADR-008-per-model-auto-compact-windows-in-project-settings.md)
- [ADR-009: Self-host esbuild.wasm via Vite `?url` and memoize `initialize`](ADR-009-self-host-esbuild-wasm-via-vite-url-and-memoize-initialize.md)
- [ADR-010: Branching model with long-lived `dev` and release PRs into `main`](ADR-010-branching-model-with-long-lived-dev-and-release-prs-into-main.md)
- [ADR-011: Bundle Monaco locally via Vite workers (no CDN loader)](ADR-011-bundle-monaco-locally-via-vite-workers-no-cdn-loader.md)
- [ADR-012: Migrate to Redux Toolkit as a separate story](ADR-012-migrate-to-redux-toolkit-as-a-separate-story.md)
- [ADR-013: Highlight JSX in Monaco with Shiki (TextMate) instead of monaco-jsx-highlighter](ADR-013-highlight-jsx-in-monaco-with-shiki-textmate-instead-of-monaco-jsx-highlighter.md)
- [ADR-014: React 19, Redux 5 and Prettier 3 with minimal code changes](ADR-014-react-19-redux-5-and-prettier-3-with-minimal-code-changes.md)
- [ADR-015: Persist with a listener middleware](ADR-015-persist-with-a-listener-middleware.md)
- [ADR-016: Typed hooks `useAppDispatch` / `useAppSelector` instead of `useActions`](ADR-016-typed-hooks-useappdispatch-useappselector-instead-of-useactions.md)
- [ADR-017: Merge story work into `dev` without PRs](ADR-017-merge-story-work-into-dev-without-prs.md)
- [ADR-018: Claude batches releases and has an Opus subagent review the release PR](ADR-018-claude-batches-releases-and-has-an-opus-subagent-review-the-release-pr.md)
- [ADR-019: Bounded fetches with retry, a bundle deadline and a best-effort cache](ADR-019-bounded-fetches-with-retry-a-bundle-deadline-and-a-best-effort-cache.md)
- [ADR-020: Folder as story status, one file per ADR, and Claude session tooling](ADR-020-folder-as-status-one-file-per-adr-and-claude-session-tooling.md)
- [ADR-021: Playwright end-to-end tests with fixture-routed unpkg](ADR-021-playwright-e2e-with-fixture-routed-unpkg.md)
- [ADR-022: Gherkin e2e scenarios with playwright-bdd (amends ADR-021)](ADR-022-gherkin-e2e-scenarios-with-playwright-bdd.md)
- [ADR-023: Save Book falls back to a Blob download on touch devices](ADR-023-save-book-falls-back-to-a-blob-download-on-touch-devices.md)
- [ADR-024: Import Monaco `editor.api` with selected contributions (amends ADR-011)](ADR-024-import-monaco-editor-api-with-selected-contributions.md)
