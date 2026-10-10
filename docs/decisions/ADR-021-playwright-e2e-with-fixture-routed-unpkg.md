# ADR-021: Playwright end-to-end tests with fixture-routed unpkg

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-017

**Context:** Vitest covers slices and plugins in isolation, but nothing exercised the real app, esbuild-wasm and the
preview iframe together. The app depends on unpkg.com at run time, which is slow, flaky and blocked in the Claude
sandbox, so a browser suite cannot use the real service.

**Decision:** Use Playwright (`@playwright/test`, Chromium only) against the production build served by `vite preview`.
All `unpkg.com` requests are fulfilled by `page.route` from small packages in `e2e/fixtures/unpkg/` (a stub `react` and
`react-dom/client` that is just enough for `show(<Component />)`, a helper with a relative import, a CSS package). The
router also offers `stall`, `slow` and a capped XHR timeout, giving deterministic simulations of the failures behind
JSB-016/018. Unversioned URLs are answered in one step plus an `x-final-url` header exposed through
`XMLHttpRequest.responseURL`, because a routed 302 is followed outside the router. Playwright was chosen over Cypress or
WebdriverIO for its route interception, `frameLocator` for the sandboxed iframe, and first-party CI support. Specs are
TypeScript in `e2e/` with their own `tsconfig.json`; Vitest only includes `src/**/*.test.ts`. CI runs the suite in a
separate `e2e` job after `check` and uploads the HTML report on failure.

**Consequences:** Tests need no network and stay fast (about 30 s for the suite with 2 workers). The stub React is not
the real library, so React-specific behaviour (hooks, reconciliation) is not covered; the stub must be extended when a
test needs more. The local sandbox ships an older Chromium than the Playwright version expects, so local runs set
`PW_CHROMIUM_PATH`; CI installs the matching browser. Mobile viewport checks can be added with JSB-019.
