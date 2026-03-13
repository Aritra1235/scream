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

test.describe("Explore Page E2E", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("should navigate to explore page", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.locator("text=EXPLORE").first()).toBeVisible();
  });

  test("should show trending users section", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=TRENDING USERS")).toBeVisible();
    await expect(
      page.locator("text=Popular accounts powered by the social graph"),
    ).toBeVisible();
  });

  test("should display user cards with follow buttons", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForTimeout(2000);
    const followButtons = page.locator(
      'button:has-text("Follow"), button:has-text("Following")',
    );
    const count = await followButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should navigate to explore from sidebar", async ({ page }) => {
    const exploreLink = page.locator('a[href="/explore"]');
    await exploreLink.click();
    await page.waitForURL("**/explore", { timeout: 5000 });
    expect(page.url()).toContain("/explore");
  });
});
