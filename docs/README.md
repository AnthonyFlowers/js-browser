# Docs

| Path | Purpose |
|------|---------|
| `stories/` | Open stories (Todo, In Progress, Blocked, Deferred). Template and index in `stories/README.md`. |
| `done/` | Completed stories. Moved here with `git mv`. |
| `architecture.md` | How the app works today, plus the planned target architecture. |
| `decisions/` | One ADR per file (`ADR-NNN-kebab-title.md`); template and index in `decisions/README.md`. |

## Story lifecycle

A story's folder is its status: `stories/` = open, `done/` = done. There is no Status field.

1. **Create**: copy the template from `stories/README.md` to `stories/JSB-NNN-kebab-title.md` (next free ID) and add a
   row to the index.
2. **Work**: reference the ID in every commit message and tick Acceptance Criteria as they are met; use Notes for
   findings. If the story is In Progress across sessions, Blocked or Deferred, keep one `State:` line under the title
   metadata saying so and why (remove it when it no longer applies).
3. **Complete**: when all criteria are checked, `git mv` the file to `done/`, drop any `State:` line, and update the
   index link.
4. **Decisions**: any significant technical choice made along the way gets an ADR file in `decisions/` (add it to the
   index in `decisions/README.md`). Update `architecture.md` if structure or data flow changed.

## Branching and release

Story work happens on a branch and is merged directly into `dev` once all local checks pass (no PR; CI runs on every
push to `dev`). Claude decides when a batch of stories is ready and opens the `dev` -> `main` release PR; before asking
the owner to merge, a fresh Opus subagent reviews it and its findings are addressed. The owner merges, and a merge to
`main` deploys to GitHub Pages. Never push directly to `main` (ADR-017, ADR-018). Branch deletions need owner
confirmation (ADR-010).

Current priority is the stability sweep (JSB-016 to JSB-020) before new features; see the index in `stories/README.md`.

IDs are never reused. Story files are never deleted.
