# JSB-018: Timeouts, retries and clear errors for package fetches

- **Status:** Done
- **Type:** Story
- **Priority:** High
- **Depends on:** none

## Description

As a user, I want package fetches to time out, retry and fail with a clear message so that a bundle can never hang on the loading bar.

In `src/bundler/plugins/fetch-plugin.ts` both `axios.get` calls (css and generic) have no timeout, so one stalled unpkg request leaves `createBundle` pending forever. `bundler/index.ts` also awaits `ensureInitialized()` (the esbuild wasm download) with no timeout.

## Acceptance Criteria

- [x] A request timeout is set on the `axios.get` calls in `fetch-plugin.ts` (value chosen and documented; generous enough for large files such as `bulma.css` on mobile)
- [x] Transient failures (network error, timeout, HTTP 5xx or 429) are retried a small number of times with backoff; HTTP 404 is not retried
- [x] The esbuild wasm `initialize` step in `bundler/index.ts` also has a timeout and still allows a retry afterwards
- [x] When retries are exhausted the bundle ends with an error naming the URL and the reason (timeout, HTTP status, offline), shown in the preview's error area through the existing `err` path
- [x] An overall bundle deadline in `createBundle` or `bundler/index.ts` guarantees the thunk settles, so `bundles[cellId].loading` always returns to false
- [x] A slow but progressing fetch that finishes within the timeout still renders
- [x] Unit tests for the plugin using a fake axios (timeout, retry then success, 404, exhausted retries) and a test for the overall deadline
- [x] `docs/architecture.md` bundler section updated

## Notes

Part of the stability sweep and the first fix for the stuck loading bar reported in JSB-016 (that story depends on this one and covers root-cause verification and the live-site check). Cached files in `filecache` bypass the network, so only first-time imports are affected. Consider aborting in-flight requests via `AbortController` when the deadline hits.

Implemented (see ADR-019):

| Setting | Value | Where |
|---------|-------|-------|
| Request timeout (per attempt) | 30 s | `REQUEST_TIMEOUT_MS`, `fetch-plugin.ts` |
| Attempts per file | 3 (2 retries), backoff 500 ms then 1000 ms | `MAX_ATTEMPTS`, `RETRY_BASE_DELAY_MS` |
| Retried | network error, timeout, HTTP 5xx, 429 | not 404 or other 4xx |
| esbuild.wasm start-up wait | 60 s | `INIT_TIMEOUT_MS`, `bundler/index.ts` |
| Overall bundle deadline | 120 s (aborts in-flight requests) | `BUNDLE_DEADLINE_MS` |
| Cache (IndexedDB) operations | 3 s, then treated as a miss | `CACHE_TIMEOUT_MS` |

A fully stalled file takes 3 x 30 s + 1.5 s of backoff (about 91.5 s), which fits inside the 120 s deadline, so the
URL-specific error normally wins over the generic deadline message. Verified in Chromium with a route that never
answers: cells ended with `Failed to fetch https://unpkg.com/date-fns: timed out after 30s (3 attempts)`.
