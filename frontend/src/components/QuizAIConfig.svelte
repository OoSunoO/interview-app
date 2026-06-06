<script>
  import {
    hasAI,
    getAIConfig,
    saveAIConfig,
    setProvider,
    PROVIDERS,
    gradeDetailed,
    saveScoreEntry,
    getScoreHistory,
  } from "../lib/ai.js";

  let { q, userAnswer, onGradeResult } = $props();

  let aiGrade = $state(null);
  let aiLoading = $state(false);
  let showAIConfig = $state(false);
  let showScoreHistory = $state(false);
  let apiKeyInput = $state(getAIConfig().key);
  let apiProvider = $state(getAIConfig().provider ?? 0);
  let scoreHistory = $state(getScoreHistory());

  async function gradeWithAI() {
    if (!hasAI()) {
      showAIConfig = true;
      return;
    }
    aiLoading = true;
    aiGrade = null;
    try {
      const result = await gradeDetailed(q.title + "\n" + q.content, userAnswer, q.answer);
      aiGrade = result;
      saveScoreEntry({
        questionId: q.id,
        title: q.title,
        overall: result.overall,
        dimensions: result.dimensions,
      });
      scoreHistory = getScoreHistory();
    } catch (e) {
      aiGrade = { overall: "错误", dimensions: [], suggestion: "评分解读失败：" + e.message };
    }
    aiLoading = false;
  }

  function saveAIKey() {
    setProvider(apiProvider);
    saveAIConfig({ key: apiKeyInput });
    showAIConfig = false;
    if (apiKeyInput) gradeWithAI();
  }

  $effect(() => {
    if (q) {
      scoreHistory = getScoreHistory();
    }
  });
</script>

<div class="ai-grade-trigger-wrap">
  <button class="ai-grade-trigger" onclick={gradeWithAI} disabled={aiLoading}>
    {aiLoading ? "AI 评分中..." : "AI 评分"}
  </button>
</div>

{#if showAIConfig}
  <div class="ai-config">
    <p class="config-hint">选择 AI 服务商并输入 API Key</p>
    <select class="provider-select" bind:value={apiProvider}>
      {#each PROVIDERS as p, i}
        <option value={i}>{p.label}</option>
      {/each}
    </select>
    <div class="config-row">
      <input type="password" bind:value={apiKeyInput} placeholder="输入 API Key..." />
      <button class="config-save" onclick={saveAIKey}>保存</button>
    </div>
  </div>
{/if}

{#if aiGrade}
  <div class="ai-grade">
    {#if aiGrade.dimensions}
      <div class="grade-dimensions">
        {#each aiGrade.dimensions as dim}
          <div class="grade-dim">
            <div class="grade-dim-header">
              <span class="grade-dim-name">{dim.name}</span>
              <span class="grade-dim-score">{dim.score}</span>
            </div>
            <div class="grade-bar-wrap">
              <div class="grade-bar-fill" style="width: {dim.score}%"></div>
            </div>
            {#if dim.comment}
              <p class="grade-dim-comment">{dim.comment}</p>
            {/if}
          </div>
        {/each}
      </div>
      {#if aiGrade.suggestion}
        <div class="grade-suggestion">{aiGrade.suggestion}</div>
      {/if}
    {:else if typeof aiGrade === "string"}
      {#each aiGrade.split("\n") as line}
        <p>{line}</p>
      {/each}
    {:else if aiGrade.raw}
      {#each aiGrade.raw.split("\n") as line}
        <p>{line}</p>
      {/each}
    {/if}
  </div>
  {#if scoreHistory.length > 0}
    <button class="history-toggle" onclick={() => (showScoreHistory = !showScoreHistory)}>
      {showScoreHistory ? "收起" : "查看"}评分历史 ({scoreHistory.length})
    </button>
    {#if showScoreHistory}
      <div class="score-history">
        {#each [...scoreHistory].reverse().slice(0, 10) as entry}
          <div class="score-entry">
            <div class="score-entry-header">
              <span class="score-entry-title">{entry.title}</span>
              <span class="score-entry-overall">{entry.overall}</span>
            </div>
            <div class="score-entry-dims">
              {#each entry.dimensions || [] as dim}
                <span class="score-mini-dim">{dim.name} {dim.score}</span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
{/if}

<style>
  .ai-grade-trigger-wrap {
    margin-top: 12px;
  }
  .ai-grade-trigger {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--accent);
    border: 1px solid var(--accent);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .ai-grade-trigger:hover {
    background: var(--accent-bg);
  }
  .ai-grade-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .ai-grade {
    margin-top: 12px;
    padding: 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 13px;
    line-height: 1.6;
    color: var(--text);
  }
  .ai-grade p {
    margin: 4px 0;
  }
  .grade-dimensions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .grade-dim-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .grade-dim-name {
    font-weight: 600;
    color: var(--text);
  }
  .grade-dim-score {
    font-weight: 700;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
  .grade-bar-wrap {
    height: 6px;
    background: var(--danger-bg);
    border-radius: 3px;
    overflow: hidden;
  }
  .grade-bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 3px;
    transition: width 0.4s var(--spring);
  }
  .grade-dim-comment {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
  .grade-suggestion {
    margin-top: 10px;
    padding: 10px;
    background: var(--accent-bg);
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--accent);
    line-height: 1.5;
  }
  .history-toggle {
    margin-top: 10px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .history-toggle:hover {
    color: var(--text);
    border-color: var(--text-dim);
  }
  .score-history {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .score-entry {
    padding: 8px 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 12px;
  }
  .score-entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .score-entry-title {
    font-weight: 600;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 70%;
  }
  .score-entry-overall {
    font-weight: 700;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
  .score-entry-dims {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .score-mini-dim {
    font-size: 11px;
    color: var(--text-muted);
    padding: 1px 5px;
    background: var(--bg-elevated);
    border-radius: 3px;
  }
  .ai-config {
    margin-top: 12px;
    padding: 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .config-hint {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }
  .provider-select {
    padding: 8px 10px;
    font-size: 13px;
    border-radius: var(--radius-sm);
    background: var(--bg-elevated);
    color: var(--text);
    border: 1px solid var(--border);
    font-family: inherit;
  }
  .config-row {
    display: flex;
    gap: 8px;
  }
  .config-row input {
    flex: 1;
    padding: 8px 10px;
    font-size: 13px;
    border-radius: var(--radius-sm);
    background: var(--bg-elevated);
    color: var(--text);
    border: 1px solid var(--border);
    font-family: inherit;
  }
  .config-save {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .config-save:active {
    transform: scale(0.97);
  }
</style>
