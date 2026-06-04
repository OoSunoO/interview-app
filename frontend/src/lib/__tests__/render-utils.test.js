import { describe, it, expect } from "vitest";
import { renderContent, renderAnswer } from "../render-utils.js";

describe("renderContent", () => {
  it("returns a text part for plain content", () => {
    const result = renderContent("Hello world");
    expect(result).toEqual([{ type: "text", content: "Hello world" }]);
  });

  it("splits out code blocks", () => {
    const text = "Some text\n```js\nconst x = 1;\n```\nMore text";
    const result = renderContent(text);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: "text", content: "Some text\n" });
    expect(result[1]).toEqual({ type: "code", lang: "js", code: "const x = 1;" });
    expect(result[2]).toEqual({ type: "text", content: "\nMore text" });
  });

  it("handles empty input", () => {
    expect(renderContent("")).toEqual([{ type: "text", content: "" }]);
    expect(renderContent(null)).toEqual([{ type: "text", content: "" }]);
    expect(renderContent(undefined)).toEqual([{ type: "text", content: "" }]);
  });

  it("handles code block without language", () => {
    const text = "```\nraw code\n```";
    const result = renderContent(text);
    // split produces ["", "match", ""]; code block is at index 1
    expect(result[1]).toEqual({ type: "code", lang: "", code: "raw code" });
  });

  it("handles multiple code blocks", () => {
    const text = "```a\n1\n```\nsep\n```b\n2\n```";
    const result = renderContent(text);
    // split produces ["", "code1", "\nsep\n", "code2", ""]; codes at 1, 3
    expect(result).toHaveLength(5);
    expect(result[1]).toEqual({ type: "code", lang: "a", code: "1" });
    expect(result[2]).toEqual({ type: "text", content: "\nsep\n" });
    expect(result[3]).toEqual({ type: "code", lang: "b", code: "2" });
  });
});

describe("renderAnswer", () => {
  it("returns a single answer section for plain text with no markers", () => {
    const result = renderAnswer("Plain answer");
    expect(result).toEqual([
      { type: "answer", parts: [{ type: "text", content: "Plain answer" }] },
    ]);
  });

  it("splits by 答案 and 解析 headers", () => {
    const text = "答案：The answer\n解析：The explanation";
    const result = renderAnswer(text);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("answer");
    expect(result[0].parts[0].content).toBe("The answer");
    expect(result[1].type).toBe("explanation");
    expect(result[1].parts[0].content).toBe("The explanation");
  });

  it("uses colon or full-width colon", () => {
    const a = renderAnswer("答案：内容");
    const b = renderAnswer("答案: 内容");
    expect(a[0].parts[0].content).toBe("内容");
    expect(b[0].parts[0].content).toBe("内容");
  });

  it("handles 扩展延伸 header", () => {
    const result = renderAnswer("答案：A\n扩展延伸：B");
    expect(result[1].type).toBe("extension");
    expect(result[1].parts[0].content).toBe("B");
  });

  it("returns empty array for empty input", () => {
    expect(renderAnswer("")).toEqual([]);
    expect(renderAnswer(null)).toEqual([]);
    expect(renderAnswer(undefined)).toEqual([]);
  });

  it("returns empty array for whitespace-only input", () => {
    expect(renderAnswer("   ")).toEqual([]);
  });

  it("handles text ending with a header and no trailing content", () => {
    const text = "答案：content\n解析：";
    const result = renderAnswer(text);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("answer");
    expect(result[0].parts[0].content).toBe("content");
    expect(result[1].type).toBe("explanation");
  });

  it("handles text with code blocks inside sections", () => {
    const text = "答案：Here's code\n```py\nprint(1)\n```\n解析：It prints 1";
    const result = renderAnswer(text);
    expect(result).toHaveLength(2);
    expect(result[0].parts).toContainEqual({
      type: "code",
      lang: "py",
      code: "print(1)",
    });
  });

  it("preserves multi-line content in sections", () => {
    const text = "答案：Line 1\nLine 2\nLine 3\n解析：Done";
    const result = renderAnswer(text);
    expect(result[0].parts[0].content).toBe("Line 1\nLine 2\nLine 3");
  });
});
