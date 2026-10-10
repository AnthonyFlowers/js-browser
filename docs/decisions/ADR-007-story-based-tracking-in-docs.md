# ADR-007: Story-based tracking in docs/

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-001

**Context:** The refresh spans many changes that should be traceable, and Claude Code sessions need durable context.

**Decision:** Track all work as Jira-style stories (`JSB-NNN`) in `docs/stories/`, move completed ones to
`docs/done/`, reference IDs in commit messages, and keep `docs/architecture.md` and `docs/decisions.md` current.
Rules are summarised in `CLAUDE.md`.

**Consequences:** Small documentation overhead per change; clear history and status in-repo without an external tracker.
