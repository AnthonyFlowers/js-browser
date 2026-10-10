# JSB-008: Delete obsolete local-serve remote branch

- **Type:** Chore
- **Priority:** Low
- **Depends on:** none
- **State:** Deferred by owner (tag, then delete, run by the owner)

## Description

As the owner, I want the unused `local-serve` remote branch removed so that the repository only contains branches that serve a purpose.

## Acceptance Criteria

- [ ] Contents of `origin/local-serve` inspected (`git log main..origin/local-serve`, diff vs. main) and summarised in Notes
- [ ] Owner confirms nothing on the branch needs to be kept or merged
- [ ] Branch deleted from the remote (`git push origin --delete local-serve`) by or with the owner's explicit approval
- [ ] Any valuable content salvaged into a new story or commit before deletion

## Notes

Purpose of the branch is unknown. Not visible in the local clone's remote refs when this story was written (only `main` and the working branch), so fetch first. Do not delete without owner confirmation: Claude shows the owner what is on the branch (commit list and diff vs. `main`) first, and the owner confirms the deletion explicitly (ADR-010). The `dev` branch now exists, so also check whether anything should go there instead.

### Status (2026-10-10)

Deferred by the owner. Investigation: `local-serve` (3 commits, Feb 2023, tip `df23387`) is an earlier variant of the app packaged as `@jsnote-ant/local-client` that saved cells to a `/cells` HTTP server (not in the repo); `main` supersedes it. Owner chose tag-then-delete. The session cannot push tags or delete branches, so the owner will run:

```sh
git push origin df23387450fd210c90878b403b04d4d37ee8c7b0:refs/tags/archive/local-serve
git push origin --delete local-serve
```
