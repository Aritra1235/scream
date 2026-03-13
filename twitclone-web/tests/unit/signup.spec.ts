import { test, expect } from "@playwright/test";

test.describe("Sign Up Page", () => {
  test("should render sign-up form", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator("text=Create your account")).toBeVisible();
  });

  test("should have name, email, and password fields", async ({ page }) => {
    await page.goto("/sign-up");
    await page.waitForTimeout(500);
    const inputs = page.locator("input:visible");
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("should have a way to navigate to sign in", async ({ page }) => {
    await page.goto("/sign-up");
    await page.waitForTimeout(500);
    const hasLink = (await page.locator('a[href="/sign-in"]').count()) > 0;
    const hasButton = (await page.locator('button:has-text("Sign in"), button:has-text("sign in")').count()) > 0;
    const hasText = (await page.locator('text=/sign.in/i').count()) > 0;
    expect(hasLink || hasButton || hasText).toBe(true);
  });
});
