<script>
  import { onMount, onDestroy } from "svelte";
  import { store } from "../lib/stores.svelte.js";
  import { api } from "../lib/local-api.js";
  import { toast } from "../lib/toast.js";
  import { FILTER_CATEGORIES, categoryLabel } from "../lib/categories.js";
  import { renderContent, renderAnswer } from "../lib/render-utils.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import Pagination from "../components/Pagination.svelte";

  let { onNavigate } = $props();

  let showRandomHint = $state(false);
  let selectedIds = $state(new Set());
  let selectionMode = $state(false);
  let companies = $state([]);
  let allTags = $state([]);
  let searchInput = $state(null);
  let detailQuestion = $state(null);
  let showDetailAnswer = $state(false);
  let detailDialog = $state(null);
  let detailNotes = $state("");
  let noteSaving = $state(false);

  const PAGE_SIZE = 20;
  let currentPage = $state(1);

  let totalPages = $derived(Math.max(1, Math.ceil(store.questions.length / PAGE_SIZE)));
  let pagedQuestions = $derived(store.questions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));

  const categories = FILTER_CATEGORIES;

  async function openDetail(q) {
    showDetailAnswer = false;
    try {
      detailQuestion = await api.questions.get(q.id);
      detailNotes = detailQuestion.notes || "";
    } catch {
      detailQuestion = q;
      detailNotes = "";
    }
  }
  function closeDetail() {
    detailQuestion = null;
    showDetailAnswer = false;
    detailNotes = "";
  }

  async function saveNotes() {
    if (!detailQuestion) return;
    noteSaving = true;
    try {
      await api.progress.update(detailQuestion.id, { notes: detailNotes });
    } catch {
      // silent
    } finally {
      noteSaving = false;
    }
  }

  function handleKeydown(e) {
    if (e.key === "Escape") { closeDetail(); return; }
    if (e.key === "/" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      searchInput?.focus();
    }
  }

  onMount(() => {
    companies = api.questions.companies();
    allTags = api.questions.tags();
    store.loadQuestions();
    document.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
  });

  function applyFilter() {
    currentPage = 1;
    clearSelection();
    store.loadQuestions({ page: 1 });
  }

  async function goQuestion(q) {
    await store.startQuiz(store.questions);
    onNavigate("quiz", { questionId: q.id });
  }

  async function goRandom() {
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
    await store.startQuiz(list);
    onNavigate("quiz", { questionId: q.id });
  }

  async function exportMarkdown() {
    const ids = store.questions.map((q) => q.id);
    if (ids.length === 0) return;
    const md = await api.exportMarkdown(ids);
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
    const newVal = api.progress.toggleBookmark(q.id);
    q.bookmarked = newVal;
    toast.success(newVal ? "已收藏" : "已取消收藏");
  }

  function highlight(text) {
    if (!store.filters.search || !text) return text;
    const s = store.filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${s})`, 'gi');
    return text.replace(re, '<mark class="search-hl">$1</mark>');
  }
  function contentSnippet(text) {
    if (!text) return "";
    const plain = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const s = store.filters.search?.toLowerCase() || "";
    const idx = plain.toLowerCase().indexOf(s);
    let snippet;
    if (idx >= 0) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(plain.length, idx + s.length + 60);
      snippet = (start > 0 ? "…" : "") + plain.slice(start, end) + (end < plain.length ? "…" : "");
    } else {
      snippet = plain.slice(0, 100) + (plain.length > 100 ? "…" : "");
    }
    return highlight(snippet);
  }

  function toggleSelection(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    selectedIds = next;
    if (next.size > 0) selectionMode = true;
    else selectionMode = false;
  }

  function clearSelection() {
    selectedIds = new Set();
    selectionMode = false;
  }

  async function startSelected() {
    const selected = store.questions.filter((q) => selectedIds.has(q.id));
    if (selected.length === 0) return;
    await store.startQuiz(selected);
    clearSelection();
    onNavigate("quiz", { questionId: selected[0].id });
  }

  function batchBookmark() {
    const selected = store.questions.filter((q) => selectedIds.has(q.id));
    if (selected.length === 0) return;
    for (const q of selected) {
      const newVal = api.progress.toggleBookmark(q.id);
      q.bookmarked = newVal;
    }
    clearSelection();
    toast.success(`已批量收藏 ${selected.length} 题`);
  }

  let hasActiveFilters = $derived(
    !!store.filters.category ||
    !!store.filters.difficulty ||
    !!store.filters.type ||
    !!store.filters.status ||
    !!store.filters.company ||
    !!store.filters.tag ||
    !!store.filters.search ||
    !!store.filters.sort_by ||
    store.filters.bookmarked
  );

  function resetFilters() {
    store.filters.category = "";
    store.filters.difficulty = "";
    store.filters.type = "";
    store.filters.status = "";
    store.filters.company = "";
    store.filters.tag = "";
    store.filters.search = "";
    store.filters.sort_by = "";
    store.filters.bookmarked = false;
    applyFilter();
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
          {#each companies as c}
            <option value={c}>{c}</option>
          {/each}
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">知识点</span>
        <select
          bind:value={store.filters.tag}
          onchange={applyFilter}
          class:filter-active={store.filters.tag}
        >
          <option value="">全部知识点</option>
          {#each allTags as t}
            <option value={t}>{t}</option>
          {/each}
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
        <svg aria-hidden="true"
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
        <svg aria-hidden="true"
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
        <svg aria-hidden="true"
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
            {#if hasActiveFilters}
        <button class="reset-filter-btn" onclick={resetFilters}>
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round"><polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
          重置
        </button>
      {/if}
      <button
        class="qr-browse-btn"
        onclick={() => onNavigate("quick-review", { reviewConfig: { category: store.filters.category, difficulty: store.filters.difficulty, type: store.filters.type, count: 20 } })}
        disabled={store.questions.length === 0}
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-linejoin="round"><circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" /></svg>
        速记
      </button>
    </div>
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
      placeholder="搜索题目、答案、标签... (按 / 快速定位)"
      bind:value={store.filters.search}
      oninput={() => applyFilter()}
			  bind:this={searchInput}
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
        <svg aria-hidden="true"
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

  {#if selectedIds.size > 0}
    <div class="sel-bar">
      <span class="sel-count">已选 {selectedIds.size} 题</span>
      <div class="sel-actions">
        <button class="sel-cancel" onclick={clearSelection}>取消</button>
        <button class="sel-bm" onclick={batchBookmark} title="收藏选中题目">
          <svg aria-hidden="true"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><polygon points="19 21 12 17.27 5 21 5 3 19 3 19 21" /></svg>
          收藏
        </button>
        <button class="sel-start" onclick={startSelected}>开始答题</button>
      </div>
    </div>
  {/if}

  {#if store.error}
    <ErrorAlert message={store.error} onRetry={applyFilter} />
  {:else if store.loading}
    <div class="skeleton" style="height:80px"></div>
    <div class="skeleton" style="height:80px;margin-top:8px"></div>
    <div class="skeleton" style="height:80px;margin-top:8px"></div>
  {:else if store.questions.length === 0}
    <p class="empty">暂无题目 — 试试调整筛选条件或换个分类</p>
  {:else}
    <p class="result-count">共 {store.questions.length} 题</p>
    <div class="list">
      {#each pagedQuestions as q}
        <button
          class="card q-item status-{q.status}"
          class:selected={selectedIds.has(q.id)}
          data-testid="question-item"
          onclick={() => openDetail(q)}
        >
          <span
            class="sel-check"
            role="checkbox"
            aria-checked={selectedIds.has(q.id)}
            tabindex="0"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); toggleSelection(q.id); } }}
            onmousedown={(e) => e.stopPropagation()}
            onpointerdown={(e) => e.stopPropagation()}
          >
            <svg aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={selectedIds.has(q.id) ? "currentColor" : "none"}
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><rect x="3" y="3" width="18" height="18" rx="3" />
              {#if selectedIds.has(q.id)}
                <polyline points="9 12 11 14 15 10" />
              {/if}
            </svg>
          </span>
          <div class="q-header">
            <span class="status-icon {q.status}">
              {#if q.status === "correct"}
                <svg aria-hidden="true"
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
                <svg aria-hidden="true"
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
                <svg aria-hidden="true"
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
                <svg aria-hidden="true"
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
              <svg aria-hidden="true"
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
          {#if store.filters.search}
            <p class="q-snippet">{@html contentSnippet(q.content)}</p>
          {/if}
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

{#if detailQuestion}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="detail-overlay" onclick={closeDetail} onkeydown={(e) => { if (e.key === "Escape") closeDetail(); }}>
    <div class="detail-panel" role="dialog" aria-modal="true" tabindex="-1" bind:this={detailDialog} onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === "Escape") closeDetail(); }}>
      <div class="dp-header">
        <div class="dp-badges">
          <span class="tag">{categoryLabel(detailQuestion.category)}</span>
          <span class="tag diff {detailQuestion.difficulty}">{detailQuestion.difficulty}</span>
          <span class="tag type">{detailQuestion.type}</span>
          {#if detailQuestion.company}
            <span class="tag company">{detailQuestion.company}</span>
          {/if}
        </div>
        <button class="dp-close" onclick={closeDetail} aria-label="关闭">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <h2 class="dp-title">{detailQuestion.title}</h2>

      <div class="dp-content">
        {#each renderContent(detailQuestion.content) as section}
          {#if section.type === "code"}
            <pre class="dp-code"><code>{section.text}</code></pre>
          {:else}
            <p class="dp-text">{section.text}</p>
          {/if}
        {/each}
      </div>

      {#if detailQuestion.hints?.length > 0}
        <details class="dp-hints">
          <summary class="dp-hints-summary">提示 ({detailQuestion.hints.length})</summary>
          <ul class="dp-hints-list">
            {#each detailQuestion.hints as hint}
              <li>{hint}</li>
            {/each}
          </ul>
        </details>
      {/if}

      {#if detailQuestion.tags?.length > 0}
        <div class="dp-tags">
          {#each detailQuestion.tags as t}
            <span class="mini-tag kp-link" role="button" tabindex="0"
              onkeydown={(e) => { if (e.key === "Enter") { closeDetail(); onNavigate("knowledge-detail", { tag: t }); } }}
              onclick={() => { closeDetail(); onNavigate("knowledge-detail", { tag: t }); }}
            >{t}</span>
          {/each}
        </div>
      {/if}

      {#if detailQuestion.review_count > 0}
        <div class="dp-progress">
          <span class="dp-progress-label">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            已答 {detailQuestion.review_count} 次
          </span>
          {#if detailQuestion.wrong_count > 0}
            <span class="dp-progress-label dp-progress-wrong">错误 {detailQuestion.wrong_count} 次</span>
          {/if}
          <span class="dp-progress-status" class:dp-status-correct={detailQuestion.status === "correct"} class:dp-status-wrong={detailQuestion.status === "wrong"} class:dp-status-reviewing={detailQuestion.status === "reviewing"}>
            {detailQuestion.status === "correct" ? "已掌握" : detailQuestion.status === "wrong" ? "待复习" : detailQuestion.status === "reviewing" ? "巩固中" : ""}
          </span>
        </div>
      {:else}
        <div class="dp-progress">
          <span class="dp-progress-label dp-progress-new">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            尚未练习
          </span>
        </div>
      {/if}

      <div class="dp-answer-section">
        <button class="dp-answer-toggle" onclick={() => (showDetailAnswer = !showDetailAnswer)}>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round">
            {#if showDetailAnswer}
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            {:else}
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            {/if}
          </svg>
          {showDetailAnswer ? "隐藏答案" : "查看答案"}
        </button>
        {#if showDetailAnswer}
          <div class="dp-answer">
            {#each renderAnswer(detailQuestion.answer) as section}
              {#if section.type === "code"}
                <pre class="dp-code"><code>{section.text}</code></pre>
              {:else}
                <p class="dp-text">{section.text}</p>
              {/if}
            {/each}
          </div>
        {/if}
      </div>

      <div class="dp-actions">
        <button class="dp-action-btn dp-action-btn-primary" onclick={() => { const q = detailQuestion; closeDetail(); goQuestion(q); }}>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          开始答题
        </button>
        <button class="dp-action-btn" onclick={(e) => { toggleBookmark(e, detailQuestion); }}>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill={detailQuestion.bookmarked ? "currentColor" : "none"}
            stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round"><polygon points="19 21 12 17.27 5 21 5 3 19 3 19 21" /></svg>
          {detailQuestion.bookmarked ? "已收藏" : "收藏"}
        </button>
      </div>
    </div>
  </div>
{/if}

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
  .reset-filter-btn {
    white-space: nowrap;
    padding: 8px 12px;
    font-size: 12px;
    background: none;
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s var(--spring);
  }
  .reset-filter-btn:active {
    transform: scale(0.96);
    color: var(--accent);
    border-color: var(--accent-dim);
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
    background: var(--search-hl-bg);
    color: var(--search-hl-color);
    border-radius: 2px;
    padding: 0 2px;
  }
  .q-title {
    font-size: 14px;
    line-height: 1.4;
    color: var(--text);
  }
  .q-snippet {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
    margin-top: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
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
    background: var(--accent-bg);
    color: var(--accent);
  }
  .tag.type.true_false {
    background: var(--ans-extension-bg);
    color: var(--ans-extension-text);
  }
  .tag.type.coding {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .tag.type.fill_in_blank {
    background: var(--warning-bg);
    color: var(--warning);
  }
  .tag.type.multiple_choice {
    background: var(--accent-bg);
    color: var(--accent);
  }

  /* ── Selection Mode ── */
  .q-item.selected {
    border-color: var(--accent);
    background: var(--accent-bg);
  }
  .sel-check {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding: 2px;
    cursor: pointer;
    color: var(--text-dim);
    transition: color 0.2s;
    z-index: 1;
    position: relative;
  }
  .q-item:hover .sel-check,
  .q-item.selected .sel-check {
    color: var(--accent);
  }

  .sel-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: var(--accent-bg);
    border: 1px solid var(--accent-dim);
    border-radius: var(--radius-sm);
    animation: scale-in 0.25s var(--spring) both;
  }
  .sel-count {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
  }
  .sel-actions {
    display: flex;
    gap: 8px;
  }
  .sel-cancel {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-pill);
    background: none;
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .sel-cancel:active {
    transform: scale(0.96);
  }
  .sel-start {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-pill);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .sel-start:active {
    transform: scale(0.96);
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
    .qr-browse-btn,
    .reset-filter-btn {
      flex: 1;
      justify-content: center;
    }
  }

  /* ── Question Detail Panel ── */
  .detail-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal-overlay);
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
    animation: fade-in 0.2s both;
  }
  .detail-panel {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius) var(--radius) 0 0;
    padding: 20px 20px 24px;
    width: 100%;
    max-width: 560px;
    max-height: 85vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: slide-up 0.3s var(--spring) both;
  }
  .dp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .dp-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
  }
  .dp-close {
    flex-shrink: 0;
    background: var(--bg-surface);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-dim);
    transition: all 0.2s var(--spring);
  }
  .dp-close:active {
    transform: scale(0.9);
    background: var(--bg-card-hover);
  }
  .dp-title {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: -0.2px;
    color: var(--text);
    margin: 0;
  }
  .dp-content {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
  }
  .dp-text {
    margin: 0 0 8px;
  }
  .dp-code {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.5;
    margin: 8px 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .dp-hints {
    font-size: 13px;
    color: var(--text-muted);
  }
  .dp-hints-summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--warning);
    padding: 4px 0;
  }
  .dp-hints-list {
    margin: 8px 0 4px 20px;
    line-height: 1.6;
  }
  .dp-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  /* ── Notes ── */
  .dp-notes {
    margin: 4px 0;
  }
  .dp-notes-details {
    font-size: 13px;
  }
  .dp-notes-summary {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: var(--text-muted);
    font-weight: 600;
    font-size: 12px;
    padding: 6px 0;
    user-select: none;
  }
  .dp-notes-summary:active {
    opacity: 0.7;
  }
  .dp-notes-badge {
    color: var(--accent);
    font-size: 8px;
  }
  .dp-notes-input {
    width: 100%;
    margin-top: 6px;
    padding: 8px 10px;
    font-size: 13px;
    line-height: 1.5;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text);
    font-family: inherit;
    resize: vertical;
    min-height: 56px;
    box-sizing: border-box;
  }
  .dp-notes-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-dim);
  }
  .dp-notes-status {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 4px;
    display: block;
  }

  .dp-answer-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .dp-answer-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    background: var(--success-bg);
    color: var(--success);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
    width: fit-content;
  }
  .dp-answer-toggle:active {
    transform: scale(0.97);
  }
  .dp-answer {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
    padding: 12px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .dp-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }
  .dp-action-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .dp-action-btn:active {
    transform: scale(0.97);
  }
  .dp-action-btn-primary {
    background: var(--accent);
    color: #fff;
    border: none;
  }
  .dp-action-btn-primary:active {
    opacity: 0.9;
  }

  /* ── Detail Progress ── */
  .dp-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    flex-wrap: wrap;
  }
  .dp-progress-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-muted);
  }
  .dp-progress-label svg {
    opacity: 0.6;
  }
  .dp-progress-wrong {
    color: var(--danger);
  }
  .dp-progress-new {
    color: var(--text-dim);
  }
  .dp-progress-status {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    color: var(--text-muted);
    margin-left: auto;
  }
  .dp-status-correct {
    background: var(--success-bg);
    color: var(--success);
  }
  .dp-status-wrong {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .dp-status-reviewing {
    background: var(--warning-bg);
    color: var(--warning);
  }

  @keyframes slide-up {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
