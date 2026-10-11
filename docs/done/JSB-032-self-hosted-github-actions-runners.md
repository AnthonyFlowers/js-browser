# JSB-032: Self-hosted GitHub Actions runners

- **Type:** Chore
- **Priority:** Medium
- **Depends on:** none

## Description

As the owner, I want CI and the Pages deploy to be able to run on my self-hosted runners so that they keep working when
GitHub-hosted minutes are unavailable, without letting fork pull requests reach my machines.

## Acceptance Criteria

- [x] `ci.yml` has a `workflow_dispatch` `runner` choice (`ubuntu-latest`, `desktop`, `mac-local`); `pull_request` and `push` runs stay on `ubuntu-latest`
- [x] `deploy.yml` routes both jobs by the `DEPLOY_RUNNER` repo variable, defaulting to `ubuntu-latest`
- [x] Fork PR approval set to "Require approval for all external contributors" (owner)
- [x] A dispatched CI run with `runner=desktop` passes (check and e2e): run 38100748709
- [x] `DEPLOY_RUNNER` set to `["self-hosted","desktop"]` with the owner's OK (2026-10-11 01:18 UTC); deploy run 38101371946 passed with build and deploy on the desktop runner, and the site returned HTTP 200

## Notes

Decision: ADR-025. Routing rules and the setup came from the owner's runner reference (Obsidian vault:
`reference/tech/github-runners.md`). The dispatch input only works once the workflow on `main` has it.

First `runner=desktop` run (2026-10-11): `check` passed; `e2e` failed with `EACCES: permission denied, mkdir '/opt/ms-playwright'`
because the runner image sets `PLAYWRIGHT_BROWSERS_PATH` to a root-owned directory. The e2e install and test steps now set
`PLAYWRIGHT_BROWSERS_PATH` to `${{ runner.temp }}/ms-playwright`, which works on both hosted and self-hosted runners.

The owner's runner images now make `/opt/ms-playwright` writable by the runner user, so the `runner.temp` override in `ci.yml` is
no longer required; it is kept because it is harmless and also works on GitHub-hosted runners. Per-repo routing is documented in
the owner's vault (`reference/tech/github-runners.md`, "Per-repo routing").
