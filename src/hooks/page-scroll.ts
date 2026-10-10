/**
 * Whether a vertical touch drag should scroll the page instead of the editor.
 * `delta` is how far the content should move down the page (positive = scroll down,
 * the opposite of the finger movement).
 */
export const shouldScrollPage = (
  delta: number,
  scrollTop: number,
  scrollHeight: number,
  viewportHeight: number
) => {
  if (delta === 0) return false;
  const maxScrollTop = Math.max(0, scrollHeight - viewportHeight);
  return delta > 0 ? scrollTop >= maxScrollTop - 1 : scrollTop <= 0;
};

export const AXIS_LOCK_THRESHOLD = 8;

export type SwipeAxis = "vertical" | "horizontal";

/**
 * The axis of a swipe, decided once the finger has moved `threshold` px from where it started
 * (undecided before that). A tie counts as vertical.
 */
export const swipeAxis = (
  dx: number,
  dy: number,
  threshold = AXIS_LOCK_THRESHOLD
): SwipeAxis | undefined => {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return undefined;
  return Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
};
