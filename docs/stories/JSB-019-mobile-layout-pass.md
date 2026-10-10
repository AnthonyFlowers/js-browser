# JSB-019: Mobile layout pass

- **Type:** Story
- **Priority:** High
- **Depends on:** none

## Description

As a user on a phone, I want the notebook to be fully usable on a small touch screen so that I can try code and packages away from a desktop.

Mobile is first-class (see CLAUDE.md, Project direction). The owner already uses the live site on an iPhone (see JSB-016).

## Acceptance Criteria

- [ ] `index.html` viewport meta is correct and the page has no horizontal scroll at 360 to 430 px widths
- [ ] `TopMenu` (title input, Save Book, Load Book) wraps or collapses cleanly on narrow screens
- [ ] `CodeCell` stacks the editor above the preview on narrow screens instead of side by side; the preview is full width and readable
- [ ] `Resizable` (`react-resizable` handles in `resizable.tsx`) can be dragged with touch, with handles large enough to hit; the vertical editor height handle works on a phone
- [ ] Monaco is usable on a phone: typing, selection and scrolling work, the Format button is reachable, and the page can still be scrolled past the editor
- [ ] `ActionBar` and `AddCell` controls have touch-sized hit areas
- [ ] Markdown cell (`text-editor.tsx`) edit and preview work with touch, including leaving edit mode by tapping outside
- [ ] Save Book and Load Book work on iOS Safari and Android Chrome (streamsaver may need a fallback; document the result)
- [ ] Verified in a mobile-emulated viewport in the e2e suite (JSB-017) and on a real phone; findings and fixes noted here

## Notes

Part of the stability sweep. Likely touches `code-cell.css`, `resizable.css`, `top-menu.css`, `action-bar.css`, `cell-list-item.css`. `streamsaver` relies on a service worker/MITM page and is a known weak spot on iOS.
