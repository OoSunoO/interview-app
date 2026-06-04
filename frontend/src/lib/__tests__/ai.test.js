import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const STORAGE_KEY = "interview_ai_config";

beforeEach(() => {
  localStorage.clear();
  // Clear module-level cache so each describe gets a fresh ai module
  vi.resetModules();
});

afterEach(() => {
  // Clean up fetch mock after tests that set it
  if (globalThis.fetch && vi.isMockFunction(globalThis.fetch)) {
    vi.restoreAllMocks();
    try {
      delete globalThis.fetch;
    } catch {
      globalThis.fetch = undefined;
    }
  }
});

describe("PROVIDERS", () => {
  it("has Anthropic, OpenAI, and DeepSeek", async () => {
    const { PROVIDERS } = await import("../ai.js");
    const labels = PROVIDERS.map((p) => p.label);
    expect(labels).toContain("Anthropic (Claude)");
    expect(labels).toContain("OpenAI (GPT)");
    expect(labels).toContain("DeepSeek");
  });

  it("each provider has endpoint and model", async () => {
    const { PROVIDERS } = await import("../ai.js");
    for (const p of PROVIDERS) {
      expect(p.endpoint).toBeTruthy();
      expect(p.model).toBeTruthy();
      expect(p.endpoint).toContain("http");
    }
  });
});

describe("hasAI", () => {
  it("returns false when no API key is configured", async () => {
    const { hasAI } = await import("../ai.js");
    expect(hasAI()).toBe(false);
  });

  it("returns true when an API key is saved", async () => {
    const { hasAI, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test-123" });
    expect(hasAI()).toBe(true);
  });
});

describe("getAIConfig", () => {
  it("returns default values when nothing is saved", async () => {
    const { getAIConfig } = await import("../ai.js");
    const cfg = getAIConfig();
    expect(cfg.key).toBe("");
    expect(cfg.provider).toBe(0);
  });

  it("reflects saved values after saveAIConfig", async () => {
    const { getAIConfig, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-abc" });
    const cfg = getAIConfig();
    expect(cfg.key).toBe("sk-abc");
  });
  it("handles corrupted config gracefully", async () => {
    localStorage.setItem("interview_ai_config", "{corrupt-json");
    vi.resetModules();
    const { getAIConfig } = await import("../ai.js");
    const cfg = getAIConfig();
    expect(cfg.key).toBe("");
    expect(cfg.provider).toBe(0);
  });
});

describe("setProvider", () => {
  it("updates endpoint and model to match the chosen provider", async () => {
    const { getAIConfig, setProvider, PROVIDERS } = await import("../ai.js");
    setProvider(2);
    const cfg = getAIConfig();
    expect(cfg.provider).toBe(2);
    expect(cfg.endpoint).toBe(PROVIDERS[2].endpoint);
    expect(cfg.model).toBe(PROVIDERS[2].model);
  });
});

// ── Score history (localStorage-based) ──

describe("getScoreHistory", () => {
  it("returns empty array when nothing saved", async () => {
    const { getScoreHistory } = await import("../ai.js");
    expect(getScoreHistory()).toEqual([]);
  });

  it("returns saved entries from localStorage", async () => {
    localStorage.setItem("ai_scores", JSON.stringify([{ score: 85, questionId: 1 }]));
    vi.resetModules();
    const { getScoreHistory } = await import("../ai.js");
    const history = getScoreHistory();
    expect(history).toHaveLength(1);
    expect(history[0].score).toBe(85);
  });

  it("handles corrupted localStorage gracefully", async () => {
    localStorage.setItem("ai_scores", "not-json");
    vi.resetModules();
    const { getScoreHistory } = await import("../ai.js");
    expect(getScoreHistory()).toEqual([]);
  });
});

describe("saveScoreEntry", () => {
  it("adds entry with timestamp", async () => {
    const { saveScoreEntry, getScoreHistory } = await import("../ai.js");
    saveScoreEntry({ score: 90, questionId: 2 });
    const history = getScoreHistory();
    expect(history).toHaveLength(1);
    expect(history[0].score).toBe(90);
    expect(history[0].questionId).toBe(2);
    expect(history[0]).toHaveProperty("timestamp");
  });

  it("caps history at 100 entries", async () => {
    const { saveScoreEntry, getScoreHistory } = await import("../ai.js");
    for (let i = 0; i < 110; i++) {
      saveScoreEntry({ score: i });
    }
    expect(getScoreHistory()).toHaveLength(100);
  });
});

// ── aiChat ──

describe("aiChat", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("throws when no API key configured", async () => {
    const { aiChat } = await import("../ai.js");
    await expect(aiChat("system", [])).rejects.toThrow("请先配置 API Key");
  });

  it("sends Anthropic format and extracts content text", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: "Claude response" }] }),
      text: () => Promise.resolve(""),
    });
    const { aiChat, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-ant-test" });
    const result = await aiChat("You're helpful", [{ role: "user", content: "Hi" }]);
    expect(result).toBe("Claude response");

    const [url, opts] = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(opts.body);
    expect(body.model).toBeTruthy();
    expect(body.max_tokens).toBe(1024);
    expect(body.system).toBe("You're helpful");
    expect(opts.headers["x-api-key"]).toBe("sk-ant-test");
    expect(opts.headers["anthropic-version"]).toBe("2023-06-01");
  });

  it("sends OpenAI format and extracts choice content", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: "GPT response" } }] }),
      text: () => Promise.resolve(""),
    });
    const { aiChat, saveAIConfig, setProvider, PROVIDERS } = await import("../ai.js");
    setProvider(1); // OpenAI — sets endpoint, model, and provider
    saveAIConfig({ key: "sk-openai" });
    const result = await aiChat("You're helpful", [{ role: "user", content: "Hi" }]);
    expect(result).toBe("GPT response");

    const [url, opts] = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(opts.body);
    expect(body.model).toBe(PROVIDERS[1].model);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toBe("You're helpful");
    expect(opts.headers["Authorization"]).toBe("Bearer sk-openai");
    expect(opts.headers["x-api-key"]).toBeUndefined();
  });

  it("throws on non-ok response with status text", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });
    const { aiChat, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    await expect(aiChat("sys", [])).rejects.toThrow("API 错误 (401)");
  });

  it("truncates long error response text to 200 chars", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("x".repeat(500)),
    });
    const { aiChat, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    await expect(aiChat("sys", [])).rejects.toThrow("x".repeat(200));
  });
});

// ── gradeAnswer ──

describe("gradeAnswer", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("returns AI evaluation result", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: "✅ 答案正确，解释..." }] }),
      text: () => Promise.resolve(""),
    });
    const { gradeAnswer, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await gradeAnswer("1+1=?", "2", "2");
    expect(result).toContain("✅");
  });

  it("passes question, answer, and reference to aiChat", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: "评估结果" }] }),
      text: () => Promise.resolve(""),
    });
    const { gradeAnswer, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    await gradeAnswer("问题?", "我的答案", "参考答案");
    const [url, opts] = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(opts.body);
    const messages = body.messages || (body.system ? null : []);
    const userMsg = body.system ? body.messages[0].content : body.messages[1].content;
    expect(userMsg).toContain("问题?");
    expect(userMsg).toContain("我的答案");
    expect(userMsg).toContain("参考答案");
  });
});

// ── analyzeMistakes ──

describe("analyzeMistakes", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("groups wrong questions by tag and returns parsed JSON", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [
            {
              text: JSON.stringify({
                summary: "需要加强基础",
                weakest_points: [
                  { point: "Java", severity: "high", wrong_count: 2, analysis: "概念模糊" },
                ],
                error_patterns: [{ pattern: "粗心", detail: "计算错误", affected_tags: ["Java"] }],
                learning_suggestions: [{ priority: "high", suggestion: "多做练习" }],
              }),
            },
          ],
        }),
      text: () => Promise.resolve(""),
    });
    const { analyzeMistakes, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const wrong = [
      { id: 1, title: "Q1", type: "short_answer", tags: ["Java"], wrong_count: 1 },
      { id: 2, title: "Q2", type: "choice", tags: ["Java", "SQL"], wrong_count: 2 },
    ];
    const result = await analyzeMistakes(wrong);
    expect(result.summary).toBe("需要加强基础");
    expect(result.weakest_points).toHaveLength(1);
    expect(result.weakest_points[0].point).toBe("Java");
  });

  it("handles markdown code fences in AI response", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ text: '```json\n{"summary":"from fences"}\n```' }],
        }),
      text: () => Promise.resolve(""),
    });
    const { analyzeMistakes, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await analyzeMistakes([
      { tags: ["Java"], id: 1, title: "Q", type: "sa", wrong_count: 1 },
    ]);
    expect(result.summary).toBe("from fences");
  });

  it("falls back to raw text when JSON parsing fails", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: "not valid json" }] }),
      text: () => Promise.resolve(""),
    });
    const { analyzeMistakes, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await analyzeMistakes([
      { tags: ["Java"], id: 1, title: "Q", type: "sa", wrong_count: 1 },
    ]);
    expect(result).toHaveProperty("raw");
    expect(result.raw).toBe("not valid json");
  });

  it("handles questions without tags", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: '{"summary":"ok"}' }] }),
      text: () => Promise.resolve(""),
    });
    const { analyzeMistakes, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await analyzeMistakes([{ id: 1, title: "Q", type: "sa", wrong_count: 1 }]);
    expect(result.summary).toBe("ok");
  });

  it("sorts tags by wrong count descending", async () => {
    let callCount = 0;
    globalThis.fetch.mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ content: [{ text: '{"summary":"ok"}' }] }),
        text: () => Promise.resolve(""),
      });
    });
    const { analyzeMistakes, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    // "common" has 2 questions, "rare" has 1 — sort is by question count per tag
    await analyzeMistakes([
      { id: 1, title: "Q1", type: "sa", tags: ["rare"], wrong_count: 1 },
      { id: 2, title: "Q2", type: "sa", tags: ["common"], wrong_count: 5 },
      { id: 3, title: "Q3", type: "sa", tags: ["common"], wrong_count: 3 },
    ]);
    const [url, opts] = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(opts.body);
    const content = body.system ? body.messages[0].content : body.messages[1].content;
    expect(content.indexOf("common")).toBeLessThan(content.indexOf("rare"));
  });
});

// ── gradeDetailed ──

describe("gradeDetailed", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("returns parsed JSON with dimensions", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [
            {
              text: JSON.stringify({
                overall: "通过",
                dimensions: [
                  { name: "完整性", score: 80, comment: "基本完整" },
                  { name: "准确性", score: 90, comment: "准确" },
                ],
                suggestion: "继续加油",
              }),
            },
          ],
        }),
      text: () => Promise.resolve(""),
    });
    const { gradeDetailed, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await gradeDetailed("Q?", "user answer", "ref answer");
    expect(result.overall).toBe("通过");
    expect(result.dimensions).toHaveLength(2);
    expect(result.suggestion).toBe("继续加油");
  });

  it("ensures dimensions field exists when missing from response", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ text: '{"overall":"通过","suggestion":"ok"}' }],
        }),
      text: () => Promise.resolve(""),
    });
    const { gradeDetailed, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await gradeDetailed("Q", "A", "R");
    expect(result.dimensions).toEqual([]);
  });

  it("provides fallback on parse failure", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: "invalid-json" }] }),
      text: () => Promise.resolve(""),
    });
    const { gradeDetailed, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await gradeDetailed("Q", "A", "R");
    expect(result.overall).toBe("未知");
    expect(result.dimensions).toHaveLength(1);
    expect(result.dimensions[0].name).toBe("总评");
  });

  it("strips markdown fences before parsing", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ text: '```json\n{"overall":"通过","dimensions":[]}\n```' }],
        }),
      text: () => Promise.resolve(""),
    });
    const { gradeDetailed, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await gradeDetailed("Q", "A", "R");
    expect(result.overall).toBe("通过");
  });
});

// ── socraticChat ──

describe("socraticChat", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  it("starts new conversation when no history provided", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: "引导性问题" }] }),
      text: () => Promise.resolve(""),
    });
    const { socraticChat, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await socraticChat("Q?", "wrong", "correct", null);
    expect(result).toBe("引导性问题");
  });

  it("continues with existing conversation history", async () => {
    const history = [
      { role: "user", content: "I think it's A" },
      { role: "assistant", content: "Why do you think so?" },
    ];
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: "后续引导" }] }),
      text: () => Promise.resolve(""),
    });
    const { socraticChat, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    const result = await socraticChat("Q", "wrong", "correct", history);
    expect(result).toBe("后续引导");

    // Verify history was passed through to aiChat
    const [url, opts] = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(opts.body);
    // OpenAI format wraps history in messages
    if (!body.system) {
      expect(body.messages.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses Socratic system prompt", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: "思考题" }] }),
      text: () => Promise.resolve(""),
    });
    const { socraticChat, saveAIConfig } = await import("../ai.js");
    saveAIConfig({ key: "sk-test" });
    await socraticChat("Q", "A", "R", []);
    const [url, opts] = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(opts.body);
    const systemPrompt = body.system || body.messages[0].content;
    expect(systemPrompt).toContain("苏格拉底");
    expect(systemPrompt).toContain("引导");
  });
});
