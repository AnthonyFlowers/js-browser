# Stories

Jira-style tracking. One Markdown file per story, named `JSB-NNN-kebab-title.md`. Open stories live in this
directory; completed ones are moved to `../done/`. See `../README.md` for the lifecycle.

## Template

```markdown
# JSB-NNN: Title

- **Status:** Todo | In Progress | Blocked | Done
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
| JSB-004 | Upgrade editor and UI dependencies | Todo | [JSB-004](JSB-004-upgrade-editor-and-ui-dependencies.md) |
| JSB-005 | GitHub Actions deployment to GitHub Pages | Blocked | [JSB-005](JSB-005-github-actions-pages-deploy.md) |
| JSB-006 | Add ESLint, Prettier, and Vitest with CI checks | Todo | [JSB-006](JSB-006-eslint-prettier-vitest-ci.md) |
| JSB-007 | Remove stale files and code; refresh README | Todo | [JSB-007](JSB-007-remove-stale-code-refresh-readme.md) |
| JSB-008 | Delete obsolete `local-serve` remote branch | Todo | [JSB-008](JSB-008-delete-local-serve-branch.md) |
| JSB-009 | Add MIT LICENSE | Todo | [JSB-009](JSB-009-add-mit-license.md) |
| JSB-010 | Switch between named local books | Todo | [JSB-010](JSB-010-switch-named-local-books.md) |
| JSB-011 | Save an individual cell as a file | Todo | [JSB-011](JSB-011-save-cell-as-file.md) |
| JSB-012 | Add CSS cell type | Todo | [JSB-012](JSB-012-css-cell-type.md) |
| JSB-013 | Per-model auto-compact settings | In Progress | [JSB-013](JSB-013-per-model-autocompact-settings.md) |
