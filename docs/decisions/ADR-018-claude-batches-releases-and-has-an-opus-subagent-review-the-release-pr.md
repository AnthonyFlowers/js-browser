# ADR-018: Claude batches releases and has an Opus subagent review the release PR

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-015

**Context:** [ADR-017](ADR-017-merge-story-work-into-dev-without-prs.md) removed PRs into `dev`, so the release PR is the only review gate before a deploy. The owner
wants releases to arrive already reviewed.

**Decision:** Work proceeds story by story, merged into `dev`. Claude decides when a batch is ready and opens the
`dev` -> `main` release PR. Before asking the owner to merge, Claude has a fresh Opus subagent review the release PR
and addresses its findings. The owner merges. Amends [ADR-017](ADR-017-merge-story-work-into-dev-without-prs.md).

**Consequences:** Every release gets an independent review without the owner reading each diff first; the owner keeps
the final merge decision. Release timing is Claude's call, not a fixed cadence.
