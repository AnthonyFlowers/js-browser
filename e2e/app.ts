import { expect, type Locator, type Page } from "@playwright/test";

export const cells = (page: Page) => page.locator(".cell-list-item");

export const gotoApp = async (page: Page) => {
  await page.goto("./");
  await expect(page.getByRole("button", { name: "Save Book" })).toBeVisible();
};

export const addCell = async (page: Page, type: "Code" | "Text") => {
  const before = await cells(page).count();
  // The last strip sits below the last cell (or is the only one in an empty book).
  await page
    .locator(".add-cell")
    .last()
    .getByRole("button", { name: type })
    .click({ force: true });
  await expect(cells(page)).toHaveCount(before + 1);
  return cells(page).nth(before);
};

/** Replaces the contents of a code cell's Monaco editor once it has loaded. */
export const setCode = async (cell: Locator, code: string) => {
  const lines = cell.locator(".monaco-editor .view-lines");
  await expect(lines).toBeVisible();
  await lines.click();
  await cell.page().keyboard.press("ControlOrMeta+A");
  await cell.page().keyboard.insertText(code);
  await expect(lines).toContainText(code.split("\n").at(-1)!);
};

export const editorText = (cell: Locator) =>
  cell.locator(".monaco-editor .view-lines");

/** The `#root` element inside a code cell's sandboxed preview iframe. */
export const previewRoot = (cell: Locator) =>
  cell.frameLocator("iframe[title='code-executor']").locator("#root");

export const moveCell = (cell: Locator, direction: "up" | "down") =>
  cell.locator(`.action-bar button:has(i.fa-arrow-${direction})`).click();

export const deleteCell = (cell: Locator) =>
  cell.locator(".action-bar button:has(i.fa-times)").click();

export interface Point {
  x: number;
  y: number;
}

export const centerOf = async (locator: Locator): Promise<Point> => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element has no bounding box");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

/** Drags with real touch events (Chromium DevTools protocol); Playwright has no touch drag API. */
export const touchDrag = async (page: Page, from: Point, to: Point) => {
  const cdp = await page.context().newCDPSession(page);
  const send = (
    type: "touchStart" | "touchMove" | "touchEnd",
    touchPoints: Point[]
  ) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
  await send("touchStart", [from]);
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await send("touchMove", [
      {
        x: from.x + ((to.x - from.x) * i) / steps,
        y: from.y + ((to.y - from.y) * i) / steps,
      },
    ]);
  }
  await send("touchEnd", []);
  await cdp.detach();
};

export const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
