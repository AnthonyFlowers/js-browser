# ADR-023: Save Book falls back to a Blob download on touch devices

- **Date:** 2026-10-10
- **Status:** Accepted
- **Story:** JSB-019

**Context:** Save Book streamed the book through `streamsaver`, which needs a service worker and a hosted MITM page. That is
unreliable on iOS Safari (and in private or restricted contexts). The owner uses the app on an iPhone.

**Decision:** `src/state/thunks/download-book.ts` keeps `streamsaver` on desktop but downloads a `Blob` through a temporary
`<a download>` on touch devices (`src/platform.ts`: coarse primary pointer, iOS user agent, or iPadOS reporting as a Mac with
touch) and wherever `navigator.serviceWorker` is missing. A failure of the streamsaver path also falls back to the Blob
download. The Web Share API and the File System Access API were not used: share sheets add a step, and File System Access is
absent on iOS. On touch devices the Load Book `<input type=file>` drops its `accept=".book"` filter, because iOS greys out
files whose extension it does not know; desktop keeps `.book`.

**Consequences:** The Blob path is covered by an e2e scenario (Chromium with iPhone 13 emulation). iOS Safari's handling of
`<a download>` (Files download prompt) has not been confirmed on a real device; see the checklist in JSB-019. iOS may offer a share or
"Save to Files" dialog rather than silently downloading.

**Update (JSB-029):** the Blob type is now `application/octet-stream`. With `application/json` iOS Safari saved
`<title>.book.json`. Load Book accepts `.book` and `.json` on desktop (no filter on touch), so `.book.json` files saved earlier
still load.
