import { describe, it, expect, beforeEach, vi } from "vitest";

const FIXTURE = [
  {
    id: 1,
    category: "java_basic",
    title: "Java是什么",
    content: "问Java核心",
    answer: "答Java",
    tags: ["Java基础"],
  },
  {
    id: 2,
    category: "java_basic",
    title: "Java选择",
    content: "选哪个",
    answer: "A",
    tags: ["Java基础"],
  },
  {
    id: 3,
    category: "database",
    title: "SQL优化",
    content: "如何优化",
    answer: "加索引",
    tags: ["SQL"],
  },
];

const FIXTURE_INDEX = FIXTURE.map((q) => ({
  id: q.id,
  category: q.category,
  difficulty: "easy",
  type: "short_answer",
  title: q.title,
  tags: q.tags || [],
  company: "",
}));

vi.mock("../question-data/index.js", () => ({
  questionIndex: FIXTURE_INDEX,
  questions: FIXTURE,
  categoryIndex: {
    java_basic: FIXTURE.filter((q) => q.category === "java_basic"),
    database: FIXTURE.filter((q) => q.category === "database"),
  },
  loadCategory: vi.fn(async () => {}),
  loadAll: vi.fn(async () => {}),
}));

vi.mock("../knowledge-data.js", () => ({
  buildKnowledgeMap: () => ({}),
  getKnowledgeForTag: vi.fn(() => null),
}));

let startInterview, getSession, clearSession, finishInterview;

beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  vi.resetModules();
  const mod = await import("../ai-mock-interview.js");
  startInterview = mod.startInterview;
  getSession = mod.getSession;
  clearSession = mod.clearSession;
  finishInterview = mod.finishInterview;
});

describe("startInterview", () => {
  it("creates a session with specified question count", () => {
    const session = startInterview({ category: "java_basic", count: 2 });
    expect(session).toBeTruthy();
    expect(session.questions).toHaveLength(2);
    expect(session.currentIndex).toBe(0);
    expect(session.startedAt).toBeTruthy();
    expect(session.completedAt).toBeNull();
    expect(session.history).toEqual([]);
    expect(session.results).toEqual([]);
  });

  it("defaults to up to 5 questions when count is not specified", () => {
    const session = startInterview({ category: "java_basic" });
    expect(session.questions.length).toBeLessThanOrEqual(5);
    expect(session.questions.length).toBeGreaterThan(0);
  });

  it("persists session to sessionStorage", () => {
    startInterview({ category: "java_basic", count: 2 });
    const saved = getSession();
    expect(saved).toBeTruthy();
    expect(saved.questions).toHaveLength(2);
  });

  it("returns empty questions array for unknown category", () => {
    const session = startInterview({ category: "nonexistent_category", count: 3 });
    expect(session.questions).toHaveLength(0);
  });
});

describe("clearSession", () => {
  it("removes session from sessionStorage", () => {
    startInterview({ category: "java_basic", count: 2 });
    expect(getSession()).toBeTruthy();
    clearSession();
    expect(getSession()).toBeNull();
  });
});

describe("finishInterview", () => {
  it("marks session as completed and saves history", () => {
    const session = startInterview({ category: "java_basic", count: 2 });
    const results = [
      { questionId: session.questions[0].id, status: "correct" },
      { questionId: session.questions[1].id, status: "wrong" },
    ];
    const finished = finishInterview(session, results);
    expect(finished.completedAt).toBeTruthy();
    expect(getSession()).toBeNull();
  });

  it("saves to localStorage history", () => {
    const session = startInterview({ category: "java_basic", count: 2 });
    const results = [
      { questionId: 1, status: "correct" },
      { questionId: 2, status: "wrong" },
    ];
    finishInterview(session, results);
    const history = JSON.parse(localStorage.getItem("ai_interview_history"));
    expect(history).toHaveLength(1);
    expect(history[0].total).toBe(2);
    expect(history[0].correct).toBe(1);
    expect(history[0].wrong).toBe(1);
  });
});
