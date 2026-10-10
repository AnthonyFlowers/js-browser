# ADR-003: Node 24 and npm

- **Date:** 2026-10-09
- **Status:** Accepted
- **Story:** JSB-002

**Context:** The project had no pinned Node version; builds only worked with a legacy OpenSSL flag.

**Decision:** Target Node 24 (`.nvmrc`, `engines`) and use npm with the committed `package-lock.json`.

**Consequences:** CI and local environments match. Contributors need Node 24+. No yarn/pnpm lockfiles.
