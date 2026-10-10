# ADR-002: Deploy to GitHub Pages with GitHub Actions

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-005

**Context:** Deployment is manual (`npm run deploy` via the `gh-pages` package pushing to the `gh-pages` branch),
so it depends on one machine and is easy to forget.

**Decision:** A workflow on push to `main` builds and deploys with `actions/upload-pages-artifact` and
`actions/deploy-pages`. The `gh-pages` package and branch become obsolete and are removed.

**Consequences:** Reproducible deploys from CI. The owner must set Pages source to "GitHub Actions" in repo
settings. The `gh-pages` branch must only be deleted after the new deployment is verified live.
