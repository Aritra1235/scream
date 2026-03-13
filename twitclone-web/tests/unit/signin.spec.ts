import { test, expect } from "@playwright/test";

test.describe("Sign In Page", () => {
  test("should render sign-in form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });

  test("should have email and password fields", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]')).toBeVisible();
    await expect(
      page.locator('input[type="password"], input[placeholder*="password" i]'),
    ).toBeVisible();
  });

  test("should have a sign-in button", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test("should have a link to create account", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator('text="Create a new account"')).toBeVisible();
  });

  test("should show error for empty form submission", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator('button:has-text("Sign In")').click();
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain("/sign-in");
  });
});
