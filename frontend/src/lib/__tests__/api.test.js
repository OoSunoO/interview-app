import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "../api.js";

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(data, ok = true) {
  globalThis.fetch.mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
    status: ok ? 200 : 500,
  });
}

describe("api", () => {
  it("version() calls GET /api/version", async () => {
    mockFetch({ version: "1.0" });
    const result = await api.version();
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/version");
    expect(result).toEqual({ version: "1.0" });
  });

  describe("questions", () => {
    it("list() calls GET /api/questions", async () => {
      mockFetch([]);
      await api.questions.list();
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/questions?");
    });

    it("list() appends params to query string", async () => {
      mockFetch([]);
      await api.questions.list({ category: "algo", difficulty: "hard" });
      const url = globalThis.fetch.mock.calls[0][0];
      expect(url).toContain("category=algo");
      expect(url).toContain("difficulty=hard");
    });

    it("list() skips null/undefined/empty params", async () => {
      mockFetch([]);
      await api.questions.list({ category: "algo", search: "", extra: null, undef: undefined });
      expect(globalThis.fetch.mock.calls[0][0]).toBe("/api/questions?category=algo");
    });

    it("get() calls GET /api/questions/:id", async () => {
      mockFetch({ id: 1 });
      const result = await api.questions.get(1);
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/questions/1");
      expect(result).toEqual({ id: 1 });
    });
  });

  describe("progress", () => {
    it("update() calls POST /api/progress/:id", async () => {
      mockFetch({ ok: true });
      await api.progress.update(42, { status: "correct" });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/progress/42",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "correct" }),
        }),
      );
    });

    it("stats() calls GET /api/progress/stats", async () => {
      mockFetch({ total: 10 });
      const result = await api.progress.stats();
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/progress/stats");
      expect(result).toEqual({ total: 10 });
    });

    it("wrong() calls GET /api/progress/wrong", async () => {
      mockFetch([]);
      await api.progress.wrong();
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/progress/wrong");
    });

    it("dueReviews() calls GET /api/progress/review/due", async () => {
      mockFetch([]);
      await api.progress.dueReviews();
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/progress/review/due");
    });

    it("knowledge() calls GET /api/progress/knowledge", async () => {
      mockFetch({});
      await api.progress.knowledge();
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/progress/knowledge");
    });
  });

  describe("error handling", () => {
    it("throws on non-ok GET", async () => {
      mockFetch(null, false);
      await expect(api.version()).rejects.toThrow("GET /version failed: 500");
    });

    it("throws on non-ok POST", async () => {
      mockFetch(null, false);
      await expect(api.progress.update(1, {})).rejects.toThrow("POST /progress/1 failed: 500");
    });
  });
});
