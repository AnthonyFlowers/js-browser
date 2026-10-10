# JSB-030: iOS selection handles drawn above the editor

- **Type:** Bug
- **Priority:** Medium
- **Depends on:** JSB-029

## Description

As a user on an iPhone, I want the native selection handles to sit on the text I selected in a code cell so that I can
adjust a selection by dragging them.

Found by the owner on an iPhone ([screenshot](assets/JSB-029-selection-handles.png)): after selecting `import` the word
is highlighted correctly, but the blue handles are drawn above the editor, partly behind the Format row and the editor top edge.

## Acceptance Criteria

- [ ] On iOS Safari the selection handles sit on the selected text, or at least are fully visible and draggable
- [ ] Typing, IME/emoji input and the JSB-029 page-scroll behaviour still work on the phone

## Notes

Cause (JSB-029 investigation): Monaco's hidden textarea (`textAreaEditContext.js` `_render`) is 0 or 1 px high at the cursor
line's top on iPhone, because only `isMacintosh` or accessibility mode gives it the line height. iOS draws the handles around
the selection inside that textarea. Options: (1) a CSS override making `.inputarea` line-height tall, tried on the phone;
(2) a small patch of Monaco's iOS branch (patch-package); (3) EditContext (not available in Safari). Each needs a real-device check.
