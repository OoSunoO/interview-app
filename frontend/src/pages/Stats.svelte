<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.svelte.js";
  import ProgressRing from "../components/ProgressRing.svelte";

  onMount(() => store.refreshStats());

  const categoryNames = {
    java_basic: "Java 基础", java_advanced: "Java 进阶", ai: "AI",
    agent: "Agent", algorithm: "算法", system_design: "系统设计", frontend: "前端",
  };

  let stats = $derived(store.stats);
</script>

<div class="page stats-page">
  <h1 class="page-title">学习进度</h1>

  {#if !stats}
    <p class="loading">加载中...</p>
  {:else}
    <div class="overview">
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
      <ProgressRing percentage={stats.total > 0 ? (stats.done / stats.total) * 100 : 0} size={100} />
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
            <div class="progress-fill" style="width: {data.total > 0 ? (data.done / data.total) * 100 : 0}%"></div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .stats-page { display: flex; flex-direction: column; gap: 20px; }
  .page-title { font-size: 22px; font-weight: 700; }
  .loading { text-align: center; color: var(--text-muted); padding: 40px 0; }
  .overview { display: flex; gap: 12px; }
  .overview-item { flex: 1; background: var(--bg-card); border-radius: var(--radius); padding: 16px; text-align: center; }
  .overview-item .num { display: block; font-size: 28px; font-weight: 700; }
  .overview-item .num.accent { color: var(--accent); }
  .overview-item .num.danger { color: var(--danger); }
  .overview-item .label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
  .overall-progress { display: flex; justify-content: center; padding: 8px 0; }
  .section-title { font-size: 16px; font-weight: 600; }
  .category-list { display: flex; flex-direction: column; gap: 12px; }
  .category-item { background: var(--bg-card); border-radius: var(--radius); padding: 14px; }
  .cat-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
  .cat-stat { color: var(--text-muted); }
  .progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.5s; }
</style>
