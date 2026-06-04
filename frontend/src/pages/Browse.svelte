<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.svelte.js";
  import { api } from "../lib/local-api.js";
  import { FILTER_CATEGORIES, categoryLabel } from "../lib/categories.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import Pagination from "../components/Pagination.svelte";

  let { onNavigate } = $props();

  let showRandomHint = $state(false);

  const PAGE_SIZE = 20;
  let currentPage = $state(1);

  let totalPages = $derived(Math.max(1, Math.ceil(store.questions.length / PAGE_SIZE)));
  let pagedQuestions = $derived(store.questions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));

  const categories = FILTER_CATEGORIES;

  onMount(() => {
    store.loadQuestions();
  });

  function applyFilter() {
    currentPage = 1;
    store.loadQuestions({ page: 1 });
  }

  function goQuestion(q) {
    store.startQuiz(store.questions);
    onNavigate("quiz", { questionId: q.id });
  }

  function goRandom() {
    const list = store.questions;
    if (list.length === 0) return;

    // Show brief toast if filters are active
    const hasFilters =
      store.filters.category ||
      store.filters.difficulty ||
      store.filters.type ||
      store.filters.status ||
      store.filters.company ||
      store.filters.search ||
      store.filters.sort_by ||
      store.filters.bookmarked;
    if (hasFilters) {
      showRandomHint = true;
      setTimeout(() => {
        showRandomHint = false;
      }, 2000);
    }

    const q = list[Math.floor(Math.random() * list.length)];
    store.startQuiz(list);
    onNavigate("quiz", { questionId: q.id });
  }

  function exportMarkdown() {
    const ids = store.questions.map((q) => q.id);
    if (ids.length === 0) return;
    const md = api.exportMarkdown(ids);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `面试题库-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function toggleBookmark(e, q) {
    e.stopPropagation();
    api.progress.toggleBookmark(q.id);
    q.bookmarked = !q.bookmarked;
  }

  function highlight(text) {
    if (!store.filters.search || !text) return text;
    const s = store.filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${s})`, 'gi');
    return text.replace(re, '<mark class="search-hl">$1</mark>');
  }
</script>

<div class="page browse">
  <h1 class="page-title" data-testid="page-title">题库</h1>

  <div class="filters">
    <div class="filters-row">
      <div class="filter-item">
        <span class="filter-label">分类</span>
        <select
          bind:value={store.filters.category}
          onchange={applyFilter}
          class:filter-active={store.filters.category}
        >
          {#each categories as c}
            <option value={c.value}>{c.label}</option>
          {/each}
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">难度</span>
        <select
          bind:value={store.filters.difficulty}
          onchange={applyFilter}
          class:filter-active={store.filters.difficulty}
        >
          <option value="">全部难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">状态</span>
        <select
          bind:value={store.filters.status}
          onchange={applyFilter}
          class:filter-active={store.filters.status}
        >
          <option value="">全部状态</option>
          <option value="new">未做</option>
          <option value="correct">已掌握</option>
          <option value="wrong">答错</option>
          <option value="reviewing">复习中</option>
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">题型</span>
        <select
          bind:value={store.filters.type}
          onchange={applyFilter}
          class:filter-active={store.filters.type}
        >
          <option value="">全部题型</option>
          <option value="short_answer">简答</option>
          <option value="coding">编码</option>
          <option value="choice">选择</option>
          <option value="true_false">判断</option>
          <option value="multiple_choice">多选</option>
          <option value="fill_in_blank">填空</option>
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">来源</span>
        <select
          bind:value={store.filters.company}
          onchange={applyFilter}
          class:filter-active={store.filters.company}
        >
          <option value="">全部来源</option>
          <option value="字节跳动">字节跳动</option>
          <option value="腾讯">腾讯</option>
          <option value="阿里巴巴">阿里巴巴</option>
          <option value="美团">美团</option>
          <option value="华为">华为</option>
          <option value="Google">Google</option>
          <option value="Microsoft">Microsoft</option>
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">排序</span>
        <select
          class:filter-active={store.filters.sort_by}
          bind:value={store.filters.sort_by}
          onchange={applyFilter}
        >
          <option value="">默认排序</option>
          <option value="difficulty">按难度</option>
          <option value="category">按分类</option>
          <option value="type">按题型</option>
          <option value="status">按状态</option>
        </select>
      </div>
    </div>

    <div class="actions-row">
      {#if showRandomHint}
        <span class="random-hint">已从当前筛选结果中随机抽取</span>
      {/if}
      <button
        class="bm-filter-btn"
        class:active={store.filters.bookmarked}
        onclick={() => { store.filters.bookmarked = !store.filters.bookmarked; applyFilter(); }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={store.filters.bookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ><polygon points="19 21 12 17.27 5 21 5 3 19 3 19 21" /></svg>
        收藏
      </button>
      <button
        class="random-btn"
        onclick={goRandom}
        disabled={store.questions.length === 0}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
        随机
      </button>
      <button
        class="export-btn"
        onclick={exportMarkdown}
        disabled={store.questions.length === 0}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        导出
      </button>
      <button
        class="qr-browse-btn"
        onclick={() => onNavigate("quick-review", { reviewConfig: { category: store.filters.category, difficulty: store.filters.difficulty, count: 20 } })}
        disabled={store.questions.length === 0}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" /></svg>
        速记
      </button>
    </div>
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
    <input
      class="search"
      placeholder="搜索题目、答案、标签..."
      bind:value={store.filters.search}
      oninput={() => applyFilter()}
    />
    {#if store.filters.search}
      <button
        class="search-clear"
        title="清除搜索"
        onclick={() => {
          store.filters.search = "";
          applyFilter();
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M18 6 6 18M6 6l12 12" /></svg
        >
      </button>
    {/if}
  </div>

  {#if store.error}
    <ErrorAlert message={store.error} onRetry={applyFilter} />
  {:else if store.loading}
    <p class="loading">加载中...</p>
  {:else if store.questions.length === 0}
    <p class="empty">暂无题目 — 试试调整筛选条件或换个分类</p>
  {:else}
    <p class="result-count">共 {store.questions.length} 题</p>
    <div class="list">
      {#each pagedQuestions as q}
        <button
          class="card q-item status-{q.status}"
          data-testid="question-item"
          onclick={() => goQuestion(q)}
        >
          <div class="q-header">
            <span class="status-icon {q.status}">
              {#if q.status === "correct"}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline
                    points="22 4 12 14.01 9 11.01"
                  /></svg
                >
              {:else if q.status === "wrong"}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg
                >
              {:else if q.status === "reviewing"}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><circle cx="12" cy="12" r="10" /><polyline
                    points="12 6 12 12 16 14"
                  /></svg
                >
              {:else}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><circle cx="12" cy="12" r="10" /></svg
                >
              {/if}
            </span>
            <span class="tag">{categoryLabel(q.category)}</span>
            <span class="tag diff {q.difficulty}">{q.difficulty}</span>
            <span class="tag type">{q.type}</span>
            {#if q.company}
              <span class="tag company">{q.company}</span>
            {/if}
            <span
              class="bm-toggle"
              class:active={q.bookmarked}
              role="button"
              tabindex="0"
              onkeydown={(e) => { if (e.key === "Enter") toggleBookmark(e, q); }}
              onclick={(e) => toggleBookmark(e, q)}
              title={q.bookmarked ? "取消收藏" : "收藏"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={q.bookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><polygon points="19 21 12 17.27 5 21 5 3 19 3 19 21" /></svg>
            </span>
          </div>
          <p class="q-title">{@html highlight(q.title)}</p>
          {#if q.tags.length > 0}
            <div class="q-tags">
              {#each q.tags.slice(0, 3) as t}
                <span
                  class="mini-tag kp-link"
                  role="button"
                  tabindex="0"
                  onkeydown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      onNavigate("knowledge-detail", { tag: t });
                    }
                  }}
                  onclick={(e) => {
                    e.stopPropagation();
                    onNavigate("knowledge-detail", { tag: t });
                  }}
                  title="查看知识点：{t}"
                >
                  {t}
                </span>
              {/each}
            </div>
          {/if}
        </button>
      {/each}
    </div>
    <Pagination page={currentPage} {totalPages} onPageChange={(n) => { currentPage = n; }} />
  {/if}
</div>

<style>
  .browse {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .filters {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .filters-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1 0 0;
    min-width: 80px;
  }
  .filter-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-dim);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding-left: 2px;
  }
  .filters-row select {
    width: 100%;
  }
  .filters-row select.filter-active {
    border-color: var(--accent-dim);
    background: var(--accent-bg);
    color: var(--accent);
  }

  /* ── Actions Row ── */
  .actions-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    position: relative;
  }
  .random-hint {
    position: absolute;
    right: 0;
    bottom: calc(100% + 4px);
    font-size: 11px;
    color: var(--accent);
    background: var(--accent-bg);
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    animation: fade-in 0.25s var(--spring);
    pointer-events: none;
  }

  .bm-filter-btn {
    white-space: nowrap;
    padding: 8px 12px;
    font-size: 12px;
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s var(--spring);
  }
  .bm-filter-btn.active {
    background: var(--warning-bg);
    color: var(--warning);
    border-color: var(--warning);
  }
  .bm-filter-btn:active {
    transform: scale(0.96);
  }

  .random-btn {
    white-space: nowrap;
    padding: 8px 14px;
    font-size: 13px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .random-btn:disabled,
  .export-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .random-btn:not(:disabled):active,
  .export-btn:not(:disabled):active {
    transform: scale(0.96);
  }
  .export-btn {
    white-space: nowrap;
    padding: 8px 12px;
    font-size: 12px;
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s var(--spring);
  }
  .export-btn:not(:disabled):hover {
    border-color: var(--accent-dim);
    color: var(--accent);
  }
  .qr-browse-btn {
    white-space: nowrap;
    padding: 8px 12px;
    font-size: 12px;
    background: none;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s var(--spring);
  }
  .qr-browse-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .qr-browse-btn:not(:disabled):active {
    transform: scale(0.96);
    background: var(--accent-bg);
  }

  .loading,
  .empty {
    text-align: center;
    color: var(--text-muted);
    padding: 40px 0;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .q-item {
    text-align: left;
    width: 100%;
    border-left: 3px solid transparent;
  }
  .q-item.status-correct {
    border-left-color: var(--success);
  }
  .q-item.status-reviewing {
    border-left-color: var(--warning);
  }
  .q-item.status-wrong {
    border-left-color: var(--danger);
  }
  .status-icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
  .status-icon.correct {
    color: var(--success);
  }
  .status-icon.wrong {
    color: var(--danger);
  }
  .status-icon.reviewing {
    color: var(--warning);
  }
  .status-icon.new {
    color: var(--text-dim);
  }
  .bm-toggle {
    margin-left: auto;
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: var(--text-dim);
    display: inline-flex;
    align-items: center;
    border-radius: 3px;
    transition: all 0.2s var(--spring);
  }
  .bm-toggle.active {
    color: var(--warning);
  }
  .bm-toggle:active {
    transform: scale(0.85);
  }
  .q-header {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
    flex-wrap: wrap;
    align-items: center;
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
    padding-right: 32px;
  }
  .search-clear {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    padding: 4px;
    display: flex;
    border-radius: 50%;
    transition: all 0.2s var(--spring);
  }
  .search-clear:active {
    background: var(--bg-surface);
    transform: scale(0.85);
  }
  .result-count {
    font-size: 12px;
    color: var(--text-muted);
  }
  :global(.search-hl) {
    background: var(--warning);
    color: #000;
    border-radius: 2px;
    padding: 0 2px;
  }
  .q-title {
    font-size: 14px;
    line-height: 1.4;
    color: var(--text);
  }
  .q-tags {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }
  .mini-tag {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--border);
    color: var(--text-muted);
  }
  .mini-tag.kp-link {
    cursor: pointer;
    transition: all 0.2s var(--spring);
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px solid transparent;
    font-family: inherit;
  }
  .mini-tag.kp-link:hover {
    border-color: var(--accent-dim);
  }
  .mini-tag.kp-link:active {
    transform: scale(0.92);
  }
  .tag.company {
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px solid var(--accent-dim);
  }
  .tag.type {
    background: var(--bg-surface);
    color: var(--text-muted);
  }
  .tag.type.short_answer {
    background: var(--success-bg);
    color: var(--success);
  }
  .tag.type.choice {
    background: rgba(108, 140, 255, 0.1);
    color: #6c8cff;
  }
  .tag.type.true_false {
    background: rgba(167, 139, 250, 0.1);
    color: #a78bfa;
  }
  .tag.type.coding {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .tag.type.fill_in_blank {
    background: rgba(251, 191, 36, 0.12);
    color: #fbbf24;
  }
  .tag.type.multiple_choice {
    background: rgba(108, 140, 255, 0.1);
    color: #6c8cff;
  }

  /* ── Mobile ── */
  @media (max-width: 480px) {
    .filters-row {
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory;
      gap: 6px;
      padding-bottom: 4px;
      margin-bottom: -4px;
    }
    .filters-row::-webkit-scrollbar {
      height: 2px;
    }
    .filters-row::-webkit-scrollbar-thumb {
      background: var(--text-dim);
      border-radius: 1px;
    }
    .filter-item {
      min-width: 110px;
      flex: none;
      scroll-snap-align: start;
    }
    .filter-item select {
      font-size: 13px;
      padding: 8px 10px;
    }
    .actions-row {
      justify-content: stretch;
    }
    .random-btn,
    .export-btn,
    .qr-browse-btn {
      flex: 1;
      justify-content: center;
    }
  }
</style>
