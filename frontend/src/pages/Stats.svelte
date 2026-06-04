<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import { categoryLabel } from "../lib/categories.js";
  import ProgressRing from "../components/ProgressRing.svelte";
  import CalendarHeatmap from "../components/CalendarHeatmap.svelte";

  onMount(async () => {
    // refreshStats must resolve before rendering overview content
    await store.refreshStats();
    try {
      dailyStats = await api.progress.dailyStats();
      weeklyData = await api.progress.weeklyActivity();
      wrongList = await api.progress.wrong();
      allDaily = await api.progress.allDailyStats();
    } catch (e) {
      // wrongList stays empty on error — weak sections gracefully show nothing
    }
  });

  let wrongList = $state([]);
  let dailyStats = $state(null);
  let weeklyData = $state([]);
  let allDaily = $state(null);

  let stats = $derived(store.stats);

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
      </div>

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
        <div class="category-item">
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
          <div class="weak-item">
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
          <span class="weak-tag" style="font-size: {Math.min(16, 12 + count * 2)}px">
            {tag}
            <span class="tag-count">{count}</span>
          </span>
        {/each}
      </div>
    {/if}
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
