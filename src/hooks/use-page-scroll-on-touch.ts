import { type RefObject, useEffect } from "react";
import { NARROW_QUERY } from "./use-media-query";
import { shouldScrollPage, swipeAxis, type SwipeAxis } from "./page-scroll";

interface ScrollableEditor {
  getScrollTop(): number;
  getScrollHeight(): number;
  getLayoutInfo(): { height: number };
  getDomNode(): HTMLElement | null;
  getSelection(): { isEmpty(): boolean } | null;
}

/**
 * Monaco's touch handling cancels touchmove, so the browser never scrolls the page for a swipe that
 * starts on the editor. On the stacked mobile layout, forward the swipe to the window whenever the
 * editor has nothing left to scroll in that direction. Only swipes that start on the editor's own DOM
 * (not the Format button or error alert, which the browser scrolls natively), that lock to the vertical
 * axis, and that are not dragging a selection are forwarded.
 */
export const usePageScrollOnTouch = (
  containerRef: RefObject<HTMLElement | null>,
  editorRef: RefObject<ScrollableEditor | null>
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let startX = 0;
    let startY = 0;
    let lastY: number | null = null;
    let axis: SwipeAxis | undefined;

    const onStart = (event: TouchEvent) => {
      const editor = editorRef.current;
      const target = event.target;
      const onEditor =
        editor !== null &&
        target instanceof Node &&
        !!editor.getDomNode()?.contains(target);
      if (event.touches.length !== 1 || !onEditor) {
        lastY = null;
        return;
      }
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      lastY = startY;
      axis = undefined;
    };
    const onMove = (event: TouchEvent) => {
      const editor = editorRef.current;
      if (
        lastY === null ||
        event.touches.length !== 1 ||
        !editor ||
        !window.matchMedia(NARROW_QUERY).matches
      ) {
        return;
      }
      const { clientX: x, clientY: y } = event.touches[0];
      axis ??= swipeAxis(x - startX, y - startY);
      if (axis !== "vertical") return;
      if (!editor.getSelection()?.isEmpty()) return;
      const delta = lastY - y;
      lastY = y;
      if (
        shouldScrollPage(
          delta,
          editor.getScrollTop(),
          editor.getScrollHeight(),
          editor.getLayoutInfo().height
        )
      ) {
        window.scrollBy(0, delta);
      }
    };
    const onEnd = () => {
      lastY = null;
    };

    container.addEventListener("touchstart", onStart, { passive: true });
    container.addEventListener("touchmove", onMove, { passive: true });
    container.addEventListener("touchend", onEnd, { passive: true });
    container.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", onStart);
      container.removeEventListener("touchmove", onMove);
      container.removeEventListener("touchend", onEnd);
      container.removeEventListener("touchcancel", onEnd);
    };
  }, [containerRef, editorRef]);
};
