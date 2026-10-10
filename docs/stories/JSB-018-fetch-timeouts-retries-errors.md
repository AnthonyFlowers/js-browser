# JSB-018: Timeouts, retries and clear errors for package fetches

- **Status:** Todo
- **Type:** Story
- **Priority:** High
- **Depends on:** none

## Description

As a user, I want package fetches to time out, retry and fail with a clear message so that a bundle can never hang on the loading bar.

In `src/bundler/plugins/fetch-plugin.ts` both `axios.get` calls (css and generic) have no timeout, so one stalled unpkg request leaves `createBundle` pending forever. `bundler/index.ts` also awaits `ensureInitialized()` (the esbuild wasm download) with no timeout.

## Acceptance Criteria

- [ ] A request timeout is set on the `axios.get` calls in `fetch-plugin.ts` (value chosen and documented; generous enough for large files such as `bulma.css` on mobile)
- [ ] Transient failures (network error, timeout, HTTP 5xx or 429) are retried a small number of times with backoff; HTTP 404 is not retried
- [ ] The esbuild wasm `initialize` step in `bundler/index.ts` also has a timeout and still allows a retry afterwards
- [ ] When retries are exhausted the bundle ends with an error naming the URL and the reason (timeout, HTTP status, offline), shown in the preview's error area through the existing `err` path
- [ ] An overall bundle deadline in `createBundle` or `bundler/index.ts` guarantees the thunk settles, so `bundles[cellId].loading` always returns to false
- [ ] A slow but progressing fetch that finishes within the timeout still renders
- [ ] Unit tests for the plugin using a fake axios (timeout, retry then success, 404, exhausted retries) and a test for the overall deadline
- [ ] `docs/architecture.md` bundler section updated

## Notes

Part of the stability sweep and the first fix for the stuck loading bar reported in JSB-016 (that story depends on this one and covers root-cause verification and the live-site check). Cached files in `filecache` bypass the network, so only first-time imports are affected. Consider aborting in-flight requests via `AbortController` when the deadline hits.
