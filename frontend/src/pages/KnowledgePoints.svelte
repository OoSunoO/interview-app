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
    <p class="page-sub">基于 tags 提取的知识体系，共 {points.length} 个知识点</p>
  </div>

  <div class="search-wrap">
    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      class="search"
      placeholder="搜索知识点..."
      bind:value={searchQuery}
    />
  </div>

  {#if error}
    <ErrorAlert message={error} onRetry={loadPoints} />
  {:else if loading}
    <div class="skeleton-grid">
      {#each Array(6) as _}
        <div class="skeleton-card" style="height: 120px"></div>
      {/each}
    </div>
  {:else if filtered.length === 0}
    <p class="empty">暂无匹配的知识点</p>
  {:else}
    <div class="kp-grid">
      {#each filtered as kp}
        <button class="card kp-card" onclick={() => goToDetail(kp.name)}>
          <div class="kp-top">
            <span class="kp-name">{kp.name}</span>
            <span class="kp-count">{kp.question_count} 题</span>
          </div>
          {#if kp.categories.length > 0}
            <div class="kp-cats">
              {#each kp.categories.slice(0, 3) as cat}
                <span class="mini-tag">{cat}</span>
              {/each}
            </div>
          {/if}
          <div class="kp-mastery">
            <div class="mastery-bar-bg">
              <div
                class="mastery-bar-fill"
                style="width: {kp.mastery}%; background: {getMasteryColor(kp.mastery)}"
              ></div>
            </div>
            <span class="mastery-label" style="color: {getMasteryColor(kp.mastery)}">
              {getMasteryLabel(kp.mastery)}
              {kp.mastery}%
            </span>
          </div>
        </button>
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

  .kp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .kp-card {
    text-align: left;
    width: 100%;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s;
  }
  .kp-card:active { transform: scale(0.97); border-color: var(--accent); }
  .kp-top { display: flex; justify-content: space-between; align-items: center; }
  .kp-name { font-size: 14px; font-weight: 600; line-height: 1.3; color: var(--text); }
  .kp-count { font-size: 11px; color: var(--text-muted); white-space: nowrap; background: var(--border); padding: 2px 8px; border-radius: 8px; }
  .kp-cats { display: flex; gap: 4px; flex-wrap: wrap; }
  .mini-tag { font-size: 10px; padding: 1px 6px; border-radius: 3px; background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border); }

  .kp-mastery { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
  .mastery-bar-bg { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .mastery-bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
  .mastery-label { font-size: 10px; font-weight: 600; white-space: nowrap; }

  .skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .skeleton-card { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); animation: pulse 1.5s ease infinite; }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.25; }
  }

  @media (max-width: 380px) {
    .kp-grid { grid-template-columns: 1fr; }
  }
</style>
