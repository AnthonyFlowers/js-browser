# Docs

| Path | Purpose |
|------|---------|
| `stories/` | Open stories (Todo / In Progress / Blocked). Template and index in `stories/README.md`. |
| `done/` | Completed stories (Status: Done). Moved here with `git mv`. |
| `architecture.md` | How the app works today, plus the planned target architecture. |
| `decisions.md` | ADR-style log of significant technical decisions. |

## Story lifecycle

1. **Create**: copy the template from `stories/README.md` to `stories/JSB-NNN-kebab-title.md` (next free ID),
   Status `Todo`, and add a row to the index.
2. **Start**: set Status to `In Progress`. Reference the ID in every commit message.
3. **Work**: tick Acceptance Criteria as they are met; use Notes for findings. Set `Blocked` (and say why in
   Notes) if waiting on something, e.g. an owner action in GitHub settings.
4. **Complete**: when all criteria are checked, set Status `Done`, `git mv` the file to `done/`, and update the
   index row (status and link).
5. **Decisions**: any significant technical choice made along the way gets an ADR in `decisions.md`.
   Update `architecture.md` if structure or data flow changed.

## Branching and release

Story work happens on a branch and is merged directly into `dev` once all local checks pass (no PR; CI runs on every
push to `dev`). Claude decides when a batch of stories is ready and opens the `dev` -> `main` release PR; before asking
the owner to merge, a fresh Opus subagent reviews it and its findings are addressed. The owner merges, and a merge to
`main` deploys to GitHub Pages. Never push directly to `main` (ADR-017, ADR-018). Branch deletions need owner
confirmation (ADR-010).

Current priority is the stability sweep (JSB-016 to JSB-020) before new features; see the index in `stories/README.md`.

IDs are never reused. Story files are never deleted.
