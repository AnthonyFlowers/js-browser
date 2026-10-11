import { describe, expect, it } from "vitest";
import { shouldScrollPage, swipeAxis } from "./page-scroll";

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

describe("swipeAxis", () => {
  it("is undecided until the finger has moved past the threshold", () => {
    expect(swipeAxis(3, 5)).toBeUndefined();
    expect(swipeAxis(0, 0)).toBeUndefined();
  });

  it("locks to the dominant axis", () => {
    expect(swipeAxis(2, 12)).toBe("vertical");
    expect(swipeAxis(-2, -12)).toBe("vertical");
    expect(swipeAxis(12, 3)).toBe("horizontal");
    expect(swipeAxis(-12, 3)).toBe("horizontal");
  });

  it("treats a tie as vertical", () => {
    expect(swipeAxis(10, 10)).toBe("vertical");
  });
});
