# JSB-008: Delete obsolete local-serve remote branch

- **Status:** Todo
- **Type:** Chore
- **Priority:** Low
- **Depends on:** none

## Description

As the owner, I want the unused `local-serve` remote branch removed so that the repository only contains branches that serve a purpose.

## Acceptance Criteria

- [ ] Contents of `origin/local-serve` inspected (`git log main..origin/local-serve`, diff vs. main) and summarised in Notes
- [ ] Owner confirms nothing on the branch needs to be kept or merged
- [ ] Branch deleted from the remote (`git push origin --delete local-serve`) by or with the owner's explicit approval
- [ ] Any valuable content salvaged into a new story or commit before deletion

## Notes

Purpose of the branch is unknown. Not visible in the local clone's remote refs when this story was written (only `main` and the working branch), so fetch first. Do not delete without owner confirmation.
