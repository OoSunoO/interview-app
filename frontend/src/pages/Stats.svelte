<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import { categoryLabel } from "../lib/categories.js";
  import { toast } from "../lib/toast.js";
  import { version as appVersion } from "../../package.json";
  import ProgressRing from "../components/ProgressRing.svelte";
  import CalendarHeatmap from "../components/CalendarHeatmap.svelte";

  let { onNavigate } = $props();

  let goalInput = $state(api.progress.getGoal());

  function saveGoal() {
    api.progress.setGoal(goalInput);
    toast.success(`每日目标已设为 ${goalInput} 题`);
  }

  function exportProgress() {
    const data = {
      progress: JSON.parse(localStorage.getItem("quiz_progress") || "{}"),
      sessions: JSON.parse(localStorage.getItem("quiz_review_sessions") || "[]"),
      dailyStats: JSON.parse(localStorage.getItem("quiz_daily_stats") || "{}"),
      goal: localStorage.getItem("quiz_daily_goal") || "0",
      exportedAt: new Date().toISOString(),
      appVersion,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `面试题-进度备份-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("进度已导出");
  }

  let importPreview = $state(null);
  let importRaw = $state(null);
  let showImportDialog = $state(false);
  let importError = $state("");

  function triggerImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.progress && !data.sessions && !data.dailyStats) {
            importError = "无效的备份文件：缺少进度数据";
            showImportDialog = true;
            return;
          }
          const pCount = Object.keys(data.progress || {}).length;
          const sCount = (data.sessions || []).length;
          const dCount = Object.keys(data.dailyStats || {}).length;
          importRaw = data;
          importPreview = { pCount, sCount, dCount, goal: data.goal || "0", date: data.exportedAt || "未知" };
          importError = "";
          showImportDialog = true;
        } catch {
          importError = "无法解析文件，请确认选择了正确的备份文件";
          showImportDialog = true;
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function confirmImport() {
    if (!importRaw) return;
    if (importRaw.progress) localStorage.setItem("quiz_progress", JSON.stringify(importRaw.progress));
    if (importRaw.sessions) localStorage.setItem("quiz_review_sessions", JSON.stringify(importRaw.sessions));
    if (importRaw.dailyStats) localStorage.setItem("quiz_daily_stats", JSON.stringify(importRaw.dailyStats));
    if (importRaw.goal) localStorage.setItem("quiz_daily_goal", String(importRaw.goal));
    showImportDialog = false;
    importRaw = null;
    toast.success("进度已导入，页面即将刷新");
    setTimeout(() => window.location.reload(), 800);
  }

  onMount(async () => {
    // refreshStats must resolve before rendering overview content
    await store.refreshStats();
    try {
      dailyStats = await api.progress.dailyStats();
      weeklyData = await api.progress.weeklyActivity();
      wrongList = await api.progress.wrong();
      allDaily = await api.progress.allDailyStats();
      history = await api.progress.reviewHistory(30);
      qrHistory = api.quickReview.getHistory();
      miHistory = api.mockInterview.getHistory();
    } catch (e) {
      // wrongList stays empty on error — weak sections gracefully show nothing
    }
  });

  let wrongList = $state([]);
  let dailyStats = $state(null);
  let weeklyData = $state([]);
  let allDaily = $state(null);
  let history = $state([]);
  let qrHistory = $state([]);
  let miHistory = $state([]);

  let trendLayout = $derived.by(() => {
    if (!trendData || trendData.length < 2) return null;
    const w = 340, h = 120, padL = 30, padR = 8, padT = 8, padB = 20;
    const chartW = w - padL - padR, chartH = h - padT - padB;
    const step = chartW / Math.max(trendData.length - 1, 1);
    const points = trendData.map((d, i) => `${padL + i * step},${padT + chartH - (d.retention / 100) * chartH}`).join(' ');
    return { w, h, padL, padR, padT, padB, chartW, chartH, step, points, gridY: [0, 25, 50, 75, 100] };
  });

  let trendData = $derived.by(() => {
    if (!allDaily) return [];
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const day = allDaily[key];
      if (day && day.reviewed > 0) {
        days.push({
          date: key,
          label: `${d.getMonth() + 1}/${d.getDate()}`,
          retention: Math.round((day.remembered / day.reviewed) * 100),
          reviewed: day.reviewed,
        });
      }
    }
    return days;
  });

  let stats = $derived(store.stats);

  function goCategory(cat) {
    store.filters.category = cat;
    store.loadQuestions({ page: 1 });
    onNavigate("browse");
  }

  function goTag(tag) {
    onNavigate("knowledge-detail", { tag });
  }

  function formatQRDate(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }

  function formatDuration(seconds) {
    if (!seconds || seconds < 60) return "不到 1 分钟";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m} 分 ${s} 秒` : `${m} 分钟`;
  }

  function difficultyLabel(d) {
    return { easy: "简单", medium: "中等", hard: "困难" }[d] || d;
  }

  function typeLabel(t) {
    return { short_answer: "问答题", coding: "编程题", choice: "选择题", multiple_choice: "多选题", true_false: "判断题", fill_in_blank: "填空题" }[t] || t;
  }

  let weakTags = $derived.by(() => {
    const count = {};
    for (const q of wrongList) {
      for (const t of q.tags || []) {
        count[t] = (count[t] || 0) + 1;
      }
    }
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  });

  let weakCategories = $derived.by(() => {
    if (!stats) return [];
    const wrongByCat = {};
    for (const q of wrongList) {
      wrongByCat[q.category] = (wrongByCat[q.category] || 0) + 1;
    }
    return Object.entries(stats.by_category)
      .map(([cat, data]) => ({
        cat,
        name: categoryLabel(cat),
        total: data.total,
        done: data.done,
        wrong: wrongByCat[cat] || 0,
        ratio: data.total > 0 ? (wrongByCat[cat] || 0) / data.total : 0,
      }))
      .filter((c) => c.wrong > 0)
      .sort((a, b) => b.ratio - a.ratio);
  });

  let activeTab = $state(localStorage.getItem("stats_tab") || "stats");

  function switchTab(tab) {
    activeTab = tab;
    localStorage.setItem("stats_tab", tab);
  }

  const TABS = [
    { id: "stats", label: "统计" },
    { id: "records", label: "记录" },
    { id: "weak", label: "薄弱" },
  ];
</script>

<div class="page stats-page">
  <div class="stats-header">
    <h1 class="page-title" data-testid="page-title">学习进度</h1>
    <div class="header-toolbar">
      <button class="export-btn-sm" onclick={exportProgress} title="导出备份">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
      </button>
      <button class="import-btn-sm" onclick={triggerImport} title="导入备份">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
      </button>
    </div>
  </div>

  {#if !stats}
    <div class="skeleton" style="height:80px"></div>
    <div class="skeleton" style="height:120px;margin-top:14px"></div>
    <div class="skeleton" style="height:200px;margin-top:14px"></div>
  {:else}
    <!-- ── Merged Header: ProgressRing + Overview + Daily ── -->
    <div class="compact-header" data-testid="stats-overview">
      <div class="ch-left">
        <ProgressRing
          percentage={stats.total > 0 ? (stats.done / stats.total) * 100 : 0}
          size={72}
        />
      </div>
      <div class="ch-mid">
        <div class="ch-row ch-overview">
          <div class="ch-stat">
            <span class="ch-num">{stats.total}</span>
            <span class="ch-lbl">总题</span>
          </div>
          <div class="ch-stat">
            <span class="ch-num accent">{stats.done}</span>
            <span class="ch-lbl">已掌握</span>
          </div>
          <div class="ch-stat">
            <span class="ch-num danger">{stats.wrong}</span>
            <span class="ch-lbl">待复习</span>
          </div>
          {#if stats.bookmarked > 0}
            <div class="ch-stat">
              <span class="ch-num" style="color:var(--warning)">{stats.bookmarked}</span>
              <span class="ch-lbl">收藏</span>
            </div>
          {/if}
        </div>
        {#if dailyStats}
          <div class="ch-row ch-daily">
            <div class="ch-stat">
              <span class="ch-num-sm">{dailyStats.today.reviewed}</span>
              <span class="ch-lbl">今日</span>
            </div>
            <div class="ch-stat">
              <span class="ch-num-sm">{dailyStats.retention}%</span>
              <span class="ch-lbl">掌握率</span>
            </div>
            <div class="ch-stat">
              <span class="ch-num-sm fire">{dailyStats.streak}</span>
              <span class="ch-lbl">连续</span>
            </div>
            <div class="ch-stat ch-goal">
              <div class="ch-goal-row">
                <span class="ch-num-sm" class:goal-met={dailyStats.today.reviewed >= goalInput}>
                  {dailyStats.today.reviewed}
                </span>
                {#if goalInput > 0}
                  <span class="ch-goal-target">/{goalInput}</span>
                {/if}
                <button class="goal-edit-btn" onclick={() => { const n = prompt('设置每日目标:', goalInput || ''); if (n !== null) { goalInput = Math.max(0, Math.min(200, parseInt(n) || 0)); saveGoal(); } }} aria-label="设置目标">
                  <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                </button>
              </div>
              <span class="ch-lbl">目标</span>
              {#if goalInput > 0}
                <div class="ch-goal-bar"><div class="ch-goal-fill" style="transform: scaleX({Math.min(1, dailyStats.today.reviewed / goalInput)})"></div></div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- ── Tab Bar ── -->
    <div class="tab-bar">
      {#each TABS as tab}
        <button
          class="tab-btn"
          class:active={activeTab === tab.id}
          onclick={() => switchTab(tab.id)}
        >{tab.label}</button>
      {/each}
    </div>

    <!-- ── Tab: 统计 ── -->
    {#if activeTab === "stats"}
      {#if stats.by_difficulty}
        <h2 class="section-title">难度分布</h2>
        <div class="diff-dist">
          {#each Object.entries(stats.by_difficulty) as [diff, d]}
            <div class="diff-item">
              <div class="diff-header">
                <span class="diff-name">
                  <span class="diff-dot {diff}"></span>
                  { { easy: "简单", medium: "中等", hard: "困难" }[diff] || diff }
                </span>
                <span class="diff-stat">{d.done}/{d.total}</span>
              </div>
              <div class="diff-bar-track">
                <div class="diff-bar done" style="transform: scaleX({d.total > 0 ? d.done / d.total : 0})"></div>
                {#if d.wrong > 0}
                  <div class="diff-bar wrong" style="transform: scaleX({d.wrong / d.total}); transform-origin: left;"></div>
                {/if}
              </div>
              <div class="diff-sub">
                <span class="diff-pct">{Math.round((d.done / d.total) * 100) || 0}% 掌握</span>
                {#if d.wrong > 0}
                  <span class="diff-wrong">{d.wrong} 道答错</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if stats.by_type}
        <h2 class="section-title">题型分布</h2>
        <div class="type-dist">
          {#each Object.entries(stats.by_type) as [type, data]}
            {@const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0}
            <div class="type-item">
              <span class="type-tag {type}">{typeLabel(type)}</span>
              <span class="type-count">{data.done}/{data.total}</span>
              <div class="type-bar-bg"><div class="type-bar-fill" style="width:{pct}%"></div></div>
              <span class="type-pct">{pct}%</span>
            </div>
          {/each}
        </div>
      {/if}

      <h2 class="section-title">各领域进度</h2>
      <div class="category-list">
        {#each Object.entries(stats.by_category) as [cat, data]}
          <div class="category-item clickable" role="button" tabindex="0" onclick={() => goCategory(cat)} onkeydown={(e) => e.key === 'Enter' && goCategory(cat)}>
            <div class="cat-header">
              <span class="cat-name">{categoryLabel(cat)}</span>
              <span class="cat-stat">{data.done}/{data.total}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="transform: scaleX({data.total > 0 ? data.done / data.total : 0})"></div>
            </div>
          </div>
        {/each}
      </div>

    <!-- ── Tab: 记录 ── -->
    {:else if activeTab === "records"}
      {#if trendData.length > 0}
        <h2 class="section-title">近 30 天掌握率趋势</h2>
        <div class="trend-chart-wrap">
          {#if trendLayout}
            {@const { w, h, padL, padR, padT, padB, chartW, chartH, step, points, gridY } = trendLayout}
            <svg aria-hidden="true" viewBox="0 0 {w} {h}" class="trend-chart">
              {#each gridY as pct}
                <line x1={padL} y1={padT + chartH - (pct / 100) * chartH} x2={w - padR} y2={padT + chartH - (pct / 100) * chartH} stroke="currentColor" stroke-opacity="0.08" stroke-width="1" />
                <text x={padL - 4} y={padT + chartH - (pct / 100) * chartH + 3} text-anchor="end" fill="currentColor" fill-opacity="0.4" font-size="8">{pct}%</text>
              {/each}
              <path d="M{points} L{padL + (trendData.length - 1) * step},{padT + chartH} L{padL},{padT + chartH}Z" fill="var(--accent)" fill-opacity="0.1" />
              <polyline points={points} fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              {#each trendData as d, i}
                <circle cx={padL + i * step} cy={padT + chartH - (d.retention / 100) * chartH} r="2.5" fill="var(--accent)" />
              {/each}
              <text x={padL} y={h - 2} text-anchor="start" fill="currentColor" fill-opacity="0.4" font-size="8">{trendData[0].label}</text>
              {#if trendData.length > 2}
                <text x={padL + chartW / 2} y={h - 2} text-anchor="middle" fill="currentColor" fill-opacity="0.4" font-size="8">{trendData[Math.floor(trendData.length / 2)].label}</text>
              {/if}
              <text x={padL + (trendData.length - 1) * step} y={h - 2} text-anchor="end" fill="currentColor" fill-opacity="0.4" font-size="8">{trendData[trendData.length - 1].label}</text>
            </svg>
          {:else if trendData.length === 1}
            <div class="trend-single">今日掌握率：{trendData[0].retention}%（{trendData[0].reviewed} 题）</div>
          {/if}
        </div>
      {/if}

      {#if allDaily}
        <h2 class="section-title">年度活动</h2>
        <CalendarHeatmap data={allDaily} />
      {/if}

      {#if weeklyData.length > 0}
        <h2 class="section-title">近 7 天活动</h2>
        <div class="weekly-chart">
          {#each weeklyData as day}
            <div class="wc-col">
              <div class="wc-bars">
                {#if day.reviewed > 0}
                  <div class="wc-bar remembered" style="height: {(day.remembered / day.max) * 100}%"></div>
                  {#if day.hard > 0}
                    <div class="wc-bar hard" style="height: {(day.hard / day.max) * 100}%"></div>
                  {/if}
                  {#if day.forgot > 0}
                    <div class="wc-bar forgot" style="height: {(day.forgot / day.max) * 100}%"></div>
                  {/if}
                {:else}
                  <div class="wc-bar empty"></div>
                {/if}
              </div>
              <div class="wc-label">{day.label}</div>
              {#if day.reviewed > 0}
                <div class="wc-count">{day.reviewed}</div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      {#if history.length > 0}
        <h2 class="section-title">最近浏览记录</h2>
        <div class="history-list">
          {#each history as s, i}
            {#if i === 0 || history[i - 1].reviewed_at.slice(0, 10) !== s.reviewed_at.slice(0, 10)}
              <div class="history-date">
                {new Date(s.reviewed_at).toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })}
              </div>
            {/if}
            <div class="history-item result-{s.result || 'unknown'}">
              <span class="history-result">
                {#if s.result === "correct"}
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {:else if s.result === "reviewing"}
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                {:else}
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                {/if}
              </span>
              <span class="history-title">{s.title}</span>
              <span class="history-meta">
                {#if s.category}{categoryLabel(s.category)}{/if}
                {#if s.difficulty}<span class="tag diff {s.difficulty}" style="margin-left:4px">{s.difficulty}</span>{/if}
                {#if s.source === "quick_review"}
                  <span class="qr-badge">速记</span>
                {/if}
              </span>
              <span class="history-time">
                {new Date(s.reviewed_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          {/each}
        </div>
      {/if}

      {#if qrHistory.length > 0}
        {@const qrTotal = qrHistory.length}
        {@const qrReviewed = qrHistory.reduce((sum, s) => sum + s.total, 0)}
        {@const qrRemembered = qrHistory.reduce((sum, s) => sum + (s.remembered || 0), 0)}
        {@const qrRate = qrReviewed > 0 ? Math.round((qrRemembered / qrReviewed) * 100) : 0}
        <h2 class="section-title">速记记录</h2>
        <div class="qr-summary">
          <div class="qr-summary-item">
            <span class="qr-summary-num">{qrTotal}</span>
            <span class="qr-summary-label">总次数</span>
          </div>
          <div class="qr-summary-item">
            <span class="qr-summary-num">{qrReviewed}</span>
            <span class="qr-summary-label">复习题数</span>
          </div>
          <div class="qr-summary-item">
            <span class="qr-summary-num" class:qr-rate-good={qrRate >= 70} class:qr-rate-ok={qrRate >= 40 && qrRate < 70}>{qrRate}%</span>
            <span class="qr-summary-label">平均掌握率</span>
          </div>
        </div>
        <div class="qr-history-list">
          {#each qrHistory.slice(0, 20) as session}
            {@const mastered = session.remembered || 0}
            {@const consolidate = session.unsure || 0}
            {@const review = session.forgot || 0}
            <div class="qr-history-item">
              <span class="qr-history-date">{formatQRDate(session.date)}</span>
              <span class="qr-history-counts">
                <span class="qr-badge qr-mastered" title="已掌握">{mastered}</span>
                <span class="qr-count-sep">/</span>
                <span class="qr-badge qr-consolidate" title="待巩固">{consolidate}</span>
                <span class="qr-count-sep">/</span>
                <span class="qr-badge qr-review" title="需复习">{review}</span>
                <span class="qr-history-total">共 {session.total} 题</span>
              </span>
              <span class="qr-history-dur">{formatDuration(session.duration_seconds)}</span>
              <span class="qr-history-rate" class:qr-rate-good={(mastered / session.total) * 100 >= 70}>
                {Math.round((mastered / session.total) * 100)}%
              </span>
            </div>
          {/each}
        </div>
        <div class="qr-nav">
          <button class="qr-nav-btn" onclick={() => onNavigate("quick-review")}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            去速记
          </button>
        </div>
      {/if}

      {#if miHistory.length > 0}
        {@const miTotal = miHistory.length}
        {@const miQuestions = miHistory.reduce((sum, s) => sum + s.total, 0)}
        {@const miPassed = miHistory.filter(s => s.pct >= 70).length}
        {@const miRate = miTotal > 0 ? Math.round((miPassed / miTotal) * 100) : 0}
        <h2 class="section-title">模拟面试记录</h2>
        <div class="mi-summary">
          <div class="mi-summary-item">
            <span class="mi-summary-num">{miTotal}</span>
            <span class="mi-summary-label">总次数</span>
          </div>
          <div class="mi-summary-item">
            <span class="mi-summary-num">{miQuestions}</span>
            <span class="mi-summary-label">总题数</span>
          </div>
          <div class="mi-summary-item">
            <span class="mi-summary-num" class:mi-rate-good={miRate >= 70}>{miRate}%</span>
            <span class="mi-summary-label">通过率</span>
          </div>
        </div>
        <div class="mi-history-list">
          {#each miHistory.slice(0, 20) as session}
            <div class="mi-history-item">
              <span class="mi-history-date">{formatQRDate(session.date)}</span>
              <span class="mi-history-counts">
                <span class="mi-badge mi-pass" title="正确">{session.correct}</span>
                <span class="mi-count-sep">/</span>
                <span class="mi-badge mi-fail" title="错误">{session.wrong}</span>
                <span class="mi-history-total">共 {session.total} 题</span>
              </span>
              {#if session.category || session.difficulty || session.type}
                <span class="mi-history-filters">
                  {session.category ? categoryLabel(session.category) : ""}
                  {session.difficulty ? difficultyLabel(session.difficulty) : ""}
                  {session.type ? typeLabel(session.type) : ""}{session.tag ? ` · ${session.tag}` : ""}
                </span>
              {/if}
              <span class="mi-history-dur">{formatDuration(session.totalTime)}</span>
              <span class="mi-history-rate" class:mi-pass-rate={session.pct >= 70} class:mi-fail-rate={session.pct < 70}>
                {session.pct}%
              </span>
            </div>
          {/each}
        </div>
        <div class="mi-nav">
          <button class="mi-nav-btn" onclick={() => onNavigate("home")}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            模拟面试
          </button>
        </div>
      {/if}

    <!-- ── Tab: 薄弱 ── -->
    {:else if activeTab === "weak"}
      {#if weakCategories.length > 0}
        <h2 class="section-title">薄弱领域</h2>
        <div class="weak-list">
          {#each weakCategories as c}
            <div class="weak-item clickable" role="button" tabindex="0" onclick={() => goCategory(c.cat)} onkeydown={(e) => e.key === 'Enter' && goCategory(c.cat)}>
              <div class="weak-header">
                <span class="cat-name">{c.name}</span>
                <span class="weak-stat">{c.wrong} 道答错 / {c.total} 道</span>
              </div>
              <div class="weak-bar">
                <div class="weak-fill" style="transform: scaleX({c.ratio})"></div>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if weakTags.length > 0}
        <h2 class="section-title">薄弱知识点</h2>
        <div class="tag-cloud">
          {#each weakTags as [tag, count]}
            <span class="weak-tag" style="font-size: {Math.min(16, 12 + count * 2)}px" role="button" tabindex="0" onclick={() => goTag(tag)} onkeydown={(e) => e.key === 'Enter' && goTag(tag)}>
              {tag}
              <span class="tag-count">{count}</span>
            </span>
          {/each}
        </div>
      {:else}
        <p class="empty-weak">暂无薄弱知识点，继续保持！</p>
      {/if}
    {/if}
  {/if}

  {#if showImportDialog}
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="overlay" onclick={() => { showImportDialog = false; importRaw = null; }} onkeydown={(e) => { if (e.key === "Escape") { showImportDialog = false; importRaw = null; } }}>
      <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
      <div class="import-dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === "Escape") { showImportDialog = false; importRaw = null; } }}>
        {#if importError}
          <div class="import-error-icon">
            <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="var(--danger)" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          </div>
          <p class="import-error-text">{importError}</p>
          <button class="import-btn-primary" onclick={() => { showImportDialog = false; importRaw = null; }}>知道了</button>
        {:else if importPreview}
          <div class="import-success-icon">
            <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="var(--success)" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div class="import-dialog-title">导入进度备份</div>
          <div class="import-summary">
            <div class="import-summary-row">
              <span class="import-summary-lbl">备份时间</span>
              <span class="import-summary-val">{importPreview.date}</span>
            </div>
            <div class="import-summary-row">
              <span class="import-summary-lbl">题目进度</span>
              <span class="import-summary-val">{importPreview.pCount} 条</span>
            </div>
            <div class="import-summary-row">
              <span class="import-summary-lbl">练习记录</span>
              <span class="import-summary-val">{importPreview.sCount} 条</span>
            </div>
            <div class="import-summary-row">
              <span class="import-summary-lbl">每日统计</span>
              <span class="import-summary-val">{importPreview.dCount} 天</span>
            </div>
            <div class="import-summary-row">
              <span class="import-summary-lbl">每日目标</span>
              <span class="import-summary-val">{importPreview.goal} 题</span>
            </div>
          </div>
          <p class="import-warning">导入将覆盖全部本地进度数据，此操作不可撤销。</p>
          <div class="import-dialog-actions">
            <button class="import-btn-cancel" onclick={() => { showImportDialog = false; importRaw = null; }}>取消</button>
            <button class="import-btn-primary danger" onclick={confirmImport}>确认导入</button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .stats-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ── Header ── */
  .stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header-toolbar {
    display: flex;
    gap: 6px;
  }
  .header-toolbar button {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-dim);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .header-toolbar button:active {
    color: var(--accent);
    border-color: var(--accent-dim);
  }

  /* ── Compact Header: Ring + Stats + Daily ── */
  .compact-header {
    display: flex;
    gap: 16px;
    align-items: center;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }
  .ch-left {
    flex-shrink: 0;
  }
  .ch-mid {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }
  .ch-row {
    display: flex;
    gap: 8px;
  }
  .ch-stat {
    flex: 1;
    text-align: center;
    min-width: 0;
  }
  .ch-num {
    display: block;
    font-size: 22px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
  }
  .ch-num.accent { color: var(--accent); }
  .ch-num.danger { color: var(--danger); }
  .ch-num-sm {
    display: block;
    font-size: 18px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
  }
  .ch-num-sm.fire { color: var(--warning); }
  .ch-num-sm.goal-met { color: var(--success); }
  .ch-lbl {
    display: block;
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 2px;
    font-weight: 500;
  }
  .ch-goal-row {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 2px;
  }
  .ch-goal-target {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 600;
  }
  .ch-goal-bar {
    height: 2px;
    background: var(--border);
    border-radius: 1px;
    overflow: hidden;
    margin-top: 3px;
  }
  .ch-goal-fill {
    height: 100%;
    background: var(--success);
    border-radius: 1px;
    transform-origin: left;
    transition: transform 0.5s;
  }
  .goal-edit-btn {
    background: none;
    border: none;
    padding: 1px;
    cursor: pointer;
    color: var(--text-dim);
    display: inline-flex;
    align-items: center;
    border-radius: 3px;
    transition: all 0.2s;
  }
  .goal-edit-btn:active {
    color: var(--accent);
  }

  /* ── Tab Bar ── */
  .tab-bar {
    display: flex;
    gap: 2px;
    background: var(--bg-surface);
    border-radius: var(--radius-sm);
    padding: 3px;
  }
  .tab-btn {
    flex: 1;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    background: none;
    color: var(--text-muted);
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    text-align: center;
  }
  .tab-btn.active {
    background: var(--bg-card);
    color: var(--text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .tab-btn:active {
    transform: scale(0.97);
  }

  /* ── Section Title ── */
  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    margin: 0;
  }

  /* ── Difficulty Distribution ── */
  .diff-dist {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .diff-item {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 14px;
  }
  .diff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .diff-name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  .diff-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .diff-dot.easy { background: var(--success); }
  .diff-dot.medium { background: var(--warning); }
  .diff-dot.hard { background: var(--danger); }
  .diff-stat {
    color: var(--text-muted);
    font-size: 12px;
  }
  .diff-bar-track {
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    gap: 2px;
  }
  .diff-bar {
    height: 100%;
    border-radius: 4px;
    transform-origin: left;
    transition: transform 0.5s;
  }
  .diff-bar.done {
    background: var(--accent);
    flex: 1;
  }
  .diff-bar.wrong {
    background: var(--danger);
    min-width: 2px;
  }
  .diff-sub {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 11px;
  }
  .diff-pct { color: var(--text-muted); }
  .diff-wrong { color: var(--danger); }

  /* ── Type Distribution ── */
  .type-dist {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .type-item {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 6px 10px;
    font-size: 12px;
  }
  .type-tag {
    font-weight: 600;
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--bg-surface);
    color: var(--text-muted);
  }
  .type-count { color: var(--text-dim); white-space: nowrap; }
  .type-bar-bg {
    width: 40px;
    height: 4px;
    background: var(--bg-surface);
    border-radius: 2px;
    overflow: hidden;
  }
  .type-bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 0.3s;
  }
  .type-pct {
    font-weight: 600;
    color: var(--text-muted);
    min-width: 28px;
    text-align: right;
  }

  /* ── Category Progress ── */
  .category-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .category-item {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 12px 14px;
  }
  .cat-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .cat-stat { color: var(--text-muted); }
  .progress-bar {
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 3px;
    transform-origin: left;
    transition: transform 0.5s;
  }

  /* ── Clickable ── */
  .category-item.clickable,
  .weak-item.clickable {
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .category-item.clickable:active,
  .weak-item.clickable:active {
    transform: scale(0.99);
  }

  /* ── Weak List ── */
  .weak-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .weak-item {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 12px 14px;
  }
  .weak-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
  }
  .weak-stat { color: var(--danger); font-size: 12px; }
  .weak-bar {
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }
  .weak-fill {
    height: 100%;
    background: var(--danger);
    border-radius: 3px;
    transform-origin: left;
  }

  /* ── Tag Cloud ── */
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .weak-tag {
    background: var(--danger-bg);
    color: var(--danger);
    padding: 4px 10px;
    border-radius: 12px;
    border: 1px solid var(--danger-glow);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .weak-tag:active {
    transform: scale(0.92);
  }
  .tag-count {
    background: var(--danger-bg);
    color: var(--danger);
    border-radius: 8px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 600;
  }
  .empty-weak {
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    padding: 24px 0;
  }

  /* ── Weekly Chart ── */
  .weekly-chart {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    padding: 20px 0 4px;
    height: 120px;
  }
  .wc-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    height: 100%;
    justify-content: flex-end;
  }
  .wc-bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    flex: 1;
    width: 100%;
    justify-content: center;
  }
  .wc-bar {
    width: 100%;
    max-width: 20px;
    border-radius: 3px 3px 0 0;
    min-height: 4px;
    transition: height 0.5s;
  }
  .wc-bar.remembered { background: var(--success); }
  .wc-bar.hard { background: var(--warning); }
  .wc-bar.forgot { background: var(--danger); }
  .wc-bar.empty {
    background: var(--border);
    height: 4px !important;
    max-width: 12px;
  }
  .wc-label {
    font-size: 11px;
    color: var(--text-dim);
    font-weight: 500;
  }
  .wc-count {
    font-size: 10px;
    color: var(--text-muted);
    font-weight: 600;
  }

  /* ── Trend Chart ── */
  .trend-chart-wrap {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px;
    overflow: hidden;
  }
  .trend-chart {
    width: 100%;
    height: 120px;
    display: block;
  }
  .trend-single {
    text-align: center;
    font-size: 13px;
    color: var(--text-muted);
    padding: 12px;
  }

  /* ── History List ── */
  .history-list {
    display: flex;
    flex-direction: column;
  }
  .history-date {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-dim);
    padding: 10px 4px 4px;
    margin-top: 4px;
    border-top: 1px solid var(--border);
  }
  .history-date:first-child {
    border-top: none;
    margin-top: 0;
  }
  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    font-size: 13px;
  }
  .history-result { display: inline-flex; align-items: center; flex-shrink: 0; }
  .history-item.result-correct .history-result { color: var(--success); }
  .history-item.result-reviewing .history-result { color: var(--warning); }
  .history-item.result-wrong .history-result { color: var(--danger); }
  .history-item.result-unknown .history-result { color: var(--text-dim); }
  .history-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
  }
  .history-meta {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    font-size: 11px;
    color: var(--text-muted);
  }
  .history-time {
    font-size: 11px;
    color: var(--text-dim);
    flex-shrink: 0;
    min-width: 36px;
    text-align: right;
  }

  /* ── QR / MI History (shared) ── */
  .qr-summary, .mi-summary {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .qr-summary-item, .mi-summary-item {
    flex: 1;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    text-align: center;
  }
  .qr-summary-num, .mi-summary-num {
    display: block;
    font-size: 20px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .qr-summary-num.qr-rate-good { color: var(--success); }
  .qr-summary-num.qr-rate-ok { color: var(--warning); }
  .mi-summary-num { color: var(--accent); }
  .mi-summary-num.mi-rate-good { color: var(--success); }
  .qr-summary-label, .mi-summary-label {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }
  .qr-history-list, .mi-history-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
  }
  .qr-history-item, .mi-history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 12px;
  }
  .qr-history-date, .mi-history-date {
    color: var(--text-dim);
    font-size: 11px;
    min-width: 60px;
    white-space: nowrap;
  }
  .qr-history-counts, .mi-history-counts {
    display: flex;
    align-items: center;
    gap: 3px;
    flex: 1;
  }
  .qr-count-sep, .mi-count-sep { color: var(--text-dim); font-size: 10px; }
  .qr-history-total, .mi-history-total {
    color: var(--text-dim);
    font-size: 10px;
    margin-left: 4px;
  }
  .qr-history-rate, .mi-history-rate {
    font-weight: 700;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    min-width: 32px;
    text-align: right;
  }
  .qr-history-rate.qr-rate-good { color: var(--success); }
  .qr-badge, .mi-badge {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
    font-weight: 600;
  }
  .qr-history-dur, .mi-history-dur {
    color: var(--text-dim);
    font-size: 10px;
    white-space: nowrap;
  }
  .qr-nav, .mi-nav {
    display: flex;
    margin-bottom: 4px;
  }
  .qr-nav-btn, .mi-nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-pill);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .qr-nav-btn:active, .mi-nav-btn:active { transform: scale(0.96); }
  .qr-nav-btn { background: var(--accent); }
  .mi-nav-btn { background: var(--danger); }
  .mi-pass-rate { color: var(--success); }
  .mi-fail-rate { color: var(--danger); }
  .mi-history-filters {
    font-size: 10px;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
    flex-shrink: 0;
  }

  .history-meta .qr-badge {
    margin-left: 4px;
    background: var(--accent-bg);
    color: var(--accent);
  }

  /* ── Import Dialog ── */
  .import-dialog {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    width: 100%;
    max-width: 340px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    animation: scale-in 0.3s var(--spring) both;
  }
  .import-error-icon,
  .import-success-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
  }
  .import-error-text {
    font-size: 14px;
    color: var(--text);
    text-align: center;
    line-height: 1.5;
  }
  .import-dialog-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
  }
  .import-summary {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .import-summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
  }
  .import-summary-lbl { color: var(--text-muted); }
  .import-summary-val {
    color: var(--text);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .import-warning {
    font-size: 12px;
    color: var(--danger);
    text-align: center;
    line-height: 1.5;
  }
  .import-dialog-actions {
    display: flex;
    gap: 8px;
    width: 100%;
  }
  .import-btn-cancel {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.2s;
  }
  .import-btn-primary {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .import-btn-primary:active { opacity: 0.85; }
  .import-btn-primary.danger { background: var(--danger); }

  .skeleton { background: var(--bg-card); border-radius: var(--radius); animation: pulse 1.5s ease infinite; }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.25; }
  }
</style>
