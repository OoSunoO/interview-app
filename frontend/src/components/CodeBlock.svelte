<script>
  import hljs from "highlight.js/lib/core";
  import java from "highlight.js/lib/languages/java";
  import python from "highlight.js/lib/languages/python";
  import javascript from "highlight.js/lib/languages/javascript";
  import bash from "highlight.js/lib/languages/bash";
  import json from "highlight.js/lib/languages/json";
  import { toast } from "../lib/toast.js";

  hljs.registerLanguage("java", java);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("json", json);

  let { code = "", lang = "" } = $props();
  let highlighted = $derived(
    lang ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value,
  );

  let copied = $state(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      toast.success("已复制");
      setTimeout(() => (copied = false), 2000);
    } catch {
      toast.error("复制失败");
    }
  }
</script>

<pre class="code-block">
  <button class="copy-btn" onclick={handleCopy} aria-label="复制代码">
    {#if copied}
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    {:else}
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    {/if}
  </button>
  <code>{@html highlighted}</code>
</pre>

<style>
  .code-block {
    position: relative;
    background: var(--code-bg);
    border-radius: 8px;
    padding: 14px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 8px 0;
  }
  .code-block code {
    font-family: "SF Mono", "Fira Code", monospace;
  }
  .copy-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s, background 0.2s, color 0.2s;
  }
  .code-block:hover .copy-btn {
    opacity: 1;
  }
  .copy-btn:active {
    background: var(--bg-card-hover);
    color: var(--text);
  }
</style>
