import { readFileSync } from "node:fs";
import { expect, type Locator } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  addCell,
  cells,
  centerOf,
  deleteCell,
  editorText,
  gotoApp,
  hasHorizontalScroll,
  moveCell,
  previewRoot,
  setCode,
  touchDrag,
} from "../app";
import { mockUnpkg } from "../mock-unpkg";
import { test } from "./fixtures";

const { Given, When, Then } = createBdd(test);

/** Scenario steps number cells from 1. */
const cellAt = (page: Parameters<typeof cells>[0], number: number) =>
  cells(page).nth(number - 1);

const currentCell = (world: { current?: ReturnType<typeof cells> }) => {
  if (!world.current) throw new Error("No cell has been added yet");
  return world.current;
};

Given("the unpkg mock is serving fixture packages", async ({ page, world }) => {
  world.unpkg = await mockUnpkg(page);
});

Given(
  "the unpkg mock never answers requests for {string}",
  async ({ page, world }, packageName: string) => {
    // The app's 30 s request timeout is capped so the three attempts finish within seconds.
    world.unpkg = await mockUnpkg(page, {
      stall: [packageName],
      requestTimeoutMs: 300,
    });
  }
);

Given("the notebook is open", async ({ page }) => {
  await gotoApp(page);
});

When("I add a code cell", async ({ page, world }) => {
  world.current = await addCell(page, "Code");
});

When("I add a text cell", async ({ page, world }) => {
  world.current = await addCell(page, "Text");
});

When("I enter the code:", async ({ world }, code: string) => {
  await setCode(currentCell(world), code);
});

When("I enter the markdown:", async ({ page, world }, markdown: string) => {
  const text = currentCell(world);
  await text.getByText("Click to edit").click();
  await text.locator(".w-md-editor textarea").fill(markdown);
  await page.locator(".top-menu").click();
});

When("I move cell {int} up", async ({ page }, number: number) => {
  await moveCell(cellAt(page, number), "up");
});

When("I delete cell {int}", async ({ page }, number: number) => {
  await deleteCell(cellAt(page, number));
});

When("I reload the page", async ({ page }) => {
  await page.reload();
});

When("I load the book file {string}", async ({ page }, path: string) => {
  await page.getByRole("button", { name: "Load Book" }).click();
  await page.locator("input[type=file]").setInputFiles(path);
});

Then("the book has {int} cell(s)", async ({ page }, count: number) => {
  await expect(cells(page)).toHaveCount(count);
});

Then(
  "the preview of cell {int} shows {string}",
  async ({ page }, number: number, text: string) => {
    await expect(previewRoot(cellAt(page, number))).toHaveText(text);
  }
);

Then(
  "the preview of cell {int} contains a {string} with text {string}",
  async ({ page }, number: number, selector: string, text: string) => {
    await expect(
      previewRoot(cellAt(page, number)).locator(selector)
    ).toHaveText(text);
  }
);

Then(
  "the preview of cell {int} has the background colour {string}",
  async ({ page }, number: number, colour: string) => {
    await expect(
      cellAt(page, number)
        .frameLocator("iframe[title='code-executor']")
        .locator("body")
    ).toHaveCSS("background-color", colour);
  }
);

Then(
  "cell {int} shows the error {string}",
  async ({ page }, number: number, message: string) => {
    await expect(cellAt(page, number).locator(".preview-error")).toContainText(
      message
    );
  }
);

Then(
  "the editor of cell {int} contains {string}",
  async ({ page }, number: number, code: string) => {
    await expect(editorText(cellAt(page, number))).toContainText(code);
  }
);

Then(
  "the text cell {int} renders a {string} with text {string}",
  async ({ page }, number: number, selector: string, text: string) => {
    await expect(
      cellAt(page, number).locator(`.wmde-markdown ${selector}`)
    ).toHaveText(text);
  }
);

Then(
  "unpkg received a request for {string}",
  async ({ world }, path: string) => {
    expect(world.unpkg?.requests).toContain(path);
  }
);

Then(
  "unpkg received {int} requests for {string}",
  async ({ world }, count: number, path: string) => {
    expect(world.unpkg?.requests.filter((r) => r === path)).toHaveLength(count);
  }
);

Then(
  "the book is saved in IndexedDB with {string}",
  async ({ page }, text: string) => {
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            new Promise<string>((resolve) => {
              const open = indexedDB.open("cellcache");
              open.onerror = () => resolve("");
              open.onsuccess = () => {
                const db = open.result;
                if (!db.objectStoreNames.contains("keyvaluepairs")) {
                  db.close();
                  return resolve("");
                }
                const get = db
                  .transaction("keyvaluepairs")
                  .objectStore("keyvaluepairs")
                  .get("default");
                get.onsuccess = () => {
                  db.close();
                  resolve(JSON.stringify(get.result ?? ""));
                };
              };
            })
        )
      )
      .toContain(text);
  }
);

Then("the book name is {string}", async ({ page }, name: string) => {
  await expect(page.locator(".top-menu input[type=text]")).toHaveValue(name);
});

// Mobile and touch steps (e2e/features/mobile.feature)

const MIN_TOUCH_TARGET = 44;

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element has no bounding box");
  return box;
};

const expectTouchSized = async (buttons: Locator) => {
  const count = await buttons.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const { width, height } = await boxOf(buttons.nth(i));
    expect(width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  }
};

const editorHeightOf = async (cell: Locator) =>
  (await boxOf(cell.locator(".editor-wrapper"))).height;

When("the viewport is {int} px wide", async ({ page }, width: number) => {
  await page.setViewportSize({ width, height: 844 });
});

When(
  "I tap the {word} add button",
  async ({ page, world }, type: "Code" | "Text") => {
    const before = await cells(page).count();
    await page
      .locator(".add-cell")
      .last()
      .getByRole("button", { name: type })
      .tap();
    await expect(cells(page)).toHaveCount(before + 1);
    world.current = cells(page).nth(before);
  }
);

When("I tap move cell {int} up", async ({ page }, number: number) => {
  await cellAt(page, number)
    .locator(".action-bar button:has(i.fa-arrow-up)")
    .tap();
});

When("I tap delete cell {int}", async ({ page }, number: number) => {
  await cellAt(page, number)
    .locator(".action-bar button:has(i.fa-times)")
    .tap();
});

When("I tap the text cell {int}", async ({ page }, number: number) => {
  await cellAt(page, number).getByText("Click to edit").tap();
});

When("I type the markdown {string}", async ({ world }, markdown: string) => {
  await currentCell(world).locator(".w-md-editor textarea").fill(markdown);
});

When("I tap outside the text cell", async ({ page }) => {
  const { x, y } = await centerOf(page.locator(".top-menu h1"));
  await page.touchscreen.tap(x, y);
});

When(
  "I note the height of the editor of cell {int}",
  async ({ page, world }, number: number) => {
    world.editorHeight = await editorHeightOf(cellAt(page, number));
  }
);

When(
  "I drag the height handle of cell {int} by {int} px with touch",
  async ({ page }, number: number, dy: number) => {
    const cell = cellAt(page, number);
    const handle = cell.locator(".react-resizable-handle-s").first();
    const from = await centerOf(handle);
    await touchDrag(page, from, { x: from.x, y: from.y + dy });
  }
);

When("I tap Save Book", async ({ page, world }) => {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save Book" }).tap();
  world.download = await download;
});

Then("the page does not scroll horizontally", async ({ page }) => {
  expect(await hasHorizontalScroll(page)).toBe(false);
});

Then(
  "the editor of cell {int} is stacked above its preview",
  async ({ page }, number: number) => {
    const cell = cellAt(page, number);
    const editor = await boxOf(cell.locator(".editor-wrapper"));
    const preview = await boxOf(cell.locator(".progress-wrapper"));
    expect(editor.y + editor.height).toBeLessThanOrEqual(preview.y + 1);
  }
);

Then(
  "the preview of cell {int} is as wide as the cell",
  async ({ page }, number: number) => {
    const cell = cellAt(page, number);
    const preview = await boxOf(cell.locator(".progress-wrapper"));
    expect(preview.width).toBeGreaterThanOrEqual((await boxOf(cell)).width - 1);
  }
);

Then(
  "there is no Monaco keyboard overlay in cell {int}",
  async ({ page }, number: number) => {
    await expect(
      cellAt(page, number).locator(".iPadShowKeyboard")
    ).toBeHidden();
  }
);

Then(
  "the action bar buttons of cell {int} are at least 44 px",
  async ({ page }, number: number) => {
    await expectTouchSized(cellAt(page, number).locator(".action-bar button"));
  }
);

Then(
  "the Format button of cell {int} is at least 44 px",
  async ({ page }, number: number) => {
    const button = cellAt(page, number).getByRole("button", { name: "Format" });
    await expect(button).toBeVisible();
    await expect(button).toHaveCSS("opacity", "1");
    await expectTouchSized(button);
  }
);

Then("the add cell buttons are at least 44 px", async ({ page }) => {
  await expectTouchSized(page.locator(".add-cell button"));
});

Then("the top menu buttons are at least 44 px", async ({ page }) => {
  await expectTouchSized(page.locator(".top-menu button"));
});

Then(
  "the height handle of cell {int} has a hit area of at least 44 px",
  async ({ page }, number: number) => {
    const hitArea = await cellAt(page, number)
      .locator(".react-resizable-handle-s")
      .first()
      .evaluate((handle) => {
        const style = getComputedStyle(handle, "::after");
        return parseFloat(style.height);
      });
    expect(hitArea).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  }
);

Then(
  "the editor of cell {int} is about {int} px taller",
  async ({ page, world }, number: number, delta: number) => {
    const before = world.editorHeight;
    if (before === undefined) throw new Error("No editor height was noted");
    await expect
      .poll(async () => (await editorHeightOf(cellAt(page, number))) - before)
      .toBeGreaterThan(delta - 15);
    expect((await editorHeightOf(cellAt(page, number))) - before).toBeLessThan(
      delta + 15
    );
  }
);

Then(
  "a .book file is downloaded containing {string}",
  async ({ world }, text: string) => {
    expect(world.download?.suggestedFilename()).toMatch(/\.book$/);
    const path = await world.download?.path();
    expect(readFileSync(path!, "utf8")).toContain(text);
  }
);
