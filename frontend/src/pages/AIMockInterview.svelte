<script>
  import { onMount } from "svelte";
  import { hasAI } from "../lib/ai.js";
  import AIConfigPanel from "../components/AIConfigPanel.svelte";
  import { startInterview, nextRound, finishInterview, clearSession, getSession } from "../lib/ai-mock-interview.js";
  import { FILTER_CATEGORIES, categoryLabel } from "../lib/categories.js";
  import { toast } from "../lib/toast.js";

  let { onNavigate, config: initialConfig } = $props();

  let session = $state(null);
  let messages = $state([]);
  let userInput = $state("");
  let aiLoading = $state(false);
  let showSetup = $state(!hasAI());
  let showSummary = $state(false);

  let category = $state(initialConfig?.category || "");
  let difficulty = $state(initialConfig?.difficulty || "");
  let questionCount = $state(initialConfig?.count || 5);

  // Results tracking for each question
  let results = $state([]);

  const categories = FILTER_CATEGORIES;

  onMount(() => {
    const saved = getSession();
    if (saved && saved.questions?.length > 0 && !saved.completedAt) {
      session = saved;
      restoreMessages(saved);
    }
  });

  function restoreMessages(s) {
    const msgs = [];
    let currentQ = null;
    for (const h of s.history) {
      if (h.type === "question") {
        currentQ = s.questions[h.questionIndex];
        msgs.push({ role: "ai", content: h.content, question: currentQ });
      } else if (h.type === "answer") {
        msgs.push({ role: "user", content: h.content });
      } else if (h.type === "followup") {
        msgs.push({ role: "ai", content: h.content, followup: true });
      }
    }
    messages = msgs;
  }

  async function beginInterview() {
    showSetup = false;
    aiLoading = true;
    try {
      session = startInterview({
        category,
        difficulty,
        type: "short_answer",
        count: questionCount,
      });
      results = [];
      messages = [];

      const reply = await nextRound(session);
      messages = [{ role: "ai", content: reply.message, question: session.questions[0] }];
    } catch (e) {
      toast.error("启动面试失败：" + e.message);
      showSetup = true;
    }
    aiLoading = false;
  }

  async function sendAnswer() {
    if (!userInput.trim() || aiLoading || !session) return;
    const answer = userInput.trim();
    userInput = "";

    messages = [...messages, { role: "user", content: answer }];
    aiLoading = true;

    try {
      const reply = await nextRound(session, answer);
      messages = [...messages, { role: "ai", content: reply.message, followup: messages[messages.length - 1]?.role !== "user" }];

      if (reply.done) {
        // Auto-rate the last question
        const lastMsg = messages[messages.length - 2];
        const lastQ = lastMsg?.question || session.questions[session.currentIndex];
        results = [...results, { questionId: lastQ.id, status: "correct", title: lastQ.title }];
        showSummary = true;
      }
    } catch (e) {
      toast.error("AI 回复失败：" + e.message);
    }
    aiLoading = false;
  }

  function finishWithSummary() {
    if (session) {
      finishInterview(session, results);
    }
    showSummary = true;
  }

  function closeSummary() {
    showSummary = false;
    session = null;
    messages = [];
    results = [];
    clearSession();
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  }

  function handleAIConfigSave(hasKey) {
    if (hasKey) showSetup = false;
  }
</script>

<div class="page ai-mi-page">
  {#if showSetup}
    <div class="setup-section">
      {#if !hasAI()}
        <div class="ai-config-block">
          <h2 class="setup-title">AI 模拟面试</h2>
          <p class="setup-desc">配置 AI 服务商后，AI 面试官将根据你的回答动态出题和追问，模拟真实面试体验</p>
          <AIConfigPanel onSave={handleAIConfigSave} />
        </div>
      {/if}

      <h2 class="setup-title">面试设置</h2>
      <label for="mi-cat">分类</label>
      <select id="mi-cat" bind:value={category}>
        {#each categories as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>

      <label for="mi-diff">难度</label>
      <select id="mi-diff" bind:value={difficulty}>
        <option value="">全部</option>
        <option value="easy">简单</option>
        <option value="medium">中等</option>
        <option value="hard">困难</option>
      </select>

      <span class="dialog-label">题量</span>
      <div class="count-options">
        <button class="count-btn" class:active={questionCount === 3} onclick={() => (questionCount = 3)}>3</button>
        <button class="count-btn" class:active={questionCount === 5} onclick={() => (questionCount = 5)}>5</button>
        <button class="count-btn" class:active={questionCount === 8} onclick={() => (questionCount = 8)}>8</button>
        <button class="count-btn" class:active={questionCount === 10} onclick={() => (questionCount = 10)}>10</button>
      </div>

      <button class="start-btn" onclick={beginInterview} disabled={aiLoading}>
        {aiLoading ? "准备中..." : "开始面试"}
      </button>
    </div>

  {:else if showSummary || session?.completedAt}
    <div class="summary-section">
      <h2 class="summary-title">面试总结</h2>
      <p class="summary-subtitle">AI 模拟面试已完成</p>

      <div class="summary-stats">
        <div class="summary-stat">
          <span class="summary-num">{results.length}</span>
          <span class="summary-label">回答题数</span>
        </div>
        <div class="summary-stat">
          <span class="summary-num success">{results.filter(r => r.status === "correct").length}</span>
          <span class="summary-label">通过</span>
        </div>
      </div>

      <div class="summary-questions">
        {#each results as r, i}
          <div class="summary-q-item">
            <span class="sq-index">{i + 1}</span>
            <span class="sq-title">{r.title}</span>
            <span class="sq-status" class:correct={r.status === "correct"}>
              {r.status === "correct" ? "✓" : ""}
            </span>
          </div>
        {/each}
      </div>

      <div class="summary-actions">
        <button class="restart-btn" onclick={closeSummary}>再来一次</button>
        <button class="home-btn" onclick={() => { closeSummary(); onNavigate("home"); }}>返回首页</button>
      </div>
    </div>

  {:else}
    <div class="interview-section">
      <div class="interview-header">
        <span class="interview-badge">AI 模拟面试</span>
        <span class="interview-progress">第 {session.currentIndex + 1}/{session.questions.length} 题</span>
      </div>

      <div class="chat-area">
        {#each messages as msg, i}
          <div class="chat-msg" class:ai-msg={msg.role === "ai"} class:user-msg={msg.role === "user"}>
            <div class="msg-avatar">
              {#if msg.role === "ai"}
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              {:else}
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {/if}
            </div>
            <div class="msg-content">{msg.content}</div>
          </div>
        {/each}
        {#if aiLoading}
          <div class="chat-msg ai-msg">
            <div class="msg-avatar">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div class="msg-content thinking">思考中...</div>
          </div>
        {/if}
      </div>

      {#if !showSummary && !session?.completedAt}
        <div class="input-row">
          <textarea
            class="chat-input"
            bind:value={userInput}
            placeholder="输入你的回答..."
            rows="2"
            onkeydown={handleKeydown}
            disabled={aiLoading}
          ></textarea>
          <button class="send-btn" onclick={sendAnswer} disabled={!userInput.trim() || aiLoading}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ai-mi-page {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* ── Setup ── */
  .setup-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 0;
  }
  .setup-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }
  .setup-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0;
  }
  .ai-config-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 8px;
  }
  .setup-section label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .setup-section select {
    padding: 10px 12px;
    font-family: inherit;
    font-size: 14px;
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    outline: none;
  }
  .dialog-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .count-options {
    display: flex;
    gap: 8px;
  }
  .count-btn {
    flex: 1;
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    text-align: center;
    transition: all 0.2s var(--spring);
  }
  .count-btn:active { transform: scale(0.96); }
  .count-btn.active {
    background: var(--accent-bg);
    color: var(--accent);
    border-color: var(--accent);
  }
  .start-btn {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    font-weight: 700;
    border-radius: var(--radius-sm);
    background: var(--accent-gradient);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
    margin-top: 8px;
    transition: all 0.2s var(--spring);
  }
  .start-btn:active { transform: scale(0.97); opacity: 0.9; }
  .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Interview ── */
  .interview-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 12px;
    padding: 12px 0;
  }
  .interview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .interview-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 8px;
    background: var(--accent-bg);
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .interview-progress {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .chat-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0;
  }
  .chat-msg {
    display: flex;
    gap: 8px;
    animation: fade-in 0.3s var(--spring) both;
  }
  .msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bg-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-dim);
  }
  .ai-msg .msg-avatar {
    background: var(--accent-bg);
    color: var(--accent);
  }
  .msg-content {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    padding: 8px 12px;
    background: var(--bg-surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    white-space: pre-wrap;
    word-break: break-word;
  }
  .ai-msg .msg-content {
    background: var(--bg-card);
    border-color: var(--accent-dim);
  }
  .msg-content.thinking {
    color: var(--text-muted);
    font-style: italic;
  }
  .input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }
  .chat-input {
    flex: 1;
    padding: 10px 12px;
    font-size: 14px;
    font-family: inherit;
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    resize: none;
    outline: none;
    line-height: 1.5;
  }
  .chat-input:focus {
    border-color: var(--accent);
  }
  .send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s var(--spring);
  }
  .send-btn:active { transform: scale(0.9); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Summary ── */
  .summary-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 0;
    align-items: center;
  }
  .summary-title {
    font-size: 22px;
    font-weight: 800;
    margin: 0;
  }
  .summary-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin: -8px 0 0;
  }
  .summary-stats {
    display: flex;
    gap: 16px;
  }
  .summary-stat {
    text-align: center;
    padding: 16px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    min-width: 80px;
  }
  .summary-num {
    display: block;
    font-size: 28px;
    font-weight: 800;
    color: var(--text);
  }
  .summary-num.success { color: var(--success); }
  .summary-label {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
  .summary-questions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .summary-q-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .sq-index {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--bg-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .sq-title {
    flex: 1;
    font-size: 13px;
    color: var(--text);
  }
  .sq-status {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-dim);
  }
  .sq-status.correct { color: var(--success); }
  .summary-actions {
    display: flex;
    gap: 10px;
    width: 100%;
  }
  .restart-btn {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .restart-btn:active { transform: scale(0.97); }
  .home-btn {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .home-btn:active { transform: scale(0.97); }
</style>
