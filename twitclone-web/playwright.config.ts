import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    headless: true,
  },
  projects: [
    {
      name: "unit",
      testDir: "./tests/unit",
      testMatch: "**/*.spec.ts",
    },
    {
      name: "e2e",
      testDir: "./tests/e2e",
      testMatch: "**/*.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
