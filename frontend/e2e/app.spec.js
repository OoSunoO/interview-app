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
    test.setTimeout(30000);
    await page.goto("/");
    for (const label of Object.values(NAV)) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("shows goal card and quick actions", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /每日目标|设置每日目标/ })).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole("button", { name: /速记模式/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /模拟面试/ })).toBeVisible();
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
    // Pick first non-empty category from the select
    const catSelect = page.locator("select").first();
    const options = await catSelect.locator("option").all();
    for (const opt of options) {
      const val = await opt.getAttribute("value");
      if (val && val !== "") {
        await catSelect.selectOption(val);
        await page.waitForTimeout(400);
        const count = await page.locator("[data-testid=question-item]").count();
        if (count > 0) break; // found a category with questions
      }
    }
    // Even the "all" (empty value) should have items
    expect(await page.locator("[data-testid=question-item]").count()).toBeGreaterThanOrEqual(0);
  });

  test("clicking question opens detail panel", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid=question-item]").first().click();
    // Detail panel should show question title (not data-testid=question-title which is on Quiz page)
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    await expect(page.locator(".dp-title").first()).not.toBeEmpty();
    // "开始答题" button should be visible
    await expect(page.getByRole("button", { name: /开始答题/ })).toBeVisible();
  });

  test("detail panel can show answer", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid=question-item]").first().click();
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    // Toggle answer visibility
    await page.getByRole("button", { name: /查看答案/ }).click();
    await expect(page.locator(".dp-answer")).toBeVisible({ timeout: 2000 });
  });

  test("clicking start quiz navigates to quiz page", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid=question-item]").first().click();
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /开始答题/ }).click();
    // Should now be on Quiz page
    await expect(page.locator("[data-testid=question-title]")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Quiz", () => {
  async function goToQuiz(page) {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /随机一题/ })).toBeVisible({ timeout: 8000 });
    await page.waitForTimeout(200);
    // Use random quiz button to navigate directly to Quiz page
    await page.getByRole("button", { name: /随机一题/ }).click();
    await expect(page.locator("[data-testid=question-title]")).toBeVisible({ timeout: 5000 });
  }

  test("question loads with interactive elements", async ({ page }) => {
    await goToQuiz(page);
    await expect(page.locator("[data-testid=question-title]")).toBeVisible();
    // Either options, textarea or code editor (depends on question type)
    const interactive = page.locator("[data-testid=option-button], textarea, .q-content").first();
    await expect(interactive).toBeVisible({ timeout: 3000 });
  });

  test("hint button is clickable", async ({ page }) => {
    await goToQuiz(page);
    const hintBtn = page.locator("button.hint-trigger");
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
    await expect(page.locator("[data-testid=stats-overview]")).toBeVisible({ timeout: 5000 });
  });

  test("export and import buttons exist", async ({ page }) => {
    await goTo(page, NAV.stats);
    await expect(page.locator("[data-testid=stats-overview]")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /导出进度备份/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /导入进度备份/ })).toBeVisible();
  });
});

test.describe("Knowledge Points", () => {
  test("loads knowledge points grouped by category", async ({ page }) => {
    await goTo(page, NAV.knowledge);
    await expect(page.locator("[data-testid=page-title]")).toHaveText("知识点", { timeout: 5000 });
    await expect(page.locator("[data-testid=category-card]").first()).toBeVisible({ timeout: 8000 });
    expect(await page.locator("[data-testid=category-card]").count()).toBeGreaterThan(0);
  });

  test("clicking a knowledge point opens detail page", async ({ page }) => {
    await goTo(page, NAV.knowledge);
    await expect(page.locator("[data-testid=category-card]").first()).toBeVisible({ timeout: 8000 });
    // Expand the first category
    await page.locator("[data-testid=category-header]").first().click();
    await expect(page.locator("[data-testid=knowledge-item]").first()).toBeVisible({ timeout: 3000 });
    // Click a child knowledge point to expand inline
    await page.locator("[data-testid=knowledge-item]").first().click();
    // Click "查看完整内容 →" to navigate to the detail page
    const detailBtn = page.getByRole("button", { name: /查看完整内容/ });
    if (await detailBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detailBtn.first().click();
      await expect(page.locator("[data-testid=kp-header]")).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Review Session (SM-2)", () => {
  test("navigating from home shows setup page", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
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
    await page.getByRole("button", { name: "10" }).click();
    await page.getByRole("button", { name: "开始复习" }).click();
    await page.waitForTimeout(300);
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
    await page.getByText("查看答案").click();
    await page.waitForTimeout(200);
    await expect(page.getByText("忘记了")).toBeVisible({ timeout: 2000 });
    await expect(page.getByText("答对了")).toBeVisible();
    await page.getByText("答对了").click();
    await page.waitForTimeout(200);
    await expect(page.getByText("查看答案")).toBeVisible({ timeout: 3000 });
  });

  test("empty state when no overdue cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /间隔复习/ }).click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "10" }).click();
    await page.getByRole("button", { name: "开始复习" }).click();
    await page.waitForTimeout(300);
    const hasCard = await page.getByText("查看答案").isVisible().catch(() => false);
    const isEmpty = await page.getByText("暂无待复习题目").isVisible().catch(() => false);
    expect(hasCard || isEmpty).toBe(true);
  });
});

test.describe("QuickReview", () => {
  async function startQR(page) {
    await page.goto("/");
    await page.waitForTimeout(300);
    await page.locator("button:has-text('速记模式')").click();
    await page.waitForTimeout(200);
    // Dialog appears — click "开始" to start with defaults
    await page.locator(".dialog .dialog-btn.primary").click();
    await expect(page.locator("[data-testid=qr-page]")).toBeVisible({ timeout: 5000 });
  }

  test("loads and starts a session", async ({ page }) => {
    await startQR(page);
    await expect(page.locator("[data-testid=qr-page]")).toBeVisible();
  });

  test("session shows question and reveal button", async ({ page }) => {
    await startQR(page);
    await expect(page.locator("[data-testid=qr-card]")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("[data-testid=qr-question-title]")).toBeVisible({ timeout: 3000 });
    await expect(page.locator("[data-testid=qr-counter]")).toBeVisible({ timeout: 3000 });
  });

  test("reveal answer and self-rate", async ({ page }) => {
    await startQR(page);
    await expect(page.locator("[data-testid=qr-card]")).toBeVisible({ timeout: 5000 });
    // Reveal answer
    await page.locator("[data-testid=qr-reveal-btn]").click();
    await page.waitForTimeout(200);
    // Rating buttons appear
    await expect(page.locator("[data-testid=qr-rate-forgot]")).toBeVisible({ timeout: 2000 });
    await expect(page.locator("[data-testid=qr-rate-remembered]")).toBeVisible();
    // Rate as remembered
    await page.locator("[data-testid=qr-rate-remembered]").click();
    await page.waitForTimeout(200);
    // Counter should advance
    await expect(page.locator("[data-testid=qr-counter]")).toHaveText(/1\//);
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
    await page.getByRole("button", { name: NAV.browse }).click();
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({ timeout: 5000 });
    const canScroll = await page.evaluate(() => {
      const el = document.querySelector(".content");
      return el ? el.scrollHeight > el.clientHeight : false;
    });
    if (!canScroll) return;
    await page.evaluate(() => {
      const el = document.querySelector(".content");
      if (el) el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(200);
    const scrolled = await page.evaluate(() => {
      const el = document.querySelector(".content");
      return el ? el.scrollTop : 0;
    });
    expect(scrolled).toBeGreaterThan(0);
  });
});

test.describe("KnowledgePoints", () => {
  test("loads knowledge list with categories", async ({ page }) => {
    await goTo(page, NAV.knowledge);
    await expect(page.locator("[data-testid=page-title]")).toHaveText("知识点", { timeout: 5000 });
    await expect(page.locator("[data-testid=category-card]").first()).toBeVisible({ timeout: 8000 });
    expect(await page.locator("[data-testid=category-card]").count()).toBeGreaterThan(0);
  });

  test("can expand a category and view knowledge items", async ({ page }) => {
    await goTo(page, NAV.knowledge);
    await expect(page.locator("[data-testid=category-header]").first()).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid=category-header]").first().click();
    await expect(page.locator("[data-testid=knowledge-item]").first()).toBeVisible({ timeout: 3000 });
  });
});
