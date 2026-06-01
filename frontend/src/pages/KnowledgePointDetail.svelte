<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { hasAI, aiChat } from "../lib/ai.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import CodeBlock from "../components/CodeBlock.svelte";

  let { tag, onNavigate } = $props();

  let detail = $state(null);
  let loading = $state(true);
  let error = $state(null);
  let aiSummary = $state(null);
  let aiSummaryLoading = $state(false);

  onMount(async () => {
    await loadDetail();
  });

  async function loadDetail() {
    loading = true;
    error = null;
    try {
      detail = await api.knowledge.get(tag);
      if (detail && hasAI() && !detail.content) generateAISummary();
    } catch (e) {
      error = e?.message || "加载知识点详情失败";
    } finally {
      loading = false;
    }
  }

  async function generateAISummary() {
    if (!detail || detail.questions.length === 0) return;
    aiSummaryLoading = true;
    try {
      const qs = detail.questions.slice(0, 15);
      const prompt = qs
        .map((q, i) => `${i + 1}. ${q.title}\n${q.content.slice(0, 300)}`)
        .join("\n\n");

      const reply = await aiChat(
        "你是一位技术面试官。针对下面这个知识点下的面试题，写一段 150 字以内的学习摘要：包含这个知识点覆盖的核心概念、常见考察角度、以及掌握的难点。直接输出摘要，不要多余格式。",
        [{ role: "user", content: `知识点：${detail.name}\n\n相关题目：\n${prompt}` }],
      );
      aiSummary = reply;
    } catch {
      // silently fall back to heuristic summary
    } finally {
      aiSummaryLoading = false;
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

  // Render markdown-style content with code blocks
  function renderContent(text) {
    if (!text) return [{ type: "text", content: "" }];
    const parts = text.split(/(```\w*\n[\s\S]*?```)/g);
    return parts.map((p) => {
      const match = p.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) return { type: "code", lang: match[1], code: match[2].trimEnd() };
      return { type: "text", content: p };
    });
  }

  // Split markdown content into sections by ## headings
  function parseSections(text) {
    if (!text) return [];
    const lines = text.split("\n");
    const sections = [];
    let current = null;

    for (const line of lines) {
      const heading = line.match(/^## (.+)/);
      if (heading) {
        if (current) sections.push(current);
        current = { title: heading[1], content: [] };
      } else {
        if (!current) {
          current = { title: "", content: [] };
        }
        current.content.push(line);
      }
    }
    if (current) sections.push(current);
    return sections;
  }
</script>

<div class="page kp-detail-page">
  <button class="back-btn" onclick={() => onNavigate("knowledge")}>
    <svg
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

    <!-- Knowledge Content (pre-stored) -->
    {#if detail.content}
      <div class="kp-content card">
        <h2 class="content-heading">知识讲解</h2>
        <div class="content-body">
          {#each parseSections(detail.content) as section}
            {#if section.title}
              <h3 class="content-subheading">{section.title}</h3>
            {/if}
            <div class="content-text">
              {#each renderContent(section.content.join("\n")) as part}
                {#if part.type === "code"}
                  <CodeBlock code={part.code} lang={part.lang} />
                {:else}
                  {#each part.content.split("\n") as line}
                    {#if line.startsWith("### ")}
                      <h4 class="content-h4">{line.slice(4)}</h4>
                    {:else if line.startsWith("- **")}
                      <p class="content-line">{@html line}</p>
                    {:else if line.match(/^\d+\.\s/)}
                      <p class="content-line">{line}</p>
                    {:else if line.startsWith("|")}
                      <p class="content-line table-line">{line}</p>
                    {:else if line.trim() === ""}
                      <br />
                    {:else}
                      <p class="content-line">{line}</p>
                    {/if}
                  {/each}
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {:else if detail.summary || aiSummary}
      <!-- Fallback AI/heuristic summary when no pre-stored content -->
      <div class="kp-summary card">
        <h3 class="section-label">
          知识点综述
          {#if aiSummaryLoading}
            <span class="summary-badge loading">AI 生成中...</span>
          {:else if aiSummary}
            <span class="summary-badge ai">AI 生成</span>
          {/if}
        </h3>
        <p class="summary-text">{aiSummary || detail.summary}</p>
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
                    ><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg
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
                    stroke-linejoin="round"><circle cx="12" cy="12" r="10" /></svg
                  >
                {/if}
              </span>
              <span class="tag">{q.category}</span>
              <span class="tag diff {q.difficulty}">{q.difficulty}</span>
              <span class="tag type">{q.type}</span>
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

  /* Knowledge Content (pre-stored) */
  .kp-content {
    padding: 16px;
  }
  .content-heading {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: var(--accent);
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
  }
  .content-body {
    font-size: 14px;
    line-height: 1.8;
    color: var(--text);
  }
  .content-subheading {
    font-size: 15px;
    font-weight: 700;
    margin: 16px 0 8px 0;
    color: var(--text);
  }
  .content-h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 12px 0 4px 0;
    color: var(--text);
  }
  .content-line {
    margin-bottom: 4px;
    color: var(--text);
  }
  .content-line.table-line {
    font-family: monospace;
    font-size: 12px;
  }
  .content-text {
    margin-bottom: 8px;
  }
  .content-text :global(p) {
    margin-bottom: 6px;
  }
  .content-text :global(code) {
    background: var(--bg-surface);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 13px;
    font-family: monospace;
  }
  .content-text :global(strong) {
    font-weight: 700;
  }

  /* Summary fallback */
  .kp-summary {
    padding: 14px;
  }
  .section-label {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .summary-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 8px;
    letter-spacing: 0.3px;
  }
  .summary-badge.ai {
    background: var(--accent-bg);
    color: var(--accent);
  }
  .summary-badge.loading {
    background: var(--bg-surface);
    color: var(--text-dim);
  }
  .summary-text {
    font-size: 13px;
    line-height: 1.7;
    color: var(--text);
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
