import { test, expect } from "@playwright/test";

const NAV = { home: "首页", browse: "题库", wrong: "错题", stats: "进度" };

async function goTo(page, tab) {
  await page.goto("/");
  await page.getByRole("button", { name: tab }).click();
}

test.describe("Home", () => {
  test("shows bottom navigation", async ({ page }) => {
    await page.goto("/");
    for (const label of Object.values(NAV)) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
  });
});

test.describe("Browse", () => {
  test("loads question list with cards", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator(".q-item").first()).toBeVisible({ timeout: 5000 });
    expect(await page.locator(".q-item").count()).toBeGreaterThan(0);
  });

  test("filters by category", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator(".q-item").first()).toBeVisible({ timeout: 5000 });
    await page.locator("select").first().selectOption("java_advanced");
    await page.waitForTimeout(300);
    expect(await page.locator(".q-item").count()).toBeGreaterThan(0);
  });

  test("clicking a question opens quiz page", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator(".q-item").first()).toBeVisible({ timeout: 5000 });
    await page.locator(".q-item").first().click();
    // Quiz page should show question title
    await expect(page.locator(".q-title")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Quiz", () => {
  test("interactive elements appear for any question type", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator(".q-item").first()).toBeVisible({ timeout: 5000 });
    await page.locator(".q-item").first().click();
    // Either option buttons or textarea appears (depends on question type)
    const quiz = page.locator(".option-btn, textarea").first();
    await expect(quiz).toBeVisible({ timeout: 5000 });
  });

  test("hint button is clickable", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator(".q-item").first()).toBeVisible({ timeout: 5000 });
    await page.locator(".q-item").first().click();
    const hintBtn = page.getByRole("button", { name: /提示/ });
    if (await hintBtn.isVisible()) {
      await hintBtn.click();
      await expect(page.locator(".hints")).toBeVisible();
    }
  });
});

test.describe("Wrong Book", () => {
  test("loads and shows content", async ({ page }) => {
    await goTo(page, NAV.wrong);
    await expect(page.locator(".page-title")).toHaveText("错题本", { timeout: 3000 });
  });
});

test.describe("Stats", () => {
  test("loads stats overview", async ({ page }) => {
    await goTo(page, NAV.stats);
    await expect(page.locator(".overview")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Mobile", () => {
  test("no horizontal overflow on 375px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const checkNoOverflow = async () => {
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      const vw = await page.evaluate(() => window.innerWidth);
      expect(sw).toBeLessThanOrEqual(vw + 1);
    };
    await checkNoOverflow();
    await page.getByRole("button", { name: NAV.browse }).click();
    await expect(page.locator(".q-item").first()).toBeVisible({ timeout: 5000 });
    await checkNoOverflow();
  });
});
