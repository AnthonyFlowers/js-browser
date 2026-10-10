# JSB-024: Offline support and installable PWA

- **Type:** Story
- **Priority:** Low
- **Depends on:** JSB-020

## Description

As a user, I want to install the app and use it offline with packages I already imported so that it works on a plane or flaky mobile connection.

## Acceptance Criteria

- [ ] `public/manifest.json` completed (name, icons, display, start URL and scope under `/js-browser/`) and the app passes the browser's installability check
- [ ] A service worker precaches the app shell, Monaco workers and the esbuild wasm (emitted by Vite with hashed names) and updates cleanly on a new deploy
- [ ] Previously imported packages keep working offline via the `filecache` localforage store; an import never fetched shows a clear offline error (relies on JSB-018)
- [ ] Books remain available offline (IndexedDB) and the update flow does not discard unsaved edits
- [ ] Works under the Pages base path; the sandboxed iframe still renders from `srcdoc`
- [ ] Tested in Chromium offline mode (e2e if feasible, JSB-017); README and `docs/architecture.md` updated; ADR recorded for the service worker approach

## Notes

Roadmap, lowest priority. Package freshness is a trade-off: the cache has no invalidation today beyond `CACHE_VERSION` in `fetch-plugin.ts`. Precache size depends on JSB-020.
