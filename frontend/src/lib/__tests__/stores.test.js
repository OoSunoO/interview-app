import { describe, it, expect, vi, beforeEach } from "vitest";

const FIXTURE = [
  {
    id: 1,
    category: "java_basic",
    difficulty: "easy",
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
    category: "database",
    difficulty: "hard",
    title: "SQL优化",
    content: "如何优化慢查询",
    answer: "加索引",
    hints: [],
    tags: ["SQL"],
    options: [],
    company: "",
  },
];

vi.mock("../question-data.js", () => ({ questions: FIXTURE }));
vi.mock("../knowledge-data.js", () => ({
  buildKnowledgeMap: () => ({}),
  getKnowledgeForTag: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe("store", () => {
  it("has default state values", async () => {
    const { store } = await import("../stores.svelte.js");
    expect(store.questions).toEqual([]);
    expect(store.stats).toBeNull();
    expect(store.wrongQuestions).toEqual([]);
    expect(store.dueReviews).toEqual([]);
    expect(store.knowledge).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.quizSession).toEqual([]);
    expect(store.quizSessionLength).toBe(0);
    expect(store.quizIndex).toBe(0);
    expect(store.hasPrev).toBe(false);
    expect(store.hasNext).toBe(false);
  });

  it("manages currentQuestion", async () => {
    const { store } = await import("../stores.svelte.js");
    store.currentQuestion = { id: 1, title: "test" };
    expect(store.currentQuestion).toEqual({ id: 1, title: "test" });
  });

  it("manages questions array", async () => {
    const { store } = await import("../stores.svelte.js");
    store.questions = FIXTURE;
    expect(store.questions).toHaveLength(2);
  });

  it("manages loading state", async () => {
    const { store } = await import("../stores.svelte.js");
    expect(store.loading).toBe(false);
    store.loading = true;
    expect(store.loading).toBe(true);
  });

  it("manages quiz session", async () => {
    const { store } = await import("../stores.svelte.js");
    store.startQuiz(FIXTURE);
    expect(store.quizSessionLength).toBe(2);
    expect(store.quizIndex).toBe(0);
    expect(store.hasPrev).toBe(false);
    expect(store.hasNext).toBe(true);
  });

  it("advanceQuiz moves forward", async () => {
    const { store } = await import("../stores.svelte.js");
    store.startQuiz(FIXTURE);
    const result = store.advanceQuiz();
    expect(result).toBe(true);
    expect(store.quizIndex).toBe(1);
    expect(store.hasPrev).toBe(true);
    expect(store.hasNext).toBe(false);
  });

  it("advanceQuiz returns false at end", async () => {
    const { store } = await import("../stores.svelte.js");
    store.startQuiz(FIXTURE);
    store.advanceQuiz();
    const result = store.advanceQuiz();
    expect(result).toBe(false);
    expect(store.quizIndex).toBe(1);
  });

  it("retreatQuiz moves backward", async () => {
    const { store } = await import("../stores.svelte.js");
    store.startQuiz(FIXTURE);
    store.advanceQuiz();
    const result = store.retreatQuiz();
    expect(result).toBe(true);
    expect(store.quizIndex).toBe(0);
  });

  it("retreatQuiz returns false at start", async () => {
    const { store } = await import("../stores.svelte.js");
    store.startQuiz(FIXTURE);
    const result = store.retreatQuiz();
    expect(result).toBe(false);
    expect(store.quizIndex).toBe(0);
  });

  it("goToQuestion navigates to index", async () => {
    const { store } = await import("../stores.svelte.js");
    store.startQuiz(FIXTURE);
    expect(store.goToQuestion(1)).toBe(true);
    expect(store.quizIndex).toBe(1);
    expect(store.goToQuestion(5)).toBe(false);
    expect(store.quizIndex).toBe(1);
  });

  it("shuffleSession randomizes order", async () => {
    const { store } = await import("../stores.svelte.js");
    store.startQuiz(FIXTURE);
    const original = [...store.quizSession];
    store.shuffleSession();
    // Should still have all questions
    expect(store.quizSessionLength).toBe(2);
    expect(store.quizIndex).toBe(0);
  });

  it("error starts null and clearError is callable", async () => {
    const { store } = await import("../stores.svelte.js");
    expect(store.error).toBeNull();
    expect(() => store.clearError()).not.toThrow();
  });

  it("has theme getter", async () => {
    const { store } = await import("../stores.svelte.js");
    expect(["light", "dark"]).toContain(store.theme);
  });

  it("toggleTheme switches theme", async () => {
    const { store } = await import("../stores.svelte.js");
    const original = store.theme;
    store.toggleTheme();
    expect(store.theme).not.toBe(original);
    store.toggleTheme();
    expect(store.theme).toBe(original);
  });

  it("filters can be set and read", async () => {
    const { store } = await import("../stores.svelte.js");
    store.filters = {
      category: "algo",
      difficulty: "hard",
      type: "",
      status: "",
      search: "",
      sort_by: "",
      company: "",
      bookmarked: false,
    };
    expect(store.filters.category).toBe("algo");
    expect(store.filters.difficulty).toBe("hard");
  });
});
