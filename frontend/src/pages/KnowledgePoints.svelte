<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";

  let { onNavigate } = $props();

  let points = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let searchQuery = $state("");
  let expandedCategory = $state(null);
  let expandedKp = $state(null);

  // Filter flat list by search
  let filtered = $derived(
    points.filter(
      (p) =>
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())),
    ),
  );

  // Group filtered points by first category into hierarchical structure
  let grouped = $derived.by(() => {
    const map = {};
    for (const p of filtered) {
      const cat = p.categories[0] || "其他";
      if (!map[cat]) {
        map[cat] = { id: cat, label: cat, totalQuestions: 0, totalMastery: 0, count: 0, children: [] };
      }
      map[cat].children.push({
        name: p.name,
        question_count: p.question_count,
        mastery: p.mastery,
        has_content: p.has_content,
      });
      map[cat].totalQuestions += p.question_count;
      map[cat].totalMastery += p.mastery;
      map[cat].count++;
    }
    return Object.values(map).sort((a, b) => b.totalQuestions - a.totalQuestions);
  });

  // Cache for knowledge detail content
  let detailCache = $state({});

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

  function toggleCategory(id) {
    expandedCategory = expandedCategory === id ? null : id;
  }

  async function toggleKp(name) {
    if (expandedKp === name) {
      expandedKp = null;
      return;
    }
    expandedKp = name;
    if (!detailCache[name]) {
      try {
        const detail = await api.knowledge.get(name);
        detailCache[name] = detail;
      } catch {
        // silently fail
      }
    }
  }

  function getMasteryColor(mastery) {
    if (mastery >= 80) return "var(--success)";
    if (mastery >= 40) return "var(--warning)";
    if (mastery > 0) return "var(--danger)";
    return "var(--text-dim)";
  }

  function goToDetail(tag) {
    onNavigate("knowledge-detail", { tag });
  }

  function stripMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/^### /gm, "")
      .replace(/^## /gm, "")
      .replace(/^# /gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[\|\-]{3,}/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
</script>

<div class="page kp-page">
  <div class="page-header">
    <h1 class="page-title" data-testid="page-title">知识点</h1>
    <p class="page-sub">共 {points.length} 个知识点，按领域分类</p>
  </div>

  <div class="search-wrap">
    <svg
      class="search-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
    <input class="search" placeholder="搜索知识点或领域..." bind:value={searchQuery} />
  </div>

  {#if error}
    <ErrorAlert message={error} onRetry={loadPoints} />
  {:else if loading}
    <div class="skeleton-grid">
      {#each Array(6) as _}
        <div class="skeleton" style="height: 100px"></div>
      {/each}
    </div>
  {:else if grouped.length === 0}
    <p class="empty">暂无匹配的领域</p>
  {:else}
    <div class="cat-list">
      {#each grouped as cat}
        <div class="cat-card card" data-testid="category-card" class:expanded={expandedCategory === cat.id}>
          <button class="cat-header" data-testid="category-header" onclick={() => toggleCategory(cat.id)}>
            <div class="cat-header-left">
              <span class="cat-label">{cat.label}</span>
              <span class="cat-stats">{cat.count} 个知识点</span>
            </div>
            <div class="cat-header-right">
              <span
                class="mastery-badge"
                style="color: {getMasteryColor(Math.round(cat.totalMastery / Math.max(cat.children.length, 1)))}"
              >
                掌握 {Math.round(cat.totalMastery / Math.max(cat.children.length, 1))}%
              </span>
              <svg
                class="cat-arrow"
                class:rotated={expandedCategory === cat.id}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg
              >
            </div>
          </button>
          {#if expandedCategory === cat.id}
            <div class="cat-children">
              {#each cat.children as kp}
                <div class="kp-wrapper" data-testid="knowledge-item">
                  <button
                    class="child-item"
                    class:expanded={expandedKp === kp.name}
                    onclick={() => toggleKp(kp.name)}
                  >
                    <div class="child-info">
                      <span class="child-name">{kp.name}</span>
                      <span class="child-count">{kp.question_count} 题</span>
                      {#if kp.has_content}
                        <span class="content-badge">📖 有讲解</span>
                      {/if}
                    </div>
                    <div class="child-mastery">
                      <div class="mastery-bar-bg">
                        <div
                          class="mastery-bar-fill"
                          style="width: {kp.mastery}%; background: {getMasteryColor(kp.mastery)}"
                        ></div>
                      </div>
                      <span
                        class="mastery-label"
                        style="color: {getMasteryColor(kp.mastery)}; font-size: 11px;"
                      >
                        {kp.mastery}%
                      </span>
                    </div>
                    <svg
                      class="child-arrow"
                      class:rotated={expandedKp === kp.name}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {#if expandedKp === kp.name}
                    <div class="kp-preview">
                      {#if detailCache[kp.name]?.content}
                        <div class="kp-content-preview">
                          {stripMarkdown(detailCache[kp.name].content).slice(0, 300)}
                          {#if detailCache[kp.name].content.length > 300}
                            <span class="content-more">...</span>
                          {/if}
                        </div>
                      {:else if detailCache[kp.name]}
                        <p class="kp-no-content">暂无知识讲解内容</p>
                      {:else}
                        <p class="kp-loading">加载中...</p>
                      {/if}
                      <button class="kp-detail-btn" onclick={() => goToDetail(kp.name)}>
                        查看完整内容 →
                      </button>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .kp-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .page-header {
    margin-bottom: 4px;
  }
  .page-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-icon {
    position: absolute;
    left: 12px;
    color: var(--text-dim);
    pointer-events: none;
  }
  .search {
    padding-left: 36px;
  }

  .empty {
    text-align: center;
    color: var(--text-muted);
    padding: 40px 0;
    font-size: 14px;
  }

  /* Category list (hierarchical) */
  .cat-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cat-card {
    padding: 0;
    overflow: hidden;
  }
  .cat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 14px 16px;
    cursor: pointer;
    text-align: left;
    background: none;
    border: none;
    color: var(--text);
    gap: 12px;
    transition: background 0.15s;
  }
  .cat-header:hover {
    background: var(--bg-surface);
  }
  .cat-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .cat-label {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  .cat-stats {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    background: var(--bg-surface);
    padding: 2px 10px;
    border-radius: 10px;
  }
  .cat-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .mastery-badge {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }
  .cat-arrow {
    transition: transform 0.2s;
    color: var(--text-dim);
  }
  .cat-arrow.rotated {
    transform: rotate(90deg);
  }

  .cat-children {
    border-top: 1px solid var(--border);
    padding: 8px 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .kp-wrapper {
    border-radius: 6px;
    overflow: hidden;
  }

  .child-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 8px;
    cursor: pointer;
    text-align: left;
    background: none;
    border: none;
    border-radius: 6px;
    color: var(--text);
    transition: background 0.12s;
  }
  .child-item:hover {
    background: var(--bg-surface);
  }
  .child-item.expanded {
    background: var(--bg-surface);
    border-radius: 6px 6px 0 0;
  }
  .child-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }
  .child-name {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }
  .child-count {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .content-badge {
    font-size: 10px;
    color: var(--accent);
    background: var(--accent-bg);
    padding: 1px 6px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .child-mastery {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100px;
    flex-shrink: 0;
  }
  .child-arrow {
    transition: transform 0.2s;
    color: var(--text-dim);
    flex-shrink: 0;
  }
  .child-arrow.rotated {
    transform: rotate(180deg);
  }

  .mastery-bar-bg {
    flex: 1;
    height: 4px;
    background: var(--bg-surface);
    border-radius: 2px;
    overflow: hidden;
  }
  .mastery-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
  }
  .mastery-label {
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
  }

  .kp-preview {
    padding: 8px 8px 12px 8px;
    border-top: 1px solid var(--border);
    margin: 0 0 2px 0;
    background: var(--bg-card);
    border-radius: 0 0 6px 6px;
  }
  .kp-content-preview {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text);
    margin-bottom: 8px;
  }
  .content-more {
    color: var(--text-muted);
  }
  .kp-no-content,
  .kp-loading {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .kp-detail-btn {
    font-size: 12px;
    color: var(--accent);
    background: none;
    border: none;
    padding: 4px 0;
    cursor: pointer;
    font-weight: 600;
    display: block;
  }
  .kp-detail-btn:hover {
    text-decoration: underline;
  }

  .skeleton-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
