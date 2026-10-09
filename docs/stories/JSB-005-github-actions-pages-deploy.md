# JSB-005: GitHub Actions deployment to GitHub Pages

- **Status:** Blocked
- **Type:** Task
- **Priority:** High
- **Depends on:** JSB-002

## Description

As the owner, I want pushes to main to deploy automatically to GitHub Pages via GitHub Actions so that releases need no manual `npm run deploy` and the gh-pages branch is no longer needed.

## Acceptance Criteria

- [x] `.github/workflows/deploy.yml` triggers on push to `main` (and `workflow_dispatch`), uses `actions/checkout`, `actions/setup-node` (Node from `.nvmrc`, npm cache), `npm ci`, `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact` (path `dist`), `actions/deploy-pages`
- [x] Workflow permissions: `contents: read`, `pages: write`, `id-token: write`; `concurrency` group `pages` set; `github-pages` environment used
- [x] Action versions pinned to current major versions
- [ ] OWNER ACTION: repo Settings > Pages > Source set to "GitHub Actions" (cannot be done from code)
- [ ] Deploy runs green; live site https://anthonyflowers.github.io/js-browser/ loads, assets resolve under `/js-browser/`, a code cell bundles and previews
- [x] `gh-pages` devDependency and `predeploy`/`deploy` scripts removed from package.json (may be done in JSB-002; verify)
- [ ] After successful verification and owner confirmation, the `gh-pages` remote branch is deleted
- [x] `CLAUDE.md` Deployment section and `docs/architecture.md` updated

## Notes

Decision: ADR-002. Order matters: do not delete `gh-pages` until the Actions deployment is confirmed live. May be set to Blocked while waiting for the owner to change the Pages source.

### Status (2026-10-09)

Blocked: waiting on merge to `main` and the owner setting Pages source to "GitHub Actions". The `gh-pages` branch
deletion requires owner confirmation: Claude reports the live-site verification (and shows what is on `gh-pages`), then the owner confirms the deletion (ADR-010). Releases reach `main` through `dev` -> `main` PRs merged by the owner, so the first deploy happens when the owner merges the release PR.

- Workflow written and validated locally: YAML parses, `actionlint` 1.7.7 reports no issues, and
  `npm ci && npm run build` on Node 24.21.0 succeeds with `dist/index.html` using `/js-browser/` paths.
- Action majors confirmed via `git ls-remote --tags` on 2026-10-09: checkout v7, setup-node v7, configure-pages v6,
  upload-pages-artifact v5, deploy-pages v5.
- Verified `gh-pages` devDependency and `predeploy`/`deploy` scripts are absent from package.json and lockfile.
- `.nojekyll` not needed (artifact-based deploy).
