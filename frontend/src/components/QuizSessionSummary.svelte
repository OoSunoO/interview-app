<script>
  import { store } from "../lib/stores.svelte.js";

  let { sessionResults, interviewed, mockInterview, onNavigate, onRetryWrong, onReset } = $props();

  let sessionSummary = $derived.by(() => {
    const correct = sessionResults.filter(r => r.status === "correct").length;
    const wrong = sessionResults.filter(r => r.status === "wrong" || r.status === "timeout").length;
    const total = sessionResults.length;
    const totalTime = sessionResults.reduce((sum, r) => sum + (r.duration || 0), 0);
    return {
      correct, wrong, total, pct: total > 0 ? Math.round(correct / total * 100) : 0,
      totalTime, avgTime: total > 0 ? Math.round(totalTime / total) : 0,
    };
  });

  let pass = $derived(sessionSummary.pct >= 70);

  function miFilterLabel(config) {
    const parts = [];
    if (config?.category) parts.push(config.category);
    if (config?.difficulty) parts.push({ easy: "简单", medium: "中等", hard: "困难" }[config.difficulty] || config.difficulty);
    if (config?.tag) parts.push(config.tag);
    return parts.length ? parts.join(" · ") : null;
  }

  async function retryWrong() {
    const wrongIds = new Set(sessionResults.filter(r => r.status === "wrong").map(r => r.id));
    const wrongQs = store.quizSession.filter(qq => wrongIds.has(qq.id));
    if (wrongQs.length > 0) {
      await store.startQuiz(wrongQs);
      onRetryWrong(wrongQs[0].id);
    }
  }

  async function retryWrongItem(wr) {
    const wrongIds = new Set(sessionResults.filter(r => r.status === "wrong").map(r => r.id));
    const wrongQs = store.quizSession.filter(qq => wrongIds.has(qq.id));
    await store.startQuiz(wrongQs);
    onRetryWrong(wr.id);
  }

  async function quickReviewWrong() {
    const wrongIds = [...new Set(sessionResults.filter(r => r.status === "wrong").map(r => r.id))];
    store._clearSessionBackup();
    onNavigate("quick-review", { reviewConfig: { questionIds: wrongIds } });
  }
</script>

<div class="session-summary" class:mock-summary={interviewed}>
  <h2 class="ss-title">{interviewed ? "模拟面试完成" : "本次练习完成"}</h2>
  {#if interviewed}
    {#if miFilterLabel(mockInterview)}
      <div class="mi-summary-filters">{miFilterLabel(mockInterview)}</div>
    {/if}
    <div class="mi-verdict" class:pass={pass} class:fail={!pass}>
      {#if pass}
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        通过
      {:else}
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        继续努力
      {/if}
    </div>
  {/if}
  <div class="ss-stats">
    <div class="ss-stat ss-correct">
      <span class="ss-num">{sessionSummary.correct}</span>
      <span class="ss-label">正确</span>
    </div>
    {#if sessionSummary.wrong > 0}
    <div class="ss-stat ss-wrong">
      <span class="ss-num">{sessionSummary.wrong}</span>
      <span class="ss-label">错误</span>
    </div>
    {/if}
    <div class="ss-stat ss-total">
      <span class="ss-num">{sessionSummary.total}</span>
      <span class="ss-label">总计</span>
    </div>
  </div>
  <div class="ss-bar-wrap">
    <div class="ss-bar">
      <div
        class="ss-bar-fill ss-bar-correct"
        style="width: {sessionSummary.pct}%"
      ></div>
    </div>
    <span class="ss-bar-label">{sessionSummary.pct}%</span>
  </div>
  <div class="ss-time-row">
    <span class="ss-time-item">
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
      总耗时 {Math.floor(sessionSummary.totalTime / 60)}分{sessionSummary.totalTime % 60}秒
    </span>
    <span class="ss-time-item">
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10" /><polyline points="12 6 12 12 16 14" /></svg>
      平均 {sessionSummary.avgTime > 60 ? `${Math.floor(sessionSummary.avgTime / 60)}分${sessionSummary.avgTime % 60}秒` : `${sessionSummary.avgTime}秒`}/题
    </span>
  </div>
  {#if sessionSummary.wrong > 0}
    <div class="ss-wrong-list">
      <h3 class="ss-subtitle">需要复习的题目</h3>
      {#each sessionResults.filter(r => r.status === "wrong") as wr}
        <button
          class="ss-wrong-item"
          onclick={() => retryWrongItem(wr)}
        >
          <span class="ss-wrong-cat">{wr.category}</span>
          <span class="ss-wrong-title">{wr.title}</span>
          {#if wr.userAnswer !== undefined}
            <div class="ss-wrong-compare">
              <div class="ss-compare-row ss-compare-user">
                <span class="ss-compare-label">你答：</span>
                <span class="ss-compare-text">{wr.userAnswer || "(空)"}</span>
              </div>
              <div class="ss-compare-row ss-compare-correct">
                <span class="ss-compare-label">答案：</span>
                <span class="ss-compare-text">{wr.correctAnswer}</span>
              </div>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
  <div class="ss-actions">
    {#if sessionSummary.wrong > 0}
      <button class="ss-btn ss-btn-primary" onclick={retryWrong}>重做错题</button>
      <button class="ss-btn ss-btn-secondary" onclick={quickReviewWrong}>
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
        速记错题
      </button>
    {/if}
    {#if interviewed}
      <button class="ss-btn ss-btn-secondary" onclick={() => onNavigate("home")}>
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        再来一轮
      </button>
    {/if}
    <button class="ss-btn" onclick={() => onNavigate("browse")}>返回题库</button>
  </div>
</div>

<style>
  .session-summary {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px 0;
    animation: fadeIn 0.3s ease;
  }
  .mock-summary .ss-title {
    color: var(--accent);
  }
  .mi-summary-filters {
    font-size: 12px;
    color: var(--text-dim);
    margin-top: 4px;
    text-align: center;
  }
  .mi-verdict {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0;
  }
  .mi-verdict.pass { color: var(--success, #52c41a); }
  .mi-verdict.fail { color: var(--danger, #e74c3c); }
  .ss-title {
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    color: var(--text);
  }
  .ss-stats {
    display: flex;
    justify-content: center;
    gap: 24px;
  }
  .ss-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .ss-num {
    font-size: 32px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .ss-correct .ss-num { color: var(--success); }
  .ss-wrong .ss-num { color: var(--danger); }
  .ss-total .ss-num { color: var(--text-muted); }
  .ss-label {
    font-size: 12px;
    color: var(--text-dim);
    font-weight: 500;
  }
  .ss-bar-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ss-bar {
    flex: 1;
    height: 10px;
    background: var(--danger-bg);
    border-radius: 5px;
    overflow: hidden;
  }
  .ss-bar-fill {
    height: 100%;
    border-radius: 5px;
    background: var(--success);
    transition: width 0.6s var(--spring);
  }
  .ss-bar-label {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    min-width: 40px;
    text-align: right;
  }
  .ss-time-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 12px;
    color: var(--text-muted);
  }
  .ss-time-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .ss-time-item svg {
    opacity: 0.6;
  }
  .ss-subtitle {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }
  .ss-wrong-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ss-wrong-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 14px;
    text-align: left;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .ss-wrong-item:active {
    transform: scale(0.98);
    border-color: var(--danger);
  }
  .ss-wrong-cat {
    font-size: 10px;
    padding: 2px 6px;
    background: var(--danger-bg);
    color: var(--danger);
    border-radius: 3px;
    white-space: nowrap;
    font-weight: 600;
  }
  .ss-wrong-title {
    font-size: 13px;
    line-height: 1.4;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
  }
  .ss-wrong-compare {
    margin-top: 8px;
    padding: 8px 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 12px;
    line-height: 1.6;
    text-align: left;
    width: 100%;
  }
  .ss-compare-row {
    display: flex;
    gap: 6px;
  }
  .ss-compare-row + .ss-compare-row {
    margin-top: 4px;
  }
  .ss-compare-label {
    flex-shrink: 0;
    font-weight: 700;
  }
  .ss-compare-user .ss-compare-label {
    color: var(--danger);
  }
  .ss-compare-correct .ss-compare-label {
    color: var(--success);
  }
  .ss-compare-text {
    color: var(--text);
    word-break: break-word;
    min-width: 0;
  }
  .ss-actions {
    display: flex;
    gap: 10px;
  }
  .ss-btn {
    flex: 1;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius);
    background: var(--bg-surface);
    color: var(--text);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .ss-btn:active {
    transform: scale(0.97);
  }
  .ss-btn-primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
  .ss-btn-primary:active {
    opacity: 0.85;
  }
  .ss-btn-secondary {
    background: var(--success-bg);
    color: var(--success);
    border-color: var(--success);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .ss-btn-secondary:active {
    opacity: 0.75;
  }
</style>
