<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";

  let { onNavigate } = $props();

  let points = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let searchQuery = $state("");

  let filtered = $derived(
    points.filter(
      (p) =>
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  onMount(async () => {
    await loadPoints();
  });

  async function loadPoints() {
    loading = true;
    error = null;
    try {
      points = await api.knowledge.list();
    } catch (e) {
      error = e.message ?? "加载知识点失败";
    } finally {
      loading = false;
    }
  }

  function getMasteryColor(mastery) {
    if (mastery >= 80) return "var(--success)";
    if (mastery >= 40) return "var(--warning)";
    if (mastery > 0) return "var(--danger)";
    return "var(--text-dim)";
  }

  function getMasteryLabel(mastery) {
    if (mastery >= 80) return "已掌握";
    if (mastery >= 40) return "学习中";
    if (mastery > 0) return "需加强";
    return "未学习";
  }

  function goToDetail(tag) {
    onNavigate("knowledge-detail", { tag });
  }
</script>

<div class="page kp-page">
  <div class="page-header">
    <h1 class="page-title">知识点</h1>
    <p class="page-sub">共 {points.length} 个知识点，按领域分类</p>
  </div>

  <div class="search-wrap">
    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      class="search"
      placeholder="搜索知识点或领域..."
      bind:value={searchQuery}
    />
  </div>

  {#if error}
    <ErrorAlert message={error} onRetry={loadPoints} />
  {:else if loading}
    <div class="skeleton-grid">
      {#each Array(6) as _}
        <div class="skeleton-card" style="height: 100px"></div>
      {/each}
    </div>
  {:else if filtered.length === 0}
    <p class="empty">暂无匹配的领域</p>
  {:else}
    <div class="cat-list">
      {#each filtered as cat}
        <div class="cat-card card" class:expanded={expandedCategory === cat.id}>
          <button class="cat-header" onclick={() => toggleCategory(cat.id)}>
            <div class="cat-header-left">
              <span class="cat-label">{cat.label}</span>
              <span class="cat-stats">{cat.totalQuestions} 题</span>
            </div>
            <div class="cat-header-right">
              <span class="mastery-badge" style="color: {getMasteryColor(Math.round(cat.totalMastery / cat.children.length))}">
                掌握 {Math.round(cat.totalMastery / cat.children.length)}%
              </span>
              <svg class="cat-arrow" class:rotated={expandedCategory === cat.id} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>
          {#if expandedCategory === cat.id}
            <div class="cat-children">
              {#each cat.children as kp}
                <button class="child-item" onclick={() => goToDetail(kp.name)}>
                  <span class="child-name">{kp.name}</span>
                  <span class="child-count">{kp.count || kp.question_count} 题</span>
                  <div class="child-mastery">
                    <div class="mastery-bar-bg">
                      <div class="mastery-bar-fill" style="width: {kp.mastery}%; background: {getMasteryColor(kp.mastery)}"></div>
                    </div>
                    <span class="mastery-label" style="color: {getMasteryColor(kp.mastery)}; font-size: 11px;">
                      {kp.mastery}%
                    </span>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .kp-page { display: flex; flex-direction: column; gap: 14px; }
  .page-header { margin-bottom: 4px; }
  .page-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

  .search-wrap { position: relative; display: flex; align-items: center; }
  .search-icon { position: absolute; left: 12px; color: var(--text-dim); pointer-events: none; }
  .search { padding-left: 36px; }

  .empty { text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 14px; }

  /* Category list (hierarchical) */
  .cat-list { display: flex; flex-direction: column; gap: 8px; }
  .cat-card { padding: 0; overflow: hidden; }
  .cat-header {
    display: flex; justify-content: space-between; align-items: center;
    width: 100%; padding: 14px 16px; cursor: pointer; text-align: left;
    background: none; border: none; color: var(--text); gap: 12px;
    transition: background 0.15s;
  }
  .cat-header:hover { background: var(--bg-surface); }
  .cat-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .cat-label { font-size: 15px; font-weight: 700; color: var(--text); }
  .cat-stats { font-size: 12px; color: var(--text-muted); white-space: nowrap; background: var(--border); padding: 2px 10px; border-radius: 10px; }
  .cat-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .mastery-badge { font-size: 12px; font-weight: 600; white-space: nowrap; }
  .cat-arrow { transition: transform 0.2s; color: var(--text-dim); }
  .cat-arrow.rotated { transform: rotate(90deg); }

  .cat-children { border-top: 1px solid var(--border); padding: 8px 16px 12px; display: flex; flex-direction: column; gap: 2px; }
  .child-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 10px 8px; cursor: pointer; text-align: left;
    background: none; border: none; border-radius: 6px; color: var(--text);
    transition: background 0.12s;
  }
  .child-item:hover { background: var(--bg-surface); }
  .child-name { font-size: 14px; font-weight: 500; flex: 1; min-width: 0; }
  .child-count { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
  .child-mastery { display: flex; align-items: center; gap: 6px; width: 100px; flex-shrink: 0; }

  .mastery-bar-bg { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .mastery-bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
  .mastery-label { font-size: 10px; font-weight: 600; white-space: nowrap; }

  .skeleton-grid { display: flex; flex-direction: column; gap: 10px; }
  .skeleton-card { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); animation: pulse 1.5s ease infinite; }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.25; }
  }
</style>
