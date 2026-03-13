import { test, expect } from "@playwright/test";

test.describe("Static Pages", () => {
  test("about page renders", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("terms page renders", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("privacy page renders", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("contact page renders", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
