# ADR-020: Folder as story status, one file per ADR, and Claude session tooling

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-025

**Context:** The owner ran an efficiency review of their other project, ant-farm, and approved carrying over the
changes that cut wasted work in Claude Code sessions. Here the story Status field duplicated what the folder already
says and had to be edited in three places per transition; `decisions.md` was a single growing file that was costly to
read and edit; each cloud session started on Node 22 with no dependencies; and delegated agents had no shared rules.

**Decision:**
- A story's folder is its status (`docs/stories/` = open, `docs/done/` = done). The Status field and index column are
  removed; an optional `State:` line covers In Progress, Blocked or Deferred open stories.
- ADRs live one per file in `docs/decisions/ADR-NNN-kebab-title.md`, with a template and index in
  `docs/decisions/README.md`. Cross-references between ADRs are relative links. `docs/decisions.md` is removed.
- A `SessionStart` hook (`scripts/claude/session-start.sh`, registered in `.claude/settings.json`) puts the Node major
  from `.nvmrc` on `PATH` and runs `npm ci` when `node_modules` is missing. It never changes git config.
- Subagents are defined in `.claude/agents/` (`context-puller` on Haiku, `implementer` on Sonnet, `release-reviewer`
  on Opus), carrying the shared working rules. A project permission allowlist covers the routine gate and read-only git
  commands.

**Consequences:** One edit per story transition and small, targeted ADR reads. Sessions are ready to run the gates
immediately. Amends [ADR-007](ADR-007-story-based-tracking-in-docs.md) (tracking layout) and [ADR-018](ADR-018-claude-batches-releases-and-has-an-opus-subagent-review-the-release-pr.md) (reviewer is now the `release-reviewer` agent). Existing
links to `docs/decisions.md` were updated.
