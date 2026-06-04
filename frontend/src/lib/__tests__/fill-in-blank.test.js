import { describe, it, expect } from "vitest";

import { splitContent } from "../../components/FillInBlank.svelte";

describe("splitContent", () => {
  it("splits text and ___ into alternating segments", () => {
    const parts = splitContent("A ___ B ___ C");
    expect(parts).toEqual([
      { type: "text", text: "A " },
      { type: "blank", index: 0 },
      { type: "text", text: " B " },
      { type: "blank", index: 1 },
      { type: "text", text: " C" },
    ]);
  });

  it("handles content with no blanks", () => {
    const parts = splitContent("Just text");
    expect(parts).toEqual([{ type: "text", text: "Just text" }]);
  });

  it("handles empty content", () => {
    expect(splitContent("")).toEqual([]);
    expect(splitContent(null)).toEqual([]);
    expect(splitContent(undefined)).toEqual([]);
  });

  it("handles leading and trailing blanks", () => {
    const parts = splitContent("___ leading and trailing ___");
    expect(parts[0]).toEqual({ type: "blank", index: 0 });
    expect(parts[parts.length - 1]).toEqual({ type: "blank", index: 1 });
  });
});
