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
