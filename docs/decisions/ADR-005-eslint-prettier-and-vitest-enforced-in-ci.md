# ADR-005: ESLint, Prettier and Vitest, enforced in CI

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-006

**Context:** No tests, lint or format configuration, and no CI exist.

**Decision:** Add ESLint (flat config, typescript-eslint, react-hooks), Prettier and Vitest; run lint, format check,
typecheck, test and build in a GitHub Actions workflow on pull requests (to `dev` and `main`) and pushes to `dev` (see [ADR-010](ADR-010-branching-model-with-long-lived-dev-and-release-prs-into-main.md)). Seed tests cover
reducers and the bundler plugins' path resolution.

**Consequences:** Consistent style and a regression safety net; one-off repo-wide format commit; small ongoing
maintenance of tooling.
