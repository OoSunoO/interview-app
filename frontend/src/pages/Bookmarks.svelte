<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import { categoryLabel } from "../lib/categories.js";
  import { toast } from "../lib/toast.js";
  import { renderContent, renderAnswer } from "../lib/render-utils.js";
  import CodeBlock from "../components/CodeBlock.svelte";

  let { onNavigate } = $props();

  let questions = $state([]);
  let loading = $state(true);
  let detailQuestion = $state(null);
  let showDetailAnswer = $state(false);
  let detailDialog = $state(null);

  function typeLabel(t) {
    return { short_answer: "问答题", choice: "选择题", multiple_choice: "多选题", true_false: "判断题", coding: "编程题", fill_in_blank: "填空题" }[t] || t;
  }

  function loadBookmarks() {
    loading = true;
    questions = api.questions.list({ bookmarked: true });
    loading = false;
  }

  function toggleBookmark(e, q) {
    e.stopPropagation();
    const newVal = api.progress.toggleBookmark(q.id);
    if (!newVal) {
      questions = questions.filter((x) => x.id !== q.id);
    }
    store.refreshStats?.();
    toast.success(newVal ? "已收藏" : "已取消收藏");
  }

  async function openDetail(q) {
    try {
      detailQuestion = await api.questions.get(q.id);
    } catch {
      detailQuestion = q;
    }
    showDetailAnswer = false;
  }

  function closeDetail() {
    detailQuestion = null;
    showDetailAnswer = false;
  }

  function clearAll() {
    if (questions.length === 0) return;
    for (const q of questions) {
      api.progress.toggleBookmark(q.id);
    }
    questions = [];
    store.refreshStats?.();
    toast.success("已取消全部收藏");
  }

  onMount(loadBookmarks);
</script>

<div class="page">
  <div class="bm-header">
    <h1 class="page-title">收藏题目</h1>
    <div class="bm-header-right">
      <span class="bm-count">{questions.length} 题</span>
      {#if questions.length > 0}
        <button class="clear-btn" onclick={clearAll}>取消全部收藏</button>
      {/if}
    </div>
  </div>

  {#if loading}
    <div class="skeleton" style="height:80px"></div>
    <div class="skeleton" style="height:80px;margin-top:10px"></div>
  {:else if questions.length === 0}
    <div class="empty-state">
      <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
        stroke-linejoin="round"><polygon points="19 21 12 17.27 5 21 5 3 19 3 19 21" /></svg>
      <p>还没有收藏题目</p>
      <p class="empty-hint">在题库中点击 ★ 即可收藏题目</p>
      <button class="goto-btn" onclick={() => onNavigate("browse")}>去题库看看</button>
    </div>
  {:else}
    <div class="bm-list">
      {#each questions as q}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="bm-item" onclick={() => openDetail(q)}>
          <div class="bm-item-badges">
            <span class="tag">{categoryLabel(q.category)}</span>
            <span class="tag diff {q.difficulty}">{q.difficulty}</span>
            <span class="tag type">{typeLabel(q.type)}</span>
            {#if q.source}
              <span class="tag company">{q.source}</span>
            {/if}
            <div class="bm-item-right">
              {#if q.wrong_count > 0}
                <span class="bm-wrong">{q.wrong_count} 次错</span>
              {/if}
              <button class="bm-star active" onclick={(e) => toggleBookmark(e, q)} aria-label="取消收藏">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round"><polygon points="19 21 12 17.27 5 21 5 3 19 3 19 21" /></svg>
              </button>
            </div>
          </div>
          <p class="bm-title">{q.title}</p>
          {#if q.tags?.length > 0}
            <div class="bm-tags">
              {#each q.tags.slice(0, 3) as t}
                <span class="mini-tag">{t}</span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Detail Dialog -->
{#if detailQuestion}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={closeDetail} onkeydown={(e) => { if (e.key === "Escape") closeDetail(); }}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="detail-panel" onclick={(e) => e.stopPropagation()} bind:this={detailDialog} tabindex="-1" role="dialog" aria-modal="true">
      <div class="dp-header">
        <div class="dp-badges">
          <span class="tag">{categoryLabel(detailQuestion.category)}</span>
          <span class="tag diff {detailQuestion.difficulty}">{detailQuestion.difficulty}</span>
          <span class="tag type">{typeLabel(detailQuestion.type)}</span>
          {#if detailQuestion.source}
            <span class="tag company">{detailQuestion.source}</span>
          {/if}
        </div>
        <button class="dp-close" onclick={closeDetail} aria-label="关闭">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <h2 class="dp-title">{detailQuestion.title}</h2>
      <div class="dp-content">
        {#each renderContent(detailQuestion.content || "") as part}
          {#if part.type === "code"}
            <CodeBlock code={part.code} lang={part.lang} />
          {:else}
            <p>{part.content}</p>
          {/if}
        {/each}
      </div>
      <button class="dp-reveal" onclick={() => (showDetailAnswer = !showDetailAnswer)}>
        {showDetailAnswer ? "收起答案" : "查看答案"}
      </button>
      {#if showDetailAnswer}
        <div class="dp-answer">
          {#each renderAnswer(detailQuestion.answer || "") as section}
            <div class="dp-ans-section {section.type}">
              <div class="dp-ans-label">
                {#if section.type === "answer"}参考答案
                {:else if section.type === "explanation"}解析
                {:else}扩展延伸
                {/if}
              </div>
              <div class="dp-ans-body">
                {#each section.parts as part}
                  {#if part.type === "code"}
                    <CodeBlock code={part.code} lang={part.lang} />
                  {:else}
                    <p>{part.content}</p>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .bm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 8px;
  }
  .bm-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .bm-count {
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .clear-btn {
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--danger);
    border: 1px solid var(--danger);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .clear-btn:active {
    background: var(--danger-bg);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 60px 20px;
    text-align: center;
    color: var(--text-muted);
  }
  .empty-state p {
    font-size: 15px;
    margin: 0;
  }
  .empty-hint {
    font-size: 13px !important;
    color: var(--text-dim);
  }
  .goto-btn {
    margin-top: 8px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
  .goto-btn:active { transform: scale(0.97); }

  .bm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bm-item {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .bm-item:active {
    transform: scale(0.99);
    background: var(--bg-card-hover);
  }
  .bm-item-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
  }
  .bm-item-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .bm-wrong {
    font-size: 10px;
    font-weight: 600;
    color: var(--danger);
    background: var(--danger-bg);
    padding: 2px 6px;
    border-radius: 3px;
  }
  .bm-star {
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: var(--text-dim);
    display: inline-flex;
    align-items: center;
    border-radius: 3px;
    transition: all 0.2s;
  }
  .bm-star.active {
    color: var(--warning);
  }
  .bm-star:active {
    transform: scale(0.85);
  }
  .bm-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin: 8px 0 4px;
    line-height: 1.4;
  }
  .bm-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .mini-tag {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    background: var(--bg-surface);
    color: var(--text-dim);
  }

  /* Detail panel */
  .detail-panel {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    width: 100%;
    max-width: 560px;
    max-height: 85vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: scale-in 0.3s var(--spring) both;
  }
  .dp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }
  .dp-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .dp-close {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text-muted);
    cursor: pointer;
  }
  .dp-close:active { transform: scale(0.88); }
  .dp-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
    margin: 0;
    line-height: 1.35;
  }
  .dp-content {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
  }
  .dp-content p { margin-bottom: 6px; }
  .dp-reveal {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .dp-reveal:active { transform: scale(0.97); }
  .dp-answer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: fade-up 0.3s var(--spring) both;
  }
  .dp-ans-section {
    padding: 14px 16px;
    border-radius: var(--radius-sm);
  }
  .dp-ans-section.answer {
    background: var(--ans-answer-bg);
    border: 1px solid var(--ans-answer-border);
  }
  .dp-ans-section.explanation {
    background: var(--ans-explanation-bg);
    border: 1px solid var(--ans-explanation-border);
  }
  .dp-ans-section.extension {
    background: var(--ans-extension-bg);
    border: 1px solid var(--ans-extension-border);
  }
  .dp-ans-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .dp-ans-section.answer .dp-ans-label { color: var(--ans-answer-text); }
  .dp-ans-section.explanation .dp-ans-label { color: var(--ans-explanation-text); }
  .dp-ans-section.extension .dp-ans-label { color: var(--ans-extension-text); }
  .dp-ans-body {
    font-size: 13px;
    line-height: 1.6;
  }
  .dp-ans-body p { margin-bottom: 4px; color: var(--text); }
  .dp-ans-body :global(pre),
  .dp-ans-body :global(code) {
    max-width: 100%;
    overflow-x: auto;
  }

  .skeleton { background: var(--bg-card); border-radius: var(--radius); animation: pulse 1.5s ease infinite; }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.25; }
  }
  @media (max-width: 480px) {
    .bm-header { flex-direction: column; align-items: flex-start; gap: 6px; }
    .bm-item { padding: 12px; }
    .bm-title { font-size: 14px; }
    .detail-panel { padding: 16px; }
  }
</style>
