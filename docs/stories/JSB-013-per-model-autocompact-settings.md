# JSB-013: Per-model auto-compact settings

- **Status:** In Progress
- **Type:** Chore
- **Priority:** Low
- **Depends on:** none

## Description

As the repo owner, I want Claude Code auto-compaction configured per model for this project so that Haiku 5.5
compacts at 100k tokens and Opus 5.5 at 600k tokens.

Configured via `modelSettings.<model>.autoCompactWindow` in `.claude/settings.json`.

## Acceptance Criteria

- [x] `.claude/settings.json` added with the values (Haiku 5.5: 100000, Opus 5.5: 600000)
- [ ] Owner verifies in a session (e.g. `/status` or `/context`) that the window applies for Haiku and Opus
- [ ] Confirm whether it applies to subagents
- [ ] If project-level `modelSettings` is not honored, fall back to user-level `/autocompact` per model and record that here

## Notes

- Docs: https://code.claude.com/docs/en/settings-reference.md#autocompactwindow and
  https://code.claude.com/docs/en/model-config.md#set-the-auto-compact-window
- Caveats:
  - The docs only show `modelSettings` being written to user settings via `/autocompact`; project-file scope and
    the exact model-key format (`claude-haiku-5-5`, `claude-opus-5-5`) are undocumented.
  - Subagent frontmatter cannot set compaction.
  - Values are capped at the model's context window (both models have 1M windows, so both values are within range).
- Decision: see ADR-008 in `docs/decisions.md`.
