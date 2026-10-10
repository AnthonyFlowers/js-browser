/** True on phones and tablets: the primary pointer is a finger, or iOS reports itself as one. */
export const isTouchDevice = () =>
  window.matchMedia("(pointer: coarse)").matches ||
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
