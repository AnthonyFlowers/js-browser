# JSB-001: Add CLAUDE.md and docs/story tracking structure

- **Type:** Chore
- **Priority:** High
- **Depends on:** none

## Description

As a maintainer, I want a CLAUDE.md and a docs/ structure for stories, architecture and decisions so that
all refresh work is tracked consistently and Claude Code sessions start with accurate context.

## Acceptance Criteria

- [x] `CLAUDE.md` at repo root covering overview, stack, commands, layout, pipeline, deployment, conventions, workflow rules
- [x] `docs/README.md` explaining layout and story lifecycle
- [x] `docs/stories/README.md` with template and index of all stories
- [x] Stories JSB-002 to JSB-012 created from the refresh interview
- [x] `docs/done/README.md`
- [x] `docs/architecture.md` describing current and target architecture
- [x] `docs/decisions.md` (since split into `docs/decisions/`) with ADR-001 onward

## Notes

Documentation only; no source, package.json or config changes. Not yet committed.
