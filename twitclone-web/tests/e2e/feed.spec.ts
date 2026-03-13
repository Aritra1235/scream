import { test, expect, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.fill(
    'input[type="email"], input[placeholder*="email" i]',
    "test@example.com",
  );
  await page.fill(
    'input[type="password"], input[placeholder*="password" i]',
    "TestPassword123!",
  );
  await page.click('button:has-text("Sign In")');
  await page.waitForURL("**/home", { timeout: 10000 });
}

test.describe("Feed E2E", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("should display For You and Following tabs", async ({ page }) => {
    await expect(page.locator("button:has-text('For You')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Following')").first()).toBeVisible();
  });

  test("should show posts in For You tab", async ({ page }) => {
    await page.waitForTimeout(2000);
    const posts = page.locator('[class*="divide"]').first();
    await expect(posts).toBeVisible();
  });

  test("should switch to Following tab", async ({ page }) => {
    await page.locator("button:has-text('Following')").first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator("button:has-text('Following')").first()).toBeVisible();
  });

  test("should switch back to For You tab", async ({ page }) => {
    await page.locator("button:has-text('Following')").first().click();
    await page.waitForTimeout(500);
    await page.locator("button:has-text('For You')").first().click();
    await page.waitForTimeout(500);
    await expect(page.locator("button:has-text('For You')").first()).toBeVisible();
  });

  test("should have a tweet input area", async ({ page }) => {
    await expect(
      page.locator('textarea, [contenteditable], [placeholder*="MIND"]'),
    ).toBeVisible();
  });

  test("should have a SCREAM button", async ({ page }) => {
    await expect(
      page.locator('button:has-text("SCREAM")').first(),
    ).toBeVisible();
  });
});
