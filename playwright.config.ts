import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const PORT = 4173;
const CI = !!process.env.CI;

// `bddgen` compiles e2e/features/*.feature into this directory; it is gitignored.
const testDir = defineBddConfig({
  features: "e2e/features/**/*.feature",
  steps: "e2e/steps/**/*.ts",
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  forbidOnly: CI,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}/js-browser/`,
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Local sandboxes ship their own Chromium build; CI installs the matching one.
        launchOptions: {
          executablePath: process.env.PW_CHROMIUM_PATH || undefined,
        },
      },
    },
  ],
  webServer: {
    command: `${process.env.E2E_SKIP_BUILD ? "" : "npm run build && "}npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/js-browser/`,
    reuseExistingServer: !CI,
    timeout: 180_000,
  },
});
