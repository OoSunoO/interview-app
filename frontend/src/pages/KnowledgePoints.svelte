<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { categoryLabel } from "../lib/categories.js";
  import {
    DOMAINS, topDomains, domainChildren, domainLabel, CATEGORY_TO_DOMAIN,
  } from "../lib/knowledge-data/domains.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import Pagination from "../components/Pagination.svelte";

  let { onNavigate } = $props();

  let points = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let searchQuery = $state("");
  let expandedDomain = $state(null);
  let expandedSub = $state(null);
  let expandedKp = $state(null);
  let showOnlyContent = $state(true);

  const PAGE_SIZE = 8;
  let currentPage = $state(1);

  // Domain tree: group points by domain structure
  let domainTree = $derived.by(() => {
    // Partition points by domain
    const byDomain = {};
    for (const p of points) {
      const d = p.domain || "other";
      if (!byDomain[d]) byDomain[d] = [];
      byDomain[d].push(p);
    }

    // Build tree from domain hierarchy
    function buildDomain(id) {
      const def = DOMAINS[id];
      if (!def) return null;
      const children = (def.children || []).map(buildDomain).filter(Boolean);
      const ownPoints = byDomain[id] || [];
      return {
        id,
        label: domainLabel(id),
        points: ownPoints,
        children,
        totalQuestions: ownPoints.reduce((s, p) => s + p.question_count, 0),
        totalMastery: ownPoints.reduce((s, p) => s + p.mastery, 0),
        count: ownPoints.length,
      };
    }

    return topDomains().map(buildDomain).filter(Boolean);
  });

  // Filter out domains with no content if showOnlyContent is on
  let filteredTree = $derived.by(() => {
    if (!showOnlyContent) return domainTree;
    return domainTree
      .map((d) => {
        const filtered = d.points.filter((p) => p.has_content);
        const children = d.children
          .map((c) => {
            const cp = c.points.filter((p) => p.has_content);
            return { ...c, points: cp, count: cp.length, totalQuestions: cp.reduce((s, p) => s + p.question_count, 0), totalMastery: cp.reduce((s, p) => s + p.mastery, 0) };
          })
          .filter((c) => c.count > 0 || c.children.length > 0);
        const fp = d.points.filter((p) => p.has_content || children.some((c) => c.points.includes(p)));
        return { ...d, points: fp, children, count: fp.length + children.length };
      })
      .filter((d) => d.count > 0 || d.children.length > 0);
  });

  let totalPages = $derived(Math.max(1, Math.ceil(filteredTree.length / PAGE_SIZE)));
  let pagedTree = $derived(filteredTree.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));

  let detailCache = $state({});
  let searchTimeout;

  $effect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadPoints(searchQuery);
      currentPage = 1;
    }, 200);
  });

  onMount(async () => {
    await loadPoints();
  });

  async function loadPoints(search) {
    loading = true;
    error = null;
    try {
      points = await api.knowledge.list(search || undefined);
    } catch (e) {
      error = e.message ?? "加载知识点失败";
    } finally {
      loading = false;
    }
  }

  function toggleDomain(id) {
    expandedDomain = expandedDomain === id ? null : id;
  }

  function toggleSub(id) {
    expandedSub = expandedSub === id ? null : id;
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
    <h1 class="page-title" data-testid="page-title">知识体系</h1>
    <p class="page-sub">共 {points.length} 个知识点，按领域树浏览</p>
  </div>

  <div class="search-wrap">
    <svg aria-hidden="true"
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
    <input
      class="search"
      placeholder="搜索知识点或领域..."
      bind:value={searchQuery}
      oninput={() => { currentPage = 1; }}
    />
    <label class="content-toggle">
      <input type="checkbox" bind:checked={showOnlyContent} />
      <span>仅看有讲解</span>
    </label>
  </div>

  {#if error}
    <ErrorAlert message={error} onRetry={loadPoints} />
  {:else if loading}
    <div class="skeleton-grid">
      {#each Array(4) as _}
        <div class="skeleton" style="height: 120px"></div>
      {/each}
    </div>
  {:else if filteredTree.length === 0}
    <p class="empty">暂无匹配的知识点</p>
  {:else}
    <div class="domain-list">
      {#each pagedTree as domain}
        <div class="domain-card card" class:expanded={expandedDomain === domain.id}>
          <button class="domain-header" onclick={() => toggleDomain(domain.id)}>
            <div class="domain-header-left">
              <span class="domain-label">{domain.label}</span>
              <span class="domain-stats">{domain.count} 个知识点 · {domain.totalQuestions} 题</span>
            </div>
            <div class="domain-header-right">
              <span
                class="mastery-badge"
                style="color: {getMasteryColor(Math.round(domain.totalMastery / Math.max(domain.count, 1)))}"
              >
                掌握 {Math.round(domain.totalMastery / Math.max(domain.count, 1))}%
              </span>
              <svg aria-hidden="true"
                class="domain-arrow"
                class:rotated={expandedDomain === domain.id}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg
              >
            </div>
          </button>

          {#if expandedDomain === domain.id}
            <div class="domain-body">
              {#if domain.children.length > 0}
                {#each domain.children as sub}
                  <div class="sub-section" class:expanded={expandedSub === sub.id}>
                    <button class="sub-header" onclick={() => toggleSub(sub.id)}>
                      <span class="sub-label">{sub.label}</span>
                      <span class="sub-stats">{sub.count} 个知识点</span>
                      <svg aria-hidden="true"
                        class="sub-arrow"
                        class:rotated={expandedSub === sub.id}
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {#if expandedSub === sub.id}
                      <div class="sub-points">
                        {#each sub.points as kp}
                          <button class="kp-item" onclick={() => toggleKp(kp.name)}>
                            <div class="kp-info">
                              <span class="kp-name">{kp.name}</span>
                              <span class="kp-count">{kp.question_count} 题</span>
                              {#if kp.has_content}
                                <span class="content-badge"><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> 讲解</span>
                              {/if}
                            </div>
                            <div class="kp-mastery">
                              <div class="mastery-bar-bg">
                                <div class="mastery-bar-fill" style="width: {kp.mastery}%; background: {getMasteryColor(kp.mastery)}"></div>
                              </div>
                              <span class="mastery-label" style="color: {getMasteryColor(kp.mastery)}">{kp.mastery}%</span>
                            </div>
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
                              <button class="kp-detail-btn" onclick={() => goToDetail(kp.name)}>查看完整内容 →</button>
                            </div>
                          {/if}
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/each}
              {/if}
              {#if domain.points.length > 0}
                <div class="direct-points">
                  {#each domain.points as kp}
                    <button class="kp-item" onclick={() => toggleKp(kp.name)}>
                      <div class="kp-info">
                        <span class="kp-name">{kp.name}</span>
                        <span class="kp-count">{kp.question_count} 题</span>
                        {#if kp.has_content}
                          <span class="content-badge"><svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> 讲解</span>
                        {/if}
                      </div>
                      <div class="kp-mastery">
                        <div class="mastery-bar-bg">
                          <div class="mastery-bar-fill" style="width: {kp.mastery}%; background: {getMasteryColor(kp.mastery)}"></div>
                        </div>
                        <span class="mastery-label" style="color: {getMasteryColor(kp.mastery)}">{kp.mastery}%</span>
                      </div>
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
                        <button class="kp-detail-btn" onclick={() => goToDetail(kp.name)}>查看完整内容 →</button>
                      </div>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
    <Pagination page={currentPage} {totalPages} onPageChange={(n) => { currentPage = n; }} />
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
    gap: 8px;
  }
  .search-icon {
    position: absolute;
    left: 12px;
    color: var(--text-dim);
    pointer-events: none;
  }
  .search {
    padding-left: 36px;
    flex: 1;
  }
  .content-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    cursor: pointer;
    flex-shrink: 0;
  }
  .content-toggle input {
    margin: 0;
  }

  .empty {
    text-align: center;
    color: var(--text-muted);
    padding: 40px 0;
    font-size: 14px;
  }

  /* Domain list */
  .domain-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .domain-card {
    padding: 0;
    overflow: hidden;
  }
  .domain-header {
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
  .domain-header:hover {
    background: var(--bg-surface);
  }
  .domain-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .domain-label {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  .domain-stats {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    background: var(--bg-surface);
    padding: 2px 10px;
    border-radius: 10px;
  }
  .domain-header-right {
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
  .domain-arrow {
    transition: transform 0.2s;
    color: var(--text-dim);
  }
  .domain-arrow.rotated {
    transform: rotate(90deg);
  }

  .domain-body {
    border-top: 1px solid var(--border);
    padding: 8px 16px 12px;
  }

  .sub-section {
    border-radius: 6px;
    margin-bottom: 4px;
  }
  .sub-header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 8px;
    cursor: pointer;
    text-align: left;
    background: none;
    border: none;
    border-radius: 6px;
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    transition: background 0.12s;
  }
  .sub-header:hover {
    background: var(--bg-surface);
  }
  .sub-label {
    flex: 1;
  }
  .sub-stats {
    font-size: 11px;
    color: var(--text-muted);
  }
  .sub-arrow {
    transition: transform 0.2s;
    color: var(--text-dim);
  }
  .sub-arrow.rotated {
    transform: rotate(180deg);
  }
  .sub-points {
    padding-left: 12px;
  }

  .direct-points {
    margin-top: 4px;
  }

  .kp-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 8px;
    cursor: pointer;
    text-align: left;
    background: none;
    border: none;
    border-radius: 6px;
    color: var(--text);
    transition: background 0.12s;
  }
  .kp-item:hover {
    background: var(--bg-surface);
  }
  .kp-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }
  .kp-name {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
  .kp-count {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .content-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: var(--accent);
    background: var(--accent-bg);
    padding: 1px 6px;
    border-radius: 4px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .kp-mastery {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100px;
    flex-shrink: 0;
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
    padding: 8px 8px 12px 12px;
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

  @media (max-width: 480px) {
    .domain-header {
      padding: 12px;
    }
    .domain-label {
      font-size: 14px;
    }
    .kp-item {
      gap: 6px;
      padding: 8px 4px;
    }
    .kp-name {
      font-size: 12px;
      white-space: normal;
    }
    .kp-mastery {
      width: 70px;
    }
    .search-wrap {
      flex-wrap: wrap;
    }
  }
</style>
