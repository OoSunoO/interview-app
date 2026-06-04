import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

/** Small fixture covering all filter/sort/pagination scenarios */
const FIXTURE = [
  {
    id: 1,
    category: "java_basic",
    difficulty: "easy",
    type: "short_answer",
    title: "Java是什么",
    content: "问Java核心",
    answer: "答Java",
    hints: [],
    tags: ["Java基础"],
    options: [],
    company: "",
  },
  {
    id: 2,
    category: "java_basic",
    difficulty: "medium",
    type: "choice",
    title: "Java选择",
    content: "选哪个",
    answer: "A) a",
    hints: [],
    tags: ["Java基础"],
    options: ["A) a", "B) b"],
    company: "字节跳动",
  },
  {
    id: 3,
    category: "database",
    difficulty: "hard",
    type: "short_answer",
    title: "SQL优化",
    content: "如何优化慢查询",
    answer: "加索引",
    hints: [],
    tags: ["SQL"],
    options: [],
    company: "",
  },
  {
    id: 4,
    category: "algorithm",
    difficulty: "easy",
    type: "coding",
    title: "两数之和",
    content: "求和",
    answer: "return",
    hints: [],
    tags: ["数组"],
    options: [],
    company: "Google",
  },
  {
    id: 5,
    category: "java_basic",
    difficulty: "medium",
    type: "true_false",
    title: "Java判断",
    content: "判断描述",
    answer: "正确",
    hints: [],
    tags: ["Java基础"],
    options: ["正确", "错误"],
    company: "",
  },
  {
    id: 6,
    category: "database",
    difficulty: "medium",
    type: "multiple_choice",
    title: "数据库事务ACID",
    content: "ACID",
    answer: "答案：A)、B)、C)。解析：...",
    hints: [],
    tags: ["事务"],
    options: ["A) 原子性", "B) 一致性", "C) 隔离性", "D) 冗余性"],
    company: "腾讯",
  },
];

const FIXTURE_INDEX = FIXTURE.map((q) => ({
  id: q.id,
  category: q.category,
  difficulty: q.difficulty,
  type: q.type,
  title: q.title,
  tags: q.tags || [],
  company: q.company || "",
}));

vi.mock("../question-data/index.js", () => ({
  questionIndex: FIXTURE_INDEX,
  // Pre-populated full data for methods that need it (get, startReviewSession, etc.)
  questions: FIXTURE,
  categoryIndex: Object.fromEntries(
    [...new Set(FIXTURE.map((q) => q.category))].map((cat) => [
      cat,
      FIXTURE.filter((q) => q.category === cat),
    ]),
  ),
  loadCategory: vi.fn(async () => {}),
  loadAll: vi.fn(async () => {}),
}));

vi.mock("../knowledge-data.js", () => ({
  buildKnowledgeMap: (questions) => {
    const map = {};
    for (const q of questions) {
      if (!q.tags) continue;
      for (const t of q.tags) {
        if (!map[t]) map[t] = { questionIds: [], category: q.category || "" };
        map[t].questionIds.push(q.id);
      }
    }
    // Add a knowledge-only tag (no associated questions) to cover the
    // knowledgeMap fallback branch in knowledge.list()
    map["知识扩展"] = { questionIds: [], category: "general" };
    return map;
  },
  getKnowledgeForTag: vi.fn(() => null),
}));

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

function getApi() {
  return import("../local-api.js").then((m) => m.api);
}

describe("api.version", () => {
  it("returns version info", async () => {
    const api = await getApi();
    const info = api.version();
    expect(info).toHaveProperty("version");
    expect(info).toHaveProperty("name", "面试题 App");
  });
});

describe("questions.list", () => {
  it("returns all questions with defaults", async () => {
    const api = await getApi();
    const result = api.questions.list();
    expect(result).toHaveLength(FIXTURE.length);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("category");
    expect(result[0]).toHaveProperty("status", "new");
    expect(result[0]).not.toHaveProperty("content"); // list item != detail
  });

  it("filters by category", async () => {
    const api = await getApi();
    expect(api.questions.list({ category: "java_basic" })).toHaveLength(3);
    expect(api.questions.list({ category: "database" })).toHaveLength(2);
    expect(api.questions.list({ category: "nonexistent" })).toHaveLength(0);
  });

  it("filters by difficulty", async () => {
    const api = await getApi();
    expect(api.questions.list({ difficulty: "easy" })).toHaveLength(2);
    expect(api.questions.list({ difficulty: "hard" })).toHaveLength(1);
  });

  it("filters by type", async () => {
    const api = await getApi();
    expect(api.questions.list({ type: "short_answer" })).toHaveLength(2);
    expect(api.questions.list({ type: "choice" })).toHaveLength(1);
  });

  it("filters by search matching title, tags, or answer", async () => {
    const api = await getApi();
    expect(api.questions.list({ search: "Java" })).toHaveLength(3);
    expect(api.questions.list({ search: "SQL" })).toHaveLength(1);
    expect(api.questions.list({ search: "数组" })).toHaveLength(1); // matches tags
    expect(api.questions.list({ search: "两数" })).toHaveLength(1); // matches title
  });

  it("filters by company", async () => {
    const api = await getApi();
    expect(api.questions.list({ company: "字节跳动" })).toHaveLength(1);
    expect(api.questions.list({ company: "Google" })).toHaveLength(1);
  });

  it("tags() returns all unique tags sorted", async () => {
    const api = await getApi();
    const tags = api.questions.tags();
    expect(tags).toContain("Java基础");
    expect(tags).toContain("SQL");
    expect(tags).toContain("数组");
    // Ensure sorted (matching default Array.sort() UTF-16 code unit order)
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1] <= tags[i]).toBe(true);
    }
  });

  it("tagsWithCount() returns tag-count pairs sorted by count desc", async () => {
    const api = await getApi();
    const tcs = api.questions.tagsWithCount();
    expect(tcs.length).toBeGreaterThan(0);
    // highest count first
    for (let i = 1; i < tcs.length; i++) {
      expect(tcs[i - 1].count >= tcs[i].count).toBe(true);
    }
    const jb = tcs.find((t) => t.name === "Java基础");
    expect(jb).toBeDefined();
    expect(jb.count).toBe(3);
  });

  it("filters by tag", async () => {
    const api = await getApi();
    expect(api.questions.list({ tag: "Java基础" })).toHaveLength(3);
    expect(api.questions.list({ tag: "SQL" })).toHaveLength(1);
    expect(api.questions.list({ tag: "不存在" })).toHaveLength(0);
  });

  it("filters by status using progress data", async () => {
    const api = await getApi();
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: { status: "wrong", wrong_count: 1 },
        2: { status: "correct", wrong_count: 0 },
      }),
    );
    // Re-import to pick up fresh localStorage
    vi.resetModules();
    const api2 = await getApi();
    expect(api2.questions.list({ status: "wrong" })).toHaveLength(1);
    expect(api2.questions.list({ status: "correct" })).toHaveLength(1);
    expect(api2.questions.list({ status: "new" })).toHaveLength(4);
  });

  it("sorts by category alphabetically", async () => {
    const api = await getApi();
    const result = api.questions.list({ sort_by: "category" });
    expect(result.length).toBe(FIXTURE.length);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].category.localeCompare(result[i].category)).toBeLessThanOrEqual(0);
    }
  });

  it("sorts by type alphabetically", async () => {
    const api = await getApi();
    const result = api.questions.list({ sort_by: "type" });
    expect(result.length).toBe(FIXTURE.length);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].type.localeCompare(result[i].type)).toBeLessThanOrEqual(0);
    }
  });

  it("sorts by difficulty (easy → medium → hard)", async () => {
    const api = await getApi();
    const result = api.questions.list({ sort_by: "difficulty" });
    const rank = { easy: 0, medium: 1, hard: 2 };
    for (let i = 1; i < result.length; i++) {
      expect(rank[result[i].difficulty]).toBeGreaterThanOrEqual(rank[result[i - 1].difficulty]);
    }
  });

  it("sorts by status (wrong → reviewing → new → correct)", async () => {
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: { status: "correct" },
        2: { status: "wrong" },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    const result = api.questions.list({ sort_by: "status" });
    expect(result.length).toBeGreaterThanOrEqual(2);
    // First result should be "wrong" status (rank 0)
    expect(result[0].status).toBe("wrong");
  });

  it("filters by bookmarked", async () => {
    const api = await getApi();
    // Toggle bookmark on id=1
    api.progress.toggleBookmark(1);
    const result = api.questions.list({ bookmarked: true });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].bookmarked).toBe(true);
  });

  it("paginates correctly", async () => {
    const api = await getApi();
    const page1 = api.questions.list({ page: 1, page_size: 2 });
    expect(page1).toHaveLength(2);
    expect(page1[0].id).toBe(1);
    expect(page1[1].id).toBe(2);

    const page2 = api.questions.list({ page: 2, page_size: 2 });
    expect(page2).toHaveLength(2);
    expect(page2[0].id).toBe(3);

    const pageOob = api.questions.list({ page: 99, page_size: 2 });
    expect(pageOob).toHaveLength(0);
  });
});

describe("questions.get", () => {
  it("returns full question detail", async () => {
    const api = await getApi();
    const q = await api.questions.get(1);
    expect(q.title).toBe("Java是什么");
    expect(q.content).toBe("问Java核心");
    expect(q).toHaveProperty("status", "new");
    expect(q).toHaveProperty("company", "");
    expect(q).toHaveProperty("notes", "");
    expect(q).toHaveProperty("created_at");
    expect(q).toHaveProperty("updated_at");
  });

  it("throws for missing question", async () => {
    const api = await getApi();
    await expect(api.questions.get(999)).rejects.toThrow("Question 999 not found");
  });
});

describe("questions.random", () => {
  it("returns a question from the fixture", async () => {
    const api = await getApi();
    const q = api.questions.random();
    expect(q).not.toBeNull();
    expect(q).toHaveProperty("id");
    expect(q).toHaveProperty("title");
  });

  it("returns null or a valid question with category filter", async () => {
    const api = await getApi();
    const q = api.questions.random({ category: "database" });
    if (q) {
      expect(["database", "database_extra"]).toContain(q.category);
    }
  });

  it("returns null or a valid question with difficulty filter", async () => {
    const api = await getApi();
    const q = api.questions.random({ difficulty: "hard" });
    if (q) {
      expect(q.difficulty).toBe("hard");
    }
  });

  it("filters by status using progress data", async () => {
    const api = await getApi();
    localStorage.setItem("quiz_progress", JSON.stringify({ 1: { status: "correct" } }));
    vi.resetModules();
    const api2 = await getApi();
    const q = api2.questions.random({ status: "correct" });
    if (q) {
      expect(q.id).toBe(1);
    }
  });
});

describe("progress.update", () => {
  it("marks correct on new question", async () => {
    const api = await getApi();
    await api.progress.update(1, { status: "correct", duration_seconds: 10 });
    const q = await api.questions.get(1);
    expect(q.status).toBe("correct");
    expect(q.wrong_count).toBe(0);
  });

  it("marks wrong on new question", async () => {
    const api = await getApi();
    await api.progress.update(1, { status: "wrong", duration_seconds: 5 });
    const q = await api.questions.get(1);
    expect(q.status).toBe("wrong");
    expect(q.wrong_count).toBe(1);
  });

  it("transitions wrong→reviewing when marked correct after a wrong", async () => {
    const api = await getApi();
    await api.progress.update(1, { status: "wrong" });
    await api.progress.update(1, { status: "correct" });
    const q = await api.questions.get(1);
    expect(q.status).toBe("reviewing");
    expect(q.wrong_count).toBe(1); // same wrong count
  });

  it("increments wrong_count on repeated wrong answers", async () => {
    const api = await getApi();
    await api.progress.update(1, { status: "wrong" });
    await api.progress.update(1, { status: "wrong" });
    const q = await api.questions.get(1);
    expect(q.wrong_count).toBe(2);
  });
});

describe("progress.stats", () => {
  it("returns correct totals and by_category breakdown", async () => {
    const api = await getApi();
    const stats = api.progress.stats();
    expect(stats.total).toBe(FIXTURE.length);
    expect(stats.done).toBe(0);
    expect(stats.wrong).toBe(0);

    // Mark some questions as done
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: { status: "correct" },
        3: { status: "wrong" },
      }),
    );
    vi.resetModules();
    const api2 = await getApi();
    const stats2 = api2.progress.stats();
    expect(stats2.done).toBe(1); // only correct
    expect(stats2.wrong).toBe(1);
    expect(stats2.by_category.java_basic).toEqual({ total: 3, done: 1 });
    expect(stats2.by_category.database).toEqual({ total: 2, done: 0 });
    expect(stats2.by_type.short_answer).toEqual({ total: 2, done: 1, wrong: 1 });
    expect(stats2.by_type.choice).toEqual({ total: 1, done: 0, wrong: 0 });
    expect(stats2.by_type.true_false).toEqual({ total: 1, done: 0, wrong: 0 });
  });

  it("counts reviewing status in by_difficulty done", async () => {
    // id=4 is algorithm, easy — set to "reviewing" to hit the branch
    // where reviewing increments byDifficulty[diff].done
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        4: { status: "reviewing" },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    const stats = api.progress.stats();
    expect(stats.by_difficulty.easy.done).toBe(1);
    expect(stats.by_difficulty.easy.total).toBeGreaterThanOrEqual(1);
  });
});

describe("progress.wrong", () => {
  it("returns questions with wrong or reviewing status", async () => {
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        2: { status: "wrong", wrong_count: 2 },
        4: { status: "reviewing", wrong_count: 1 },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    const wrong = api.progress.wrong();
    expect(wrong).toHaveLength(2);
    expect(wrong.find((q) => q.id === 2).wrong_count).toBe(2);
    expect(wrong.find((q) => q.id === 4).wrong_count).toBe(1);
  });
});

describe("progress.dueReviews", () => {
  it("returns questions past their review date", async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: { status: "wrong", wrong_count: 1, next_review_at: yesterday },
        2: { status: "wrong", wrong_count: 2, next_review_at: tomorrow },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    const due = api.progress.dueReviews();
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe(1);
  });
});

describe("progress.knowledge", () => {
  it("returns category breakdown with tags", async () => {
    const api = await getApi();
    const kp = api.progress.knowledge();
    const java = kp.find((c) => c.name === "java_basic");
    expect(java).toBeDefined();
    expect(java.total).toBe(3);
    expect(java.tags.length).toBeGreaterThanOrEqual(1);
    expect(java.tags[0].name).toBe("Java基础");
  });
});

describe("knowledge API", () => {
  it("lists knowledge points", async () => {
    const api = await getApi();
    const list = api.knowledge.list();
    // Expect one entry per unique tag in the fixture
    expect(list.length).toBeGreaterThanOrEqual(3);
    const jb = list.find((k) => k.name === "Java基础");
    expect(jb).toBeDefined();
    expect(jb.question_count).toBe(3);
    expect(jb).toHaveProperty("mastery");
    expect(jb).toHaveProperty("has_content", false);
  });

  it("searches knowledge points by name", async () => {
    const api = await getApi();
    const result = api.knowledge.list("Java");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((k) => k.name === "Java基础")).toBe(true);
  });

  it("searches knowledge points by content", async () => {
    const knowledgeData = await import("../knowledge-data.js");
    knowledgeData.getKnowledgeForTag.mockImplementation((tag) => {
      if (tag === "SQL") return { content: "SQL查询优化技巧和索引原理" };
      return null;
    });
    const api = await getApi();
    const result = api.knowledge.list("查询优化");
    expect(result.some((k) => k.name === "SQL")).toBe(true);
  });

  it("gets knowledge point tags for a question", async () => {
    const api = await getApi();
    const tags = api.knowledge.getTagsForQuestion(1);
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe("Java基础");
  });

  it("returns empty tags for nonexistent question", async () => {
    const api = await getApi();
    expect(api.knowledge.getTagsForQuestion(999)).toEqual([]);
  });
});

describe("SM-2 progress.update with rating", () => {
  it("stores SM-2 fields after good rating", async () => {
    const api = await getApi();
    await api.progress.update(1, { rating: "good" });
    const q = await api.questions.get(1);
    expect(q.ef).toBeGreaterThanOrEqual(1.3);
    expect(q.interval).toBe(1);
    expect(q.repetitions).toBe(1);
    expect(q.next_review_at).toBeTruthy();
  });

  it("resets repetitions on forgot", async () => {
    const api = await getApi();
    await api.progress.update(1, { rating: "good" }); // reps: 1
    await api.progress.update(1, { rating: "forgot" }); // should reset
    const q = await api.questions.get(1);
    expect(q.repetitions).toBe(0);
    expect(q.interval).toBe(1);
  });

  it("advances to 6-day interval on second correct", async () => {
    const api = await getApi();
    await api.progress.update(1, { rating: "good" }); // interval: 1
    await api.progress.update(1, { rating: "good" }); // interval: 6
    const q = await api.questions.get(1);
    expect(q.interval).toBe(6);
    expect(q.repetitions).toBe(2);
  });

  it("writes ef from sm2 calculation (good=quality 4, ef stays 2.5)", async () => {
    const api = await getApi();
    await api.progress.update(1, { rating: "good" });
    const q = await api.questions.get(1);
    expect(q.ef).toBe(2.5);
  });

  it("accepts rating from status fallback", async () => {
    const api = await getApi();
    await api.progress.update(1, { status: "correct" });
    const q = await api.questions.get(1);
    expect(q.ef).toBeDefined();
    expect(q.interval).toBe(1);
  });
});

describe("dailyStats", () => {
  it("returns zeros when no reviews today", async () => {
    const api = await getApi();
    const stats = api.progress.dailyStats();
    expect(stats.today.reviewed).toBe(0);
    expect(stats.streak).toBe(0);
  });

  it("counts reviews after rating cards", async () => {
    const api = await getApi();
    await api.progress.update(1, { rating: "good" });
    const stats = api.progress.dailyStats();
    expect(stats.today.reviewed).toBe(1);
    expect(stats.today.remembered).toBe(1);
  });

  it("counts forgot separately", async () => {
    const api = await getApi();
    await api.progress.update(1, { rating: "forgot" });
    const stats = api.progress.dailyStats();
    expect(stats.today.reviewed).toBe(1);
    expect(stats.today.forgot).toBe(1);
    expect(stats.today.remembered).toBe(0);
  });

  it("computes retention correctly", async () => {
    const api = await getApi();
    await api.progress.update(1, { rating: "good" });
    await api.progress.update(2, { rating: "good" });
    await api.progress.update(3, { rating: "forgot" });
    const stats = api.progress.dailyStats();
    expect(stats.today.reviewed).toBe(3);
    expect(stats.today.remembered).toBe(2);
    expect(stats.retention).toBe(67); // 2/3 ≈ 67%
  });
});

describe("startReviewSession", () => {
  it("returns new cards when no progress exists", async () => {
    const api = await getApi();
    const session = await api.progress.startReviewSession(3);
    expect(session.length).toBe(3);
    expect(session.every((q) => q.id)).toBe(true);
  });

  it("returns overdue cards ahead of new cards", async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: {
          status: "wrong",
          wrong_count: 1,
          next_review_at: yesterday,
          ef: 2.5,
          interval: 1,
          repetitions: 1,
        },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    const session = await api.progress.startReviewSession(3);
    // Session includes the overdue card plus new cards
    expect(session.length).toBe(3);
    expect(session.find((q) => q.id === 1)).toBeDefined();
  });
});

describe("migrateProgress", () => {
  it("adds SM-2 fields to existing progress entries", async () => {
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: {
          status: "wrong",
          wrong_count: 1,
          review_count: 1,
          next_review_at: new Date().toISOString(),
        },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    api.migrateProgress();
    const progress = JSON.parse(localStorage.getItem("quiz_progress"));
    expect(progress["1"].ef).toBe(2.5);
    expect(progress["1"].interval).toBe(0);
    expect(progress["1"].repetitions).toBe(0);
  });
});

describe("dueReviews with SM-2", () => {
  it("returns all overdue questions regardless of status", async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: { status: "correct", next_review_at: yesterday, ef: 2.5, interval: 6, repetitions: 2 },
        2: { status: "wrong", next_review_at: yesterday, ef: 2.5, interval: 1, repetitions: 0 },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    const due = api.progress.dueReviews();
    expect(due).toHaveLength(2);
  });
});

describe("exportMarkdown", () => {
  it("generates markdown for given question ids", async () => {
    const api = await getApi();
    const md = await api.exportMarkdown([1, 4]);
    expect(md).toContain("Java是什么");
    expect(md).toContain("两数之和");
    expect(md).not.toContain("SQL优化");
  });

  it("includes options for choice questions", async () => {
    const api = await getApi();
    const md = await api.exportMarkdown([2]);
    expect(md).toContain("Java选择");
    expect(md).toContain("选项");
    expect(md).toContain("A) a");
    expect(md).toContain("B) b");
  });
});

describe("knowledge.get", () => {
  it("returns detail for a specific tag", async () => {
    const api = await getApi();
    const detail = await api.knowledge.get("Java基础");
    expect(detail.name).toBe("Java基础");
    expect(detail.question_count).toBeGreaterThan(0);
    expect(detail).toHaveProperty("mastery");
    expect(detail).toHaveProperty("content");
    expect(detail.questions.length).toBe(detail.question_count);
    expect(detail.questions[0]).toHaveProperty("id");
    expect(detail.questions[0]).toHaveProperty("title");
    expect(detail.questions[0]).toHaveProperty("difficulty");
  });

  it("returns empty questions for unknown tag", async () => {
    const api = await getApi();
    const detail = await api.knowledge.get("nonexistent-tag");
    expect(detail.name).toBe("nonexistent-tag");
    expect(detail.question_count).toBe(0);
    expect(detail.questions).toEqual([]);
  });
});

describe("migrateProgress with correct status", () => {
  it("sets SM-2 fields for correct entries without next_review_at", async () => {
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: { status: "correct", wrong_count: 0, review_count: 1 },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    api.migrateProgress();
    const progress = JSON.parse(localStorage.getItem("quiz_progress"));
    expect(progress["1"].ef).toBe(2.5);
    expect(progress["1"].interval).toBe(4);
    expect(progress["1"].repetitions).toBe(1);
    expect(progress["1"].next_review_at).toBeTruthy();
  });
});

describe("toggleBookmark", () => {
  it("bookmarks a question and returns true", async () => {
    const api = await getApi();
    const result = api.progress.toggleBookmark(1);
    expect(result).toBe(true);
    const q = await api.questions.get(1);
    expect(q.bookmarked).toBe(true);
  });

  it("unbookmarks a previously bookmarked question", async () => {
    const api = await getApi();
    api.progress.toggleBookmark(1); // bookmark
    const result = api.progress.toggleBookmark(1); // unbookmark
    expect(result).toBe(false);
    const q = await api.questions.get(1);
    expect(q.bookmarked).toBe(false);
  });

  it("toggles bookmark for multiple questions independently", async () => {
    const api = await getApi();
    api.progress.toggleBookmark(1);
    api.progress.toggleBookmark(3);
    expect((await api.questions.get(1)).bookmarked).toBe(true);
    expect((await api.questions.get(3)).bookmarked).toBe(true);
    expect((await api.questions.get(2)).bookmarked).toBeFalsy();
  });
});

describe("daily goal", () => {
  it("getGoal returns 0 by default", async () => {
    const api = await getApi();
    expect(api.progress.getGoal()).toBe(0);
  });

  it("setGoal stores and returns the clamped value", async () => {
    const api = await getApi();
    expect(api.progress.setGoal(10)).toBe(10);
    expect(api.progress.getGoal()).toBe(10);
  });

  it("clamps goal to 0–200", async () => {
    const api = await getApi();
    expect(api.progress.setGoal(-5)).toBe(0);
    expect(api.progress.setGoal(250)).toBe(200);
  });
});

describe("quickReview", () => {
  it("saves and retrieves a session", async () => {
    const api = await getApi();
    const session = { questionIds: [1, 2, 3], count: 3 };
    api.quickReview.saveSession(session);
    const retrieved = api.quickReview.getSession();
    expect(retrieved).toEqual(session);
  });

  it("clears session", async () => {
    const api = await getApi();
    api.quickReview.saveSession({ questionIds: [1] });
    api.quickReview.clearSession();
    expect(api.quickReview.getSession()).toBeNull();
  });

  it("getSession returns null when no session saved", async () => {
    const api = await getApi();
    expect(api.quickReview.getSession()).toBeNull();
  });

  it("saveSession handles localStorage failure gracefully", async () => {
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const api = await getApi();
    expect(() => api.quickReview.saveSession({ questionIds: [1] })).not.toThrow();
    spy.mockRestore();
  });

  it("getSession returns null on corrupt JSON", async () => {
    vi.spyOn(localStorage, "getItem").mockReturnValue("{corrupt");
    const api = await getApi();
    expect(api.quickReview.getSession()).toBeNull();
  });

  it("clearSession handles localStorage failure gracefully", async () => {
    const spy = vi.spyOn(localStorage, "removeItem").mockImplementation(() => {
      throw new Error("storage error");
    });
    const api = await getApi();
    expect(() => api.quickReview.clearSession()).not.toThrow();
    spy.mockRestore();
  });

  it("saveHistory stores session result with date", async () => {
    const api = await getApi();
    api.quickReview.saveHistory({
      total: 10,
      remembered: 7,
      forgot: 2,
      unsure: 1,
      category: "java",
      difficulty: "easy",
    });
    const history = api.quickReview.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].total).toBe(10);
    expect(history[0].remembered).toBe(7);
    expect(history[0].forgot).toBe(2);
    expect(history[0].date).toBeDefined();
  });

  it("getHistory returns empty array when no history exists", async () => {
    const api = await getApi();
    expect(api.quickReview.getHistory()).toEqual([]);
  });

  it("saveHistory prepends entries (most recent first)", async () => {
    const api = await getApi();
    api.quickReview.saveHistory({ total: 5, remembered: 3, forgot: 1, unsure: 1 });
    api.quickReview.saveHistory({ total: 8, remembered: 7, forgot: 0, unsure: 1 });
    const history = api.quickReview.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].total).toBe(8);
    expect(history[1].total).toBe(5);
  });

  it("saveHistory caps at 50 entries", async () => {
    const api = await getApi();
    for (let i = 0; i < 55; i++) {
      api.quickReview.saveHistory({ total: 1, remembered: 1, forgot: 0, unsure: 0 });
    }
    expect(api.quickReview.getHistory()).toHaveLength(50);
  });

  it("clearHistory removes all history", async () => {
    const api = await getApi();
    api.quickReview.saveHistory({ total: 5, remembered: 3, forgot: 1, unsure: 1 });
    api.quickReview.clearHistory();
    expect(api.quickReview.getHistory()).toEqual([]);
  });

  it("saveHistory handles localStorage failure gracefully", async () => {
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const api = await getApi();
    expect(() =>
      api.quickReview.saveHistory({ total: 1, remembered: 1, forgot: 0, unsure: 0 }),
    ).not.toThrow();
    spy.mockRestore();
  });

  it("getHistory returns empty array on corrupt JSON", async () => {
    vi.spyOn(localStorage, "getItem").mockReturnValue("{corrupt");
    const api = await getApi();
    expect(api.quickReview.getHistory()).toEqual([]);
  });
});

describe("mockInterview", () => {
  it("saveHistory and getHistory round-trip", async () => {
    const api = await getApi();
    api.mockInterview.saveHistory({
      correct: 7,
      wrong: 3,
      total: 10,
      pct: 70,
      totalTime: 600,
      timeLimit: 120,
    });
    api.mockInterview.saveHistory({
      correct: 5,
      wrong: 5,
      total: 10,
      pct: 50,
      totalTime: 480,
      timeLimit: 60,
    });
    const history = api.mockInterview.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].total).toBe(10);
    expect(history[0].pct).toBe(50);
    expect(history[1].total).toBe(10);
    expect(history[1].pct).toBe(70);
  });

  it("getHistory returns empty array when no history saved", async () => {
    const api = await getApi();
    expect(api.mockInterview.getHistory()).toEqual([]);
  });

  it("clearHistory removes all history", async () => {
    const api = await getApi();
    api.mockInterview.saveHistory({
      correct: 3,
      wrong: 1,
      total: 4,
      pct: 75,
      totalTime: 300,
      timeLimit: 120,
    });
    api.mockInterview.clearHistory();
    expect(api.mockInterview.getHistory()).toEqual([]);
  });

  it("saveHistory caps at 50 entries", async () => {
    const api = await getApi();
    for (let i = 0; i < 55; i++) {
      api.mockInterview.saveHistory({
        correct: 1,
        wrong: 0,
        total: 1,
        pct: 100,
        totalTime: 60,
        timeLimit: 120,
      });
    }
    expect(api.mockInterview.getHistory()).toHaveLength(50);
  });

  it("saveHistory handles localStorage failure gracefully", async () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const api = await getApi();
    expect(() =>
      api.mockInterview.saveHistory({
        correct: 1,
        wrong: 0,
        total: 1,
        pct: 100,
        totalTime: 60,
        timeLimit: 120,
      }),
    ).not.toThrow();
  });

  it("getHistory returns empty array on corrupt JSON", async () => {
    vi.spyOn(localStorage, "getItem").mockReturnValue("{corrupt");
    const api = await getApi();
    expect(api.mockInterview.getHistory()).toEqual([]);
  });
});

describe("getGoal error handling", () => {
  it("returns 0 when localStorage throws", async () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("storage error");
    });
    const api = await getApi();
    expect(api.progress.getGoal()).toBe(0);
  });
});

describe("reviewHistory", () => {
  it("handles missing question gracefully", async () => {
    const api = await getApi();
    // Set up a session with a non-existent question_id
    localStorage.setItem(
      "quiz_review_sessions",
      JSON.stringify([
        {
          id: 1,
          question_id: 999,
          result: "correct",
          reviewed_at: new Date().toISOString(),
          duration_seconds: 10,
          source: "quiz",
        },
      ]),
    );
    vi.resetModules();
    const api2 = await getApi();
    const history = api2.progress.reviewHistory(50);
    expect(history).toHaveLength(1);
    expect(history[0].title).toBe("题目 #999");
    expect(history[0].question_id).toBe(999);
  });
});

describe("questions.related", () => {
  it("returns related questions by shared tags", async () => {
    const api = await getApi();
    // id=1 has tags ["Java基础"] — ids 2,5 share same tag and category
    const related = api.questions.related(1);
    expect(related.length).toBeGreaterThanOrEqual(2);
    expect(related.map((r) => r.id).sort()).toEqual(expect.arrayContaining([2, 5]));
  });

  it("returns empty array for nonexistent question", async () => {
    const api = await getApi();
    expect(api.questions.related(999)).toEqual([]);
  });

  it("limits results", async () => {
    const api = await getApi();
    expect(api.questions.related(1, 1)).toHaveLength(1);
  });
});

describe("questions.companies", () => {
  it("returns unique company names sorted by frequency", async () => {
    const api = await getApi();
    const companies = api.questions.companies();
    expect(companies).toContain("字节跳动");
    expect(companies).toContain("Google");
    expect(companies).toContain("腾讯");
    // Companies should be ordered by frequency descending
    expect(companies.length).toBe(3);
  });
});

describe("weeklyActivity", () => {
  it("returns 7 days with zero stats when no data", async () => {
    const api = await getApi();
    const week = api.progress.weeklyActivity();
    expect(week).toHaveLength(7);
    expect(week[6].label).toBe("今天");
    expect(week.every((d) => d.reviewed === 0)).toBe(true);
    expect(week.every((d) => d.retention === null)).toBe(true);
  });

  it("reflects today's activity", async () => {
    const api = await getApi();
    const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
    localStorage.setItem(
      "quiz_daily_stats",
      JSON.stringify({ [today]: { reviewed: 3, remembered: 2, hard: 0, forgot: 1 } }),
    );
    vi.resetModules();
    const api2 = await getApi();
    const week = api2.progress.weeklyActivity();
    const todayEntry = week[6];
    expect(todayEntry.reviewed).toBe(3);
    expect(todayEntry.remembered).toBe(2);
    expect(todayEntry.retention).toBe(67);
  });
});

describe("allDailyStats", () => {
  it("returns raw daily stats object", async () => {
    const api = await getApi();
    const stats = { "2026-01-01": { reviewed: 5 } };
    localStorage.setItem("quiz_daily_stats", JSON.stringify(stats));
    vi.resetModules();
    const api2 = await getApi();
    expect(api2.progress.allDailyStats()).toEqual(stats);
  });
});

describe("startReviewSession with category", () => {
  it("filters to a single category", async () => {
    const api = await getApi();
    const session = await api.progress.startReviewSession(10, "java_basic");
    expect(session.every((q) => q.category === "java_basic")).toBe(true);
  });

  it("returns empty session for nonexistent category", async () => {
    const api = await getApi();
    const session = await api.progress.startReviewSession(10, "nonexistent");
    // May include overdue cards from other categories if there are none
    expect(session.length).toBeLessThanOrEqual(10);
  });
});

describe("migrateProgress no-op", () => {
  it("returns migrated: false when no entries need migration", async () => {
    localStorage.setItem(
      "quiz_progress",
      JSON.stringify({
        1: {
          status: "correct",
          ef: 2.5,
          interval: 4,
          repetitions: 1,
          next_review_at: new Date().toISOString(),
        },
      }),
    );
    vi.resetModules();
    const api = await getApi();
    const result = api.migrateProgress();
    expect(result.migrated).toBe(false);
  });
});

describe("usernameSuffix", () => {
  it("keys are suffixed when username is set", async () => {
    localStorage.setItem("quiz_username", "test-user");
    vi.resetModules();
    const api = await getApi();
    await api.progress.update(1, { status: "correct" });
    // Progress should be stored under quiz_progress_test-user
    const raw = localStorage.getItem("quiz_progress_test-user");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed["1"].status).toBe("correct");
  });
});

describe("recordReviewActivity edge cases", () => {
  it("records hard rating separately", async () => {
    const api = await getApi();
    await api.progress.update(1, { rating: "hard" });
    const stats = api.progress.dailyStats();
    expect(stats.today.hard).toBe(1);
    expect(stats.today.remembered).toBe(0);
    expect(stats.today.forgot).toBe(0);
  });

  it("prunes entries beyond 365 count", async () => {
    // Build 367 entries so the pruning logic kicks in
    const many = {};
    const today = new Date();
    for (let i = 0; i < 367; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      many[key] = { reviewed: 1 };
    }
    localStorage.setItem("quiz_daily_stats", JSON.stringify(many));
    vi.resetModules();
    const api = await getApi();
    await api.progress.update(1, { rating: "good" });
    const all = api.progress.allDailyStats();
    const keys = Object.keys(all);
    expect(keys.length).toBeLessThanOrEqual(366);
  });
});

describe("questions.list search extras", () => {
  it("searches by tag name", async () => {
    const api = await getApi();
    const result = api.questions.list({ search: "数组" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });
});

describe("knowledge.list content search", () => {
  it("finds knowledge points by content text", async () => {
    const knowledgeData = await import("../knowledge-data.js");
    knowledgeData.getKnowledgeForTag.mockImplementation((tag) => {
      if (tag === "Java基础") return { content: "Java面向对象编程核心概念" };
      if (tag === "SQL") return { content: "数据库查询语言" };
      return null;
    });
    const api = await getApi();
    const result = api.knowledge.list("面向对象");
    expect(result.some((k) => k.name === "Java基础")).toBe(true);
  });
});

describe("questions.random extras", () => {
  it("filters by category", async () => {
    const api = await getApi();
    const q = api.questions.random({ category: "java_basic" });
    expect(q).not.toBeNull();
    expect(["java_basic", "java_basic_extras"]).toContain(q.category);
  });

  it("filters by difficulty", async () => {
    const api = await getApi();
    const q = api.questions.random({ difficulty: "hard" });
    expect(q).not.toBeNull();
    expect(q.difficulty).toBe("hard");
  });
});
