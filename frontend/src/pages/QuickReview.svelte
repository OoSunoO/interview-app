<script>
  /**
   * QuickReview — 速记模式
   * Card-based quick Q&A review. Question → reveal answer → self-rate → next.
   * Supports session save/resume for mid-exit recovery.
   */
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { categoryLabel } from "../lib/categories.js";
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

  function renderContent(text) {
    if (!text) return [{ type: "text", content: "" }];
    const parts = text.split(/(```\w*\n[\s\S]*?```)/g);
    return parts.map((p) => {
      const match = p.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) return { type: "code", lang: match[1], code: match[2].trimEnd() };
      return { type: "text", content: p };
    });
  }

  function renderAnswer(text) {
    if (!text) return [];
    const lines = text.split("\n");
    const sections = [];
    let curType = "answer";
    let curLines = [];
    const headerRe = /^(答案|解析|扩展延伸|推荐阅读)[：:]\s*/;

    for (const line of lines) {
      const h = line.match(headerRe);
      if (h) {
        if (curLines.length) sections.push({ type: curType, text: curLines.join("\n").trim() });
        curType = { 答案: "answer", 解析: "explanation" }[h[1]] ?? "extension";
        curLines = [line.slice(h[0].length)];
      } else {
        curLines.push(line);
      }
    }
    if (curLines.length) sections.push({ type: curType, text: curLines.join("\n").trim() });

    const hasMarkers = lines.some((l) => headerRe.test(l));
    if (!hasMarkers) {
      const t = text.trim();
      return t ? [{ type: "answer", parts: renderContent(t) }] : [];
    }
    return sections.map((s) => ({ type: s.type, parts: renderContent(s.text) }));
  }

  function startSession(filter) {
    try {
      const list = api.questions.list({
        category: filter.category || undefined,
        difficulty: filter.difficulty || undefined,
        page_size: filter.count || 20,
      });

      if (list.length === 0) {
        phase = "completed";
        return;
      }

      questions = list.map((item) => api.questions.get(item.id));
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

  function restoreSession(saved) {
    try {
      questions = saved.questionIds.map((id) => api.questions.get(id));
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
    } else {
      api.quickReview.clearSession();
      phase = "completed";
    }
  }

  async function toggleBookmark(q) {
    if (!q) return;
    q.bookmarked = !q.bookmarked;
    try {
      await api.progress.toggleBookmark(q.id);
    } catch {
      q.bookmarked = !q.bookmarked;
    }
  }

  function handleExit() {
    if (phase === "active" && doneCount > 0) saveSession();
    onNavigate("home");
  }

  function handleDone() {
    api.quickReview.clearSession();
    onNavigate("home");
  }

</script>

<div class="page qr-page">
  <!-- ── Active ── -->
  {#if phase === "active"}
    <div class="qr-header">
      <span class="qr-title">速记模式</span>
      <span class="qr-counter">{doneCount}/{total}</span>
      <button class="qr-close" onclick={handleExit} aria-label="退出">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>

    <div class="qr-progress-track">
      <div class="qr-progress-fill" style="transform: scaleX({doneCount / total})"></div>
    </div>

    {#key currentQuestion?.id}
      <div class="qr-card">
        <div class="qr-card-badges">
          <span class="tag">{currentQuestion?.category ? categoryLabel(currentQuestion.category) : ""}</span>
          <span class="tag diff {currentQuestion?.difficulty}">{currentQuestion?.difficulty}</span>
          <span class="tag type">{currentQuestion?.type}</span>
          <button
            class="qr-bm-btn {currentQuestion?.bookmarked ? 'active' : ''}"
            onclick={() => toggleBookmark(currentQuestion)}
            aria-label={currentQuestion?.bookmarked ? '取消收藏' : '收藏'}
          >
            <svg
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

        <h2 class="qr-question-title">{currentQuestion?.title}</h2>

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
            <span class="qr-hint-label">💡 提示</span>
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
          <button class="qr-reveal-btn" onclick={revealAnswer}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
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
            <button class="qr-rate-btn forgot" onclick={() => selfRate("forgot")}>
              ❌ 不会
            </button>
            <button class="qr-rate-btn unsure" onclick={() => selfRate("unsure")}>
              🤔 大概会
            </button>
            <button class="qr-rate-btn remembered" onclick={() => selfRate("remembered")}>
              ✅ 已掌握
            </button>
          </div>
        </div>
      {/if}
    {/key}

  <!-- ── Completed / Empty ── -->
  {:else if phase === "completed"}
    <div class="qr-summary">
      <div class="summary-icon">
        {#if total === 0}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        {:else if rememberedCount >= forgotCount}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" /></svg>
        {:else}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
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
        <button class="summary-btn secondary" onclick={() => onNavigate("wrong")}>查看错题</button>
      </div>
    </div>

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
  .qr-rate-btn.forgot:active {
    background: var(--danger-bg);
    border-color: var(--danger);
    color: var(--danger);
  }
  .qr-rate-btn.unsure:active {
    background: var(--warning-bg);
    border-color: var(--warning);
    color: var(--warning);
  }
  .qr-rate-btn.remembered:active {
    background: var(--success-bg);
    border-color: var(--success);
    color: var(--success);
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
</style>
