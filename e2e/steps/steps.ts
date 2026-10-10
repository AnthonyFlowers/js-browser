import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  addCell,
  cells,
  deleteCell,
  editorText,
  gotoApp,
  moveCell,
  previewRoot,
  setCode,
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
