# JSB-029: Mobile fixes from the real-phone check

- **Type:** Bug
- **Priority:** High
- **Depends on:** JSB-019

## Description

As a user on a phone, I want the preview, the editor and Save Book to behave on iOS Safari so that the notebook is
usable without sideways scrolling, stuck scrolling or wrongly named files.

Found by the owner on an iPhone (iOS Safari) after the PR #6 release, running the JSB-019 checklist.

## Acceptance Criteria

- [x] A long unbroken line shown in a preview wraps instead of making the preview scroll sideways
  ([screenshot](../stories/assets/JSB-029-preview-sideways-scroll.png): `show("2222211111aaahx…")` with the start of the line scrolled out of view)
- [x] A vertical swipe that starts on the code editor scrolls the page once the editor has nothing left to scroll
  (or always, when the editor content fits), while typing, selection and scrolling inside a long editor still work
- [x] Save Book on iOS saves a file named `<title>.book`, not `<title>.book.json`
  ([screenshot](../stories/assets/JSB-029-save-book-json.png)); Load Book still accepts the saved file (and a `.book.json` saved
  by the current release)
- [x] iOS selection handles: investigated; no clean fix without a real device (see Selection handles below), options
  proposed ([screenshot](../stories/assets/JSB-029-selection-handles.png): after selecting `import` the blue handles are drawn
  above the editor, partly behind its top edge, not at the text)
- [x] E2E scenarios cover what headless Chromium can check (preview wrapping, the saved file name); anything it cannot
  (real touch scrolling and selection handles) is noted here with the manual check for the owner

## Notes

Owner results for the JSB-019 checklist: items 2, 4, 5 and 6 passed, JSB-016 (item 8) passed. Failures: items 1, 3 and 7.

## Implementation notes

- Preview: the iframe `srcDoc` now sets `overflow-wrap: anywhere; word-break: break-word` on `body`, `pre-wrap` on `pre` and
  `max-width: 100%` on images/video/canvas/svg. JSX output is unaffected (only wrapping rules).
- Editor swipe: `src/hooks/use-page-scroll-on-touch.ts` adds passive touch listeners to the editor wrapper (narrow layout only,
  single finger). Per touchmove it asks `shouldScrollPage` (`src/hooks/page-scroll.ts`, unit-tested) whether the editor can still
  scroll in that direction (`getScrollTop`, `getScrollHeight`, `getLayoutInfo().height`); if not it calls `window.scrollBy(0, delta)`.
  Monaco still handles the touch itself, so typing, selection and in-editor scrolling are unchanged. The listeners are passive, so
  they cannot interfere with Monaco's `preventDefault`.
- Save Book: the Blob type is `application/octet-stream` (iOS appends `.json` to `application/json` downloads), so the file is
  `<title>.book`. Load Book on desktop now uses `accept=".book,.json"` so `.book.json` files saved by the earlier release load
  (touch devices already have no filter). ADR-023 is updated.
- E2E (`e2e/features/mobile.feature`): a 600-character unbroken string has no horizontal overflow in the preview iframe; the saved
  download does not end in `.json` and its Blob type is not `application/json`.

### Selection handles (not fixed)

On iPhone Monaco's hidden textarea is placed at the cursor line's top but is 0 or 1 px high (`textAreaEditContext.js`
`_render`: only `isMacintosh` or accessibility mode gives it the line height; iPhone user agents do not contain "Macintosh").
iOS draws its native handles around the selection inside that textarea, so they collapse at the top of the cursor line with the
knobs above it, over the Format row and behind the editor top edge. Making the textarea line-height tall with a CSS override
(`.inputarea { height: <line height> !important }`) would likely move the knobs onto the line, but it fights Monaco's inline
styles, is tied to the font size, and cannot be verified without a device, so it was not applied. Options: (1) that CSS override,
tried on the phone; (2) a small patch of Monaco's iOS branch (patch-package); (3) EditContext (Monaco's newer input path, not
available in Safari). Manual check for the owner: select a word and see whether the handles sit on the line.

## Manual checks on iPhone (headless Chromium cannot do real touch scrolling)

1. Short editor (content fits): swipe up and down starting on the code; the page scrolls.
2. Long editor: swipe inside; the editor scrolls first, then at its top or bottom the page scrolls.
3. Tap to type, double-tap to select a word, drag a handle: all still work.
4. Save Book: the Files prompt shows `<title>.book`; Load Book accepts it.
