<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import ProgressRing from "../components/ProgressRing.svelte";

  onMount(async () => {
    // refreshStats must resolve before rendering overview content
    await store.refreshStats();
    try {
      wrongList = await api.progress.wrong();
    } catch (e) {
      // wrongList stays empty on error — weak sections gracefully show nothing
    }
  });

  const categoryNames = {
    java_basic: "Java 基础",
    java_advanced: "Java 进阶",
    ai: "AI",
    agent: "Agent",
    algorithm: "算法",
    system_design: "系统设计",
    frontend: "前端",
    cs_basics: "计算机基础",
    database: "数据库",
    linux: "Linux",
    devops: "DevOps",
    react: "React",
    project_mgmt: "项目管理",
    product: "产品思维",
  };

  let wrongList = $state([]);

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
        name: categoryNames[cat] || cat,
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
    </div>

    <div class="overall-progress">
      <ProgressRing
        percentage={stats.total > 0 ? (stats.done / stats.total) * 100 : 0}
        size={100}
      />
    </div>

    <h2 class="section-title">各领域进度</h2>
    <div class="category-list">
      {#each Object.entries(stats.by_category) as [cat, data]}
        <div class="category-item">
          <div class="cat-header">
            <span class="cat-name">{categoryNames[cat] || cat}</span>
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
</style>
