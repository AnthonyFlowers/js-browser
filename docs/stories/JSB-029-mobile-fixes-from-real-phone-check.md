# JSB-029: Mobile fixes from the real-phone check

- **Type:** Bug
- **Priority:** High
- **Depends on:** JSB-019

## Description

As a user on a phone, I want the preview, the editor and Save Book to behave on iOS Safari so that the notebook is
usable without sideways scrolling, stuck scrolling or wrongly named files.

Found by the owner on an iPhone (iOS Safari) after the PR #6 release, running the JSB-019 checklist.

## Acceptance Criteria

- [ ] A long unbroken line shown in a preview wraps instead of making the preview scroll sideways
  ([screenshot](assets/JSB-029-preview-sideways-scroll.png): `show("2222211111aaahx…")` with the start of the line scrolled out of view)
- [ ] A vertical swipe that starts on the code editor scrolls the page once the editor has nothing left to scroll
  (or always, when the editor content fits), while typing, selection and scrolling inside a long editor still work
- [ ] Save Book on iOS saves a file named `<title>.book`, not `<title>.book.json`
  ([screenshot](assets/JSB-029-save-book-json.png)); Load Book still accepts the saved file (and a `.book.json` saved
  by the current release)
- [ ] E2E scenarios cover what headless Chromium can check (preview wrapping, the saved file name); anything it cannot
  (real touch scrolling) is noted here with the manual check for the owner

## Notes

Owner results for the JSB-019 checklist: items 2, 4, 5 and 6 passed, JSB-016 (item 8) passed. Failures: items 1, 3 and 7.
