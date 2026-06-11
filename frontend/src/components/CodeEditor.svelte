<script>
  import { onMount, onDestroy } from "svelte";
  import { EditorView, basicSetup } from "codemirror";
  import { EditorState } from "@codemirror/state";
  import { java } from "@codemirror/lang-java";
  import { python } from "@codemirror/lang-python";
  import { javascript } from "@codemirror/lang-javascript";
  import { css } from "@codemirror/lang-css";
  import { oneDark } from "@codemirror/theme-one-dark";

  let { value = "", language = "auto", readonly = false, onUpdate } = $props();

  let container;
  let view;

  const langMap = {
    java: java, python: python, py: python,
    javascript: javascript, js: javascript, typescript: javascript, ts: javascript,
    jsx: javascript, tsx: javascript,
    css: css, html: javascript,
  };

  function detectLang(tags, title) {
    if (language !== "auto") return language;
    if (!tags) return "javascript";
    for (const t of tags) {
      const lower = t.toLowerCase();
      if (langMap[lower]) return lower;
      if (lower.includes("java") && !lower.includes("javascript")) return "java";
      if (lower.includes("python") || lower === "py") return "python";
      if (lower.includes("javascript") || lower.includes("js") || lower === "js") return "javascript";
      if (lower.includes("css")) return "css";
      if (lower.includes("go")) return "go";
      if (lower.includes("rust") || lower.includes("rs")) return "rust";
      if (lower.includes("cpp") || lower.includes("c++") || lower.includes("c")) return "cpp";
    }
    if (title) {
      const t = title.toLowerCase();
      if (t.includes("java") && !t.includes("javascript")) return "java";
      if (t.includes("python") || t.includes("py")) return "python";
    }
    return "javascript";
  }

  function langExt(lang) {
    return langMap[lang]?.() || javascript();
  }

  onMount(() => {
    if (!container) return;
    const resolvedLang = language || "javascript";
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        langExt(resolvedLang),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onUpdate?.(update.state.doc.toString());
          }
        }),
        readonly ? EditorView.editable.of(false) : [],
      ].flat(),
    });
    view = new EditorView({ state, parent: container });
  });

  onDestroy(() => {
    view?.destroy();
  });
</script>

<div bind:this={container} class="cm-editor-wrap" class:readonly></div>

<style>
  .cm-editor-wrap {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    font-size: 14px;
    line-height: 1.6;
  }
  .cm-editor-wrap :global(.cm-editor) {
    background: #1e1e2e;
  }
  .cm-editor-wrap :global(.cm-gutters) {
    background: #181825;
    border-right: 1px solid #313244;
  }
  .cm-editor-wrap :global(.cm-activeLineGutter) {
    background: rgba(137, 180, 250, 0.1);
  }
  .cm-editor-wrap :global(.cm-content) {
    padding: 8px 0;
  }
  .cm-editor-wrap :global(.cm-cursor) {
    border-left-color: var(--accent);
  }
  .cm-editor-wrap :global(.cm-selectionBackground) {
    background: rgba(137, 180, 250, 0.2) !important;
  }
  .cm-editor-wrap.readonly :global(.cm-editor) {
    opacity: 0.9;
  }
</style>
