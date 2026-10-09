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

Story work happens on a branch that opens a PR into `dev` and is merged once CI is green. Releases are `dev` -> `main`
PRs, opened by Claude and merged by the owner; a merge to `main` deploys to GitHub Pages. Never push directly to `main`
or `dev`. Branch deletions need owner confirmation (ADR-010).

IDs are never reused. Story files are never deleted.
