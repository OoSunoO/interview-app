<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.svelte.js";
  import CodeBlock from "../components/CodeBlock.svelte";

  let { questionId, onNavigate } = $props();
  let q = $state(null);
  let showAnswer = $state(false);
  let showHints = $state(false);
  let timer = $state(0);
  let timerInterval = $state(null);
  let saving = $state(false);

  onMount(async () => {
    q = await store.loadQuestionDetail(questionId);
    timerInterval = setInterval(() => timer++, 1000);
  });

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  async function mark(status) {
    stopTimer();
    saving = true;
    await store.markProgress(q.id, status, timer);
    q.status = status === "correct" ? "correct" : "wrong";
    showAnswer = true;
    saving = false;
  }

  let selectedOption = $state(null);

  function renderContent(text) {
    if (!text) return [{ type: "text", content: "" }];
    const parts = text.split(/(```\w*\n[\s\S]*?```)/g);
    return parts.map(p => {
      const match = p.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) return { type: "code", lang: match[1], code: match[2].trimEnd() };
      return { type: "text", content: p };
    });
  }

  function isOptionCorrect(opt) {
    if (!q) return false;
    if (q.type === "true_false") return q.answer.startsWith(opt);
    return q.answer.startsWith(opt.substring(0, 2));
  }

  async function selectOption(opt) {
    if (selectedOption !== null) return;
    selectedOption = opt;
    const correct = isOptionCorrect(opt);
    stopTimer();
    saving = true;
    await store.markProgress(q.id, correct ? "correct" : "wrong", timer);
    showAnswer = true;
    saving = false;
  }
</script>

<div class="page quiz">
  {#if !q}
    <p class="loading">加载中...</p>
  {:else}
    <div class="q-meta">
      <span class="tag">{q.category}</span>
      <span class="tag diff {q.difficulty}">{q.difficulty}</span>
      <span class="tag">{q.type}</span>
      <span class="timer">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
    </div>

    <h2 class="q-title">{q.title}</h2>

    <div class="q-content">
      {#each renderContent(q.content) as part}
        {#if part.type === "code"}
          <CodeBlock code={part.code} lang={part.lang} />
        {:else}
          <p>{part.content}</p>
        {/if}
      {/each}
    </div>

    {#if q.hints.length > 0 && !showAnswer}
      <button class="hint-btn" onclick={() => showHints = !showHints}>
        {showHints ? "隐藏提示" : "显示提示"} ({q.hints.length})
      </button>
      {#if showHints}
        <ul class="hints">
          {#each q.hints as hint}
            <li>{hint}</li>
          {/each}
        </ul>
      {/if}
    {/if}

    {#if q.type === "choice" || q.type === "true_false"}
      <div class="options">
        {#each q.options as opt}
          <button class="option-btn"
            class:selected={selectedOption === opt}
            class:correct={selectedOption !== null && isOptionCorrect(opt)}
            class:wrong={selectedOption === opt && !isOptionCorrect(opt)}
            disabled={selectedOption !== null}
            onclick={() => selectOption(opt)}
          >
            {opt}
          </button>
        {/each}
      </div>
    {:else}
      {#if !showAnswer}
        <div class="actions">
          <button class="wrong-btn" onclick={() => mark("wrong")} disabled={saving}>
            {saving ? "保存中..." : "答错了"}
          </button>
          <button class="correct-btn" onclick={() => mark("correct")} disabled={saving}>
            {saving ? "保存中..." : "答对了"}
          </button>
        </div>
      {/if}
    {/if}

    {#if showAnswer}
      <div class="answer-section">
        <h3>参考答案</h3>
        {#each renderContent(q.answer) as part}
          {#if part.type === "code"}
            <CodeBlock code={part.code} lang={part.lang} />
          {:else}
            <p>{part.content}</p>
          {/if}
        {/each}
      </div>
      <div class="after-actions">
        <button onclick={() => onNavigate("browse")}>返回题库</button>
        <button onclick={() => onNavigate("wrong")}>查看错题本</button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .quiz { display: flex; flex-direction: column; gap: 14px; }
  .loading { text-align: center; color: var(--text-muted); padding: 60px 0; }
  .q-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: var(--bg-hover); }
  .tag.diff.easy { background: #166534; color: #4ade80; }
  .tag.diff.medium { background: #713f12; color: #fbbf24; }
  .tag.diff.hard { background: #7f1d1d; color: #f87171; }
  .timer { margin-left: auto; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--text-muted); }
  .q-title { font-size: 17px; font-weight: 600; }
  .q-content { line-height: 1.7; font-size: 15px; }
  .q-content p { margin-bottom: 8px; }
  .hint-btn { background: none; color: var(--warning); border: 1px solid var(--warning); padding: 8px; }
  .hints { padding-left: 20px; color: var(--text-muted); font-size: 14px; }
  .hints li { margin-bottom: 6px; }
  .answer-section { background: #052e16; border-radius: var(--radius); padding: 16px; border: 1px solid #166534; }
  .answer-section h3 { font-size: 14px; color: #4ade80; margin-bottom: 8px; }
  .answer-section p { font-size: 14px; line-height: 1.7; }
  .actions { display: flex; gap: 12px; margin-top: 8px; }
  .actions button { flex: 1; padding: 14px; font-size: 15px; font-weight: 600; }
  .wrong-btn { background: var(--danger); }
  .wrong-btn:disabled { background: #7f1d1d; }
  .correct-btn { background: var(--success); }
  .correct-btn:disabled { background: #166534; }
  .options { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .option-btn { width: 100%; padding: 14px; font-size: 15px; text-align: left; background: var(--bg-card); color: var(--text); border: 2px solid var(--border); transition: all 0.2s; }
  .option-btn:active { transform: scale(0.98); }
  .option-btn.selected { border-color: var(--accent); }
  .option-btn.correct { border-color: var(--success); background: #052e16; color: #4ade80; }
  .option-btn.wrong { border-color: var(--danger); background: #2d0a0a; color: #fca5a5; }
  .option-btn:disabled { cursor: default; opacity: 1; }
  .option-btn:disabled:not(.correct):not(.wrong) { opacity: 0.6; }
  .after-actions { display: flex; gap: 12px; }
  .after-actions button { flex: 1; padding: 12px; font-size: 14px; }
</style>
