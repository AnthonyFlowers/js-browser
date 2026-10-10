# ADR-022: Gherkin e2e scenarios with playwright-bdd

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-026
- **Amends:** ADR-021

**Context:** ADR-021 wrote e2e tests as plain Playwright specs. The owner wants tests that read as behaviour and
acceptance criteria that can be expressed as runnable scenarios.

**Decision:** E2E tests are Gherkin `.feature` files in `e2e/features/`, compiled to Playwright tests by
`playwright-bdd` (`bddgen`, output in the gitignored `.features-gen/`). Step definitions live in `e2e/steps/` and call
the existing helpers (`e2e/app.ts`, `e2e/mock-unpkg.ts`); a `world` fixture carries per-scenario state (unpkg mock,
current cell). `npm run test:e2e` is `bddgen && playwright test`, so CI needs no extra step. Cells are numbered from 1 in
steps; multi-line code and markdown use doc strings. Everything else in ADR-021 (Playwright, fixture-routed unpkg,
production build, separate CI job) stands.

**Consequences:** New stories add or extend scenarios and may phrase acceptance criteria as scenarios. Steps should be
reused before new ones are added. There is a generation step: after editing a `.feature` file run `npm run test:e2e`
(or `npx bddgen`); undefined steps fail generation. Features and generated files are not type-checked, but step files are.
