# JSB-026: Gherkin e2e scenarios with playwright-bdd

- **Type:** Task
- **Priority:** High
- **Depends on:** JSB-017

## Description

As the owner, I want end-to-end tests written as Gherkin (Given/When/Then) feature files so that the behaviour under test reads in domain language and acceptance criteria can be phrased as runnable scenarios. This becomes the standard for all future e2e tests.

## Acceptance Criteria

- [x] `playwright-bdd` added; `playwright.config.ts` uses `defineBddConfig`; `npm run test:e2e` runs `bddgen` then `playwright test`
- [x] The 7 tests of `e2e/notebook.spec.ts` converted to `e2e/features/*.feature` (cells, imports, persistence, books, network) with every original assertion kept; old spec removed
- [x] Step definitions in `e2e/steps/` reuse `e2e/app.ts` and `e2e/mock-unpkg.ts`
- [x] Generated `.features-gen/` is gitignored and excluded from ESLint and Prettier; `npm run typecheck` covers the step files
- [x] `PW_CHROMIUM_PATH` and `E2E_SKIP_BUILD` still work; CI `e2e` job unchanged (bddgen runs inside the npm script)
- [x] CLAUDE.md, implementer agent, README, `docs/architecture.md` updated; ADR-022 amends ADR-021
- [x] Gates and `test:e2e` pass on Node 24

## Notes

Decision: [ADR-022](../decisions/ADR-022-gherkin-e2e-scenarios-with-playwright-bdd.md). 7 scenarios, about 38 s per local run including the build (3 runs).
