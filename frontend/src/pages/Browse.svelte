<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.js";

  let { onNavigate } = $props();

  const categories = [
    { value: "", label: "全部" },
    { value: "java_basic", label: "Java 基础" },
    { value: "java_advanced", label: "Java 进阶" },
    { value: "ai", label: "AI" },
    { value: "agent", label: "Agent" },
    { value: "algorithm", label: "算法" },
    { value: "system_design", label: "系统设计" },
    { value: "frontend", label: "前端" },
  ];

  onMount(() => { store.loadQuestions(); });

  function applyFilter() {
    store.loadQuestions({ page: 1 });
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
  </div>

  <input
    class="search"
    placeholder="搜索题目..."
    bind:value={store.filters.search}
    oninput={() => applyFilter()}
  />

  {#if store.loading}
    <p class="loading">加载中...</p>
  {:else if store.questions.length === 0}
    <p class="empty">暂无题目</p>
  {:else}
    <div class="list">
      {#each store.questions as q}
        <button class="card q-item" onclick={() => onNavigate("quiz", { questionId: q.id })}>
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
  .page-title { font-size: 22px; font-weight: 700; }
  .filters { display: flex; gap: 8px; }
  .filters select { flex: 1; }
  .loading, .empty { text-align: center; color: var(--text-muted); padding: 40px 0; }
  .list { display: flex; flex-direction: column; gap: 10px; }
  .q-item { text-align: left; width: 100%; background: var(--bg-card); }
  .q-item:active { background: var(--bg-hover); }
  .q-header { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
  .tag { font-size: 11px; padding: 2px 7px; border-radius: 4px; background: var(--bg-hover); }
  .tag.diff.easy { background: #166534; color: #4ade80; }
  .tag.diff.medium { background: #713f12; color: #fbbf24; }
  .tag.diff.hard { background: #7f1d1d; color: #f87171; }
  .tag.wrong { background: #7f1d1d; color: #fca5a5; }
  .q-title { font-size: 14px; line-height: 1.4; }
  .q-tags { display: flex; gap: 4px; margin-top: 6px; }
  .mini-tag { font-size: 10px; padding: 1px 6px; border-radius: 3px; background: var(--border); color: var(--text-muted); }
</style>
