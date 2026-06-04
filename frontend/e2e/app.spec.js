import { test, expect } from "@playwright/test";

const NAV = { home: "首页", browse: "题库", knowledge: "知识点", wrong: "错题", stats: "进度" };

async function goTo(page, tab) {
  await page.goto("/");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: tab }).click();
  await page.waitForTimeout(200);
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
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    expect(await page.locator("[data-testid=question-item]").count()).toBeGreaterThan(0);
  });

  test("filters by category", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    await page.locator("select").first().selectOption("java_advanced");
    await page.waitForTimeout(300);
    expect(await page.locator("[data-testid=question-item]").count()).toBeGreaterThan(0);
  });

  test("clicking a question opens quiz page", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid=question-item]").first().click();
    // Quiz page should show question title
    await expect(page.locator("[data-testid=question-title]")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Quiz", () => {
  test("interactive elements appear for any question type", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid=question-item]").first().click();
    // Either option buttons or textarea appears (depends on question type)
    const quiz = page.locator("[data-testid=option-button], textarea").first();
    await expect(quiz).toBeVisible({ timeout: 5000 });
  });

  test("hint button is clickable", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid=question-item]").first().click();
    const hintBtn = page.getByRole("button", { name: /提示/ });
    if (await hintBtn.isVisible()) {
      await hintBtn.click();
      await expect(page.locator("[data-testid=hints-list]")).toBeVisible();
    }
  });
});

test.describe("Wrong Book", () => {
  test("loads and shows content", async ({ page }) => {
    await goTo(page, NAV.wrong);
    await expect(page.locator("[data-testid=page-title]")).toHaveText("错题本", { timeout: 3000 });
  });
});

test.describe("Stats", () => {
  test("loads stats overview", async ({ page }) => {
    await goTo(page, NAV.stats);
    // Wait for async stats to load: loading text disappears → overview appears
    await expect(page.locator("[data-testid=stats-overview]")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Knowledge Points", () => {
  test("loads knowledge points grouped by category", async ({ page }) => {
    await goTo(page, NAV.knowledge);
    await expect(page.locator("[data-testid=category-card]").first()).toBeVisible({ timeout: 5000 });
    expect(await page.locator("[data-testid=category-card]").count()).toBeGreaterThan(0);
  });

  test("clicking a knowledge point opens detail page", async ({ page }) => {
    await goTo(page, NAV.knowledge);
    await expect(page.locator("[data-testid=category-card]").first()).toBeVisible({ timeout: 5000 });
    // Expand the first category
    await page.locator("[data-testid=category-header]").first().click();
    await expect(page.locator("[data-testid=knowledge-item]").first()).toBeVisible({ timeout: 3000 });
    // Click a child knowledge point to expand inline
    await page.locator("[data-testid=knowledge-item]").first().click();
    // Click "查看完整内容 →" to navigate to the detail page
    await page.getByRole("button", { name: /查看完整内容/ }).first().click();
    await expect(page.locator("[data-testid=kp-header]")).toBeVisible({ timeout: 5000 });
  });
});

test.test.describe("Review Session (SM-2)", () => {
  test("navigating from home shows setup page", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    // Click "间隔复习" button on home
    await page.getByRole("button", { name: /间隔复习/ }).click();
    await page.waitForTimeout(200);
    await expect(page.getByText("选择分类和题量")).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole("button", { name: "开始复习" })).toBeVisible();
  });

  test("setup and start a review session", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /间隔复习/ }).click();
    await page.waitForTimeout(200);
    // Select count 10
    await page.getByRole("button", { name: "10" }).click();
    // Start review
    await page.getByRole("button", { name: "开始复习" }).click();
    await page.waitForTimeout(300);
    // Should show a question card
    await expect(page.getByText("查看答案")).toBeVisible({ timeout: 5000 });
  });

  test("reveal answer and rate a card", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /间隔复习/ }).click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "10" }).click();
    await page.getByRole("button", { name: "开始复习" }).click();
    await page.waitForTimeout(300);
    // Reveal answer
    await page.getByText("查看答案").click();
    await page.waitForTimeout(200);
    // Rating buttons should appear
    await expect(page.getByText("忘记了")).toBeVisible({ timeout: 2000 });
    await expect(page.getByText("答对了")).toBeVisible();
    // Rate as "good"
    await page.getByText("答对了").click();
    await page.waitForTimeout(200);
    // Should advance to next card
    await expect(page.getByText("查看答案")).toBeVisible({ timeout: 3000 });
  });

  test("empty state when no overdue cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /间隔复习/ }).click();
    await page.waitForTimeout(200);
    // Start with just 1 question — should always have at least 1 card
    await page.getByRole("button", { name: "10" }).click();
    await page.getByRole("button", { name: "开始复习" }).click();
    await page.waitForTimeout(300);
    // Active phase: either a card or empty state
    const hasCard = await page.getByText("查看答案").isVisible().catch(() => false);
    const isEmpty = await page.getByText("暂无待复习题目").isVisible().catch(() => false);
    expect(hasCard || isEmpty).toBe(true);
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
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    await checkNoOverflow();
  });

  test("page content is scrollable vertically", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    // Browse page with many items should be scrollable
    await page.getByRole("button", { name: NAV.browse }).click();
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    // Scroll down and verify page moves
    const scrollBefore = await page.evaluate(() => {
      const el = document.querySelector(".content");
      return el ? el.scrollTop : document.documentElement.scrollTop;
    });
    await page.evaluate(() => {
      const el = document.querySelector(".content");
      if (el) el.scrollTop = 500;
    });
    await page.waitForTimeout(200);
    const scrollAfter = await page.evaluate(() => {
      const el = document.querySelector(".content");
      return el ? el.scrollTop : document.documentElement.scrollTop;
    });
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  });
});
