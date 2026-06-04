<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import { FILTER_CATEGORIES, categoryLabel } from "../lib/categories.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";

  let { onNavigate } = $props();
  let recommend = $state([]);
  let dueCount = $state(0);
  let loading = $state(true);
  let error = $state(null);
  let reminderEnabled = $state(localStorage.getItem("review_reminder") !== "off");
  let dailyGoal = $state(api.progress.getGoal());
  let weeklyData = $state([]);

  // ── Quick Review ──
  let showQRDialog = $state(false);
  let showResumeDialog = $state(false);
  let savedQRSession = $state(null);
  let qrCategory = $state("");
  let qrDifficulty = $state("");
  let qrCount = $state(20);

  const categories = FILTER_CATEGORIES;

  async function loadData() {
    loading = true;
    error = null;
    try {
      const [due, stats, wrong] = await Promise.all([
        api.progress.dueReviews(),
        api.progress.stats(),
        api.progress.wrong(),
      ]);
      dueCount = due.length;
      store.stats = stats;
      store.refreshDailyStats();

      // Build smart recommendations:
      // 1. Prioritize due/pending SM-2 reviews
      // 2. Then wrong-answer questions
      // 3. Fall back to random unseen questions
      let recs = [];
      const seen = new Set();

      function pushRec(q) {
        if (recs.length >= 3 || seen.has(q.id)) return;
        seen.add(q.id);
        recs.push(q);
      }

      for (const q of due) pushRec(q);
      for (const q of wrong) pushRec(q);

      if (recs.length < 3) {
        const extras = await api.questions.list({ page_size: 10 });
        for (const q of extras) pushRec(q);
      }

      recommend = recs;

      // Build weekly chart
      const allDaily = api.progress.allDailyStats();
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const dayLabel = i === 0 ? "今天" : i === 1 ? "昨天" : ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
        const count = allDaily[key]?.reviewed || 0;
        days.push({ label: dayLabel, count });
      }
      weeklyData = days;
    } catch (e) {
      error = e.message ?? "加载数据失败";
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await loadData();
    if (reminderEnabled && dueCount > 0 && "Notification" in window && Notification.permission === "granted") {
      new Notification("📚 复习提醒", {
        body: `你有 ${dueCount} 道题待复习，点击开始巩固吧！`,
        icon: "/favicon.ico",
        tag: "review-reminder",
      });
    }
  });

  function toggleReminder() {
    reminderEnabled = !reminderEnabled;
    localStorage.setItem("review_reminder", reminderEnabled ? "on" : "off");
    if (reminderEnabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  // ── Quick Review ──
  function openQuickReview() {
    savedQRSession = api.quickReview.getSession();
    if (savedQRSession && savedQRSession.questionIds?.length > 0) {
      showResumeDialog = true;
    } else {
      savedQRSession = null;
      showQRDialog = true;
    }
  }

  function resumeQuickReview() {
    showResumeDialog = false;
    onNavigate("quick-review", { reviewConfig: { resume: true } });
  }

  function startQuickReview() {
    showQRDialog = false;
    showResumeDialog = false;
    onNavigate("quick-review", {
      reviewConfig: { category: qrCategory, difficulty: qrDifficulty, count: qrCount },
    });
  }

  function handleOverlayKeydown(e, close) {
    if (e.key === "Escape") close();
  }
</script>

<div class="page home">
  <div class="hero-section">
    <div class="hero-content">
      <div class="eyebrow">面试准备</div>
      <h1 class="hero-title">温故而知新</h1>
      <p class="hero-desc">持续练习，巩固知识。每一次复习都是进步的阶梯。</p>
    </div>

    {#if loading}
      <div class="hero-stats-skeleton">
        <div class="skeleton-box" style="width:64px;height:52px"></div>
        <div class="skeleton-box" style="width:64px;height:52px"></div>
        <div class="skeleton-box" style="width:64px;height:52px"></div>
      </div>
    {:else}
      <div class="hero-stats">
        <div class="double-bezel">
          <div class="double-bezel-inner stat-inner">
            <span class="stat-num">{store.stats?.total ?? 0}</span>
            <span class="stat-lbl">总题数</span>
          </div>
        </div>
        <div class="double-bezel">
          <div class="double-bezel-inner stat-inner accent">
            <span class="stat-num">{store.stats?.done ?? 0}</span>
            <span class="stat-lbl">已掌握</span>
          </div>
        </div>
        <div class="double-bezel">
          <div class="double-bezel-inner stat-inner" class:attention={dueCount > 0}>
            <span class="stat-num">{dueCount}</span>
            <span class="stat-lbl">待复习</span>
          </div>
        </div>
      </div>
    {/if}
    {#if dailyGoal > 0}
      <div class="goal-card">
        <div class="goal-row">
          <span class="goal-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </span>
          <span class="goal-text">每日目标</span>
          <span class="goal-count" class:goal-done={store.dailyStats.today.reviewed >= dailyGoal}>
            {Math.min(store.dailyStats.today.reviewed, dailyGoal)}/{dailyGoal}
          </span>
        </div>
        <div class="goal-bar-track">
          <div class="goal-bar-fill" style="transform: scaleX({Math.min(1, store.dailyStats.today.reviewed / dailyGoal)})"></div>
        </div>
      </div>
    {/if}
  </div>

  <div class="body-section">
    {#if error}
      <ErrorAlert message={error} onRetry={loadData} />
    {:else if loading}
      <div class="skeleton" style="height:52px"></div>
      <div class="skeleton" style="height:96px;margin-top:8px"></div>
      <div class="skeleton" style="height:96px;margin-top:8px"></div>
    {:else}
      {#if dueCount > 0}
        <button class="due-card" onclick={() => onNavigate("wrong")}>
          <div class="due-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div class="due-body">
            <span class="due-lbl">待复习提醒</span>
            <span class="due-cnt">{dueCount} 道题待巩固</span>
          </div>
          <div class="due-arrow-icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      {:else}
        <div class="all-clear">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--success)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline
              points="22 4 12 14.01 9 11.01"
            />
          </svg>
          <span>暂无待复习题目，继续保持</span>
        </div>
      {/if}

      <button class="review-entry-btn" onclick={() => onNavigate("review-session")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        间隔复习
        {#if store.dailyStats?.streak > 0}
          <span class="review-streak-badge">🔥 {store.dailyStats.streak} 天</span>
        {/if}
      </button>

      {#if store.dailyStats && store.dailyStats.today.reviewed > 0}
        <div class="daily-mini-stats">
          <span>今日已复习 <strong>{store.dailyStats.today.reviewed}</strong> 题</span>
          <span class="daily-dot">·</span>
          <span>掌握率 <strong>{store.dailyStats.retention}%</strong></span>
        </div>
      {/if}

      <div class="weekly-chart">
        <div class="wc-bars">
          {#each weeklyData as day}
            <div class="wc-col" title="{day.count} 题">
              <div
                class="wc-bar"
                style="height: {Math.max(3, Math.min(100, day.count * 6))}px"
                class:wc-hit={dailyGoal > 0 && day.count >= dailyGoal}
                class:wc-today={day.label === "今天" && day.count > 0}
              ></div>
              <span class="wc-label">{day.label}</span>
            </div>
          {/each}
        </div>
      </div>

      <button class="reminder-toggle" onclick={toggleReminder}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class:off={!reminderEnabled}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        复习提醒
        <span class="toggle-dot" class:on={reminderEnabled} class:off={!reminderEnabled}></span>
      </button>

      <div class="section-divider">
        <span class="section-dot"></span>
        <span class="section-dot"></span>
        <span class="section-dot"></span>
      </div>

      <h2 class="section-heading">今日推荐</h2>

      {#if recommend.length === 0}
        <p class="empty-rec">暂无推荐 — 去题库开始刷题吧</p>
      {:else}
        <div class="recommend-list">
          {#each recommend as q, i}
            <button
              class="rec-card"
              style="animation-delay: {i * 80}ms"
              onclick={() => onNavigate("quiz", { questionId: q.id })}
            >
              <div class="rec-badges">
                <span class="tag">{categoryLabel(q.category)}</span>
                <span class="tag diff {q.difficulty}">{q.difficulty}</span>
              </div>
              <p class="rec-title">{q.title}</p>
              <span class="rec-type">{q.type}</span>
            </button>
          {/each}
        </div>
      {/if}

      <button class="btn-wrap start-cta" onclick={() => onNavigate("browse")}>
        开始刷题
        <span class="btn-icon">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </button>

      <button class="qr-entry-btn" onclick={openQuickReview}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" /></svg>
        速记模式
      </button>
    {/if}
  </div>
</div>

<!-- ── Resume Dialog ── -->
{#if showResumeDialog}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="dialog-overlay" onclick={() => (showResumeDialog = false)} onkeydown={(e) => handleOverlayKeydown(e, () => showResumeDialog = false)}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => handleOverlayKeydown(e, () => showResumeDialog = false)}>
      <div class="dialog-title">继续速记？</div>
      <div class="dialog-desc">您有未完成的速记训练，是否继续上次进度？</div>
      <div class="resume-info">
        已完成 <strong>{Object.keys(savedQRSession?.results || {}).length}/{savedQRSession?.questionIds?.length || 0}</strong> 题
      </div>
      <div class="dialog-actions">
        <button class="dialog-btn cancel" onclick={() => { showResumeDialog = false; showQRDialog = true; savedQRSession = null; }}>开始新的</button>
        <button class="dialog-btn primary" onclick={resumeQuickReview}>继续</button>
      </div>
    </div>
  </div>
{/if}

<!-- ── Filter Dialog ── -->
{#if showQRDialog}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="dialog-overlay" onclick={() => (showQRDialog = false)} onkeydown={(e) => handleOverlayKeydown(e, () => showQRDialog = false)}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => handleOverlayKeydown(e, () => showQRDialog = false)}>
      <div class="dialog-title">速记模式</div>
      <div class="dialog-desc">按条件筛选题目，快速浏览</div>

      <label for="qr-cat">分类</label>
      <select id="qr-cat" bind:value={qrCategory}>
        {#each categories as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>

      <label for="qr-diff">难度</label>
      <select id="qr-diff" bind:value={qrDifficulty}>
        <option value="">全部</option>
        <option value="easy">简单</option>
        <option value="medium">中等</option>
        <option value="hard">困难</option>
      </select>

      <span class="dialog-label">题量</span>
      <div class="count-options">
        <button class="count-btn" class:active={qrCount === 10} onclick={() => (qrCount = 10)}>10</button>
        <button class="count-btn" class:active={qrCount === 20} onclick={() => (qrCount = 20)}>20</button>
        <button class="count-btn" class:active={qrCount === 30} onclick={() => (qrCount = 30)}>30</button>
      </div>

      <div class="dialog-actions">
        <button class="dialog-btn cancel" onclick={() => (showQRDialog = false)}>取消</button>
        <button class="dialog-btn primary" onclick={startQuickReview}>开始</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .home {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-top: 0;
  }

  /* ── Hero Section ── */
  .hero-section {
    position: relative;
    margin: 0 -20px;
    padding: 40px 20px 28px;
    background: linear-gradient(180deg, rgba(108, 140, 255, 0.08) 0%, transparent 100%);
    text-align: center;
    overflow: hidden;
  }
  .hero-section::before {
    content: "";
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(108, 140, 255, 0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .hero-content {
    position: relative;
    z-index: 1;
  }
  .eyebrow {
    display: inline-flex;
    padding: 4px 14px;
    border-radius: var(--radius-pill);
    background: var(--accent-bg);
    color: var(--accent);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .hero-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.15;
    color: var(--text);
    margin-bottom: 8px;
  }
  .hero-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 24px;
  }

  /* ── Stats ── */
  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }
  .hero-stats .double-bezel {
    width: 98px;
  }
  .stat-inner {
    text-align: center;
    padding: 14px 8px;
  }
  .stat-num {
    display: block;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text);
    line-height: 1.1;
  }
  .stat-inner.accent .stat-num {
    color: var(--accent);
  }
  .stat-inner.attention .stat-num {
    color: var(--danger);
  }
  .stat-lbl {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 4px;
    font-weight: 500;
  }
  .hero-stats-skeleton {
    display: flex;
    justify-content: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }
  .hero-stats-skeleton .skeleton-box {
    width: 98px;
    height: 88px;
  }

  /* ── Daily Goal ── */
  .goal-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .goal-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .goal-icon {
    display: inline-flex;
    color: var(--accent);
  }
  .goal-text {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    flex: 1;
  }
  .goal-count {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .goal-count.goal-done {
    color: var(--success);
  }
  .goal-bar-track {
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .goal-bar-fill {
    height: 100%;
    background: var(--success);
    border-radius: 2px;
    transform-origin: left;
    transition: transform 0.5s;
  }

  /* ── Body Section ── */
  .body-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Due Card ── */
  .due-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    text-align: left;
    width: 100%;
    color: var(--text);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.3s var(--spring);
  }
  .due-card:active {
    background: var(--bg-card-hover);
    border-color: rgba(108, 140, 255, 0.2);
    transform: scale(0.99);
  }
  .due-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--accent-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--accent);
  }
  .due-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .due-lbl {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }
  .due-cnt {
    font-size: 12px;
    color: var(--text-muted);
  }
  .due-arrow-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bg-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-dim);
  }

  .all-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    font-size: 14px;
    color: var(--text-muted);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  /* ── Section Divider ── */
  .section-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 2px 0;
  }
  .section-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
  }

  .section-heading {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.2px;
    color: var(--text);
  }

  /* ── Recommend ── */
  .recommend-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .rec-card {
    text-align: left;
    width: 100%;
    padding: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    animation: fade-in 0.6s var(--spring) both;
    transition: all 0.3s var(--spring);
  }
  .rec-card:active {
    background: var(--bg-card-hover);
    border-color: rgba(108, 140, 255, 0.2);
    transform: scale(0.99);
  }
  .rec-badges {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
  }
  .rec-title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.45;
    margin-bottom: 6px;
    letter-spacing: -0.2px;
  }
  .rec-type {
    font-size: 11px;
    color: var(--text-dim);
    font-weight: 500;
  }

  .empty-rec {
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
    padding: 20px 0;
  }

  /* ── CTA ── */
  .start-cta {
    width: 100%;
    justify-content: center;
    font-size: 16px;
    padding: 12px 24px 12px 28px;
  }

  /* ── Mobile ── */
  @media (max-width: 480px) {
    .hero-section {
      margin: 0 -14px;
      padding: 32px 14px 24px;
    }
    .hero-title {
      font-size: 24px;
    }
    .hero-stats .double-bezel {
      width: auto;
      flex: 1;
      min-width: 0;
    }
    .stat-inner {
      padding: 10px 6px;
    }
    .stat-num {
      font-size: 20px;
    }
    .stat-lbl {
      font-size: 10px;
    }
    .hero-stats-skeleton .skeleton-box {
      width: auto;
      flex: 1;
      height: 76px;
    }
    .rec-card {
      padding: 14px;
    }
    .rec-title {
      font-size: 14px;
    }
  }

/* ── Quick Review Entry Button ── */
.qr-entry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--accent);
  border: 1px solid var(--accent);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s var(--spring);
}
.qr-entry-btn:active {
  transform: scale(0.97);
  background: var(--accent-bg);
}

/* ── Reminder Toggle ── */
.reminder-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text-muted);
  border: 1px solid var(--border);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s var(--spring);
}
.reminder-toggle:active {
  transform: scale(0.97);
}
.reminder-toggle svg.off {
  opacity: 0.4;
}
.toggle-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text-dim);
  transition: all 0.3s var(--spring);
}
.toggle-dot.on {
  background: var(--success);
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
}
.toggle-dot.off {
  background: var(--text-dim);
}

/* ── SM-2 Review Entry Button ── */
.review-entry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
}
.review-entry-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}
.review-streak-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.15);
}

/* ── Daily Mini Stats ── */
.daily-mini-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
.daily-mini-stats strong {
  font-weight: 700;
  color: var(--accent);
}
.daily-dot {
  color: var(--text-dim);
}

/* ── Dialogs (Overlay) ── */
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal-overlay);
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fade-in 0.2s both;
}
.dialog {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: scale-in 0.3s var(--spring) both;
}
.dialog-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}
.dialog-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}
.dialog label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.dialog select {
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  background: var(--bg-card);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  outline: none;
  width: 100%;
}
.dialog select:focus {
  border-color: var(--accent);
}
.count-options {
  display: flex;
  gap: 8px;
}
.count-btn {
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
.count-btn:active {
  transform: scale(0.96);
}
.count-btn.active {
  background: var(--accent-bg);
  color: var(--accent);
  border-color: var(--accent);
}
.dialog-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.dialog-btn {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s var(--spring);
  text-align: center;
}
.dialog-btn:active {
  transform: scale(0.97);
}
.dialog-btn.cancel {
  background: none;
  color: var(--text-muted);
  border: 1px solid var(--border);
}
.dialog-btn.primary {
  background: var(--accent);
  color: #fff;
  border: none;
}
.dialog-btn.secondary {
  background: var(--bg-surface);
  color: var(--accent);
  border: 1px solid var(--accent);
}
.resume-info {
  padding: 12px 14px;
  background: var(--accent-bg);
  border: 1px solid rgba(108, 140, 255, 0.12);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
}
.resume-info strong {
  color: var(--accent);
}

/* ── Mobile ── */
@media (max-width: 480px) {
  .dialog {
    padding: 20px;
    max-width: 300px;
  }
}

/* ── Weekly Chart ── */
.weekly-chart {
  padding: 10px 0 4px;
}
.wc-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
}
.wc-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.wc-bar {
  width: 100%;
  max-width: 32px;
  border-radius: 4px 4px 0 0;
  background: var(--border);
  transition: height 0.5s var(--spring), background 0.3s;
  min-height: 3px;
}
.wc-bar.wc-hit {
  background: var(--success);
}
.wc-bar.wc-today {
  background: var(--accent);
}
.wc-bar.wc-hit.wc-today {
  background: var(--success);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}
.wc-label {
  font-size: 10px;
  color: var(--text-dim);
  font-weight: 500;
}
</style>
