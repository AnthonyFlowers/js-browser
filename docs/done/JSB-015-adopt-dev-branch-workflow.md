# JSB-015: Adopt dev branch workflow

- **Type:** Chore
- **Priority:** Medium
- **Depends on:** none

## Description

As the owner, I want a long-lived `dev` branch for in-progress work and release PRs into `main` so that `main` (which deploys to GitHub Pages) only changes through reviewed releases.

## Acceptance Criteria

- [x] `dev` branch created on origin from `main`
- [x] `CLAUDE.md` Workflow rules describe the branching model (replaces "do not push to main directly")
- [x] `docs/README.md`, `docs/decisions/` (ADR-010) updated
- [x] Story index updated

## Notes

Decision: ADR-010. Story/feature branches open PRs into `dev` and are merged once CI is green. Releases are `dev` -> `main` PRs, opened by Claude and merged by the owner; a merge to `main` deploys to GitHub Pages. Nobody pushes directly to `main` or `dev`. Branch deletions (e.g. `gh-pages`, `local-serve`) need explicit owner confirmation (JSB-005, JSB-008).

Follow-ups: ADR-017 dropped PRs into `dev`; ADR-018 added Opus review of the release PR.
