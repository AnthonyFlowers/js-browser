# ADR-019: Bounded fetches with retry, a bundle deadline and a best-effort cache

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-018, JSB-016

**Context:** An unpkg request that never answered left `createBundle` pending forever, so a cell stayed on the loading
bar with no error (reproduced for JSB-016). Mobile connections are slow and flaky, so the limits must be generous.

**Decision:** Every package request has a 30 s timeout and up to 3 attempts (backoff 500 ms, 1000 ms) for network
errors, timeouts, HTTP 5xx and 429; 404 and other 4xx fail immediately. Failures are thrown as
`Failed to fetch <url>: <reason>` and reach the preview through the existing `err` path. `bundle()` also enforces a
120 s deadline that aborts in-flight requests via `AbortController`, and waiting for `esbuild.initialize` times out
after 60 s without calling `initialize` a second time (esbuild rejects that while the first call is pending). The
IndexedDB cache is best effort: a read, write or cleanup that fails or takes over 3 s counts as a miss. The bundles slice
records the thunk `requestId` and ignores results from a superseded request.

**Consequences:** A bundle always settles within about 2 minutes. Files fetched before a timeout stay cached, so an
edit-to-retry continues where it stopped. A single file that cannot download within 30 s (bulma.css, about 750 KB, needs roughly
25 KB/s) can never load; revisit the numbers if that appears in practice.
