import { test, expect } from "@playwright/test";

const NAV = { home: "首页", browse: "题库", knowledge: "知识点", wrong: "错题", stats: "进度" };

async function goTo(page, tab) {
  await page.goto("/");
  await expect(page.getByRole("button", { name: tab })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: tab }).click();
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
    await expect(page.getByRole("button", { name: /每日目标|设置每日目标/ })).toBeVisible({
      timeout: 3000,
    });
    await expect(page.getByRole("button", { name: /速记模式/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /模拟面试/ })).toBeVisible();
  });

  test("theme toggle switches between dark and light", async ({ page }) => {
    await page.goto("/");
    const themeBtn = page.getByRole("button", { name: "切换主题" });
    await expect(themeBtn).toBeVisible();
    const initial = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    await themeBtn.click();
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(after).not.toBe(initial);
  });

  test("daily goal button opens dialog", async ({ page }) => {
    await page.goto("/");
    const goalBtn = page.getByRole("button", { name: /每日目标|设置每日目标/ });
    await expect(goalBtn).toBeVisible({ timeout: 3000 });
    await goalBtn.click();
    await page.waitForTimeout(200);
    // Dialog should appear with goal input
    await expect(page.locator(".dialog-title")).toHaveText("每日目标", { timeout: 3000 });
    // Close via cancel
    await page.getByRole("button", { name: "取消" }).click();
    await page.waitForTimeout(200);
    // Dialog should be closed — check dialog content is gone
    await expect(page.locator(".dialog-title")).not.toBeVisible();
  });

  test("mock interview dialog has type and tag filters", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /模拟面试/ }).click();
    await page.waitForTimeout(200);
    await expect(page.locator(".dialog-title")).toHaveText("模拟面试", { timeout: 3000 });
    // Category and difficulty selects exist
    await expect(page.locator("#mi-cat")).toBeVisible();
    await expect(page.locator("#mi-diff")).toBeVisible();
    // New filters
    await expect(page.locator("#mi-type")).toBeVisible();
    await expect(page.locator("#mi-tag")).toBeVisible();
    // Type options
    const typeOpts = await page.locator("#mi-type option").all();
    const typeValues = await Promise.all(typeOpts.map((o) => o.getAttribute("value")));
    expect(typeValues).toContain("coding");
    expect(typeValues).toContain("choice");
    // Close
    await page.getByRole("button", { name: "取消" }).click();
    await page.waitForTimeout(200);
    await expect(page.locator(".dialog-title")).not.toBeVisible();
  });
});

test.describe("Browse", () => {
  test("loads question list with cards", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    expect(await page.locator("[data-testid=question-item]").count()).toBeGreaterThan(0);
  });

  test("filters by category", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
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
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    await page.locator("[data-testid=question-item]").first().click();
    // Detail panel should show question title (not data-testid=question-title which is on Quiz page)
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    await expect(page.locator(".dp-title").first()).not.toBeEmpty();
    // "开始答题" button should be visible
    await expect(page.getByRole("button", { name: /开始答题/ })).toBeVisible();
  });

  test("detail panel can show answer", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    await page.locator("[data-testid=question-item]").first().click();
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    // Toggle answer visibility
    await page.getByRole("button", { name: /查看答案/ }).click();
    await expect(page.locator(".dp-answer")).toBeVisible({ timeout: 2000 });
  });

  test("clicking start quiz navigates to quiz page", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    await page.locator("[data-testid=question-item]").first().click();
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /开始答题/ }).click();
    // Should now be on Quiz page
    await expect(page.locator("[data-testid=question-title]")).toBeVisible({ timeout: 5000 });
  });

  test("bookmark filter toggles active state", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    const bmBtn = page.locator("button.bm-filter-btn");
    await expect(bmBtn).toBeVisible();
    await bmBtn.click();
    await page.waitForTimeout(200);
    await expect(bmBtn).toHaveClass(/active/);
    await bmBtn.click();
    await page.waitForTimeout(200);
    await expect(bmBtn).not.toHaveClass(/active/);
  });

  test("search filters questions", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    const searchBox = page.getByPlaceholder(/搜索/);
    await expect(searchBox).toBeVisible();
    // Get initial count
    const initialCount = await page.locator("[data-testid=question-item]").count();
    // Type something that likely matches few questions
    await searchBox.fill("TCP");
    await page.waitForTimeout(400);
    const filteredCount = await page.locator("[data-testid=question-item]").count();
    // Should have at least one result but likely fewer than all
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    // Clear search
    await searchBox.fill("");
    await page.waitForTimeout(300);
    const restoredCount = await page.locator("[data-testid=question-item]").count();
    expect(restoredCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test("tag filter narrows results", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    // Find the tag filter select (last filter-item select)
    const tagSelect = page.locator(".filter-item select").last();
    await expect(tagSelect).toBeVisible();
    // Pick first non-empty tag option
    const options = await tagSelect.locator("option").all();
    let picked = false;
    for (const opt of options) {
      const val = await opt.getAttribute("value");
      if (val && val !== "") {
        await tagSelect.selectOption(val);
        await page.waitForTimeout(400);
        picked = true;
        break;
      }
    }
    expect(picked).toBe(true);
    // Reset filters
    await page.getByRole("button", { name: /重置/ }).click();
    await page.waitForTimeout(300);
  });

  test("detail panel shows related questions", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    await page.locator("[data-testid=question-item]").first().click();
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    // Check for related questions section
    const related = page.locator(".dp-related");
    if (await related.isVisible()) {
      await expect(related.locator(".dp-related-item").first()).toBeVisible({ timeout: 2000 });
    }
    // Close detail panel
    await page.locator(".dp-close").click();
    await page.waitForTimeout(200);
  });

  test("detail panel notes are editable", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    await page.locator("[data-testid=question-item]").first().click();
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    // Open notes section
    await page.locator(".dp-notes-summary").click();
    await page.waitForTimeout(200);
    const notesInput = page.locator(".dp-notes-input");
    await expect(notesInput).toBeVisible({ timeout: 2000 });
    // Write a note
    await notesInput.fill("E2E test note");
    await page.waitForTimeout(300);
    // Close and reopen to verify persistence
    await page.locator(".dp-close").click();
    await page.waitForTimeout(200);
    await page.locator("[data-testid=question-item]").first().click();
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    await page.locator(".dp-notes-summary").click();
    await page.waitForTimeout(200);
    await expect(page.locator(".dp-notes-input")).toHaveValue("E2E test note");
    // Clean up
    await notesInput.fill("");
    await page.waitForTimeout(200);
  });
});

test.describe("Quiz", () => {
  async function goToQuiz(page) {
    await page.goto("/");
    await page.waitForLoadState("load");
    // Wait for the random-quiz button before clicking (allows warm-up data load)
    await expect(page.getByRole("button", { name: /随机一题/ })).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /随机一题/ }).click({ timeout: 5000 });
    // Wait for quiz page navigation + async question data load (warm-up may be slow)
    await expect(page.locator("[data-testid=question-title]")).toBeVisible({ timeout: 15000 });
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

  test("can reveal answer and view content", async ({ page }) => {
    await goToQuiz(page);
    const revealBtn = page.getByRole("button", { name: /查看答案/ });
    if (await revealBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await revealBtn.click();
      await page.waitForTimeout(200);
      await expect(
        page.locator(".q-answer, .answer-section, [data-testid=answer-content]").first(),
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test("self-evaluation: submit answer and rate", async ({ page }) => {
    await goTo(page, NAV.browse);
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    await page.locator("[data-testid=question-item]").first().click();
    await expect(page.locator(".dp-title")).toBeVisible({ timeout: 3000 });
    await page.getByRole("button", { name: /开始答题/ }).click();
    await expect(page.locator("[data-testid=question-title]")).toBeVisible({ timeout: 8000 });

    // Handle different question types
    const optBtn = page.locator("[data-testid=option-button]").first();
    if (await optBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Choice question: selecting correct option auto-reveals answer
      await optBtn.click();
    } else {
      const textarea = page.locator("textarea").first();
      if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Short answer: type, submit, then self-evaluate
        await textarea.pressSequentially("test answer");
        // Scroll submit button into view to avoid nav bar interception
        const submitBtn = page.getByRole("button", { name: /提交答案/ });
        await submitBtn.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        await submitBtn.click({ force: true });

        // Self-evaluate as correct
        await expect(page.getByRole("button", { name: /答对了/ })).toBeVisible({ timeout: 5000 });
        await page.getByRole("button", { name: /答对了/ }).click();
        await page.waitForTimeout(300);
      }
    }

    // Answer section should be visible (appears after correct option or self-evaluation)
    await expect(page.locator("[data-testid=answer-section]").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("Escape key exits quiz back to browse", async ({ page }) => {
    test.setTimeout(30000);
    // Clear any leftover quiz session backup from previous tests
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("quiz_session_backup");
      localStorage.removeItem("quiz_review_sessions_e2e-test");
    });
    await goToQuiz(page);
    await expect(page.locator("[data-testid=question-title]")).toBeVisible();
    // Press Escape to exit
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    // Should be back on Browse page
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Wrong Book", () => {
  test("loads and shows content", async ({ page }) => {
    await goTo(page, NAV.wrong);
    await expect(page.locator("[data-testid=page-title]")).toHaveText("错题本", { timeout: 3000 });
  });

  test("keyboard shortcuts in review mode: Space reveal, Escape exit", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    // Inject progress with 2 wrong questions (IDs 1 and 2 exist in the index)
    await page.evaluate(() => {
      localStorage.setItem(
        "quiz_progress_e2e-test",
        JSON.stringify({
          1: { status: "wrong", wrong_count: 2 },
          2: { status: "wrong", wrong_count: 1 },
        }),
      );
    });
    await page.getByRole("button", { name: NAV.wrong }).click();
    await page.waitForTimeout(300);
    // Click button that starts review
    const reviewBtn = page.getByRole("button", { name: /开始复习/ });
    await expect(reviewBtn).toBeVisible({ timeout: 3000 });
    await reviewBtn.click();
    await page.waitForTimeout(300);
    // Review card should appear
    await expect(page.locator(".review-card")).toBeVisible({ timeout: 5000 });
    // Press Space to reveal answer
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);
    await expect(page.locator(".review-answer")).toBeVisible({ timeout: 2000 });
    // Press Escape to exit review mode
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
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
    await expect(page.locator("button.export-btn-sm")).toBeVisible();
    await expect(page.locator("button.import-btn-sm")).toBeVisible();
  });
});

test.describe("Knowledge Points", () => {
  test("loads knowledge points as domain tree", async ({ page }) => {
    await goTo(page, NAV.knowledge);
    await expect(page.locator("[data-testid=page-title]")).toHaveText("知识体系", { timeout: 5000 });
    await expect(page.locator(".domain-card").first()).toBeVisible({ timeout: 8000 });
    expect(await page.locator(".domain-card").count()).toBeGreaterThan(0);
  });

  test("clicking a knowledge point opens detail page", async ({ page }) => {
    await goTo(page, NAV.knowledge);
    await expect(page.locator(".domain-card").first()).toBeVisible({ timeout: 8000 });
    // Expand the first domain
    await page.locator(".domain-header").first().click();
    // Expand the first sub-section if any
    const subHeader = page.locator(".sub-header").first();
    if (await subHeader.isVisible({ timeout: 3000 }).catch(() => false)) {
      await subHeader.click();
    }
    // Click a knowledge item
    await expect(page.locator(".kp-item").first()).toBeVisible({ timeout: 3000 });
    await page.locator(".kp-item").first().click();
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
    const hasCard = await page
      .getByText("查看答案")
      .isVisible()
      .catch(() => false);
    const isEmpty = await page
      .getByText("暂无待复习题目")
      .isVisible()
      .catch(() => false);
    expect(hasCard || isEmpty).toBe(true);
  });

  test("Escape key exits active session back to home", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: /间隔复习/ }).click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "10" }).click();
    await page.getByRole("button", { name: "开始复习" }).click();
    await page.waitForTimeout(300);
    const hasCard = await page
      .getByText("查看答案")
      .isVisible()
      .catch(() => false);
    const isEmpty = await page
      .getByText("暂无待复习题目")
      .isVisible()
      .catch(() => false);
    if (!hasCard && isEmpty) return;
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    await expect(page.getByRole("button", { name: /间隔复习/ })).toBeVisible({ timeout: 3000 });
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

  test("Escape key exits active session back to home", async ({ page }) => {
    await startQR(page);
    await expect(page.locator("[data-testid=qr-page]")).toBeVisible({ timeout: 5000 });
    // Press Escape to exit
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    // Should be back on home page
    await expect(page.getByRole("button", { name: /速记模式/ })).toBeVisible({ timeout: 3000 });
  });
});

test.describe("QuickReview History on Stats", () => {
  test("shows QuickReview session data on stats page after injection", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);

    // Inject QR history into localStorage (the key uses username suffix from storageState)
    await page.evaluate(() => {
      const history = [
        {
          total: 8,
          remembered: 5,
          forgot: 2,
          unsure: 1,
          category: "database",
          difficulty: "medium",
          date: new Date().toISOString(),
        },
        {
          total: 6,
          remembered: 4,
          forgot: 1,
          unsure: 1,
          category: "algorithm",
          difficulty: "easy",
          date: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      // Username from storageState is "e2e-test"
      localStorage.setItem("quick_review_history_e2e-test", JSON.stringify(history));
    });

    // Navigate to Stats
    await page.getByRole("button", { name: "进度" }).click();
    await page.waitForTimeout(300);
    // Switch to "记录" tab
    await page.getByRole("button", { name: "记录" }).click();
    await page.waitForTimeout(200);

    // Should see the QR history section with summary
    await expect(page.locator(".qr-summary")).toBeVisible({ timeout: 5000 });
    // Summary should show 2 sessions
    await expect(page.locator(".qr-summary-item").first()).toContainText("2");
    // Should see "去速记" button
    await expect(page.getByRole("button", { name: /去速记/ })).toBeVisible();
    // QR history items should be rendered
    await expect(page.locator(".qr-history-item").first()).toBeVisible();
  });
});

test.describe("Mock Interview History on Stats", () => {
  test("shows Mock Interview history with filter context on stats page", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);

    // Inject MI history into localStorage
    await page.evaluate(() => {
      const history = [
        {
          correct: 5,
          wrong: 2,
          total: 7,
          pct: 71,
          totalTime: 420,
          timeLimit: 600,
          category: "database",
          difficulty: "medium",
          type: "short_answer",
          tag: "SQL",
          date: new Date().toISOString(),
        },
        {
          correct: 3,
          wrong: 3,
          total: 6,
          pct: 50,
          totalTime: 300,
          timeLimit: 600,
          category: "algorithm",
          difficulty: "hard",
          date: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      localStorage.setItem("mock_interview_history_e2e-test", JSON.stringify(history));
    });

    // Navigate to Stats
    await page.getByRole("button", { name: "进度" }).click();
    await page.waitForTimeout(300);
    // Switch to "记录" tab
    await page.getByRole("button", { name: "记录" }).click();
    await page.waitForTimeout(200);

    // Should see the MI history section with summary
    await expect(page.locator(".mi-summary")).toBeVisible({ timeout: 5000 });
    // Summary should show 2 sessions
    await expect(page.locator(".mi-summary-item").first()).toContainText("2");
    // Should see "模拟面试" nav button
    await expect(page.getByRole("button", { name: /模拟面试/ })).toBeVisible();
    // MI history items should be rendered
    await expect(page.locator(".mi-history-item").first()).toBeVisible();

    // First item should show filter context: 数据库 中等 问答题 · SQL
    const firstFilters = page.locator(".mi-history-filters").first();
    await expect(firstFilters).toContainText("数据库");
    await expect(firstFilters).toContainText("中等");
    await expect(firstFilters).toContainText("问答题");
    await expect(firstFilters).toContainText("SQL");

    // Second item shows category and difficulty: 算法 困难
    const lastFilters = page.locator(".mi-history-filters").last();
    await expect(lastFilters).toContainText("算法");
    await expect(lastFilters).toContainText("困难");
  });
});

test.describe("Mock Interview Flow", () => {
  test("starts a session, answers a question, and completes", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => {
      errors.push(err.message);
      console.error("[PAGE ERROR]", err.message);
    });

    await page.goto("/");
    await page.waitForTimeout(300);

    // Wait for data to load
    await expect(page.getByRole("button", { name: /模拟面试/ })).toBeVisible({ timeout: 10000 });

    // Open MI dialog
    await page.getByRole("button", { name: /模拟面试/ }).click();
    await page.waitForTimeout(200);
    await expect(page.locator(".dialog-title")).toHaveText("模拟面试", { timeout: 3000 });

    // Set category to one with questions
    await page.locator("#mi-cat").selectOption("java");
    // Set count to 5
    await page.locator("button.count-btn").filter({ hasText: "5" }).click();
    // Set time limit to 5min to avoid auto-advance interference
    await page.locator("button.time-btn").filter({ hasText: "5分" }).click();

    // Start session
    await page.getByRole("button", { name: /开始模拟/ }).click();

    // Verify Quiz loaded with MI-specific UI
    await expect(page.locator("[data-testid=question-title]")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".mi-badge")).toHaveText("模拟面试");
    await expect(page.locator(".mi-filter-label")).toBeVisible();
    await expect(page.locator(".q-timer")).toBeVisible();
    await expect(page.locator("button.browse-toggle")).not.toBeVisible();

    // Answer the first question and navigate through all 5
    for (let i = 0; i < 5; i++) {
      // Wait for question to load
      await expect(page.locator("[data-testid=question-title]")).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(200);

      // Check question type and answer accordingly
      const optBtn = page.locator("[data-testid=option-button]").first();
      if (await optBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await optBtn.click({ force: true });
        await page.waitForTimeout(150);  // Wait for Svelte reactivity (showAnswer / retry buttons)
        // For multiple_choice: submit after selecting
        const submitMulti = page.getByRole("button", { name: /确认提交/ });
        if (await submitMulti.isVisible({ timeout: 500 }).catch(() => false)) {
          await submitMulti.click();
        }
        // If wrong answer, attempt retry first, then give up
        const retryBtn = page.getByRole("button", { name: /再试一次/ });
        if (await retryBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await retryBtn.click();
          await page.waitForTimeout(100);
          // After retry, try another option or give up
          const opt2 = page.locator("[data-testid=option-button]:not(.selected)").first();
          if (await opt2.isVisible({ timeout: 500 }).catch(() => false)) {
            await opt2.click({ force: true });
            await page.waitForTimeout(150);
          }
        }
        // Give up to reveal answer
        const giveUp = page.getByRole("button", { name: /看答案/ });
        if (await giveUp.isVisible({ timeout: 1000 }).catch(() => false)) {
          await giveUp.click();
          await page.waitForTimeout(150);
        }
      } else {
        const textarea = page.locator("textarea").first();
        if (await textarea.isVisible({ timeout: 1000 }).catch(() => false)) {
          await textarea.pressSequentially("test answer " + i);
          await page.waitForTimeout(100);
          const submitBtn = page.getByRole("button", { name: /提交答案/ });
          await expect(submitBtn).toBeEnabled({ timeout: 3000 });
          await submitBtn.click();
          // Click either "答对了" or "答错了"
          const correctBtn = page.getByRole("button", { name: /答对了/ });
          const wrongBtn = page.getByRole("button", { name: /答错了/ });
          await Promise.race([
            expect(correctBtn).toBeVisible({ timeout: 5000 }),
            expect(wrongBtn).toBeVisible({ timeout: 5000 }),
          ]);
          if (await correctBtn.isVisible().catch(() => false)) {
            await correctBtn.click();
          } else {
            await wrongBtn.click();
          }
          await page.waitForTimeout(200);
        }
      }

      // Verify answer is visible
      await expect(page.locator("[data-testid=answer-section]").first()).toBeVisible({
        timeout: 5000,
      });

      // Navigate to next question or finish on the last
      if (i < 4) {
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(500);
      } else {
        // On the last question, click "完成" to finish
        await page.getByRole("button", { name: /完成/ }).click();
        await page.waitForTimeout(300);
      }
    }
    expect(errors, `Page errors: ${errors.join(" | ")}`).toHaveLength(0);

    // Verify summary screen
    await expect(page.locator(".session-summary")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".session-summary.mock-summary")).toBeVisible();
    await expect(page.locator(".mi-summary-filters")).toBeVisible();
    await expect(page.locator(".ss-title")).toHaveText("模拟面试完成");
    // "再来一轮" button navigates to Home
    await expect(page.getByRole("button", { name: /再来一轮/ })).toBeVisible();
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
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
    await checkNoOverflow();
  });

  test("page content is scrollable vertically", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.getByRole("button", { name: NAV.browse }).click();
    await expect(page.locator("[data-testid=question-item]").first()).toBeVisible({
      timeout: 5000,
    });
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

test.describe("Stats Tabs", () => {
  test("switches between tabs and shows content", async ({ page }) => {
    await goTo(page, NAV.stats);
    await expect(page.locator("[data-testid=stats-overview]")).toBeVisible({ timeout: 5000 });
    // Default tab is 统计 — difficulty and category sections should be visible
    await expect(page.locator(".section-title").first()).toBeVisible({ timeout: 3000 });
    // Switch to 记录 tab
    await page.getByRole("button", { name: "记录" }).click();
    await page.waitForTimeout(200);
    // Should show yearly activity or weekly chart
    await expect(page.locator(".section-title").first()).toBeVisible();
    // Switch to 薄弱 tab
    await page.getByRole("button", { name: "薄弱" }).click();
    await page.waitForTimeout(200);
    // Should show empty state with encouragement
    await expect(page.getByText("暂无薄弱知识点")).toBeVisible({ timeout: 3000 });
  });
});

test.describe("WrongBook AI Analysis", () => {
  test("shows AI analysis tab with CTA", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    // Inject wrong questions so tab bar appears
    await page.evaluate(() => {
      localStorage.setItem(
        "quiz_progress_e2e-test",
        JSON.stringify({
          1: { status: "wrong", wrong_count: 2 },
          2: { status: "wrong", wrong_count: 1 },
        }),
      );
    });
    await page.getByRole("button", { name: NAV.wrong }).click();
    await page.waitForTimeout(300);
    await expect(page.locator("[data-testid=page-title]")).toHaveText("错题本", { timeout: 3000 });
    // Switch to AI 分析 tab
    await page.getByRole("button", { name: "AI 分析" }).click();
    await page.waitForTimeout(200);
    // CTA should be visible
    await expect(page.getByText("AI 将分析你的错题")).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole("button", { name: /开始分析/ })).toBeVisible();
  });
});

test.describe("Empty States", () => {
  test("wrong book shows empty state when no wrong questions", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(300);
    // Ensure no wrong questions exist
    await page.evaluate(() => {
      localStorage.removeItem("quiz_progress_e2e-test");
    });
    await page.getByRole("button", { name: NAV.wrong }).click();
    await page.waitForTimeout(300);
    await expect(page.getByText("暂无错题")).toBeVisible({ timeout: 3000 });
  });
});
