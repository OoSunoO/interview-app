<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import { categoryLabel } from "../lib/categories.js";
  import ProgressRing from "../components/ProgressRing.svelte";
  import CalendarHeatmap from "../components/CalendarHeatmap.svelte";

  let { onNavigate } = $props();

  let goalInput = $state(api.progress.getGoal());
  let goalSaved = $state(false);

  function saveGoal() {
    api.progress.setGoal(goalInput);
    goalSaved = true;
    setTimeout(() => goalSaved = false, 2000);
  }

  function exportProgress() {
    const data = {
      progress: JSON.parse(localStorage.getItem("quiz_progress") || "{}"),
      sessions: JSON.parse(localStorage.getItem("quiz_review_sessions") || "[]"),
      dailyStats: JSON.parse(localStorage.getItem("quiz_daily_stats") || "{}"),
      goal: localStorage.getItem("quiz_daily_goal") || "0",
      exportedAt: new Date().toISOString(),
      appVersion: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0",
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
    } catch (e) {
      // wrongList stays empty on error — weak sections gracefully show nothing
    }
  });

  let wrongList = $state([]);
  let dailyStats = $state(null);
  let weeklyData = $state([]);
  let allDaily = $state(null);
  let history = $state([]);

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
</script>

<div class="page stats-page">
  <h1 class="page-title" data-testid="page-title">学习进度</h1>

  {#if !stats}
    <p class="loading">加载中...</p>
  {:else}
    <div class="overview" data-testid="stats-overview">
      <div class="overview-item">
        <span class="num">{stats.total}</span>
        <span class="label">总题</span>
      </div>
      <div class="overview-item">
        <span class="num accent">{stats.done}</span>
        <span class="label">已掌握</span>
      </div>
      <div class="overview-item">
        <span class="num danger">{stats.wrong}</span>
        <span class="label">待复习</span>
      </div>
      {#if stats.bookmarked > 0}
        <div class="overview-item">
          <span class="num" style="color:var(--warning)">{stats.bookmarked}</span>
          <span class="label">已收藏</span>
        </div>
      {/if}
    </div>

    <div class="overall-progress">
      <ProgressRing
        percentage={stats.total > 0 ? (stats.done / stats.total) * 100 : 0}
        size={100}
      />
    </div>

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
              <div
                class="diff-bar done"
                style="transform: scaleX({d.total > 0 ? d.done / d.total : 0})"
              ></div>
              {#if d.wrong > 0}
                <div
                  class="diff-bar wrong"
                  style="transform: scaleX({d.wrong / d.total}); transform-origin: left;"
                ></div>
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

    {#if dailyStats}
      <div class="daily-section">
        <div class="daily-item">
          <span class="daily-num">{dailyStats.today.reviewed}</span>
          <span class="daily-lbl">今日复习</span>
        </div>
        <div class="daily-item">
          <span class="daily-num">{dailyStats.retention}%</span>
          <span class="daily-lbl">掌握率</span>
        </div>
        <div class="daily-item">
          <span class="daily-num fire">{dailyStats.streak}</span>
          <span class="daily-lbl">连续天数</span>
        </div>
        <div class="daily-item goal-item">
          <div class="goal-top">
            <span class="daily-num" class:goal-met={dailyStats.today.reviewed >= goalInput}>{dailyStats.today.reviewed}</span>
            {#if goalInput > 0}
              <span class="goal-target">/ {goalInput}</span>
            {/if}
          </div>
          <div class="goal-lbl-row">
            <span class="daily-lbl">每日目标</span>
            <button class="goal-edit-btn" onclick={() => { const n = prompt('设置每日复习目标（题数）:', goalInput || ''); if (n !== null) { goalInput = Math.max(0, Math.min(200, parseInt(n) || 0)); saveGoal(); } }} aria-label="设置目标">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
            </button>
          </div>
          {#if goalInput > 0}
            <div class="goal-progress-track">
              <div class="goal-progress-fill" style="transform: scaleX({Math.min(1, dailyStats.today.reviewed / goalInput)})"></div>
            </div>
          {/if}
        </div>
      </div>

      {#if trendData.length > 0}
        <h2 class="section-title">近 30 天掌握率趋势</h2>
        <div class="trend-chart-wrap">
          {#if trendLayout}
            {@const { w, h, padL, padR, padT, padB, chartW, chartH, step, points, gridY } = trendLayout}
            <svg viewBox="0 0 {w} {h}" class="trend-chart">
              <!-- Grid lines -->
              {#each gridY as pct}
                <line x1={padL} y1={padT + chartH - (pct / 100) * chartH} x2={w - padR} y2={padT + chartH - (pct / 100) * chartH} stroke="currentColor" stroke-opacity="0.08" stroke-width="1" />
                <text x={padL - 4} y={padT + chartH - (pct / 100) * chartH + 3} text-anchor="end" fill="currentColor" fill-opacity="0.4" font-size="8">{pct}%</text>
              {/each}
              <!-- Area fill -->
              <path d="M{points} L{padL + (trendData.length - 1) * step},{padT + chartH} L{padL},{padT + chartH}Z" fill="var(--accent)" fill-opacity="0.1" />
              <!-- Line -->
              <polyline points={points} fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <!-- Dots -->
              {#each trendData as d, i}
                <circle cx={padL + i * step} cy={padT + chartH - (d.retention / 100) * chartH} r="2.5" fill="var(--accent)" />
              {/each}
              <!-- X labels (first, last, and one mid) -->
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
            <div
              class="progress-fill"
              style="transform: scaleX({data.total > 0 ? data.done / data.total : 0})"
            ></div>
          </div>
        </div>
      {/each}
    </div>

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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              {:else if s.result === "reviewing"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              {:else}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              {/if}
            </span>
            <span class="history-title">{s.title}</span>
            <span class="history-meta">
              {#if s.category}{categoryLabel(s.category)}{/if}
              {#if s.difficulty}<span class="tag diff {s.difficulty}" style="margin-left:4px">{s.difficulty}</span>{/if}
            </span>
            <span class="history-time">
              {new Date(s.reviewed_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        {/each}
      </div>
    {/if}

    <div class="export-section">
      <button class="export-progress-btn" onclick={exportProgress}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        导出进度备份
      </button>
    </div>
  {/if}
</div>

<style>
  .stats-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .loading {
    text-align: center;
    color: var(--text-muted);
    padding: 40px 0;
  }
  .overview {
    display: flex;
    gap: 12px;
  }
  .overview-item {
    flex: 1;
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 16px;
    text-align: center;
  }
  .overview-item .num {
    display: block;
    font-size: 28px;
    font-weight: 700;
  }
  .overview-item .num.accent {
    color: var(--accent);
  }
  .overview-item .num.danger {
    color: var(--danger);
  }
  .overview-item .label {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
  .overall-progress {
    display: flex;
    justify-content: center;
    padding: 8px 0;
  }

  .daily-section {
    display: flex;
    gap: 8px;
  }
  .daily-item {
    flex: 1;
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 14px;
    text-align: center;
  }
  .daily-num {
    display: block;
    font-size: 22px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--text);
  }
  .daily-num.fire {
    color: var(--warning);
  }
  .daily-num.goal-met {
    color: var(--success);
  }
  .goal-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .goal-top {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 2px;
  }
  .goal-target {
    font-size: 14px;
    color: var(--text-muted);
    font-weight: 600;
  }
  .goal-lbl-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .goal-edit-btn {
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: var(--text-dim);
    display: inline-flex;
    align-items: center;
    border-radius: 3px;
    transition: all 0.2s;
  }
  .goal-edit-btn:hover {
    color: var(--accent);
    background: var(--bg-surface);
  }
  .goal-progress-track {
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 4px;
  }
  .goal-progress-fill {
    height: 100%;
    background: var(--success);
    border-radius: 2px;
    transform-origin: left;
    transition: transform 0.5s;
  }
  .daily-lbl {
    display: block;
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }
  .category-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .category-item {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 14px;
  }
  .cat-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .cat-stat {
    color: var(--text-muted);
  }
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

  /* ── Difficulty Distribution ── */
  .diff-dist {
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    font-size: 14px;
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
    font-size: 13px;
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
  .diff-pct {
    color: var(--text-muted);
  }
  .diff-wrong {
    color: var(--danger);
  }
  .weak-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .weak-item {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 14px;
  }
  .weak-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .weak-stat {
    color: var(--danger);
    font-size: 12px;
  }
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
  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .weak-tag {
    background: #2d0a0a;
    color: #fca5a5;
    padding: 4px 10px;
    border-radius: 12px;
    border: 1px solid #7f1d1d;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .weak-tag[role="button"] {
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .weak-tag[role="button"]:hover {
    box-shadow: 0 0 8px rgba(252, 165, 165, 0.2);
  }
  .weak-tag[role="button"]:active {
    transform: scale(0.92);
  }
  .category-item.clickable,
  .weak-item.clickable {
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .category-item.clickable:hover,
  .weak-item.clickable:hover {
    box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  }
  .category-item.clickable:active,
  .weak-item.clickable:active {
    transform: scale(0.99);
  }
  .tag-count {
    background: #7f1d1d;
    color: #fca5a5;
    border-radius: 8px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 600;
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
    transition: height 0.5s var(--spring);
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
    font-variant-numeric: tabular-nums;
  }

  /* ── Retention Trend ── */
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

  /* ── Export Progress ── */
  .export-section {
    display: flex;
    justify-content: center;
  }
  .export-progress-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .export-progress-btn:active {
    transform: scale(0.96);
    color: var(--accent);
    border-color: var(--accent-dim);
  }

  /* ── Review History ── */
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
    transition: background 0.2s;
  }
  .history-item:hover {
    background: var(--bg-surface);
  }
  .history-result {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }
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
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    min-width: 36px;
    text-align: right;
  }

  /* ── Mobile ── */
  @media (max-width: 480px) {
    .overview {
      gap: 8px;
    }
    .overview-item {
      padding: 12px 8px;
    }
    .overview-item .num {
      font-size: 22px;
    }
  }
</style>
