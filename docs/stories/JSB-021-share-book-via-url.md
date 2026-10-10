# JSB-021: Share a book via URL

- **Type:** Story
- **Priority:** Medium
- **Depends on:** JSB-010

## Description

As a user, I want to share a book as a link so that someone can open the same notebook without exchanging a `.book` file.

## Acceptance Criteria

- [ ] A "Share" action in `TopMenu` produces a URL carrying the book (the `Book` shape from `src/state/cell.ts`), compressed and encoded in the URL hash so no server is involved
- [ ] Opening a link imports it through the same validation as `importCells` (requires `data`, `order`, `title`); invalid or oversized payloads show a clear error
- [ ] Opening a shared link never overwrites an existing local book silently: it is saved under a unique name (see JSB-010) or the user confirms
- [ ] The URL length limit is handled: the user is told when a book is too large to share by link and pointed to Save Book
- [ ] Works with the Pages base path `/js-browser/`; unit tests for encode/decode round trip; README and `docs/architecture.md` updated

## Notes

Roadmap, after the stability sweep. Hash fragments are not sent to the server. Opening a link runs the code in the sandboxed iframes, so consider showing the cells without bundling until the user confirms (open question for the owner).
