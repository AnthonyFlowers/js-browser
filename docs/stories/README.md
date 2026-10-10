# Stories

Jira-style tracking. One Markdown file per story, named `JSB-NNN-kebab-title.md`. Open stories live in this
directory; completed ones are moved to `../done/`. See `../README.md` for the lifecycle.

## Template

```markdown
# JSB-NNN: Title

- **Status:** Todo | In Progress | Blocked | Deferred | Done
- **Type:** Story | Task | Bug | Chore
- **Priority:** High | Medium | Low
- **Depends on:** JSB-NNN, ... (or none)

## Description

As a <role>, I want <capability> so that <benefit>.

(Optional extra context.)

## Acceptance Criteria

- [ ] Concrete, verifiable criterion

## Notes

Findings, decisions (link ADRs), blockers, owner actions.
```

## Index

| ID | Title | Status | Location |
|----|-------|--------|----------|
| JSB-001 | Add CLAUDE.md and docs/story tracking structure | Done | [done/JSB-001](../done/JSB-001-add-claude-md-and-story-tracking.md) |
| JSB-002 | Migrate build from CRA 4 to Vite | Done | [done/JSB-002](../done/JSB-002-migrate-cra-to-vite.md) |
| JSB-003 | Upgrade esbuild-wasm and rewrite bundler | Done | [done/JSB-003](../done/JSB-003-upgrade-esbuild-wasm-rewrite-bundler.md) |
| JSB-004 | Upgrade editor and UI dependencies | Done | [done/JSB-004](../done/JSB-004-upgrade-editor-and-ui-dependencies.md) |
| JSB-005 | GitHub Actions deployment to GitHub Pages | In Progress | [JSB-005](JSB-005-github-actions-pages-deploy.md) |
| JSB-006 | Add ESLint, Prettier, and Vitest with CI checks | Done | [done/JSB-006](../done/JSB-006-eslint-prettier-vitest-ci.md) |
| JSB-007 | Remove stale files and code; refresh README | Done | [done/JSB-007](../done/JSB-007-remove-stale-code-refresh-readme.md) |
| JSB-008 | Delete obsolete `local-serve` remote branch | Deferred | [JSB-008](JSB-008-delete-local-serve-branch.md) |
| JSB-009 | Add MIT LICENSE | Done | [done/JSB-009](../done/JSB-009-add-mit-license.md) |
| JSB-010 | Switch between named local books (picker and rename) | Todo | [JSB-010](JSB-010-switch-named-local-books.md) |
| JSB-011 | Save an individual cell as a file | Todo | [JSB-011](JSB-011-save-cell-as-file.md) |
| JSB-012 | Add CSS cell type (cumulative) | Todo | [JSB-012](JSB-012-css-cell-type.md) |
| JSB-013 | Per-model auto-compact settings | In Progress | [JSB-013](JSB-013-per-model-autocompact-settings.md) |
| JSB-014 | Migrate state to Redux Toolkit | Done | [done/JSB-014](../done/JSB-014-migrate-state-to-redux-toolkit.md) |
| JSB-015 | Adopt dev branch workflow | Done | [done/JSB-015](../done/JSB-015-adopt-dev-branch-workflow.md) |
| JSB-016 | Code cell preview sometimes stays on the loading bar (depends on JSB-018) | Todo | [JSB-016](JSB-016-preview-stuck-on-loading-bar.md) |
| JSB-017 | End-to-end tests in CI with Playwright | Todo | [JSB-017](JSB-017-e2e-tests-in-ci.md) |
| JSB-018 | Timeouts, retries and clear errors for package fetches | Todo | [JSB-018](JSB-018-fetch-timeouts-retries-errors.md) |
| JSB-019 | Mobile layout pass | Todo | [JSB-019](JSB-019-mobile-layout-pass.md) |
| JSB-020 | Reduce bundle size (Monaco and other heavy dependencies) | Todo | [JSB-020](JSB-020-reduce-bundle-size.md) |
| JSB-021 | Share a book via URL | Todo | [JSB-021](JSB-021-share-book-via-url.md) |
| JSB-022 | TypeScript in code cells | Todo | [JSB-022](JSB-022-typescript-cells.md) |
| JSB-023 | Show console output in cell previews | Todo | [JSB-023](JSB-023-console-output-in-previews.md) |
| JSB-024 | Offline support and installable PWA | Todo | [JSB-024](JSB-024-offline-pwa.md) |

Priority order: the stability sweep (JSB-016 to JSB-020, High) comes first; JSB-010 to JSB-012 and JSB-021 to JSB-023 (Medium) and JSB-024 (Low) follow.
