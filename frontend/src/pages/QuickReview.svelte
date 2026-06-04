<script>
  /**
   * QuickReview — 速记模式
   * Card-based quick Q&A review. Question → reveal answer → self-rate → next.
   * Supports session save/resume for mid-exit recovery.
   */
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { categoryLabel } from "../lib/categories.js";
  import { toast } from "../lib/toast.js";
  import { renderContent, renderAnswer } from "../lib/render-utils.js";
  import CodeBlock from "../components/CodeBlock.svelte";

  let { config, onNavigate } = $props();

  // ── Phases ──
  // loading | active | completed
  let phase = $state("loading");

  // ── Session data ──
  let questions = $state([]);
  let currentIndex = $state(0);
  let showAnswer = $state(false);
  let results = $state({});

  // ── Derived ──
  let currentQuestion = $derived(questions[currentIndex]);
  let total = $derived(questions.length);
  let rememberedCount = $derived(
    Object.values(results).filter((r) => r === "remembered").length,
  );
  let forgotCount = $derived(
    Object.values(results).filter((r) => r === "forgot").length,
  );
  let unsureCount = $derived(
    Object.values(results).filter((r) => r === "unsure").length,
  );
  let doneCount = $derived(Object.keys(results).length);
  let forgottenCount = $derived(
    Object.values(results).filter((r) => r === "forgot").length,
  );
  let showSessionMap = $state(false);
  let mapDialog = $state(null);
  let showHistory = $state(false);

  function trapFocus(e, container) {
    if (e.key !== "Tab" || !container) return;
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  $effect(() => {
    if (showSessionMap && mapDialog) {
      mapDialog.focus();
    }
  });
  let sessionStatusMap = $derived.by(() => {
    const map = Object.create(null);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const rating = results[q.id];
      if (rating === "remembered") map[q.id] = "correct";
      else if (rating === "forgot") map[q.id] = "wrong";
      else if (i === currentIndex) map[q.id] = "current";
      else map[q.id] = "pending";
    }
    return map;
  });

  async function startSession(filter) {
    try {
      const list = api.questions.list({
        category: filter.category || undefined,
        difficulty: filter.difficulty || undefined,
        type: filter.type || undefined,
        page_size: filter.count || 20,
      });

      if (list.length === 0) {
        phase = "completed";
        return;
      }

      questions = await Promise.all(list.map((item) => api.questions.get(item.id)));
      currentIndex = 0;
      showAnswer = false;
      results = {};
      phase = "active";
      saveSession();
    } catch (e) {
      // If load fails, stay in loading and show nothing
      phase = "completed";
    }
  }

  async function restoreSession(saved) {
    try {
      questions = await Promise.all(saved.questionIds.map((id) => api.questions.get(id)));
      currentIndex = saved.currentIndex;
      results = saved.results || {};
      phase = "active";
      showAnswer = false;
    } catch {
      // If restore fails, start fresh with saved filter
      startSession(saved.filter || { count: 20 });
    }
  }

  function saveSession() {
    if (questions.length === 0) return;
    api.quickReview.saveSession({
      questionIds: questions.map((q) => q.id),
      currentIndex,
      results,
      filter: config || { count: 20 },
      updated_at: new Date().toISOString(),
    });
  }

  onMount(() => {
    if (config?.resume) {
      const saved = api.quickReview.getSession();
      if (saved && saved.questionIds?.length > 0) {
        restoreSession(saved);
        return;
      }
    }
    startSession(config || { count: 20 });
  });

  function revealAnswer() {
    showAnswer = true;
  }

  function handleKeydown(e) {
    if (phase !== "active") return;
    if (showSessionMap) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (!showAnswer && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      revealAnswer();
      return;
    }
    if (showAnswer) {
      if (e.key === "1") { selfRate("forgot"); return; }
      if (e.key === "2") { selfRate("unsure"); return; }
      if (e.key === "3") { selfRate("remembered"); return; }
    }
  }

  function selfRate(rating) {
    results = { ...results, [currentQuestion.id]: rating };

    const sm2Rating = { forgot: "forgot", unsure: "hard", remembered: "good" }[rating];

    // Silent save — fire-and-forget
    api.progress.update(currentQuestion.id, {
      status: { forgot: "wrong", unsure: "reviewing", remembered: "correct" }[rating],
      rating: sm2Rating,
      source: "quick_review",
      duration_seconds: 0,
    });

    if (currentIndex < questions.length - 1) {
      currentIndex++;
      showAnswer = false;
      saveSession();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      api.quickReview.saveHistory({
        total,
        remembered: rememberedCount,
        forgot: forgotCount,
        unsure: unsureCount,
        category: config?.category || "",
        difficulty: config?.difficulty || "",
      });
      api.quickReview.clearSession();
      phase = "completed";
    }
  }

  async function toggleBookmark(q) {
    if (!q) return;
    q.bookmarked = !q.bookmarked;
    try {
      await api.progress.toggleBookmark(q.id);
      toast.success(q.bookmarked ? "已收藏" : "已取消收藏");
    } catch {
      q.bookmarked = !q.bookmarked;
      toast.error("操作失败");
    }
  }

  function formatDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function handleExit() {
    if (phase === "active" && doneCount > 0) saveSession();
    onNavigate("home");
  }

  function handleDone() {
    api.quickReview.clearSession();
    onNavigate("home");
  }

  function reviewForgotten() {
    const fq = questions.filter((q) => results[q.id] === "forgot");
    if (fq.length === 0) return;
    questions = fq;
    currentIndex = 0;
    showAnswer = false;
    results = {};
    phase = "active";
    saveSession();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restartSession() {
    api.quickReview.clearSession();
    startSession(config || { count: 20 });
  }

</script>

<svelte:window onkeydown={handleKeydown} />

<div class="page qr-page" data-testid="qr-page">
  <!-- ── Active ── -->
  {#if phase === "active"}
    <div class="qr-header">
      <span class="qr-title">速记模式</span>
      <span class="qr-counter" data-testid="qr-counter">{doneCount}/{total}</span>
      <button class="map-btn" onclick={() => (showSessionMap = !showSessionMap)} title="题目列表">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /></svg>
      </button>
      <button class="qr-close" onclick={handleExit} aria-label="退出">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>

    <div class="qr-progress-track">
      <div class="qr-progress-fill" style="transform: scaleX({doneCount / total})"></div>
    </div>

    {#key currentQuestion?.id}
      <div class="qr-card" data-testid="qr-card">
        <div class="qr-card-badges">
          <span class="tag">{currentQuestion?.category ? categoryLabel(currentQuestion.category) : ""}</span>
          <span class="tag diff {currentQuestion?.difficulty}">{currentQuestion?.difficulty}</span>
          <span class="tag type">{currentQuestion?.type}</span>
          <button
            class="qr-bm-btn {currentQuestion?.bookmarked ? 'active' : ''}"
            onclick={() => toggleBookmark(currentQuestion)}
            aria-label={currentQuestion?.bookmarked ? '取消收藏' : '收藏'}
          >
            <svg aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={currentQuestion?.bookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>

        <h2 class="qr-question-title" data-testid="qr-question-title">{currentQuestion?.title}</h2>

        <div class="qr-content">
          {#each renderContent(currentQuestion?.content || "") as part}
            {#if part.type === "code"}
              <CodeBlock code={part.code} lang={part.lang} />
            {:else}
              <p>{part.content}</p>
            {/if}
          {/each}
        </div>

        {#if currentQuestion?.hints?.length > 0 && !showAnswer}
          <div class="qr-hints">
            <span class="qr-hint-label">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
              提示
            </span>
            {#each currentQuestion.hints.slice(0, 1) as hint}
              <p class="qr-hint-text">{hint}</p>
            {/each}
          </div>
        {/if}

        {#if currentQuestion?.options?.length > 0}
          <div class="qr-options">
            {#each currentQuestion.options as opt}
              <div class="qr-opt">{opt}</div>
            {/each}
          </div>
        {/if}
      </div>

      {#if !showAnswer}
        <div class="qr-reveal-area">
          <button class="qr-reveal-btn" onclick={revealAnswer} data-testid="qr-reveal-btn">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
              stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" /></svg>
            查看答案
          </button>
        </div>
      {:else}
        <div class="qr-answer">
          {#each renderAnswer(currentQuestion?.answer || "") as section}
            <div class="qr-ans-section {section.type}">
              <div class="qr-ans-label">
                {#if section.type === "answer"}参考答案
                {:else if section.type === "explanation"}解析
                {:else}扩展延伸
                {/if}
              </div>
              <div class="qr-ans-body">
                {#each section.parts as part}
                  {#if part.type === "code"}
                    <CodeBlock code={part.code} lang={part.lang} />
                  {:else}
                    <p>{part.content}</p>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <div class="qr-rate-area">
          <p class="qr-rate-hint">这道题你掌握了吗？</p>
          <div class="qr-rate-btns">
            <button class="qr-rate-btn forgot" onclick={() => selfRate("forgot")} data-testid="qr-rate-forgot">
              <span class="qr-rate-icon">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              </span>
              <span class="qr-rate-lbl">不会</span>
            </button>
            <button class="qr-rate-btn unsure" onclick={() => selfRate("unsure")} data-testid="qr-rate-unsure">
              <span class="qr-rate-icon">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              </span>
              <span class="qr-rate-lbl">大概会</span>
            </button>
            <button class="qr-rate-btn remembered" onclick={() => selfRate("remembered")} data-testid="qr-rate-remembered">
              <span class="qr-rate-icon">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              <span class="qr-rate-lbl">已掌握</span>
            </button>
          </div>
        </div>
      {/if}
    {/key}

  {#if showSessionMap}
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="overlay" onclick={() => (showSessionMap = false)} onkeydown={(e) => { if (e.key === "Escape") showSessionMap = false; }}>
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div class="map-dialog" role="dialog" aria-modal="true" tabindex="-1" data-testid="qr-map-dialog" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { trapFocus(e, mapDialog); if (e.key === "Escape") showSessionMap = false; }} bind:this={mapDialog}>
        <div class="map-title">题目列表</div>
        <div class="map-legend">
          <span class="map-legend-item"><span class="map-dot correct"></span>已掌握</span>
          <span class="map-legend-item"><span class="map-dot wrong"></span>答错</span>
          <span class="map-legend-item"><span class="map-dot current"></span>当前</span>
          <span class="map-legend-item"><span class="map-dot pending"></span>未答</span>
        </div>
        <div class="map-grid">
          {#each questions as q, i}
            {@const status = sessionStatusMap[q.id] || "pending"}
            <button
              class="map-item"
              class:map-correct={status === "correct"}
              class:map-wrong={status === "wrong"}
              class:map-current={status === "current"}
              onclick={() => { if (status !== "correct" && status !== "wrong") { currentIndex = i; showAnswer = false; saveSession(); showSessionMap = false; } }}
              title={q.title}
              disabled={status === "correct" || status === "wrong"}
            >
              {i + 1}
            </button>
          {/each}
        </div>
        <button class="map-close" onclick={() => (showSessionMap = false)}>关闭</button>
      </div>
    </div>
  {/if}

  <!-- ── Completed / Empty ── -->
  {:else if phase === "completed"}
    <div class="qr-summary" data-testid="qr-summary">
      <div class="summary-icon">
        {#if total === 0}
          <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        {:else if rememberedCount >= forgotCount}
          <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" /></svg>
        {:else}
          <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" /></svg>
        {/if}
      </div>

      {#if total === 0}
        <h2 class="summary-title">没有符合条件的题目</h2>
        <p class="summary-desc">试试更换筛选条件</p>
      {:else}
        <h2 class="summary-title">速记完成！</h2>
        <div class="summary-stats">
          <div class="summary-stat remembered">
            <span class="summary-stat-num">{rememberedCount}</span>
            <span class="summary-stat-lbl">已掌握</span>
          </div>
          <div class="summary-stat unsure">
            <span class="summary-stat-num">{unsureCount}</span>
            <span class="summary-stat-lbl">待巩固</span>
          </div>
          <div class="summary-stat forgot">
            <span class="summary-stat-num">{forgotCount}</span>
            <span class="summary-stat-lbl">要复习</span>
          </div>
        </div>
        <p class="summary-pct">{Math.round((rememberedCount / total) * 100)}% 掌握率</p>
      {/if}

      <div class="summary-actions">
        <button class="summary-btn primary" onclick={handleDone}>完成</button>
        {#if total > 0}
          <button class="summary-btn secondary" onclick={restartSession}>再来一轮</button>
        {/if}
        {#if forgottenCount > 0}
          <button class="summary-btn danger" onclick={reviewForgotten}>
            复习 {forgottenCount} 道遗忘题
          </button>
        {/if}
        <button class="summary-btn ghost" onclick={() => onNavigate("wrong")}>查看错题</button>
        <button class="summary-btn ghost" onclick={() => (showHistory = true)}>历史记录</button>
      </div>
    </div>

    {#if showHistory}
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div class="overlay" onclick={() => (showHistory = false)} onkeydown={(e) => { if (e.key === "Escape") showHistory = false; }}>
        <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
        <div class="history-dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === "Escape") showHistory = false; }}>
          <div class="history-header">
            <span class="history-title">速记历史</span>
            <button class="history-close" onclick={() => (showHistory = false)} aria-label="关闭">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          {#if api.quickReview.getHistory().length === 0}
            <p class="history-empty">暂无记录</p>
          {:else}
            <div class="history-list">
              {#each api.quickReview.getHistory() as session}
                <div class="history-item">
                  <div class="history-item-date">{formatDate(session.date)}</div>
                  <div class="history-item-stats">
                    <span class="history-stat remembered">{session.remembered}</span>
                    <span class="history-stat unsure">{session.unsure}</span>
                    <span class="history-stat forgot">{session.forgot}</span>
                  </div>
                  <div class="history-item-info">
                    <span>{session.total} 题</span>
                    <span class="history-pct">{Math.round((session.remembered / session.total) * 100)}%</span>
                  </div>
                </div>
              {/each}
            </div>
            <button class="history-clear" onclick={() => { api.quickReview.clearHistory(); showHistory = false; }}>清除历史</button>
          {/if}
        </div>
      </div>
    {/if}

  <!-- ── Loading ── -->
  {:else}
    <div class="qr-loading">
      <div class="skeleton" style="height:200px"></div>
    </div>
  {/if}
</div>

<style>
  .qr-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: calc(24px + var(--nav-height) + var(--safe-bottom));
  }

  /* ── Header ── */
  .qr-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .qr-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--accent);
  }
  .qr-counter {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .qr-close {
    margin-left: auto;
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text-muted);
    cursor: pointer;
  }
  .qr-close:active {
    transform: scale(0.88);
  }

  /* ── Map Button ── */
  .map-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    width: 32px;
    height: 32px;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: all 0.3s var(--spring);
  }
  .map-btn:active {
    transform: scale(0.88);
    color: var(--accent);
    border-color: var(--accent-dim);
  }

  /* ── Session Map Overlay ── */
  .map-dialog {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    width: 100%;
    max-width: 340px;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: scale-in 0.3s var(--spring) both;
  }
  .map-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }
  .map-legend {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .map-legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-muted);
  }
  .map-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .map-dot.correct { background: var(--success); }
  .map-dot.wrong { background: var(--danger); }
  .map-dot.current { background: var(--accent); }
  .map-dot.pending { background: var(--text-dim); }
  .map-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    gap: 6px;
  }
  .map-item {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    padding: 0;
  }
  .map-item:active {
    transform: scale(0.9);
  }
  .map-item:disabled {
    cursor: default;
    opacity: 0.7;
  }
  .map-item.map-correct {
    background: var(--success-bg);
    color: var(--success);
    border-color: var(--success);
  }
  .map-item.map-wrong {
    background: var(--danger-bg);
    color: var(--danger);
    border-color: var(--danger);
  }
  .map-item.map-current {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    box-shadow: 0 0 8px rgba(108, 140, 255, 0.4);
  }
  .map-close {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
  .map-close:active {
    transform: scale(0.97);
  }

  /* ── Progress ── */
  .qr-progress-track {
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .qr-progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transform-origin: left;
    transition: transform 0.5s var(--spring);
  }

  /* ── Question Card ── */
  .qr-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    animation: fade-in 0.35s var(--spring) both;
  }

  .qr-card-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .tag.type {
    background: var(--bg-surface);
    color: var(--text-dim);
  }
  .qr-bm-btn {
    margin-left: auto;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--text-dim);
    transition: color 0.2s;
    display: inline-flex;
    align-items: center;
  }
  .qr-bm-btn:hover,
  .qr-bm-btn.active {
    color: var(--warning);
  }

  .qr-question-title {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.2px;
    line-height: 1.35;
    margin-bottom: 12px;
    color: var(--text);
  }

  .qr-content {
    font-size: 15px;
    line-height: 1.75;
    color: var(--text);
  }
  .qr-content p {
    margin-bottom: 8px;
  }

  /* ── Hints ── */
  .qr-hints {
    margin-top: 12px;
    padding: 10px 14px;
    background: var(--warning-bg);
    border: 1px solid rgba(251, 191, 36, 0.15);
    border-radius: var(--radius-sm);
  }
  .qr-hint-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--warning);
    display: block;
    margin-bottom: 4px;
  }
  .qr-hint-text {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  /* ── Options (choice/true_false) ── */
  .qr-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
  }
  .qr-opt {
    padding: 10px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--text);
  }

  /* ── Reveal Button ── */
  .qr-reveal-area {
    display: flex;
    justify-content: center;
  }
  .qr-reveal-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    font-size: 15px;
    font-weight: 600;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.3s var(--spring);
    font-family: inherit;
    animation: fade-in 0.5s var(--spring) both;
  }
  .qr-reveal-btn:active {
    transform: scale(0.97);
  }

  /* ── Answer ── */
  .qr-answer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: fade-up 0.3s var(--spring) both;
  }
  .qr-ans-section {
    border-radius: var(--radius-sm);
    padding: 14px 16px;
  }
  .qr-ans-section.answer {
    background: var(--ans-answer-bg);
    border: 1px solid var(--ans-answer-border);
  }
  .qr-ans-section.explanation {
    background: var(--ans-explanation-bg);
    border: 1px solid var(--ans-explanation-border);
  }
  .qr-ans-section.extension {
    background: var(--ans-extension-bg);
    border: 1px solid var(--ans-extension-border);
  }
  .qr-ans-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .qr-ans-section.answer .qr-ans-label {
    color: var(--ans-answer-text);
  }
  .qr-ans-section.explanation .qr-ans-label {
    color: var(--ans-explanation-text);
  }
  .qr-ans-section.extension .qr-ans-label {
    color: var(--ans-extension-text);
  }
  .qr-ans-body {
    font-size: 14px;
    line-height: 1.65;
  }
  .qr-ans-body p {
    margin-bottom: 6px;
    color: var(--text);
  }
  .qr-ans-body :global(pre),
  .qr-ans-body :global(code) {
    max-width: 100%;
    overflow-x: auto;
  }

  /* ── Self-Rating ── */
  .qr-rate-area {
    animation: fade-in 0.4s var(--spring) both;
  }
  .qr-rate-hint {
    text-align: center;
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 10px;
  }
  .qr-rate-btns {
    display: flex;
    gap: 8px;
  }
  .qr-rate-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 8px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--bg-surface);
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s var(--spring);
    font-family: inherit;
    text-align: center;
  }
  .qr-rate-btn:active {
    transform: scale(0.96);
  }
  .qr-rate-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }
  .qr-rate-btn.forgot:active,
  .qr-rate-btn.forgot .qr-rate-icon {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .qr-rate-btn.unsure:active,
  .qr-rate-btn.unsure .qr-rate-icon {
    background: var(--warning-bg);
    color: var(--warning);
  }
  .qr-rate-btn.remembered:active,
  .qr-rate-btn.remembered .qr-rate-icon {
    background: var(--success-bg);
    color: var(--success);
  }
  .qr-rate-lbl {
    font-size: 13px;
    font-weight: 700;
  }

  /* ── Summary ── */
  .qr-summary {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 20px;
    text-align: center;
  }
  .summary-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-bg);
    color: var(--accent);
  }
  .summary-icon :global(svg) {
    width: 32px;
    height: 32px;
  }
  .summary-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .summary-desc {
    font-size: 14px;
    color: var(--text-muted);
  }
  .summary-stats {
    display: flex;
    gap: 16px;
  }
  .summary-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--bg-card);
  }
  .summary-stat-num {
    font-size: 22px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .summary-stat.remembered .summary-stat-num {
    color: var(--success);
  }
  .summary-stat.unsure .summary-stat-num {
    color: var(--warning);
  }
  .summary-stat.forgot .summary-stat-num {
    color: var(--danger);
  }
  .summary-stat-lbl {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }
  .summary-pct {
    font-size: 13px;
    color: var(--text-muted);
  }
  .summary-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 240px;
  }
  .summary-btn {
    width: 100%;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.3s var(--spring);
  }
  .summary-btn:active {
    transform: scale(0.97);
  }
  .summary-btn.primary {
    background: var(--accent);
    color: #fff;
    border: none;
  }
  .summary-btn.secondary {
    background: none;
    color: var(--text-muted);
    border: 1px solid var(--border);
  }

  /* ── Loading ── */
  .qr-loading {
    padding: 40px 0;
  }

  /* ── Mobile ── */
  @media (max-width: 480px) {
    .qr-card {
      padding: 16px;
    }
    .qr-question-title {
      font-size: 15px;
    }
    .qr-content {
      font-size: 14px;
    }
    .qr-rate-btn {
      font-size: 12px;
      padding: 12px 6px;
    }
    .summary-stats {
      gap: 10px;
    }
    .summary-stat {
      min-width: 50px;
      padding: 10px 12px;
    }
    .summary-stat-num {
      font-size: 18px;
    }
  }

  /* ── Summary Ghost Button ── */
  .summary-btn.ghost {
    background: none;
    color: var(--text-dim);
    border: none;
    font-size: 13px;
    padding: 8px;
  }
  .summary-btn.danger {
    background: var(--danger-bg);
    color: var(--danger);
    border: 1px solid var(--danger);
  }

  /* ── History Dialog ── */
  .history-dialog {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0;
    width: 100%;
    max-width: 360px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    animation: scale-in 0.3s var(--spring) both;
    overflow: hidden;
  }
  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 0;
  }
  .history-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }
  .history-close {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--text-dim);
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
  }
  .history-close:active {
    transform: scale(0.88);
  }
  .history-empty {
    padding: 32px 16px;
    text-align: center;
    color: var(--text-dim);
    font-size: 14px;
  }
  .history-list {
    padding: 12px 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .history-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .history-item-date {
    font-size: 12px;
    color: var(--text-dim);
    min-width: 56px;
  }
  .history-item-stats {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }
  .history-stat {
    width: 24px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    border-radius: 4px;
  }
  .history-stat.remembered {
    background: var(--success-bg);
    color: var(--success);
  }
  .history-stat.unsure {
    background: var(--warning-bg);
    color: var(--warning);
  }
  .history-stat.forgot {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .history-item-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
    font-size: 11px;
    color: var(--text-dim);
  }
  .history-pct {
    font-weight: 700;
    color: var(--text-muted);
  }
  .history-clear {
    margin: 0 16px 16px;
    padding: 8px;
    font-size: 12px;
    color: var(--danger);
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: inherit;
  }
  .history-clear:active {
    opacity: 0.7;
  }
</style>
