<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.svelte.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";

  let { onNavigate } = $props();
  let expanded = $state({});
  let search = $state("");

  onMount(() => {
    store.loadKnowledge();
  });

  let knowledge = $derived(store.knowledge);
  let filtered = $derived(
    search
      ? knowledge.filter(
          (c) =>
            c.label.toLowerCase().includes(search.toLowerCase()) ||
            c.tags.some((t) => t.name.includes(search)),
        )
      : knowledge,
  );

  function toggle(catName) {
    expanded[catName] = !expanded[catName];
    expanded = { ...expanded };
  }

  function startQuizByTag(catName, tagName) {
    store.loadQuestions({ category: catName, tag: tagName, page_size: 100 });
  }

  function startCategoryQuiz(catName) {
    store.loadQuestions({ category: catName, page_size: 100 });
    // Navigate to browse so questions show up; user can then quiz
    onNavigate("browse");
  }

  function startTagQuiz(catName, tagName) {
    store.loadQuestions({ category: catName, tag: tagName, page_size: 100 });
    onNavigate("browse");
  }

  function pct(done, total) {
    if (total === 0) return 0;
    return Math.round((done / total) * 100);
  }
</script>

<div class="page knowledge">
  <h1 class="page-title" data-testid="page-title">知识点</h1>
  <p class="page-sub">按领域分层浏览，追踪每个知识点的掌握进度</p>

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
    <input class="search" placeholder="搜索领域或知识点..." bind:value={search} />
  </div>

  {#if store.error}
    <ErrorAlert message={store.error} onRetry={() => store.loadKnowledge()} />
  {:else if store.loading}
    <div class="skeleton-list">
      {#each { length: 5 } as _}
        <div class="skeleton-card" style="height:80px"></div>
      {/each}
    </div>
  {:else if filtered.length === 0}
    <p class="empty">无匹配结果 — 试试其他关键词</p>
  {:else}
    <div class="category-list">
      {#each filtered as cat}
        <div class="category-card" class:expanded={expanded[cat.name]}>
          <button class="category-header" onclick={() => toggle(cat.name)}>
            <div class="cat-left">
              <svg
                class="collapse-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class:rotated={expanded[cat.name]}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span class="cat-label">{cat.label}</span>
            </div>
            <div class="cat-right">
              <span class="cat-stat">{cat.done}/{cat.total}</span>
              <span
                class="cat-pct"
                class:green={pct(cat.done, cat.total) >= 80}
                class:yellow={pct(cat.done, cat.total) >= 40 && pct(cat.done, cat.total) < 80}
                class:red={pct(cat.done, cat.total) < 40}>{pct(cat.done, cat.total)}%</span
              >
            </div>
          </button>

          {#if expanded[cat.name]}
            <div class="cat-body">
              <div class="cat-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style="transform: scaleX({pct(cat.done, cat.total) / 100})"
                  ></div>
                </div>
              </div>

              <div class="sub-list">
                {#each cat.tags as tag}
                  <button class="sub-item" onclick={() => startTagQuiz(cat.name, tag.name)}>
                    <div class="sub-left">
                      <span class="sub-name">{tag.name}</span>
                      <span class="sub-count">{tag.done}/{tag.total}</span>
                    </div>
                    <div class="sub-bar-wrap">
                      <div class="sub-bar">
                        <div
                          class="sub-fill"
                          class:green={pct(tag.done, tag.total) >= 80}
                          class:yellow={pct(tag.done, tag.total) >= 40 &&
                            pct(tag.done, tag.total) < 80}
                          class:red={pct(tag.done, tag.total) < 40}
                          style="transform: scaleX({pct(tag.done, tag.total) / 100})"
                        ></div>
                      </div>
                    </div>
                    <svg
                      class="sub-arrow"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                {/each}
              </div>

              <button class="start-cat-quiz" onclick={() => startCategoryQuiz(cat.name)}>
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
                刷全部 {cat.label}
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .knowledge {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .page-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 4px;
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

  .loading,
  .empty {
    text-align: center;
    color: var(--text-muted);
    padding: 40px 0;
  }

  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .skeleton-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    animation: pulse 1.5s ease infinite;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .category-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .category-card.expanded {
    border-color: var(--accent-dim);
  }

  .category-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: none;
    color: var(--text);
    border: none;
    border-radius: 0;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }
  .category-header:hover {
    background: var(--bg-card-hover);
  }
  .category-header:active {
    background: var(--bg-surface);
  }

  .cat-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .collapse-icon {
    color: var(--text-dim);
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  .collapse-icon.rotated {
    transform: rotate(90deg);
  }
  .cat-label {
    font-size: 16px;
    font-weight: 600;
  }

  .cat-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cat-stat {
    font-size: 13px;
    color: var(--text-muted);
  }
  .cat-pct {
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    min-width: 40px;
    text-align: center;
  }
  .cat-pct.green {
    background: var(--success-bg);
    color: var(--success);
  }
  .cat-pct.yellow {
    background: rgba(251, 191, 36, 0.15);
    color: var(--warning);
  }
  .cat-pct.red {
    background: var(--danger-bg);
    color: var(--danger);
  }

  .cat-body {
    padding: 0 16px 14px;
  }

  .cat-progress {
    margin-bottom: 12px;
  }
  .progress-bar {
    height: 5px;
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

  .sub-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sub-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    background: var(--bg-surface);
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: left;
    color: var(--text);
    transition: all 0.15s;
  }
  .sub-item:hover {
    border-color: var(--accent-dim);
    background: var(--bg-card-hover);
  }
  .sub-item:active {
    transform: scale(0.98);
  }

  .sub-left {
    min-width: 80px;
    flex-shrink: 0;
  }
  .sub-name {
    font-size: 14px;
    font-weight: 500;
    display: block;
  }
  .sub-count {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }

  .sub-bar-wrap {
    flex: 1;
  }
  .sub-bar {
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }
  .sub-fill {
    height: 100%;
    border-radius: 3px;
    transform-origin: left;
    transition: transform 0.4s;
  }
  .sub-fill.green {
    background: var(--success);
  }
  .sub-fill.yellow {
    background: var(--warning);
  }
  .sub-fill.red {
    background: var(--danger);
  }

  .sub-arrow {
    color: var(--text-dim);
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .sub-item:hover .sub-arrow {
    opacity: 1;
  }

  .start-cat-quiz {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    font-size: 13px;
    font-weight: 600;
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px dashed var(--accent-dim);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .start-cat-quiz:hover {
    background: rgba(96, 165, 250, 0.18);
    border-style: solid;
  }
  .start-cat-quiz:active {
    transform: scale(0.98);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.25;
    }
  }
</style>
