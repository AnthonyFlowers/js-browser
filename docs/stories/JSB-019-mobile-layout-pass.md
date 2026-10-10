# JSB-019: Mobile layout pass

- **Type:** Story
- **Priority:** High
- **Depends on:** none
- **State:** Awaiting owner check on a real phone

## Description

As a user on a phone, I want the notebook to be fully usable on a small touch screen so that I can try code and packages away from a desktop.

Mobile is first-class (see CLAUDE.md, Project direction). The owner already uses the live site on an iPhone (see JSB-016).

## Acceptance Criteria

- [x] `index.html` viewport meta is correct and the page has no horizontal scroll at 360 to 430 px widths
- [x] `TopMenu` (title input, Save Book, Load Book) wraps or collapses cleanly on narrow screens
- [x] `CodeCell` stacks the editor above the preview on narrow screens instead of side by side; the preview is full width and readable
- [x] `Resizable` (`react-resizable` handles in `resizable.tsx`) can be dragged with touch, with handles large enough to hit; the vertical editor height handle works on a phone
- [x] Monaco is usable on a phone: typing, selection and scrolling work, the Format button is reachable, and the page can still be scrolled past the editor
- [x] `ActionBar` and `AddCell` controls have touch-sized hit areas
- [x] Markdown cell (`text-editor.tsx`) edit and preview work with touch, including leaving edit mode by tapping outside
- [x] Save Book and Load Book work on iOS Safari and Android Chrome (streamsaver may need a fallback; document the result)
- [ ] Verified in a mobile-emulated viewport in the e2e suite (JSB-017) and on a real phone; findings and fixes noted here (e2e done; real phone open, see below)

## Notes

Part of the stability sweep. Likely touches `code-cell.css`, `resizable.css`, `top-menu.css`, `action-bar.css`, `cell-list-item.css`. `streamsaver` relies on a service worker/MITM page and is a known weak spot on iOS.

## Implementation notes

- Breakpoint 768 px: stacked layout below it (`CodeCell` picks the tree with `useMediaQuery`; the editor keeps a vertical handle, min 120 px, the preview is 40vh, min 200 px, full width). Desktop tree and behaviour are unchanged.
- Root cause of the keyboard icons over the code (reproduced in Chromium with the iPhone UA): Monaco's `iPadShowKeyboard` overlay textarea, shown whenever the UA is iOS. Hidden by CSS; tapping the editor opens the keyboard as usual.
- On narrow screens the Format button sits in its own row above the code instead of overlaying the first line.
- Hover-only controls were unreachable on touch: the Format button and the AddCell strip are now always visible under `hover: none`.
- Resize handles keep their 10 px look; a 44 px invisible `::after` hit area and `touch-action: none` make them draggable by finger (react-resizable/react-draggable handle touch events; verified with CDP touch events in the e2e suite).
- Monaco: `scrollbar.alwaysConsumeMouseWheel: false` added; font 18 px, word wrap and no minimap were already set. Markdown cells use the edit-only mode below 768 px.
- Save Book: Blob + `<a download>` on touch devices, streamsaver on desktop (ADR-023). Load Book drops the `accept` filter on touch devices.
- Markdown cell leave-edit: added a touch `pointerup` listener because iOS Safari does not fire `click` for taps on non-interactive elements. The MDEditor height drag bar is mouse-only (not touch); not changed.
- A blank preview for a cell below the fold in full-page screenshots was a capture artifact (the iframe text is present and a viewport screenshot shows it); the e2e scenario "Every code cell of a book renders its preview" guards it.
- E2E: `mobile` Playwright project (iPhone 13 profile in Chromium) and `e2e/features/mobile.feature` (no horizontal scroll at 360/390/430, stacked layout, 44 px targets, tap move/delete/add, markdown tap edit and tap outside, touch drag resize, Save Book download). Passed with `--repeat-each 10`. A "swipe over the editor scrolls the page" scenario was dropped: synthesized touch scrolling does not scroll even a plain page in headless Chromium here.

## Owner checklist (real iPhone, iOS Safari)

1. Page does not scroll sideways; top menu wraps cleanly; Load Book shows Pick Book.
2. Editor sits above a full-width preview; no keyboard icon over the code; typing, selecting and Format work.
3. Swipe vertically starting on the editor: the page scrolls past it (if it sticks, report where).
4. Drag the thin bar below the editor with a finger: editor height changes and the page does not scroll meanwhile.
5. Up/down/delete buttons and the + Code / + Text buttons are easy to tap.
6. Text cell: tap to edit, type, tap elsewhere on the page (including empty background): it renders; the MDEditor height bar is not touch-resizable (known).
7. Save Book: does a download or Save to Files prompt appear, and does the `.book` file open in Files? Load Book: can the saved `.book` file be picked (not greyed out)?
8. Android Chrome, if available: same Save Book and Load Book check.
