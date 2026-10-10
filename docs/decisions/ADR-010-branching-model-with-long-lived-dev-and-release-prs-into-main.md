# ADR-010: Branching model with long-lived `dev` and release PRs into `main`

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-015

**Context:** A merge to `main` deploys to GitHub Pages, so `main` should only change deliberately. Work was previously
committed on a single working branch.

**Amended by [ADR-017](ADR-017-merge-story-work-into-dev-without-prs.md)** (story work merges into `dev` without a PR).

**Decision:** `dev` is a long-lived branch holding in-progress work (created from `main`). Story/feature branches open
PRs into `dev` and are merged once CI is green. Releases are `dev` -> `main` PRs, opened by Claude and merged by the
owner; the merge deploys to GitHub Pages. Nobody pushes directly to `main` or `dev`. Deleting branches (`gh-pages`,
`local-serve`) requires explicit owner confirmation after Claude shows what is on them.

**Consequences:** CI (JSB-006) must run on PRs into `dev` and `main`. Releases are batched and owner-gated. Slightly more
PR overhead per story.
