import { test, expect } from "@playwright/test";

test.describe("Authentication E2E", () => {
  test("should sign in with valid credentials and redirect to home", async ({
    page,
  }) => {
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
    expect(page.url()).toContain("/home");
  });

  test("should show home feed after sign in", async ({ page }) => {
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

    await expect(page.locator("h1:has-text('Home')").first()).toBeVisible();
    await expect(page.locator("button:has-text('For You')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Following')").first()).toBeVisible();
  });
});
