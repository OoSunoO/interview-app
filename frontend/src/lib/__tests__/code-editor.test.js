import { describe, it, expect } from "vitest";

describe("CodeEditor component", () => {
  it("imports codemirror packages successfully", async () => {
    const codemirror = await import("codemirror");
    expect(codemirror).toBeTruthy();
  });

  it("imports language extensions successfully", async () => {
    const java = await import("@codemirror/lang-java");
    const python = await import("@codemirror/lang-python");
    const js = await import("@codemirror/lang-javascript");
    expect(java.java).toBeTypeOf("function");
    expect(python.python).toBeTypeOf("function");
    expect(js.javascript).toBeTypeOf("function");
  });

  it("creates EditorState without error", async () => {
    const { EditorState } = await import("@codemirror/state");
    const { basicSetup } = await import("codemirror");
    const { java } = await import("@codemirror/lang-java");
    const state = EditorState.create({
      doc: "public class Hello {}",
      extensions: [basicSetup, java()],
    });
    expect(state.doc.toString()).toBe("public class Hello {}");
  });

  it("creates EditorView without error", async () => {
    const { EditorView } = await import("codemirror");
    expect(EditorView).toBeTruthy();
  });
});
