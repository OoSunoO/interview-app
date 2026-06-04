<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import { FILTER_CATEGORIES, categoryLabel } from "../lib/categories.js";
  import { toast } from "../lib/toast.js";
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
  let qrCategory = $state(localStorage.getItem("qr_category") || "");
  let qrDifficulty = $state(localStorage.getItem("qr_difficulty") || "");
  let qrType = $state(localStorage.getItem("qr_type") || "");
  let qrCount = $state(Number(localStorage.getItem("qr_count")) || 20);
  let lastSession = $state(null);
  let showMIDialog = $state(false);
  let showGoalDialog = $state(false);
  let goalInput = $state(0);
  let miCategory = $state(localStorage.getItem("mi_category") || "");
  let miDifficulty = $state(localStorage.getItem("mi_difficulty") || "");
  let miType = $state(localStorage.getItem("mi_type") || "");
  let miTag = $state(localStorage.getItem("mi_tag") || "");
  let miCount = $state(Number(localStorage.getItem("mi_count")) || 10);
  let miTimeLimit = $state(Number(localStorage.getItem("mi_time_limit")) || 120);
  let allTags = $state([]);

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
      allTags = api.questions.tags();
    } catch (e) {
      error = e.message ?? "加载数据失败";
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await loadData();
    try {
      const saved = sessionStorage.getItem("last_quiz_session");
      if (saved) lastSession = JSON.parse(saved);
    } catch (_) { /* ignore */ }
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
    toast.success(reminderEnabled ? "复习提醒已开启" : "复习提醒已关闭");
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
    localStorage.setItem("qr_category", qrCategory);
    localStorage.setItem("qr_difficulty", qrDifficulty);
    localStorage.setItem("qr_type", qrType);
    localStorage.setItem("qr_count", String(qrCount));
    onNavigate("quick-review", {
      reviewConfig: { category: qrCategory, difficulty: qrDifficulty, type: qrType, count: qrCount },
    });
  }

  async function startMockInterview() {
    showMIDialog = false;
    localStorage.setItem("mi_category", miCategory);
    localStorage.setItem("mi_difficulty", miDifficulty);
    localStorage.setItem("mi_type", miType);
    localStorage.setItem("mi_tag", miTag);
    localStorage.setItem("mi_count", String(miCount));
    localStorage.setItem("mi_time_limit", String(miTimeLimit));
    const list = api.questions.list({
      category: miCategory,
      difficulty: miDifficulty,
      type: miType || undefined,
      tag: miTag || undefined,
      page_size: 500,
    });
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, miCount);
    if (selected.length === 0) {
      toast.error("没有符合条件的题目");
      return;
    }
    await store.startQuiz(selected);
    onNavigate("quiz", {
      questionId: selected[0].id,
      mockInterview: { timeLimit: miTimeLimit },
    });
  }

  function handleOverlayKeydown(e, close) {
    if (e.key === "Escape") close();
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "刚刚";
    if (m < 60) return `${m}分钟前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}小时前`;
    return `${Math.floor(h / 24)}天前`;
  }

  async function startDueReview() {
    const due = await api.progress.dueReviews();
    if (due.length > 0) {
      await store.startQuiz(due);
      onNavigate("quiz", { questionId: due[0].id });
    }
  }

  function openGoalDialog() {
    goalInput = dailyGoal;
    showGoalDialog = true;
  }

  function saveGoal() {
    const val = Math.max(0, Math.min(200, Math.round(goalInput) || 0));
    api.progress.setGoal(val);
    dailyGoal = val;
    showGoalDialog = false;
    if (val > 0) toast.success(`每日目标已设为 ${val} 题`);
    else toast.success("每日目标已关闭");
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
      <button class="goal-card" onclick={openGoalDialog}>
        <div class="goal-row">
          <span class="goal-icon">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </span>
          <span class="goal-text">每日目标</span>
          <span class="goal-count" class:goal-done={store.dailyStats.today.reviewed >= dailyGoal}>
            {Math.min(store.dailyStats.today.reviewed, dailyGoal)}/{dailyGoal}
          </span>
        </div>
        <div class="goal-bar-track">
          <div class="goal-bar-fill" style="transform: scaleX({Math.min(1, store.dailyStats.today.reviewed / dailyGoal)})"></div>
        </div>
      </button>
    {:else}
      <button class="goal-card goal-card-empty" onclick={openGoalDialog}>
        <div class="goal-row">
          <span class="goal-icon">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </span>
          <span class="goal-text">设置每日目标</span>
          <span class="goal-hint">+</span>
        </div>
      </button>
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
        <button class="due-card" onclick={startDueReview}>
          <div class="due-icon">
            <svg aria-hidden="true"
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
            <svg aria-hidden="true"
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
        <button class="due-alt-link" onclick={() => onNavigate("wrong")}>在错题本中查看</button>
      {:else}
        <div class="all-clear">
          <svg aria-hidden="true"
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

      {#if lastSession}
        <button class="last-session-card" onclick={async () => {
          const wrongIds = lastSession.results.filter(r => r.status === "wrong" || r.status === "timeout").map(r => r.id);
          if (wrongIds.length > 0) {
            await store.startQuiz(store.questions.filter(q => wrongIds.includes(q.id)));
            onNavigate("quiz", { questionId: wrongIds[0] });
          }
        }}>
          <div class="ls-header">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
              stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" /></svg>
            <span class="ls-label">上次练习</span>
            <span class="ls-time">{timeAgo(lastSession.completedAt)}</span>
          </div>
          <div class="ls-stats">
            <span class="ls-stat">
              <span class="ls-stat-num correct">{lastSession.correct}</span>
              <span class="ls-stat-lbl">正确</span>
            </span>
            <span class="ls-stat">
              <span class="ls-stat-num wrong">{lastSession.wrong}</span>
              <span class="ls-stat-lbl">错误</span>
            </span>
            <span class="ls-stat">
              <span class="ls-stat-num">{lastSession.total}</span>
              <span class="ls-stat-lbl">总计</span>
            </span>
            <span class="ls-stat">
              <span class="ls-stat-num pct" class:pass={lastSession.pct >= 70}>{lastSession.pct}%</span>
              <span class="ls-stat-lbl">正确率</span>
            </span>
          </div>
          {#if lastSession.wrong > 0}
            <div class="ls-wrong-hint">点击复习 {lastSession.wrong} 道错题 →</div>
          {/if}
        </button>
      {/if}
      <button class="review-entry-btn" onclick={() => onNavigate("review-session")}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        间隔复习
        {#if store.dailyStats?.streak > 0}
          <span class="review-streak-badge"><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg> {store.dailyStats.streak} 天</span>
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
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
          <svg aria-hidden="true"
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

      <button class="random-btn" onclick={() => {
        const q = api.questions.random();
        if (q) onNavigate("quiz", { questionId: q.id });
      }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" /></svg>
        随机一题
      </button>

      <button class="qr-entry-btn" onclick={openQuickReview}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" /></svg>
        速记模式
      </button>

      <button class="mi-entry-btn" onclick={() => (showMIDialog = true)}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
        模拟面试
      </button>
    {/if}
  </div>
</div>

<!-- ── Resume Dialog ── -->
{#if showResumeDialog}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="overlay" onclick={() => (showResumeDialog = false)} onkeydown={(e) => handleOverlayKeydown(e, () => showResumeDialog = false)}>
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
  <div class="overlay" onclick={() => (showQRDialog = false)} onkeydown={(e) => handleOverlayKeydown(e, () => showQRDialog = false)}>
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

      <label for="qr-type">题型</label>
      <select id="qr-type" bind:value={qrType}>
        <option value="">全部</option>
        <option value="short_answer">问答题</option>
        <option value="choice">选择题</option>
        <option value="multiple_choice">多选题</option>
        <option value="true_false">判断题</option>
        <option value="coding">编程题</option>
        <option value="fill_in_blank">填空题</option>
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

<!-- ── Mock Interview Dialog ── -->
{#if showMIDialog}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="overlay" onclick={() => (showMIDialog = false)} onkeydown={(e) => handleOverlayKeydown(e, () => showMIDialog = false)}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => handleOverlayKeydown(e, () => showMIDialog = false)}>
      <div class="dialog-title">模拟面试</div>
      <div class="dialog-desc">在限定时间内完成题目，考验真实面试水平</div>

      <label for="mi-cat">分类</label>
      <select id="mi-cat" bind:value={miCategory}>
        {#each categories as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>

      <label for="mi-diff">难度</label>
      <select id="mi-diff" bind:value={miDifficulty}>
        <option value="">全部</option>
        <option value="easy">简单</option>
        <option value="medium">中等</option>
        <option value="hard">困难</option>
      </select>

      <label for="mi-type">题型</label>
      <select id="mi-type" bind:value={miType}>
        <option value="">全部</option>
        <option value="short_answer">问答题</option>
        <option value="choice">选择题</option>
        <option value="multiple_choice">多选题</option>
        <option value="true_false">判断题</option>
        <option value="coding">编程题</option>
        <option value="fill_in_blank">填空题</option>
      </select>

      <label for="mi-tag">知识点</label>
      <select id="mi-tag" bind:value={miTag}>
        <option value="">全部</option>
        {#each allTags as tag}
          <option value={tag}>{tag}</option>
        {/each}
      </select>

      <span class="dialog-label">题量</span>
      <div class="count-options">
        <button class="count-btn" class:active={miCount === 5} onclick={() => (miCount = 5)}>5</button>
        <button class="count-btn" class:active={miCount === 10} onclick={() => (miCount = 10)}>10</button>
        <button class="count-btn" class:active={miCount === 20} onclick={() => (miCount = 20)}>20</button>
        <button class="count-btn" class:active={miCount === 30} onclick={() => (miCount = 30)}>30</button>
      </div>

      <span class="dialog-label">每题限时</span>
      <div class="time-options">
        <button class="time-btn" class:active={miTimeLimit === 60} onclick={() => (miTimeLimit = 60)}>1分</button>
        <button class="time-btn" class:active={miTimeLimit === 120} onclick={() => (miTimeLimit = 120)}>2分</button>
        <button class="time-btn" class:active={miTimeLimit === 180} onclick={() => (miTimeLimit = 180)}>3分</button>
        <button class="time-btn" class:active={miTimeLimit === 300} onclick={() => (miTimeLimit = 300)}>5分</button>
      </div>

      <div class="dialog-actions">
        <button class="dialog-btn cancel" onclick={() => (showMIDialog = false)}>取消</button>
        <button class="dialog-btn primary" onclick={startMockInterview}>开始模拟</button>
      </div>
    </div>
  </div>
{/if}

<!-- ── Goal Dialog ── -->
{#if showGoalDialog}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="overlay" onclick={() => (showGoalDialog = false)} onkeydown={(e) => handleOverlayKeydown(e, () => showGoalDialog = false)}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => handleOverlayKeydown(e, () => showGoalDialog = false)}>
      <div class="dialog-title">每日目标</div>
      <div class="dialog-desc">设置每天计划复习的题数（0 关闭目标）</div>
      <input class="goal-input" type="number" min="0" max="200" bind:value={goalInput} onkeydown={(e) => { if (e.key === "Enter") saveGoal(); }}>
      <div class="dialog-actions">
        <button class="dialog-btn cancel" onclick={() => (showGoalDialog = false)}>取消</button>
        <button class="dialog-btn primary" onclick={saveGoal}>保存</button>
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
    cursor: pointer;
    transition: all 0.2s var(--spring);
    text-align: left;
    font-family: inherit;
    width: 100%;
  }
  .goal-card:active {
    transform: scale(0.98);
  }
  .goal-card-empty .goal-hint {
    font-size: 16px;
    font-weight: 700;
    color: var(--accent);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .due-alt-link {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-dim);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 0 0;
    font-family: inherit;
    transition: color 0.2s;
  }
  .due-alt-link:active {
    color: var(--accent);
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

/* ── Random Button ── */
.random-btn {
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
.random-btn:active {
  transform: scale(0.97);
  background: var(--accent-bg);
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

.mi-entry-btn {
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
  color: var(--danger);
  border: 1px solid var(--danger);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s var(--spring);
  margin-top: 8px;
}
.mi-entry-btn:active {
  transform: scale(0.97);
  background: var(--danger-bg);
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

/* ── Last Session Card ── */
.last-session-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  text-align: left;
  width: 100%;
  color: var(--text);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all 0.3s var(--spring);
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}
.last-session-card:active {
  background: var(--bg-card-hover);
  border-color: rgba(108, 140, 255, 0.2);
  transform: scale(0.99);
}
.ls-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-dim);
}
.ls-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}
.ls-time {
  font-size: 11px;
  color: var(--text-muted);
}
.ls-stats {
  display: flex;
  gap: 12px;
}
.ls-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.ls-stat-num {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.ls-stat-num.correct { color: var(--success); }
.ls-stat-num.wrong { color: var(--danger); }
.ls-stat-num.pct { color: var(--text); }
.ls-stat-num.pct.pass { color: var(--success); }
.ls-stat-lbl {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.ls-wrong-hint {
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
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
  display: inline-flex;
  align-items: center;
  gap: 3px;
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
.dialog label,
.dialog-label {
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
.time-options {
  display: flex;
  gap: 8px;
}
.time-btn {
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
.time-btn:active {
  transform: scale(0.96);
}
.time-btn.active {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger, #e74c3c);
  border-color: var(--danger, #e74c3c);
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
