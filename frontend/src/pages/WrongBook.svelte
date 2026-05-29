<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import {
    hasAI,
    getAIConfig,
    saveAIConfig,
    setProvider,
    PROVIDERS,
    socraticChat,
  } from "../lib/ai.js";

  let { onNavigate } = $props();
  let wrongQuestions = $state([]);
  let reviewMode = $state(false);
  let currentIndex = $state(0);
  let showAnswer = $state(false);
  let socraticMsgs = $state([]);
  let socraticLoading = $state(false);
  let chatInput = $state("");
  let showAIConfig = $state(false);
  let apiKeyInput = $state(getAIConfig().key);
  let apiProvider = $state(getAIConfig().provider ?? 0);
  let loading = $state(true);
  let error = $state(null);

  async function loadWrong() {
    loading = true;
    error = null;
    try {
      wrongQuestions = await api.progress.wrong();
    } catch (e) {
      error = e.message ?? "加载错题失败";
    } finally {
      loading = false;
    }
  }

  onMount(loadWrong);

  async function markCorrect() {
    const q = wrongQuestions[currentIndex];
    await api.progress.update(q.id, { status: "correct", duration_seconds: 0 });
    wrongQuestions.splice(currentIndex, 1);
    showAnswer = false;
    if (wrongQuestions.length === 0) reviewMode = false;
  }

  async function markWrongAgain() {
    const q = wrongQuestions[currentIndex];
    await api.progress.update(q.id, { status: "wrong", duration_seconds: 0 });
    currentIndex = (currentIndex + 1) % wrongQuestions.length;
    showAnswer = false;
  }

  async function startSocratic() {
    if (!hasAI()) {
      showAIConfig = true;
      return;
    }
    const q = wrongQuestions[currentIndex];
    socraticLoading = true;
    socraticMsgs = [];
    try {
      const reply = await socraticChat(q.title, "", q.answer, []);
      socraticMsgs = [{ role: "ai", content: reply }];
    } catch (e) {
      socraticMsgs = [{ role: "ai", content: "对话启动失败：" + e.message }];
    }
    socraticLoading = false;
  }

  async function sendChat() {
    if (!chatInput.trim()) return;
    const q = wrongQuestions[currentIndex];
    const userMsg = chatInput.trim();
    chatInput = "";
    socraticMsgs = [...socraticMsgs, { role: "user", content: userMsg }];
    socraticLoading = true;
    try {
      const history = socraticMsgs.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      }));
      const reply = await socraticChat(q.title, "", q.answer, history);
      socraticMsgs = [...socraticMsgs, { role: "ai", content: reply }];
    } catch (e) {
      socraticMsgs = [...socraticMsgs, { role: "ai", content: "对话出错：" + e.message }];
    }
    socraticLoading = false;
  }

  function saveAIKey() {
    setProvider(apiProvider);
    saveAIConfig({ key: apiKeyInput });
    showAIConfig = false;
    if (apiKeyInput) startSocratic();
  }
</script>

<div class="page wrong">
  {#if reviewMode}
    <div class="review-header">
      <button
        class="back-btn"
        onclick={() => {
          reviewMode = false;
          showAnswer = false;
        }}>← 退出</button
      >
      <span class="review-progress">{currentIndex + 1}/{wrongQuestions.length}</span>
    </div>

    {#if wrongQuestions.length > 0}
      <div class="review-card">
        <div class="q-info">
          <span class="tag">{wrongQuestions[currentIndex].category}</span>
          <span class="tag diff {wrongQuestions[currentIndex].difficulty}"
            >{wrongQuestions[currentIndex].difficulty}</span
          >
          <span class="wrong-badge-sm">答错 {wrongQuestions[currentIndex].wrong_count} 次</span>
        </div>
        <h2 class="review-title">{wrongQuestions[currentIndex].title}</h2>
      </div>

      <button
        class="reveal-btn"
        class:revealed={showAnswer}
        onclick={() => (showAnswer = !showAnswer)}
      >
        {showAnswer ? "隐藏答案" : "查看答案"}
      </button>

      {#if showAnswer}
        <div class="review-actions">
          <button class="wrong-btn" onclick={markWrongAgain}>还是不会</button>
          <button class="correct-btn" onclick={markCorrect}>掌握了</button>
        </div>
        <button class="socratic-btn" onclick={startSocratic} disabled={socraticLoading}>
          {socraticLoading ? "思考中..." : "🤖 AI 苏格拉底式探讨"}
        </button>
      {/if}

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

      {#if socraticMsgs.length > 0}
        <div class="socratic-chat">
          {#each socraticMsgs as msg}
            <div class="chat-msg {msg.role}">
              <div class="msg-content">{msg.content}</div>
            </div>
          {/each}
          {#if !showAnswer}
            <div class="chat-input-row">
              <input
                bind:value={chatInput}
                placeholder="输入你的回答..."
                onkeydown={(e) => e.key === "Enter" && sendChat()}
              />
              <button
                class="chat-send"
                onclick={sendChat}
                disabled={socraticLoading || !chatInput.trim()}>发送</button
              >
            </div>
          {/if}
        </div>
      {/if}
    {:else}
      <p class="empty">全部掌握！🎉</p>
    {/if}
  {:else}
    <div class="wrong-header">
      <h1 class="page-title">错题本</h1>
      {#if !loading}
        <span class="wrong-badge">{wrongQuestions.length}</span>
      {/if}
    </div>

    {#if error}
      <ErrorAlert message={error} onRetry={loadWrong} />
    {:else if loading}
      <p class="loading">加载中...</p>
    {:else if wrongQuestions.length === 0}
      <p class="empty">暂无错题 — 继续保持！可以去题库刷更多题</p>
    {:else}
      <p class="summary">共 {wrongQuestions.length} 道待复习</p>
      <button class="start-review btn-gradient" onclick={() => (reviewMode = true)}>
        开始复习 ({wrongQuestions.length})
      </button>

      <div class="list">
        {#each wrongQuestions as q}
          <button
            class="card"
            onclick={() => {
              store.startQuiz(wrongQuestions);
              onNavigate("quiz", { questionId: q.id });
            }}
          >
            <div class="q-header">
              <span class="tag">{q.category}</span>
              <span class="tag diff {q.difficulty}">{q.difficulty}</span>
              <span class="wrong-count">答错 {q.wrong_count} 次</span>
            </div>
            <p class="q-title-text">{q.title}</p>
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .wrong {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .empty {
    text-align: center;
    color: var(--text-muted);
    padding: 40px 0;
    font-size: 18px;
  }
  .loading {
    text-align: center;
    color: var(--text-muted);
    padding: 60px 0;
  }
  .wrong-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wrong-badge {
    background: var(--danger-bg);
    color: var(--danger);
    font-size: 13px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 12px;
    font-variant-numeric: tabular-nums;
  }
  .summary {
    color: var(--text-muted);
    font-size: 14px;
  }
  .start-review {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--radius);
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .wrong .card {
    text-align: left;
    width: 100%;
    padding: 14px;
    color: var(--text);
    cursor: pointer;
    border-left: 3px solid rgba(248, 113, 113, 0.3);
  }
  .q-header {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 6px;
    align-items: center;
  }
  .wrong-count {
    margin-left: auto;
    color: var(--danger);
    font-size: 12px;
  }
  .q-title-text {
    font-size: 14px;
    line-height: 1.4;
  }
  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }
  .back-btn {
    background: none;
    color: var(--text-dim);
    padding: 8px 0;
    font-size: 14px;
  }
  .review-progress {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .q-info {
    display: flex;
    gap: 8px;
    font-size: 13px;
    color: var(--text-muted);
    align-items: center;
    flex-wrap: wrap;
  }
  .q-info .wrong-badge-sm {
    margin-left: auto;
    font-size: 11px;
    color: var(--danger);
    background: var(--danger-bg);
    padding: 2px 8px;
    border-radius: 4px;
  }
  .review-title {
    font-size: 17px;
    font-weight: 600;
    line-height: 1.5;
    margin: 8px 0 4px;
  }
  .reveal-btn {
    width: 100%;
    padding: 16px;
    background: var(--bg-surface);
    color: var(--text);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .reveal-btn:active {
    background: var(--bg-card-hover);
    border-style: solid;
    border-color: var(--accent-dim);
  }
  .reveal-btn.revealed {
    border-style: solid;
    border-color: var(--accent-dim);
    background: var(--accent-bg);
  }
  .review-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }
  .review-actions button {
    flex: 1;
    padding: 16px;
    font-weight: 600;
    border-radius: var(--radius);
  }
  .correct-btn {
    background: var(--success);
  }
  .wrong-btn {
    background: var(--danger);
  }
  .review-card {
    background: var(--bg-card);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 20px;
  }
  .socratic-btn {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    background: none;
    border: 1px solid var(--border);
    color: var(--text-muted);
    margin-top: 8px;
  }
  .socratic-chat {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--bg-surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    padding: 14px;
    max-height: 400px;
    overflow-y: auto;
  }
  .chat-msg {
    max-width: 90%;
  }
  .chat-msg.ai {
    align-self: flex-start;
  }
  .chat-msg.user {
    align-self: flex-end;
  }
  .msg-content {
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    line-height: 1.6;
  }
  .chat-msg.ai .msg-content {
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .chat-msg.user .msg-content {
    background: var(--accent-bg);
    border: 1px solid var(--accent-dim);
    color: var(--text);
  }
  .chat-input-row {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .chat-input-row input {
    flex: 1;
  }
  .chat-send {
    white-space: nowrap;
    padding: 10px 16px;
  }
  .ai-config {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px;
  }
  .config-hint {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .provider-select {
    margin-bottom: 8px;
  }
  .config-row {
    display: flex;
    gap: 8px;
  }
  .config-row input {
    flex: 1;
  }
  .config-save {
    white-space: nowrap;
    padding: 10px 16px;
  }
</style>
