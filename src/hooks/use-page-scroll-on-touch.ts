import { type RefObject, useEffect } from "react";
import { NARROW_QUERY } from "./use-media-query";
import { shouldScrollPage } from "./page-scroll";

interface ScrollableEditor {
  getScrollTop(): number;
  getScrollHeight(): number;
  getLayoutInfo(): { height: number };
}

/**
 * Monaco's touch handling cancels touchmove, so the browser never scrolls the page for a swipe that
 * starts on the editor. On the stacked mobile layout, forward the swipe to the window whenever the
 * editor has nothing left to scroll in that direction.
 */
export const usePageScrollOnTouch = (
  containerRef: RefObject<HTMLElement | null>,
  editorRef: RefObject<ScrollableEditor | null>
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let lastY: number | null = null;

    const onStart = (event: TouchEvent) => {
      lastY = event.touches.length === 1 ? event.touches[0].clientY : null;
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
      const y = event.touches[0].clientY;
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
