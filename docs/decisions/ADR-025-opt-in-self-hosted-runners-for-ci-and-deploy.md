# ADR-025: Opt-in self-hosted runners for CI and deploy

- **Date:** 2026-10-11
- **Status:** Accepted
- **Story:** JSB-032

**Context:** The owner runs a pool of self-hosted GitHub Actions runners (`desktop`: Linux x64; `mac-local`: Linux arm64
containers on the Mac), and GitHub-hosted minutes can run out. The repo is public, so fork pull requests must never run on
the owner's machines.

**Decision:** `ci.yml` gains a `workflow_dispatch` with a `runner` choice (`ubuntu-latest`, `desktop`, `mac-local`); its jobs
compute `runs-on` from `inputs.runner`, which is empty on `pull_request` and `push`, so those runs stay on `ubuntu-latest`.
`deploy.yml` (push to `main` and dispatch only, no `pull_request`) reads `runs-on` from the repo variable `DEPLOY_RUNNER`
(a JSON label array, e.g. `["self-hosted","desktop"]`), defaulting to `ubuntu-latest` when it is unset. Never add self-hosted
`runs-on` to a job a pull request can run, never add `pull_request_target`, and never route by `vars.*` in a workflow that has
`pull_request` triggers.

**Consequences:** Self-hosted CI is opt-in per dispatch (`gh workflow run ci.yml --ref <branch> -f runner=desktop`); PR and push CI
are unchanged. Deploys move to self-hosted only when the owner sets `DEPLOY_RUNNER`; deleting it reverts to GitHub-hosted. Fork
PR approval is set to "Require approval for all external contributors" (owner setting).
