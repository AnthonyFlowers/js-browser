# JSB-005: GitHub Actions deployment to GitHub Pages

- **Status:** Todo
- **Type:** Task
- **Priority:** High
- **Depends on:** JSB-002

## Description

As the owner, I want pushes to main to deploy automatically to GitHub Pages via GitHub Actions so that releases need no manual `npm run deploy` and the gh-pages branch is no longer needed.

## Acceptance Criteria

- [ ] `.github/workflows/deploy.yml` triggers on push to `main` (and `workflow_dispatch`), uses `actions/checkout`, `actions/setup-node` (Node from `.nvmrc`, npm cache), `npm ci`, `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact` (path `dist`), `actions/deploy-pages`
- [ ] Workflow permissions: `contents: read`, `pages: write`, `id-token: write`; `concurrency` group `pages` set; `github-pages` environment used
- [ ] Action versions pinned to current major versions
- [ ] OWNER ACTION: repo Settings > Pages > Source set to "GitHub Actions" (cannot be done from code)
- [ ] Deploy runs green; live site https://anthonyflowers.github.io/js-browser/ loads, assets resolve under `/js-browser/`, a code cell bundles and previews
- [ ] `gh-pages` devDependency and `predeploy`/`deploy` scripts removed from package.json (may be done in JSB-002; verify)
- [ ] After successful verification and owner confirmation, the `gh-pages` remote branch is deleted
- [ ] `CLAUDE.md` Deployment section and `docs/architecture.md` updated

## Notes

Decision: ADR-002. Order matters: do not delete `gh-pages` until the Actions deployment is confirmed live. May be set to Blocked while waiting for the owner to change the Pages source.
