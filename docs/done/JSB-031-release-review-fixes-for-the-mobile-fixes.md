# JSB-031: Release-review fixes for the mobile fixes

- **Type:** Bug
- **Priority:** High
- **Depends on:** JSB-029

## Description

As a user on a phone, I want the editor swipe forwarding and the preview wrapping from JSB-029 to behave precisely so that
only the intended swipes scroll the page and my JSX layouts are not squeezed.

Findings from the release review of PR #7 (dev -> main).

## Acceptance Criteria

- [x] A swipe that starts on the Format button or the format-error alert is not forwarded to the page (no double scroll)
- [x] A horizontal swipe on the editor does not scroll the page (axis locked after 8 px, pure logic unit-tested)
- [x] Dragging a selection (non-empty editor selection) does not scroll the page; JSB-030 notes that its fix must keep this
- [x] The preview uses `overflow-wrap: break-word` only, so min-content sizing of user JSX is unchanged, and long strings still wrap
- [x] E2E scenarios cover a swipe scrolling the page, no double scroll from the Format button and no scroll on a sideways swipe

## Notes

## Implementation notes

- `use-page-scroll-on-touch.ts` keeps its listeners on `.editor-wrapper` but `touchstart` only arms the gesture when the target is
  inside `editor.getDomNode()` (Monaco only cancels touches on its own DOM, so elsewhere the browser already scrolls the page).
- `swipeAxis(dx, dy, threshold = 8)` in `page-scroll.ts` (unit-tested) decides the axis once; the gesture is ignored if it locks horizontal.
  While undecided nothing is scrolled; the accumulated vertical movement is applied at the first forwarded move.
- Selection: moves are ignored while `!editor.getSelection()?.isEmpty()`.
- Preview: `overflow-wrap: break-word` on `body` (with `pre-wrap` and media `max-width`). `break-word` only breaks when a word does
  not fit the line and, unlike `anywhere`, does not lower min-content size, so tables and flex rows keep their natural widths. The
  existing "long unbroken string wraps" scenario passes with it, so no further rule was needed. `word-break: break-word` is removed.
  This corrects JSB-029's note: JSX output is not entirely unaffected by wrapping rules; with `break-word` only the overflow case differs.
- E2E (`mobile.feature`, real touch via CDP `Input.dispatchTouchEvent`): swipe on a short editor scrolls the page; a sideways
  swipe with 30 px drift leaves `scrollY` at 0; a swipe starting on Format makes no `window.scrollBy` call from the app. Measuring
  `scrollY` for the Format case was flaky (native scroll plus fling gave 135 to 321 px for a 120 px swipe, so a double scroll cannot
  be told from momentum), hence the `scrollBy` spy instead. The Format and sideways scenarios fail against the pre-fix hook, so they
  are not vacuous. Not covered: selection-drag suppression (needs real long-press selection handles; check on the phone).
