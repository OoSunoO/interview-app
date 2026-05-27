<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.svelte.js";

  let { onNavigate } = $props();

  const categories = [
    { value: "", label: "全部" },

    { value: "cs_basics", label: "计算机基础" },
    { value: "algorithm", label: "算法" },
    { value: "database", label: "数据库" },
    { value: "linux", label: "Linux" },
    { value: "devops", label: "DevOps" },

    { value: "java_basic", label: "Java" },
    { value: "java_advanced", label: "Java 进阶" },
    { value: "react", label: "React" },
    { value: "frontend", label: "前端" },

    { value: "ai", label: "AI 基础" },
    { value: "agent", label: "AI Agent" },
    { value: "system_design", label: "系统设计" },

    { value: "project_mgmt", label: "项目管理" },
    { value: "product", label: "产品思维" },
  ];

  onMount(() => { store.loadQuestions(); });

  function applyFilter() {
    store.loadQuestions({ page: 1 });
  }

  function goQuestion(q) {
    store.startQuiz(store.questions);
    onNavigate("quiz", { questionId: q.id });
  }

  function goRandom() {
    const list = store.questions;
    if (list.length === 0) return;
    const q = list[Math.floor(Math.random() * list.length)];
    store.startQuiz(list);
    onNavigate("quiz", { questionId: q.id });
  }

  function statusLabel(s) {
    return { new: "未做", seen: "看过", correct: "已掌握", wrong: "答错", reviewing: "复习中" }[s] || s;
  }
</script>

<div class="page browse">
  <h1 class="page-title">题库</h1>

  <div class="filters">
    <select bind:value={store.filters.category} onchange={applyFilter}>
      {#each categories as c}
        <option value={c.value}>{c.label}</option>
      {/each}
    </select>
    <select bind:value={store.filters.difficulty} onchange={applyFilter}>
      <option value="">全部难度</option>
      <option value="easy">简单</option>
      <option value="medium">中等</option>
      <option value="hard">困难</option>
    </select>
    <button class="random-btn" onclick={goRandom} disabled={store.questions.length === 0}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 3 21 3 21 8"/>
        <line x1="4" y1="20" x2="21" y2="3"/>
        <polyline points="21 16 21 21 16 21"/>
        <line x1="15" y1="15" x2="21" y2="21"/>
        <line x1="4" y1="4" x2="9" y2="9"/>
      </svg>
      随机一题
    </button>
  </div>

  <div class="search-wrap">
    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      class="search"
      placeholder="搜索题目..."
      bind:value={store.filters.search}
      oninput={() => applyFilter()}
    />
  </div>

  {#if store.loading}
    <p class="loading">加载中...</p>
  {:else if store.questions.length === 0}
    <p class="empty">暂无题目 — 试试调整筛选条件或换个分类</p>
  {:else}
    <div class="list">
      {#each store.questions as q}
        <button class="card q-item" onclick={() => goQuestion(q)}>
          <div class="q-header">
            <span class="tag">{q.category}</span>
            <span class="tag diff {q.difficulty}">{q.difficulty}</span>
            <span class="tag type">{q.type}</span>
            <span class="status tag" class:wrong={q.status === "wrong"}>{statusLabel(q.status)}</span>
          </div>
          <p class="q-title">{q.title}</p>
          {#if q.tags.length > 0}
            <div class="q-tags">
              {#each q.tags.slice(0, 3) as t}
                <span class="mini-tag">{t}</span>
              {/each}
            </div>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .browse { display: flex; flex-direction: column; gap: 12px; }
  .filters { display: flex; gap: 8px; }
  .filters select { flex: 1; }
  .random-btn { white-space: nowrap; padding: 8px 14px; font-size: 13px; background: var(--accent); color: #fff; border: none; border-radius: var(--radius); cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
  .random-btn:disabled { opacity: 0.4; cursor: default; }
  .random-btn:not(:disabled):active { transform: scale(0.96); }
  .loading, .empty { text-align: center; color: var(--text-muted); padding: 40px 0; }
  .list { display: flex; flex-direction: column; gap: 10px; }
  .q-item { text-align: left; width: 100%; }
  .q-header { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
  .search-wrap { position: relative; display: flex; align-items: center; }
  .search-icon { position: absolute; left: 12px; color: var(--text-dim); pointer-events: none; }
  .search { padding-left: 36px; }
  .q-item { border-left: 3px solid transparent; }
  .q-title { font-size: 14px; line-height: 1.4; }
  .q-tags { display: flex; gap: 4px; margin-top: 6px; }
  .mini-tag { font-size: 10px; padding: 1px 6px; border-radius: 3px; background: var(--border); color: var(--text-muted); }
</style>
