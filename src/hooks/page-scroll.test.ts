import { describe, expect, it } from "vitest";
import { shouldScrollPage } from "./page-scroll";

describe("shouldScrollPage", () => {
  it("scrolls the page when the content fits the editor", () => {
    expect(shouldScrollPage(10, 0, 100, 200)).toBe(true);
    expect(shouldScrollPage(-10, 0, 100, 200)).toBe(true);
  });

  it("leaves scrolling to the editor while it can move in the swipe direction", () => {
    expect(shouldScrollPage(10, 50, 1000, 200)).toBe(false);
    expect(shouldScrollPage(-10, 50, 1000, 200)).toBe(false);
  });

  it("scrolls the page past the editor's bottom or top edge", () => {
    expect(shouldScrollPage(10, 800, 1000, 200)).toBe(true);
    expect(shouldScrollPage(-10, 0, 1000, 200)).toBe(true);
    expect(shouldScrollPage(-10, 800, 1000, 200)).toBe(false);
  });

  it("ignores a zero delta", () => {
    expect(shouldScrollPage(0, 0, 100, 200)).toBe(false);
  });
});
