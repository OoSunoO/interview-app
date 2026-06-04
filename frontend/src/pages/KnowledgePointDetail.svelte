<script>
  import { onMount } from "svelte";
  import { marked } from "marked";
  import { api } from "../lib/local-api.js";
  import { categoryLabel } from "../lib/categories.js";
  import { toast } from "../lib/toast.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";

  let { tag, onNavigate } = $props();

  let detail = $state(null);
  let loading = $state(true);
  let error = $state(null);

  onMount(async () => {
    await loadDetail();
  });

  async function loadDetail() {
    loading = true;
    error = null;
    try {
      detail = await api.knowledge.get(tag);
    } catch (e) {
      error = e?.message || "加载知识点详情失败";
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

  function goQuestion(q) {
    onNavigate("quiz", { questionId: q.id });
  }

  async function toggleBookmark(e, q) {
    e.stopPropagation();
    q.bookmarked = !q.bookmarked;
    try {
      await api.progress.toggleBookmark(q.id);
      toast.success(q.bookmarked ? "已收藏" : "已取消收藏");
    } catch {
      q.bookmarked = !q.bookmarked;
      toast.error("操作失败");
    }
  }
</script>

<div class="page kp-detail-page">
  <button class="back-btn" onclick={() => onNavigate("knowledge")}>
    <svg aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
    返回知识点
  </button>

  {#if error}
    <ErrorAlert message={error} onRetry={loadDetail} />
  {:else if loading}
    <div class="skeleton-card" style="height: 100px; margin-bottom: 12px"></div>
    <div class="skeleton-card" style="height: 80px"></div>
    <div class="skeleton-card" style="height: 80px; margin-top: 8px"></div>
    <div class="skeleton-card" style="height: 80px; margin-top: 8px"></div>
  {:else if detail}
    <!-- Header -->
    <div class="kp-header card" data-testid="kp-header">
      <div class="kp-title-row">
        <h1 class="kp-title">{detail.name}</h1>
        {#if detail.question_count > 0}
          <span class="kp-count">{detail.question_count} 道相关题目</span>
        {/if}
      </div>
      <div class="kp-mastery-section">
        <div
          class="mastery-badge"
          style="background: {getMasteryColor(detail.mastery)}22; color: {getMasteryColor(
            detail.mastery,
          )}; border: 1px solid {getMasteryColor(detail.mastery)}44;"
        >
          {getMasteryLabel(detail.mastery)} · {detail.mastery}%
        </div>
      </div>
      {#if detail.categories.length > 0}
        <div class="kp-cats">
          {#each detail.categories as cat}
            <span class="mini-tag">{cat}</span>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Knowledge Content -->
    {#if detail.content}
      <div class="kp-content card">
        <h2 class="content-heading">知识资料</h2>
        <div class="content-body">{@html marked(detail.content)}</div>
      </div>
    {:else}
      <div class="kp-empty card">
        <h2 class="content-heading">知识资料</h2>
        <p class="empty-text">暂无资料</p>
      </div>
    {/if}

    <!-- Related Questions -->
    {#if detail.questions.length > 0}
      <h3 class="section-title">相关题目</h3>
      <div class="question-list">
        {#each detail.questions as q}
          <button class="card q-item status-{q.status}" onclick={() => goQuestion(q)}>
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
                    ><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg
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
                    stroke-linejoin="round"><circle cx="12" cy="12" r="10" /></svg
                  >
                {/if}
              </span>
              <span class="tag">{categoryLabel(q.category)}</span>
              <span class="tag diff {q.difficulty}">{q.difficulty}</span>
              <span class="tag type">{q.type}</span>
              <span
                class="kp-bm-toggle {q.bookmarked ? 'active' : ''}"
                role="button"
                tabindex="0"
                onclick={(e) => toggleBookmark(e, q)}
                onkeydown={(e) => e.key === 'Enter' && toggleBookmark(e, q)}
              >
                <svg aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={q.bookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
            </div>
            <p class="q-title">{q.title}</p>
            <p class="q-content-preview">{q.content.slice(0, 60)}...</p>
          </button>
        {/each}
      </div>
    {:else}
      <p class="no-questions">该知识点暂关联题目，建议独立学习知识内容。</p>
    {/if}
  {/if}
</div>

<style>
  .kp-detail-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--accent);
    font-size: 13px;
    padding: 4px 0;
    cursor: pointer;
    width: fit-content;
  }
  .back-btn:active {
    opacity: 0.7;
  }

  .kp-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .kp-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }
  .kp-title {
    font-size: 20px;
    margin: 0;
  }
  .kp-count {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    background: var(--border);
    padding: 2px 10px;
    border-radius: 8px;
    margin-top: 4px;
  }
  .kp-mastery-section {
    display: flex;
  }
  .mastery-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 12px;
    display: inline-block;
  }
  .kp-cats {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  .mini-tag {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }

  /* Knowledge Content: rendered markdown */
  .kp-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .content-body {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
    overflow-x: auto;
  }
  :global(.content-body h2) {
    font-size: 16px;
    font-weight: 700;
    margin: 16px 0 8px 0;
    color: var(--accent);
  }
  :global(.content-body h2:first-child) {
    margin-top: 0;
  }
  :global(.content-body h3) {
    font-size: 14px;
    font-weight: 700;
    margin: 12px 0 6px 0;
  }
  :global(.content-body p) {
    margin: 6px 0;
  }
  :global(.content-body ul), :global(.content-body ol) {
    margin: 6px 0;
    padding-left: 20px;
  }
  :global(.content-body li) {
    margin: 3px 0;
  }
  :global(.content-body table) {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 13px;
  }
  :global(.content-body th), :global(.content-body td) {
    border: 1px solid var(--border);
    padding: 6px 10px;
    text-align: left;
  }
  :global(.content-body th) {
    background: var(--bg-surface);
    font-weight: 600;
  }
  :global(.content-body code) {
    font-size: 13px;
    background: var(--bg-surface);
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid var(--border);
  }
  :global(.content-body a) {
    color: var(--accent);
    text-decoration: none;
  }
  :global(.content-body hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 12px 0;
  }
  /* Knowledge Content: empty */
  .kp-empty {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .content-heading {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: var(--accent);
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
  }
  .empty-text {
    font-size: 14px;
    color: var(--text-dim);
    margin: 0;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin-top: 4px;
    color: var(--text);
  }

  .question-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .q-item {
    text-align: left;
    width: 100%;
    padding: 14px;
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
  .q-header {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
    flex-wrap: wrap;
    align-items: center;
  }
  .status-icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
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
  .kp-bm-toggle {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    color: var(--text-dim);
    margin-left: auto;
    transition: color 0.2s;
    flex-shrink: 0;
  }
  .kp-bm-toggle:hover {
    color: var(--warning);
  }
  .kp-bm-toggle.active {
    color: var(--warning);
  }
  .q-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 3px;
  }
  .q-content-preview {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .no-questions {
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    padding: 20px 0;
  }

  .skeleton-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    animation: pulse 1.5s ease infinite;
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
