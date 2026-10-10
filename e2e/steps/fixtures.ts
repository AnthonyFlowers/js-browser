import type { Locator } from "@playwright/test";
import { test as base } from "playwright-bdd";
import type { UnpkgMock } from "../mock-unpkg";

/** State shared by the steps of one scenario. */
export interface World {
  unpkg?: UnpkgMock;
  /** The cell most recently added, which "I enter the code" targets. */
  current?: Locator;
}

export const test = base.extend<{ world: World }>({
  world: async ({}, use) => {
    await use({});
  },
});
