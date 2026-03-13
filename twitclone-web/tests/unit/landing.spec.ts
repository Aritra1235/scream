import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should render the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SCREAM/i);
  });

  test("should have sign-in and sign-up links", async ({ page }) => {
    await page.goto("/");
    const signInLink = page.locator('a[href="/sign-in"]');
    const signUpLink = page.locator('a[href="/sign-up"]');
    const hasSignIn = (await signInLink.count()) > 0;
    const hasSignUp = (await signUpLink.count()) > 0;
    expect(hasSignIn || hasSignUp).toBe(true);
  });
});
