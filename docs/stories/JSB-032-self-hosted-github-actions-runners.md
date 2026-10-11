# JSB-032: Self-hosted GitHub Actions runners

- **Type:** Chore
- **Priority:** Medium
- **Depends on:** none
- **State:** In Progress, awaiting the first dispatched run on the self-hosted runners

## Description

As the owner, I want CI and the Pages deploy to be able to run on my self-hosted runners so that they keep working when
GitHub-hosted minutes are unavailable, without letting fork pull requests reach my machines.

## Acceptance Criteria

- [x] `ci.yml` has a `workflow_dispatch` `runner` choice (`ubuntu-latest`, `desktop`, `mac-local`); `pull_request` and `push` runs stay on `ubuntu-latest`
- [x] `deploy.yml` routes both jobs by the `DEPLOY_RUNNER` repo variable, defaulting to `ubuntu-latest`
- [x] Fork PR approval set to "Require approval for all external contributors" (owner)
- [ ] A dispatched CI run with `runner=desktop` passes (check and e2e)
- [ ] `DEPLOY_RUNNER` set only after the owner's OK (optional)

## Notes

Decision: ADR-025. Routing rules and the setup came from the owner's runner reference (Obsidian vault:
`reference/tech/github-runners.md`). The dispatch input only works once the workflow on `main` has it.
