<script>
  /**
   * ReviewSession — SM-2 间隔复习
   * Card-based review with 4-level self-rating and SM-2 scheduling.
   * Session save/resume via localStorage.
   */
  import { onMount, onDestroy } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import { RATINGS } from "../lib/sm2.js";
  import { FILTER_CATEGORIES, categoryLabel } from "../lib/categories.js";
  import { toast } from "../lib/toast.js";
  import { renderContent, renderAnswer } from "../lib/render-utils.js";
  import CodeBlock from "../components/CodeBlock.svelte";

  let { config, onNavigate } = $props();

  // setup | loading | active | completed | empty
  let phase = $state("loading");
  let cards = $state([]);
  let currentIndex = $state(0);
  let showAnswer = $state(false);
  let results = $state({});
  function typeLabel(t) {
    return { short_answer: "问答题", choice: "选择题", multiple_choice: "多选题", true_false: "判断题", coding: "编程题", fill_in_blank: "填空题" }[t] || t;
  }

  function _initVal(key, fallback) { return config?.[key] ?? fallback; }
  let configCategory = $state(_initVal("category", ""));
  let configDifficulty = $state(_initVal("difficulty", ""));
  let configCount = $state(_initVal("count", 20));

  let showSessionMap = $state(false);
  let mapDialog = $state(null);

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
  let currentCard = $derived(cards[currentIndex]);
  let total = $derived(cards.length);
  let doneCount = $derived(Object.keys(results).length);
  let counts = $derived.by(() => {
    const c = { forgot: 0, hard: 0, good: 0, easy: 0 };
    for (const r of Object.values(results)) c[r] = (c[r] || 0) + 1;
    return c;
  });
  let retention = $derived(doneCount > 0 ? Math.round(((counts.good + counts.easy) / doneCount) * 100) : 0);
  let sessionStatusMap = $derived.by(() => {
    const map = Object.create(null);
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rating = results[card.id];
      if (rating === "good" || rating === "easy") map[card.id] = "correct";
      else if (rating === "forgot" || rating === "hard") map[card.id] = "wrong";
      else if (i === currentIndex) map[card.id] = "current";
      else map[card.id] = "pending";
    }
    return map;
  });

  const SAVE_KEY = "review_session";

  async function startSession(count, category, difficulty) {
    try {
      const session = await api.progress.startReviewSession(count || 20, category || "", difficulty || "");
      if (session.length === 0) {
        phase = "empty";
        return;
      }
      cards = session;
      currentIndex = 0;
      showAnswer = false;
      results = {};
      phase = "active";
      saveSession();
    } catch {
      phase = "empty";
    }
  }

  async function restoreSession(saved) {
    try {
      cards = await Promise.all(saved.cardIds.map((id) => api.questions.get(id)));
      currentIndex = saved.currentIndex;
      results = saved.results || {};
      phase = "active";
      showAnswer = false;
    } catch {
      startSession();
    }
  }

  function saveSession() {
    if (cards.length === 0) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        cardIds: cards.map((c) => c.id),
        currentIndex,
        results,
        updated_at: new Date().toISOString(),
      }));
    } catch { /* ignore */ }
  }

  function clearSession() {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
  }

  function handleKeydown(e) {
    if (showSessionMap) return;
    if (phase === "active") {
      // Space to reveal answer
      if (e.key === " " || e.key === "Spacebar") {
        if (!showAnswer) { e.preventDefault(); revealAnswer(); return; }
      }
      // 1-4 to rate
      if (showAnswer) {
        const map = { "1": "forgot", "2": "hard", "3": "good", "4": "easy" };
        const rating = map[e.key];
        if (rating) { e.preventDefault(); rate(rating); return; }
      }
      // Escape to exit
      if (e.key === "Escape") { e.preventDefault(); handleExit(); return; }
    }
    // R to restart from completed
    if (e.key === "r" || e.key === "R") {
      if (phase === "completed" && cards.length > 0) {
        e.preventDefault();
        startSession(configCount, configCategory, configDifficulty);
        return;
      }
    }
  }

  onMount(async () => {
    window.addEventListener("keydown", handleKeydown);
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.cardIds?.length > 0) {
          restoreSession(parsed);
          return;
        }
      } catch { /* ignore */ }
    }
    phase = "setup";
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
  });

  function revealAnswer() {
    showAnswer = true;
  }

  async function rate(rating) {
    results = { ...results, [currentCard.id]: rating };
    await store.rateAndAdvance(currentCard.id, rating);

    if (currentIndex < cards.length - 1) {
      currentIndex++;
      showAnswer = false;
      saveSession();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      clearSession();
      phase = "completed";
    }
  }

  function handleExit() {
    if (phase === "active" && doneCount > 0) saveSession();
    else clearSession();
    onNavigate("home");
  }

  function handleDone() {
    clearSession();
    onNavigate("home");
  }

  function toggleBookmark(e, card) {
    e.stopPropagation();
    if (!card) return;
    card.bookmarked = api.progress.toggleBookmark(card.id);
    toast.success(card.bookmarked ? "已收藏" : "已取消收藏");
  }

  const categories = FILTER_CATEGORIES;
</script>

<div class="page rs-page">
  <!-- ── Setup ── -->
  {#if phase === "setup"}
    <div class="rs-setup">
      <div class="rs-setup-icon">
        <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
      </div>
      <h2 class="rs-setup-title">间隔复习</h2>
      <p class="rs-setup-desc">选择分类和题量，开始 SM-2 间隔复习。</p>

      <label for="rs-cat">分类</label>
      <select id="rs-cat" bind:value={configCategory}>
        {#each categories as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>

      <label for="rs-diff">难度</label>
      <select id="rs-diff" bind:value={configDifficulty}>
        <option value="">全部难度</option>
        <option value="easy">简单</option>
        <option value="medium">中等</option>
        <option value="hard">困难</option>
      </select>

      <span class="rs-setup-lbl">题量</span>
      <div class="rs-count-options">
        <button class="rs-count-btn" class:active={configCount === 10} onclick={() => (configCount = 10)}>10</button>
        <button class="rs-count-btn" class:active={configCount === 20} onclick={() => (configCount = 20)}>20</button>
        <button class="rs-count-btn" class:active={configCount === 30} onclick={() => (configCount = 30)}>30</button>
        <button class="rs-count-btn" class:active={configCount === 50} onclick={() => (configCount = 50)}>50</button>
      </div>

      <button class="rs-setup-start" onclick={() => startSession(configCount, configCategory, configDifficulty)}>
        开始复习
      </button>
    </div>

  <!-- ── Active ── -->
  {:else if phase === "active"}
    <div class="rs-header">
      <span class="rs-title">间隔复习</span>
      <span class="rs-counter">{doneCount}/{total}</span>
      <button class="map-btn" onclick={() => (showSessionMap = !showSessionMap)} title="题目列表">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /></svg>
      </button>
      <button class="rs-close" onclick={handleExit} aria-label="退出">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>

    <div class="rs-progress-track">
      <div class="rs-progress-fill" style="transform: scaleX({doneCount / total})"></div>
    </div>

    {#key currentCard?.id}
      <div class="rs-card">
        <div class="rs-card-badges">
          <span class="tag">{currentCard?.category ? categoryLabel(currentCard.category) : ""}</span>
          <span class="tag diff {currentCard?.difficulty}">{currentCard?.difficulty}</span>
          <span class="tag type">{typeLabel(currentCard?.type)}</span>
          <span
            class="rs-bm-toggle"
            class:active={currentCard?.bookmarked}
            role="button"
            tabindex="0"
            onkeydown={(e) => { if (e.key === "Enter") toggleBookmark(e, currentCard); }}
            onclick={(e) => toggleBookmark(e, currentCard)}
            title={currentCard?.bookmarked ? "取消收藏" : "收藏"}
          >
            <svg aria-hidden="true"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill={currentCard?.bookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><polygon points="19 21 12 17.27 5 21 5 3 19 3 19 21" /></svg>
          </span>
        </div>

        <h2 class="rs-question-title">{currentCard?.title}</h2>

        <div class="rs-content">
          {#each renderContent(currentCard?.content || "") as part}
            {#if part.type === "code"}
              <CodeBlock code={part.code} lang={part.lang} />
            {:else}
              <p>{part.content}</p>
            {/if}
          {/each}
        </div>

        {#if currentCard?.hints?.length > 0 && !showAnswer}
          <div class="rs-hints">
            <span class="rs-hint-label">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
              提示
            </span>
            {#each currentCard.hints.slice(0, 1) as hint}
              <p class="rs-hint-text">{hint}</p>
            {/each}
          </div>
        {/if}

        {#if currentCard?.options?.length > 0}
          <div class="rs-options">
            {#each currentCard.options as opt}
              <div class="rs-opt">{opt}</div>
            {/each}
          </div>
        {/if}
      </div>

      {#if !showAnswer}
        <div class="rs-reveal-area">
          <button class="rs-reveal-btn" onclick={revealAnswer}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
              stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" /></svg>
            查看答案
          </button>
        </div>
      {:else}
        <div class="rs-answer">
          {#each renderAnswer(currentCard?.answer || "") as section}
            <div class="rs-ans-section {section.type}">
              <div class="rs-ans-label">
                {#if section.type === "answer"}参考答案
                {:else if section.type === "explanation"}解析
                {:else}扩展延伸
                {/if}
              </div>
              <div class="rs-ans-body">
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

        <div class="rs-rate-area">
          <div class="rs-rate-btns">
            <button class="rs-rate-btn forgot" onclick={() => rate("forgot")}>
              <span class="rs-rate-kbd">1</span>
              <span class="rs-rate-icon">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                  stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              </span>
              <span class="rs-rate-lbl">忘记了</span>
              <span class="rs-rate-sub">1 天后复习</span>
            </button>
            <button class="rs-rate-btn hard" onclick={() => rate("hard")}>
              <span class="rs-rate-kbd">2</span>
              <span class="rs-rate-icon">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                  stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" /></svg>
              </span>
              <span class="rs-rate-lbl">不太熟</span>
              <span class="rs-rate-sub">1 天后复习</span>
            </button>
            <button class="rs-rate-btn good" onclick={() => rate("good")}>
              <span class="rs-rate-kbd">3</span>
              <span class="rs-rate-icon">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                  stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
              <span class="rs-rate-lbl">答对了</span>
              <span class="rs-rate-sub">逐步延长</span>
            </button>
            <button class="rs-rate-btn easy" onclick={() => rate("easy")}>
              <span class="rs-rate-kbd">4</span>
              <span class="rs-rate-icon">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                  stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </span>
              <span class="rs-rate-lbl">很简单</span>
              <span class="rs-rate-sub">快速进阶</span>
            </button>
          </div>
        </div>
      {/if}
    {/key}

  {#if showSessionMap}
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="overlay" onclick={() => (showSessionMap = false)} onkeydown={(e) => { if (e.key === "Escape") showSessionMap = false; }}>
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div class="map-dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { trapFocus(e, mapDialog); if (e.key === "Escape") showSessionMap = false; }} bind:this={mapDialog}>
        <div class="map-title">复习列表</div>
        <div class="map-legend">
          <span class="map-legend-item"><span class="map-dot correct"></span>已掌握</span>
          <span class="map-legend-item"><span class="map-dot wrong"></span>待巩固</span>
          <span class="map-legend-item"><span class="map-dot current"></span>当前</span>
          <span class="map-legend-item"><span class="map-dot pending"></span>待复习</span>
        </div>
        <div class="map-grid">
          {#each cards as card, i}
            {@const status = sessionStatusMap[card.id] || "pending"}
            <button
              class="map-item"
              class:map-correct={status === "correct"}
              class:map-wrong={status === "wrong"}
              class:map-current={status === "current"}
              onclick={() => { if (status !== "correct" && status !== "wrong") { currentIndex = i; showAnswer = false; saveSession(); showSessionMap = false; } }}
              title={card.title}
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

  <!-- ── Completed ── -->
  {:else if phase === "completed"}
    <div class="rs-summary">
      <div class="summary-icon {retention >= 70 ? 'good' : retention >= 40 ? 'ok' : 'bad'}">
        {#if retention >= 70}
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

      <h2 class="summary-title">复习完成！</h2>

      {#if store.dailyStats?.streak > 0}
        <div class="summary-streak">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>
          连续 {store.dailyStats.streak} 天
        </div>
      {/if}

      <div class="summary-stats">
        <div class="summary-stat good">
          <span class="summary-stat-num">{counts.good + counts.easy}</span>
          <span class="summary-stat-lbl">已掌握</span>
        </div>
        <div class="summary-stat hard">
          <span class="summary-stat-num">{counts.hard}</span>
          <span class="summary-stat-lbl">待巩固</span>
        </div>
        <div class="summary-stat forgot">
          <span class="summary-stat-num">{counts.forgot}</span>
          <span class="summary-stat-lbl">要复习</span>
        </div>
      </div>
      <p class="summary-pct">{retention}% 掌握率</p>

      <div class="summary-actions">
        <button class="summary-btn primary" onclick={handleDone}>完成</button>
        <button class="summary-btn secondary" onclick={() => onNavigate("wrong")}>查看错题</button>
      </div>
    </div>

  <!-- ── Empty ── -->
  {:else if phase === "empty"}
    <div class="rs-summary">
      <div class="summary-icon good">
        <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" /></svg>
      </div>
      <h2 class="summary-title">暂无待复习题目</h2>
      <p class="summary-desc">所有题目已按计划安排，请继续保持复习节奏！</p>
      <div class="summary-actions">
        <button class="summary-btn primary" onclick={handleDone}>返回首页</button>
        <button class="summary-btn secondary" onclick={() => onNavigate("browse")}>浏览题库</button>
      </div>
    </div>

  <!-- ── Loading ── -->
  {:else}
    <div class="rs-loading">
      <div class="skeleton" style="height:200px"></div>
    </div>
  {/if}
</div>

<style>
  .rs-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: calc(24px + var(--nav-height) + var(--safe-bottom));
  }

  /* ── Header ── */
  .rs-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .rs-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--accent);
  }
  .rs-counter {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .rs-close {
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
  .rs-close:active {
    transform: scale(0.88);
  }

  /* ── Progress ── */
  .rs-progress-track {
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .rs-progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transform-origin: left;
    transition: transform 0.5s var(--spring);
  }

  /* ── Question Card ── */
  .rs-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    animation: fade-in 0.35s var(--spring) both;
  }

  .rs-card-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    align-items: center;
  }
  .rs-bm-toggle {
    margin-left: auto;
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: var(--text-dim);
    display: inline-flex;
    align-items: center;
    border-radius: 3px;
    transition: all 0.2s var(--spring);
  }
  .rs-bm-toggle.active {
    color: var(--warning);
  }
  .rs-bm-toggle:active {
    transform: scale(0.85);
  }
  .tag.type {
    background: var(--bg-surface);
    color: var(--text-dim);
  }

  .rs-question-title {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.2px;
    line-height: 1.35;
    margin-bottom: 12px;
    color: var(--text);
  }

  .rs-content {
    font-size: 15px;
    line-height: 1.75;
    color: var(--text);
  }
  .rs-content p {
    margin-bottom: 8px;
  }

  /* ── Hints ── */
  .rs-hints {
    margin-top: 12px;
    padding: 10px 14px;
    background: var(--warning-bg);
    border: 1px solid rgba(251, 191, 36, 0.15);
    border-radius: var(--radius-sm);
  }
  .rs-hint-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--warning);
    display: block;
    margin-bottom: 4px;
  }
  .rs-hint-text {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  /* ── Options ── */
  .rs-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 12px;
  }
  .rs-opt {
    padding: 10px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--text);
  }

  /* ── Reveal Button ── */
  .rs-reveal-area {
    display: flex;
    justify-content: center;
  }
  .rs-reveal-btn {
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
  .rs-reveal-btn:active {
    transform: scale(0.97);
  }

  /* ── Answer ── */
  .rs-answer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: fade-up 0.3s var(--spring) both;
  }
  .rs-ans-section {
    border-radius: var(--radius-sm);
    padding: 14px 16px;
  }
  .rs-ans-section.answer {
    background: var(--ans-answer-bg);
    border: 1px solid var(--ans-answer-border);
  }
  .rs-ans-section.explanation {
    background: var(--ans-explanation-bg);
    border: 1px solid var(--ans-explanation-border);
  }
  .rs-ans-section.extension {
    background: var(--ans-extension-bg);
    border: 1px solid var(--ans-extension-border);
  }
  .rs-ans-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .rs-ans-section.answer .rs-ans-label { color: var(--ans-answer-text); }
  .rs-ans-section.explanation .rs-ans-label { color: var(--ans-explanation-text); }
  .rs-ans-section.extension .rs-ans-label { color: var(--ans-extension-text); }
  .rs-ans-body {
    font-size: 14px;
    line-height: 1.65;
  }
  .rs-ans-body p {
    margin-bottom: 6px;
    color: var(--text);
  }
  .rs-ans-body :global(pre),
  .rs-ans-body :global(code) {
    max-width: 100%;
    overflow-x: auto;
  }

  /* ── Self-Rating ── */
  .rs-rate-area {
    animation: fade-in 0.4s var(--spring) both;
  }
  .rs-rate-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .rs-rate-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
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
  .rs-rate-btn:active {
    transform: scale(0.96);
  }
  .rs-rate-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    margin-bottom: 2px;
  }
  .rs-rate-lbl {
    font-size: 13px;
    font-weight: 700;
  }
  .rs-rate-kbd {
    position: absolute;
    top: 6px;
    right: 8px;
    font-size: 10px;
    font-weight: 700;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    color: var(--text-dim);
    border: 1px solid var(--border);
    opacity: 0.6;
  }
  .rs-rate-sub {
    font-size: 10px;
    color: var(--text-dim);
    font-weight: 400;
  }

  .rs-rate-btn.forgot:active,
  .rs-rate-btn.forgot .rs-rate-icon {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .rs-rate-btn.hard:active,
  .rs-rate-btn.hard .rs-rate-icon {
    background: var(--warning-bg);
    color: var(--warning);
  }
  .rs-rate-btn.good:active,
  .rs-rate-btn.good .rs-rate-icon {
    background: var(--success-bg);
    color: var(--success);
  }
  .rs-rate-btn.easy:active,
  .rs-rate-btn.easy .rs-rate-icon {
    background: var(--accent-bg);
    color: var(--accent);
  }

  /* ── Summary ── */
  .rs-summary {
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
    background: var(--bg-surface);
    color: var(--text-muted);
  }
  .summary-icon :global(svg) {
    width: 32px;
    height: 32px;
  }
  .summary-icon.good {
    background: var(--success-bg);
    color: var(--success);
  }
  .summary-icon.ok {
    background: var(--warning-bg);
    color: var(--warning);
  }
  .summary-icon.bad {
    background: var(--danger-bg);
    color: var(--danger);
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
  .summary-streak {
    font-size: 14px;
    color: var(--warning);
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
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
  .summary-stat.good .summary-stat-num { color: var(--success); }
  .summary-stat.hard .summary-stat-num { color: var(--warning); }
  .summary-stat.forgot .summary-stat-num { color: var(--danger); }
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
  .rs-loading {
    padding: 40px 0;
  }

  /* ── Setup ── */
  .rs-setup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 20px;
    text-align: center;
  }
  .rs-setup-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--accent-bg);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rs-setup-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .rs-setup-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    margin-bottom: 4px;
  }
  .rs-setup label,
  .rs-setup-lbl {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    align-self: stretch;
    text-align: left;
  }
  .rs-setup select {
    width: 100%;
    padding: 10px 12px;
    font-family: inherit;
    font-size: 14px;
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    outline: none;
  }
  .rs-setup select:focus {
    border-color: var(--accent);
  }
  .rs-count-options {
    display: flex;
    gap: 8px;
    width: 100%;
  }
  .rs-count-btn {
    flex: 1;
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
    text-align: center;
  }
  .rs-count-btn:active {
    transform: scale(0.96);
  }
  .rs-count-btn.active {
    background: var(--accent-bg);
    color: var(--accent);
    border-color: var(--accent);
  }
  .rs-setup-start {
    width: 100%;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    border-radius: var(--radius-sm);
    background: var(--accent-gradient);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.3s var(--spring);
    margin-top: 8px;
  }
  .rs-setup-start:active {
    transform: scale(0.97);
    opacity: 0.9;
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

  /* ── Mobile ── */
  @media (max-width: 480px) {
    .rs-card {
      padding: 16px;
    }
    .rs-question-title {
      font-size: 15px;
    }
    .rs-content {
      font-size: 14px;
    }
    .rs-rate-btn {
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
