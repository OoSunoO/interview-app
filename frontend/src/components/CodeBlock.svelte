<script>
  import hljs from "highlight.js/lib/core";
  import java from "highlight.js/lib/languages/java";
  import python from "highlight.js/lib/languages/python";
  import javascript from "highlight.js/lib/languages/javascript";
  import bash from "highlight.js/lib/languages/bash";
  import json from "highlight.js/lib/languages/json";

  hljs.registerLanguage("java", java);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("json", json);

  let { code = "", lang = "" } = $props();
  let highlighted = $derived(lang ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value);
</script>

<pre class="code-block"><code>{@html highlighted}</code></pre>

<style>
  .code-block {
    background: #0d1117;
    border-radius: 8px;
    padding: 14px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 8px 0;
  }
  .code-block code { font-family: "SF Mono", "Fira Code", monospace; }
</style>
