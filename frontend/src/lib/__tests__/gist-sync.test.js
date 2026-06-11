import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const TOKEN_KEY = "gist_token";
const GIST_ID_KEY = "gist_id";
const USERNAME_KEY = "quiz_username";
const API_BASE = "https://api.github.com";

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function getGistSync() {
  const { gistSync } = await import("../gist-sync.js");
  return gistSync;
}

describe("Token management", () => {
  it("defaults to no token and no username", async () => {
    const gs = await getGistSync();
    expect(gs.getToken()).toBeNull();
    expect(gs.hasToken()).toBe(false);
    expect(gs.getUsername()).toBeNull();
    expect(gs.hasUsername()).toBe(false);
  });

  it("setToken / getToken round-trip", async () => {
    const gs = await getGistSync();
    gs.setToken("ghp_test123");
    expect(gs.getToken()).toBe("ghp_test123");
    expect(gs.hasToken()).toBe(true);
  });

  it("setUsername / getUsername round-trip", async () => {
    const gs = await getGistSync();
    gs.setUsername("test-user");
    expect(gs.getUsername()).toBe("test-user");
    expect(gs.hasUsername()).toBe(true);
  });

  it("clearToken removes token and gist ID", async () => {
    const gs = await getGistSync();
    gs.setToken("ghp_test");
    localStorage.setItem(GIST_ID_KEY, "gist_abc");
    gs.clearToken();
    expect(gs.getToken()).toBeNull();
    expect(localStorage.getItem(GIST_ID_KEY)).toBeNull();
  });

  it("handles localStorage errors gracefully", async () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("storage error");
    });
    const gs = await getGistSync();
    expect(gs.getToken()).toBeNull();
    expect(gs.getUsername()).toBeNull();
    expect(gs.hasToken()).toBe(false);
    expect(gs.hasUsername()).toBe(false);
  });
});

describe("slotKey / readSlot / writeSlot", () => {
  it("slotKey produces prefixed key", async () => {
    const gs = await getGistSync();
    expect(gs.slotKey("alice", "quiz_progress")).toBe("quiz_progress_alice");
  });

  it("writeSlot and readSlot round-trip", async () => {
    const gs = await getGistSync();
    gs.writeSlot("alice", "quiz_progress", { 1: { status: "correct" } });
    const data = gs.readSlot("alice", "quiz_progress");
    expect(data).toEqual({ 1: { status: "correct" } });
  });

  it("readSlot returns {} for missing data (progress-like keys)", async () => {
    const gs = await getGistSync();
    expect(gs.readSlot("alice", "quiz_progress")).toEqual({});
  });

  it("readSlot returns {} for any missing key due to '|| \"{}\"' fallback", async () => {
    const gs = await getGistSync();
    expect(gs.readSlot("alice", "quiz_review_sessions")).toEqual({});
  });

  it("readSlot returns [] for corrupt session data via catch branch", async () => {
    localStorage.setItem("quiz_review_sessions_alice", "{corrupt");
    const gs = await getGistSync();
    expect(gs.readSlot("alice", "quiz_review_sessions")).toEqual([]);
  });
});

describe("collectLocalData", () => {
  it("collects all progress data for a username", async () => {
    const gs = await getGistSync();
    gs.writeSlot("alice", "quiz_progress", { 1: { status: "correct" } });
    gs.writeSlot("alice", "quiz_review_sessions", [{ id: 1, result: "correct" }]);
    gs.writeSlot("alice", "quiz_daily_stats", { "2026-01-01": { reviewed: 5 } });
    localStorage.setItem("quiz_daily_goal", "20");

    const data = gs.collectLocalData("alice");
    expect(data.version).toBe(1);
    expect(data.username).toBe("alice");
    expect(data.progress).toEqual({ 1: { status: "correct" } });
    expect(data.sessions).toEqual([{ id: 1, result: "correct" }]);
    expect(data.daily_stats).toEqual({ "2026-01-01": { reviewed: 5 } });
    expect(data.daily_goal).toBe(20);
    expect(data).toHaveProperty("revision", 0);
    expect(data).toHaveProperty("updated_at");
  });
});

describe("applyRemoteData", () => {
  it("writes all fields to slot-based localStorage", async () => {
    const gs = await getGistSync();
    const data = {
      progress: { 1: { status: "correct" } },
      sessions: [{ id: 1, result: "correct" }],
      daily_stats: { "2026-01-01": { reviewed: 5 } },
      daily_goal: 15,
    };
    gs.applyRemoteData("bob", data);

    expect(JSON.parse(localStorage.getItem("quiz_progress_bob"))).toEqual(data.progress);
    expect(JSON.parse(localStorage.getItem("quiz_review_sessions_bob"))).toEqual(data.sessions);
    expect(JSON.parse(localStorage.getItem("quiz_daily_stats_bob"))).toEqual(data.daily_stats);
    expect(localStorage.getItem("quiz_daily_goal")).toBe("15");
  });

  it("skips missing fields", async () => {
    const gs = await getGistSync();
    gs.applyRemoteData("bob", {});
    expect(localStorage.getItem("quiz_progress_bob")).toBeNull();
    expect(localStorage.getItem("quiz_review_sessions_bob")).toBeNull();
  });
});

describe("validateToken", () => {
  it("returns ok with login on success", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ login: "octocat" }),
    });
    const gs = await getGistSync();
    const result = await gs.validateToken("ghp_valid");
    expect(result).toEqual({ ok: true, login: "octocat" });
    expect(globalThis.fetch).toHaveBeenCalledWith(`${API_BASE}/user`, expect.anything());
  });

  it("returns error on 401", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    const gs = await getGistSync();
    const result = await gs.validateToken("ghp_bad");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("无效");
  });

  it("returns error on fetch failure", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));
    const gs = await getGistSync();
    const result = await gs.validateToken("ghp_test");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("网络错误");
  });
});

describe("readProgress / writeProgress", () => {
  it("readProgress returns parsed content", async () => {
    const payload = { version: 1, progress: {} };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          files: { "interview-progress.json": { content: JSON.stringify(payload) } },
        }),
    });
    const gs = await getGistSync();
    const result = await gs.readProgress("token", "gist_1");
    expect(result).toEqual(payload);
  });

  it("readProgress returns null on 404", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    const gs = await getGistSync();
    expect(await gs.readProgress("token", "gist_1")).toBeNull();
  });

  it("readProgress returns null when file is missing", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ files: {} }),
    });
    const gs = await getGistSync();
    expect(await gs.readProgress("token", "gist_1")).toBeNull();
  });

  it("readProgress returns null on corrupt JSON", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ files: { "interview-progress.json": { content: "{corrupt" } } }),
    });
    const gs = await getGistSync();
    expect(await gs.readProgress("token", "gist_1")).toBeNull();
  });

  it("writeProgress increments revision and sends PATCH", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    const gs = await getGistSync();
    const result = await gs.writeProgress("token", "gist_1", { revision: 3, progress: {} });
    expect(result.revision).toBe(4);
    expect(result.updated_at).toBeTruthy();
    const [url, opts] = globalThis.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/gists/gist_1`);
    expect(opts.method).toBe("PATCH");
  });

  it("writeProgress defaults revision to 0 when missing", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    const gs = await getGistSync();
    const payload = { progress: {} };
    const result = await gs.writeProgress("token", "gist_1", payload);
    expect(result.revision).toBe(1);
  });
});

describe("mergeSessions", () => {
  it("merges remote and local, deduplicating by id with newest date", async () => {
    const gs = await getGistSync();
    const remote = [
      { id: 1, result: "correct", reviewed_at: "2026-01-02T00:00:00Z" },
      { id: 2, result: "wrong", reviewed_at: "2026-01-01T00:00:00Z" },
    ];
    const local = [
      { id: 2, result: "correct", reviewed_at: "2026-01-03T00:00:00Z" },
      { id: 3, result: "correct", reviewed_at: "2026-01-02T00:00:00Z" },
    ];
    const merged = gs.mergeSessions(remote, local);
    expect(merged).toHaveLength(3);
    expect(merged.find((s) => s.id === 2).result).toBe("correct");
  });

  it("sorts by reviewed_at ascending", async () => {
    const gs = await getGistSync();
    const result = gs.mergeSessions(
      [
        { id: 2, reviewed_at: "2026-01-02T00:00:00Z" },
        { id: 1, reviewed_at: "2026-01-01T00:00:00Z" },
      ],
      [],
    );
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it("caps at 500 entries", async () => {
    const gs = await getGistSync();
    const many = Array.from({ length: 600 }, (_, i) => ({
      id: i,
      reviewed_at: new Date(2026, 0, i + 1).toISOString(),
    }));
    expect(gs.mergeSessions(many, [])).toHaveLength(500);
  });
});

describe("mergeDailyStats", () => {
  it("merges with local overriding remote", async () => {
    const gs = await getGistSync();
    const result = gs.mergeDailyStats(
      { "2026-01-01": { reviewed: 3 }, "2026-01-02": { reviewed: 5 } },
      { "2026-01-02": { reviewed: 8 } },
    );
    expect(result).toEqual({
      "2026-01-01": { reviewed: 3 },
      "2026-01-02": { reviewed: 8 },
    });
  });
});

describe("syncOut", () => {
  it("pushes local data when no remote exists", async () => {
    localStorage.setItem(USERNAME_KEY, "alice");
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    const gs = await getGistSync();
    const result = await gs.syncOut("token", "gist_1");
    expect(result.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${API_BASE}/gists/gist_1`,
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("returns error when no username set", async () => {
    const gs = await getGistSync();
    const result = await gs.syncOut("token", "gist_1");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("未设置用户名");
  });

  it("merges when remote revision is higher", async () => {
    localStorage.setItem(USERNAME_KEY, "alice");
    // Seed empty arrays so collectLocalData returns valid shapes
    const gs0 = await getGistSync();
    gs0.writeSlot("alice", "quiz_review_sessions", []);
    gs0.writeSlot("alice", "quiz_daily_stats", {});
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            files: {
              "interview-progress.json": {
                content: JSON.stringify({
                  version: 1,
                  revision: 5,
                  progress: { 1: { status: "correct" } },
                  sessions: [],
                  daily_stats: {},
                }),
              },
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });
    const gs = await getGistSync();
    const result = await gs.syncOut("token", "gist_1");
    expect(result.ok).toBe(true);
    const [url, opts] = globalThis.fetch.mock.calls[1];
    const body = JSON.parse(opts.body);
    const content = JSON.parse(body.files["interview-progress.json"].content);
    expect(content.progress).toEqual({ 1: { status: "correct" } });
  });
});

describe("syncIn", () => {
  it("restores remote data when local is empty", async () => {
    localStorage.setItem(USERNAME_KEY, "alice");
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          files: {
            "interview-progress.json": {
              content: JSON.stringify({
                revision: 3,
                progress: { 1: { status: "correct" } },
                sessions: [],
                daily_stats: {},
              }),
            },
          },
        }),
    });
    const gs = await getGistSync();
    const result = await gs.syncIn("token", "gist_1");
    expect(result.ok).toBe(true);
    expect(result.restored).toBe(true);
    expect(result.hasData).toBe(true);
  });

  it("does not restore when local is newer", async () => {
    localStorage.setItem(USERNAME_KEY, "alice");
    localStorage.setItem(
      "quiz_progress_alice",
      JSON.stringify({ _syncRevision: 10, 1: { status: "correct" } }),
    );
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          files: {
            "interview-progress.json": {
              content: JSON.stringify({
                revision: 3,
                progress: {},
                sessions: [],
                daily_stats: {},
              }),
            },
          },
        }),
    });
    const gs = await getGistSync();
    const result = await gs.syncIn("token", "gist_1");
    expect(result.ok).toBe(true);
    expect(result.restored).toBe(false);
  });

  it("returns hasData=false when remote has no progress", async () => {
    localStorage.setItem(USERNAME_KEY, "alice");
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          files: {
            "interview-progress.json": { content: JSON.stringify({ revision: 1 }) },
          },
        }),
    });
    const gs = await getGistSync();
    const result = await gs.syncIn("token", "gist_1");
    expect(result.ok).toBe(true);
    expect(result.hasData).toBe(false);
  });

  it("returns error when no username", async () => {
    const gs = await getGistSync();
    const result = await gs.syncIn("token", "gist_1");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("未设置用户名");
  });
});

describe("onStatusChange", () => {
  it("subscribe and unsubscribe work", async () => {
    const gs = await getGistSync();
    const fn = vi.fn();
    const unsub = gs.onStatusChange(fn);
    expect(fn).not.toHaveBeenCalled();
    unsub();
    expect(unsub).toBeDefined();
  });
});

describe("migrateToSlotKeys", () => {
  it("copies legacy keys to slot keys when slot is empty", async () => {
    localStorage.setItem(USERNAME_KEY, "alice");
    localStorage.setItem("quiz_progress", JSON.stringify({ 1: { status: "correct" } }));
    localStorage.setItem("quiz_review_sessions", JSON.stringify([{ id: 1 }]));
    localStorage.setItem("quiz_daily_stats", JSON.stringify({ "2026-01-01": { reviewed: 5 } }));

    const gs = await getGistSync();
    gs.migrateToSlotKeys();

    expect(JSON.parse(localStorage.getItem("quiz_progress_alice"))).toEqual({
      1: { status: "correct" },
    });
    expect(JSON.parse(localStorage.getItem("quiz_review_sessions_alice"))).toEqual([{ id: 1 }]);
    expect(JSON.parse(localStorage.getItem("quiz_daily_stats_alice"))).toEqual({
      "2026-01-01": { reviewed: 5 },
    });
  });

  it("does not overwrite existing slot data", async () => {
    localStorage.setItem(USERNAME_KEY, "alice");
    localStorage.setItem("quiz_progress", JSON.stringify({ 1: { status: "correct" } }));
    localStorage.setItem("quiz_progress_alice", JSON.stringify({ 2: { status: "wrong" } }));

    const gs = await getGistSync();
    gs.migrateToSlotKeys();

    expect(JSON.parse(localStorage.getItem("quiz_progress_alice"))).toEqual({
      2: { status: "wrong" },
    });
  });

  it("is no-op when no username set", async () => {
    const gs = await getGistSync();
    expect(() => gs.migrateToSlotKeys()).not.toThrow();
  });
});

describe("sync status lifecycle", () => {
  it("getSyncStatus returns idle initially", async () => {
    const gs = await getGistSync();
    const status = gs.getSyncStatus();
    expect(status.status).toBe("idle");
    expect(status.error).toBeNull();
    expect(status.lastSync).toBeNull();
  });

  it("forceSync is a no-op without token/gistId", async () => {
    const gs = await getGistSync();
    const result = await gs.forceSync();
    expect(result).toBeUndefined();
  });
});
