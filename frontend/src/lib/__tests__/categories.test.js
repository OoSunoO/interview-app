import { describe, it, expect } from "vitest";
import { categoryLabel, CATEGORY_LABELS, MAIN_CATEGORY, FILTER_CATEGORIES } from "../categories.js";

describe("categoryLabel", () => {
  it("returns label for known slugs", () => {
    expect(categoryLabel("cs_basics")).toBe("计算机基础");
    expect(categoryLabel("algorithm")).toBe("算法与数据结构");
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

describe("CATEGORY_LABELS → MAIN_CATEGORY consistency", () => {
  it("every CATEGORY_LABELS slug has a MAIN_CATEGORY entry", () => {
    for (const slug of Object.keys(CATEGORY_LABELS)) {
      expect(MAIN_CATEGORY).toHaveProperty(slug);
    }
  });

  it("every MAIN_CATEGORY value has a CATEGORY_LABELS entry", () => {
    const parentSlugs = new Set(Object.values(MAIN_CATEGORY));
    for (const slug of parentSlugs) {
      expect(CATEGORY_LABELS).toHaveProperty(slug);
    }
  });
});

describe("FILTER_CATEGORIES consistency", () => {
  it("every filter value (except '') is a key in MAIN_CATEGORY", () => {
    for (const entry of FILTER_CATEGORIES) {
      if (entry.value === "") continue;
      expect(MAIN_CATEGORY).toHaveProperty(entry.value);
    }
  });

  it("every filter label matches CATEGORY_LABELS", () => {
    for (const entry of FILTER_CATEGORIES) {
      if (entry.value === "") continue;
      expect(entry.label).toBe(CATEGORY_LABELS[entry.value]);
    }
  });

  it("has no duplicate filter values", () => {
    const values = FILTER_CATEGORIES.map((e) => e.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("has no duplicate filter labels", () => {
    const labels = FILTER_CATEGORIES.map((e) => e.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
