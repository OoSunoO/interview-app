import { describe, it, expect, beforeEach, vi } from "vitest";

const STORAGE_KEY = "interview_ai_config";

beforeEach(() => {
  localStorage.clear();
  // Clear module-level cache so each describe gets a fresh ai module
  vi.resetModules();
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
