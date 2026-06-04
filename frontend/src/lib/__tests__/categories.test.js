import { describe, it, expect } from "vitest";
import { categoryLabel, CATEGORY_LABELS } from "../categories.js";

describe("categoryLabel", () => {
  it("returns label for known slugs", () => {
    expect(categoryLabel("cs_basics")).toBe("计算机基础");
    expect(categoryLabel("algorithm")).toBe("算法");
    expect(categoryLabel("java_basic")).toBe("Java 基础");
    expect(categoryLabel("jvm")).toBe("JVM");
    expect(categoryLabel("system_design")).toBe("系统设计");
    expect(categoryLabel("behavioral")).toBe("行为面试");
  });

  it("returns the slug itself for unknown slugs", () => {
    expect(categoryLabel("nonexistent")).toBe("nonexistent");
    expect(categoryLabel("")).toBe("");
  });

  it("handles every entry in CATEGORY_LABELS consistently", () => {
    for (const [slug, expected] of Object.entries(CATEGORY_LABELS)) {
      expect(categoryLabel(slug)).toBe(expected);
    }
  });
});
