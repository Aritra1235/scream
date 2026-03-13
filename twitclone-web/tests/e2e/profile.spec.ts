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

test.describe("Profile Page E2E", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("should display own profile with edit button", async ({ page }) => {
    await page.goto("/testuser");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Test User").first()).toBeVisible();
    await expect(page.locator("text=@testuser").first()).toBeVisible();
    await expect(page.locator('button:has-text("Edit profile")')).toBeVisible();
  });

  test("should display alice profile with follow button", async ({ page }) => {
    await page.goto("/alice");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Alice").first()).toBeVisible();
    await expect(page.locator("text=@alice").first()).toBeVisible();
    const followBtn = page.locator(
      'button:has-text("Following"), button:has-text("Follow")',
    );
    await expect(followBtn.first()).toBeVisible();
  });

  test("should show follower and following counts", async ({ page }) => {
    await page.goto("/alice");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Following").first()).toBeVisible();
    await expect(page.locator("text=Followers").first()).toBeVisible();
  });

  test("should show profile tabs (Posts, Replies, etc.)", async ({ page }) => {
    await page.goto("/testuser");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Posts").first()).toBeVisible();
    await expect(page.locator("text=Replies")).toBeVisible();
    await expect(page.locator("text=Media")).toBeVisible();
    await expect(page.locator("text=Likes")).toBeVisible();
  });

  test("should display user posts on profile", async ({ page }) => {
    await page.goto("/testuser");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=@testuser").first()).toBeVisible();
  });

  test("should return 404 for non-existent user", async ({ page }) => {
    await page.goto("/nonexistentuser99999");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=404")).toBeVisible();
  });
});
