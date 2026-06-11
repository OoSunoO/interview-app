import { describe, it, expect } from "vitest";
import { PATHS } from "../learning-paths.js";
import { FILTER_CATEGORIES } from "../categories.js";

describe("learning-paths data integrity", () => {
  const validCategoryValues = new Set(FILTER_CATEGORIES.map((c) => c.value));

  it("exports PATHS as an array", () => {
    expect(Array.isArray(PATHS)).toBe(true);
  });

  it("has at least one path", () => {
    expect(PATHS.length).toBeGreaterThanOrEqual(1);
  });

  it("every path has required fields", () => {
    for (const path of PATHS) {
      expect(path.id).toBeTruthy();
      expect(path.title).toBeTruthy();
      expect(path.description).toBeTruthy();
      expect(path.icon).toBeTruthy();
      expect(path.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(path.estimatedWeeks).toBeGreaterThan(0);
      expect(Array.isArray(path.stages)).toBe(true);
      expect(path.stages.length).toBeGreaterThan(0);
    }
  });

  it("all paths have unique IDs", () => {
    const ids = PATHS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every stage has required fields", () => {
    for (const path of PATHS) {
      for (const stage of path.stages) {
        expect(stage.id).toBeTruthy();
        expect(stage.title).toBeTruthy();
        expect(stage.description).toBeTruthy();
        expect(Array.isArray(stage.targets)).toBe(true);
        expect(stage.targets.length).toBeGreaterThan(0);
      }
    }
  });

  it("all stage IDs are unique within each path", () => {
    for (const path of PATHS) {
      const ids = path.stages.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("every target references a valid category", () => {
    for (const path of PATHS) {
      for (const stage of path.stages) {
        for (const target of stage.targets) {
          expect(target.category).toBeTruthy();
          expect(target.label).toBeTruthy();
          expect(target.required).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every target category exists in FILTER_CATEGORIES", () => {
    for (const path of PATHS) {
      for (const stage of path.stages) {
        for (const target of stage.targets) {
          expect(validCategoryValues.has(target.category)).toBe(true);
        }
      }
    }
  });

  it("every path has an overall totalRequired greater than 0", () => {
    for (const path of PATHS) {
      const total = path.stages.reduce(
        (s, st) => s + st.targets.reduce((t, tg) => t + tg.required, 0),
        0,
      );
      expect(total).toBeGreaterThan(0);
    }
  });
});
