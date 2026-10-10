# ADR-017: Merge story work into `dev` without PRs

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-015

**Context:** PRs into `dev` added a round trip per story without a reviewer in the loop; CI already runs on every push
to `dev`.

**Decision:** Story branches are merged directly into `dev` and pushed once lint, format check, typecheck, tests and
build pass locally. `dev` -> `main` release PRs remain, opened by Claude and merged by the owner. Amends [ADR-010](ADR-010-branching-model-with-long-lived-dev-and-release-prs-into-main.md).

**Consequences:** Faster integration; a red CI run on `dev` must be fixed immediately since there is no PR gate.
