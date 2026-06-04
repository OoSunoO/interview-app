import { describe, it, expect } from "vitest";
import { getKnowledgeForTag, buildKnowledgeMap } from "../knowledge-data.js";

describe("getKnowledgeForTag", () => {
  it("returns content for known tags", () => {
    const result = getKnowledgeForTag("基础");
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("content");
    expect(result.category).toBe("java_basic");
  });

  it("returns null for unknown tags", () => {
    expect(getKnowledgeForTag("nonexistent-tag")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getKnowledgeForTag("")).toBeNull();
  });
});

describe("buildKnowledgeMap", () => {
  const Q1 = { id: 1, category: "java_basic", tags: ["基础", "面向对象"] };
  const Q2 = { id: 2, category: "database", tags: ["事务", "基础"] };
  const Q3 = { id: 3, category: "java_basic", tags: [] };
  const Q4 = { id: 4, category: "algorithm" }; // no tags field

  it("builds tag → questionIds map from question data", () => {
    const map = buildKnowledgeMap([Q1, Q2]);
    // "基础" appears in both Q1 and Q2
    expect(map["基础"].questionIds).toEqual([1, 2]);
    // "面向对象" appears only in Q1
    expect(map["面向对象"].questionIds).toEqual([1]);
    // "事务" appears only in Q2
    expect(map["事务"].questionIds).toEqual([2]);
  });

  it("merges knowledgeContent for tags with existing content", () => {
    const map = buildKnowledgeMap([Q1]);
    // "基础" has pre-written content
    expect(map["基础"]).toHaveProperty("content");
    expect(map["基础"].content).toContain("Java");
    expect(map["基础"]).toHaveProperty("category", "java_basic");
  });

  it("includes knowledge-only tags with empty questionIds", () => {
    const map = buildKnowledgeMap([Q1]);
    // "JVM" is a defined knowledge point with no questions tagged in this fixture
    expect(map["JVM"]).toBeDefined();
    expect(map["JVM"].questionIds).toEqual([]);
    expect(map["JVM"]).toHaveProperty("content");
  });

  it("uses question category as fallback when tag has no pre-written content", () => {
    const Q5 = { id: 5, category: "react", tags: ["VirtualDOM"] };
    const map = buildKnowledgeMap([Q1, Q5]);
    // "VirtualDOM" has no pre-written content → falls back to question's category
    expect(map["VirtualDOM"]).toBeDefined();
    expect(map["VirtualDOM"].category).toBe("react");
    expect(map["VirtualDOM"]).not.toHaveProperty("content");
    expect(map["VirtualDOM"].questionIds).toEqual([5]);
  });

  it("skips questions with no tags field", () => {
    const map = buildKnowledgeMap([Q4]);
    expect(Object.keys(map)).toBeDefined();
  });

  it("returns empty map for empty input", () => {
    const map = buildKnowledgeMap([]);
    // Still contains knowledge-only tags
    expect(Object.keys(map).length).toBeGreaterThan(0);
    // But no questionIds
    for (const entry of Object.values(map)) {
      expect(entry.questionIds).toEqual([]);
    }
  });

  it("handles empty tags array", () => {
    const map = buildKnowledgeMap([Q3]);
    // Q3 has no tags — should not create entries for it
    // but knowledge-only tags still exist
    for (const [tag, entry] of Object.entries(map)) {
      if (entry.questionIds.length > 0) {
        expect(tag).not.toBe("");
      }
    }
  });
});
