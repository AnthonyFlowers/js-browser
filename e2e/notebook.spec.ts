import { expect, test } from "@playwright/test";
import {
  addCell,
  cells,
  deleteCell,
  editorText,
  gotoApp,
  moveCell,
  previewRoot,
  setCode,
} from "./app";
import { mockUnpkg } from "./mock-unpkg";

test.describe("notebook", () => {
  test("show() renders a value in the preview iframe", async ({ page }) => {
    await mockUnpkg(page);
    await gotoApp(page);
    const cell = await addCell(page, "Code");
    await setCode(cell, 'show("hello from e2e")');
    await expect(previewRoot(cell)).toHaveText("hello from e2e");
  });

  test("renders JSX through show() and edits a text cell as markdown", async ({
    page,
  }) => {
    await mockUnpkg(page);
    await gotoApp(page);

    const code = await addCell(page, "Code");
    await setCode(
      code,
      'const Greeting = ({ name }) => <h1 className="greet">Hello, {name}</h1>;\nshow(<Greeting name="JSX" />)'
    );
    await expect(previewRoot(code).locator("h1.greet")).toHaveText(
      "Hello, JSX"
    );

    const text = await addCell(page, "Text");
    await text.getByText("Click to edit").click();
    await text
      .locator(".w-md-editor textarea")
      .fill("# Notes\n\nSome *emphasis*");
    await page.locator(".top-menu").click();
    await expect(text.locator(".wmde-markdown h1")).toHaveText("Notes");
    await expect(text.locator(".wmde-markdown em")).toHaveText("emphasis");
  });

  test("resolves bare imports through unpkg and reports failing imports", async ({
    page,
  }) => {
    const unpkg = await mockUnpkg(page);
    await gotoApp(page);

    const cell = await addCell(page, "Code");
    await setCode(
      cell,
      'import { shout } from "tiny-helper";\nimport "tiny-styles/style.css";\nshow(shout("hi"))'
    );
    await expect(previewRoot(cell)).toHaveText("HI!");
    await expect(
      cell.frameLocator("iframe[title='code-executor']").locator("body")
    ).toHaveCSS("background-color", "rgb(1, 2, 3)");
    expect(unpkg.requests).toContain("/tiny-helper@1.0.0/lib/upper.js");

    await setCode(cell, 'import "no-such-package";\nshow("unreachable")');
    await expect(cell.locator(".preview-error")).toContainText(
      "Failed to fetch https://unpkg.com/no-such-package: HTTP 404"
    );
  });

  test("moves and deletes cells and the cumulative scope follows", async ({
    page,
  }) => {
    await mockUnpkg(page);
    await gotoApp(page);

    const first = await addCell(page, "Code");
    await setCode(first, 'var tag = "A";');
    const second = await addCell(page, "Code");
    await setCode(second, 'var tag = "B";');
    const third = await addCell(page, "Code");
    await setCode(third, "show(tag)");
    await expect(previewRoot(third)).toHaveText("B");

    await moveCell(second, "up");
    await expect(editorText(cells(page).nth(0))).toContainText('"B"');
    await expect(editorText(cells(page).nth(1))).toContainText('"A"');
    await expect(previewRoot(third)).toHaveText("A");

    await deleteCell(cells(page).nth(1));
    await expect(cells(page)).toHaveCount(2);
    await expect(previewRoot(cells(page).nth(1))).toHaveText("B");
  });

  test("restores the book from IndexedDB after a reload", async ({ page }) => {
    await mockUnpkg(page);
    await gotoApp(page);
    const cell = await addCell(page, "Code");
    await setCode(cell, 'show("persisted")');
    await expect(previewRoot(cell)).toHaveText("persisted");
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
      .toContain("persisted");

    await page.reload();
    await expect(cells(page)).toHaveCount(1);
    await expect(editorText(cells(page).first())).toContainText("persisted");
    await expect(previewRoot(cells(page).first())).toHaveText("persisted");
    await expect(page.locator(".top-menu input[type=text]")).toHaveValue(
      "default"
    );
  });

  test("loads a .book file through Load Book", async ({ page }) => {
    await mockUnpkg(page);
    await gotoApp(page);
    await page.getByRole("button", { name: "Load Book" }).click();
    await page
      .locator("input[type=file]")
      .setInputFiles("e2e/fixtures/sample.book");

    await expect(cells(page)).toHaveCount(2);
    await expect(previewRoot(cells(page).nth(0))).toHaveText(
      "loaded from a book"
    );
    await expect(cells(page).nth(1).locator(".wmde-markdown h1")).toHaveText(
      "Imported heading"
    );
  });

  test("a stalled package ends in the fetch error message", async ({
    page,
  }) => {
    // The app's 30 s request timeout is capped so the three attempts finish within seconds.
    const unpkg = await mockUnpkg(page, {
      stall: ["tiny-helper"],
      requestTimeoutMs: 300,
    });
    await gotoApp(page);
    const cell = await addCell(page, "Code");
    await setCode(
      cell,
      'import { shout } from "tiny-helper";\nshow(shout("x"))'
    );

    await expect(cell.locator(".preview-error")).toContainText(
      "Failed to fetch https://unpkg.com/tiny-helper: timed out after 30s (3 attempts)"
    );
    expect(unpkg.requests.filter((r) => r === "/tiny-helper")).toHaveLength(3);
  });
});
