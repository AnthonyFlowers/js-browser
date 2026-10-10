# ADR-008: Per-model auto-compact windows in project settings

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-013

**Context:** Long sessions benefit from model-specific auto-compaction: a small window suits Haiku (context-pulling
tasks) while Opus can keep much more context. Claude Code supports `modelSettings.<model>.autoCompactWindow`.

**Decision:** Commit `.claude/settings.json` with `autoCompactWindow` of 100000 for `claude-haiku-5-5` and 600000
for `claude-opus-5-5`. Values are capped at the model's context window (both have 1M).

**Consequences:** Consistent compaction behaviour for anyone using the repo, if honored. Unverified: the docs only
show `modelSettings` written to user settings via `/autocompact`, so project-file scope and the exact model-key
format are undocumented; whether it applies to subagents is unknown (subagent frontmatter cannot set compaction).
If project-level settings are ignored, fall back to user-level `/autocompact` per model. Verification is tracked in
JSB-013.
