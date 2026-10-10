# JSB-025: Workflow efficiency for Claude Code sessions

- **Type:** Chore
- **Priority:** High
- **Depends on:** none

## Description

As the owner, I want Claude Code sessions to start ready to run the gates and to spend fewer tokens on bookkeeping so that stories move faster. The items come from the owner's efficiency review of their other project, ant-farm.

## Acceptance Criteria

- [x] SessionStart hook (`scripts/claude/session-start.sh`) registered in `.claude/settings.json` (300 s timeout, `modelSettings` kept); idempotent, no git config changes
- [x] Subagents `context-puller` (Haiku), `implementer` (Sonnet), `release-reviewer` (Opus) in `.claude/agents/`
- [x] `CLAUDE.md` Gotchas section and workflow rules updated (agents, subagents commit, fresh Sonnet fixer)
- [x] Permission allowlist for the gates and read-only git commands in `.claude/settings.json`
- [x] Folder = status: Status field and index column removed; `State:` line only where needed; lifecycle docs updated
- [x] One file per ADR in `docs/decisions/` with README (template and index); `docs/decisions.md` removed and all references updated
- [x] `test-results/` and `playwright-report/` ignored
- [x] ADR-020 recorded; stability priority line reordered (JSB-017, then JSB-019, JSB-020)
- [x] Gates pass on Node 24; settings JSON valid; no broken relative links in docs

## Notes

Decision: [ADR-020](../decisions/ADR-020-folder-as-status-one-file-per-adr-and-claude-session-tooling.md). The hook was tested with a temporary `CLAUDE_ENV_FILE`: output `node v24.21.0, deps ready`, one deduplicated `export PATH` line on repeated runs.
