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
    analyzeMistakes,
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
  let knowledgeTags = $state([]);
  let showSchedule = $state(true);
  let loading = $state(true);
  let error = $state(null);
  let currentDetail = $state(null);
  let detailLoading = $state(false);
  let detailVersion = $state(0);
  let lastDetailIndex = $state(-1);
  let analysisResult = $state(null);
  let analysisLoading = $state(false);
  let analysisError = $state(null);

  async function loadReviewDetail(index) {
    const q = wrongQuestions[index];
    if (!q) { currentDetail = null; return; }
    currentDetail = null;
    detailLoading = true;
    const version = ++detailVersion;
    lastDetailIndex = index;
    try {
      const detail = await api.questions.get(q.id);
      if (version === detailVersion) currentDetail = detail;
    } catch {
      if (version === detailVersion) currentDetail = null;
    } finally {
      if (version === detailVersion) detailLoading = false;
    }
  }

  let reviewSchedule = $derived.by(() => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const tomorrowEnd = new Date(todayEnd.getTime() + 86400000);
    const weekEnd = new Date(todayEnd.getTime() + 6 * 86400000);
    const buckets = { overdue: [], today: [], tomorrow: [], this_week: [], later: [] };

    for (const q of wrongQuestions) {
      if (!q.next_review_at) continue;
      const d = new Date(q.next_review_at);
      if (d <= now) buckets.overdue.push(q);
      else if (d <= todayEnd) buckets.today.push(q);
      else if (d <= tomorrowEnd) buckets.tomorrow.push(q);
      else if (d <= weekEnd) buckets.this_week.push(q);
      else buckets.later.push(q);
    }
    return buckets;
  });

  // Only show schedule when any bucket is non-empty
  let hasSchedule = $derived(
    Object.values(reviewSchedule).some((b) => b.length > 0),
  );

  async function loadWrong() {
    loading = true;
    error = null;
    try {
      const [wrong, kp] = await Promise.all([
        api.progress.wrong(),
        api.knowledge.list(),
      ]);
      wrongQuestions = wrong;
      knowledgeTags = kp;
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
    if (wrongQuestions.length === 0) { reviewMode = false; currentDetail = null; }
    else loadReviewDetail(currentIndex);
  }

  async function markWrongAgain() {
    const q = wrongQuestions[currentIndex];
    await api.progress.update(q.id, { status: "wrong", duration_seconds: 0 });
    currentIndex = (currentIndex + 1) % wrongQuestions.length;
    showAnswer = false;
    loadReviewDetail(currentIndex);
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

  let grouped = $derived.by(() => {
    const kpMap = {};
    for (const k of knowledgeTags) kpMap[k.name] = k;

    const groups = {};
    for (const q of wrongQuestions) {
      const tags = (q.tags && q.tags.length > 0) ? q.tags : ["未分类"];
      for (const t of tags) {
        if (!groups[t]) {
          const kp = kpMap[t];
          groups[t] = {
            tag: t,
            questions: [],
            totalWrong: 0,
            totalQuestions: kp?.question_count ?? 0,
            mastery: kp?.mastery ?? 0,
          };
        }
        groups[t].questions.push(q);
        groups[t].totalWrong += q.wrong_count;
      }
    }
    return Object.values(groups).sort((a, b) => b.totalWrong - a.totalWrong);
  });

  async function runAnalysis() {
    if (!hasAI()) {
      showAIConfig = true;
      return;
    }
    analysisLoading = true;
    analysisError = null;
    try {
      analysisResult = await analyzeMistakes(wrongQuestions);
    } catch (e) {
      analysisError = e.message ?? "分析失败";
    } finally {
      analysisLoading = false;
    }
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
          currentDetail = null;
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
        {#if detailLoading}
          <p class="loading" style="padding:20px 0">加载详情...</p>
        {:else if currentDetail}
          <div class="review-content">{currentDetail.content}</div>
        {/if}
      </div>
      {#if showAnswer && currentDetail}
        <div class="review-answer">
          <strong>答案：</strong>
          <div class="review-answer-text">{currentDetail.answer}</div>
        </div>
      {/if}

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
      <h1 class="page-title" data-testid="page-title">错题本</h1>
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
      <button class="start-review btn-gradient" onclick={() => {
        reviewMode = true;
        currentIndex = 0;
        showAnswer = false;
        loadReviewDetail(0);
      }}>
        开始复习 ({wrongQuestions.length})
      </button>

      {#if hasSchedule}
        <div class="schedule-section">
          <button class="schedule-header" onclick={() => (showSchedule = !showSchedule)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            复习日程
            <span class="chevron" class:open={showSchedule}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          {#if showSchedule}
            <div class="schedule-body">
              {#each [
                { key: "overdue", label: "已逾期", cls: "overdue" },
                { key: "today", label: "今天", cls: "" },
                { key: "tomorrow", label: "明天", cls: "" },
                { key: "this_week", label: "本周内", cls: "" },
                { key: "later", label: "以后", cls: "later" },
              ] as bucket}
                {@const items = reviewSchedule[bucket.key]}
                {#if items.length > 0}
                  <div class="schedule-row {bucket.cls}">
                    <span class="schedule-label">{bucket.label}</span>
                    <span class="schedule-count">{items.length} 题</span>
                    <div class="schedule-questions">
                      {#each items.slice(0, 3) as item}
                        <button class="schedule-q" onclick={() => {
                          store.startQuiz(wrongQuestions);
                          onNavigate("quiz", { questionId: item.id });
                        }}>{item.title}</button>
                      {/each}
                      {#if items.length > 3}
                        <span class="schedule-more">等 {items.length} 题</span>
                      {/if}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <div class="analysis-section">
        <button class="analysis-btn" onclick={runAnalysis} disabled={analysisLoading}>
          {#if analysisLoading}
            分析中...
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 2.5-1 5-2.7 6.7L12 12V2z" />
              <path d="M12 12 7 17.3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            AI 错题根因分析
          {/if}
        </button>

        {#if analysisError}
          <p class="analysis-error">{analysisError}</p>
        {/if}

        {#if analysisResult}
          <div class="analysis-result">
            {#if analysisResult.summary}
              <p class="analysis-summary">{analysisResult.summary}</p>
            {/if}

            {#if analysisResult.weakest_points && analysisResult.weakest_points.length > 0}
              <div class="analysis-section-group">
                <h4>薄弱知识点</h4>
                {#each analysisResult.weakest_points as point}
                  <div class="analysis-card {point.severity}">
                    <div class="analysis-card-header">
                      <span class="analysis-point">{point.point}</span>
                      <span class="badge sev-{point.severity}">
                        {point.severity === "high" ? "严重" : point.severity === "medium" ? "中等" : "轻微"}
                      </span>
                    </div>
                    <p class="analysis-card-text">{point.analysis}</p>
                    <span class="analysis-count">错 {point.wrong_count} 次</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if analysisResult.error_patterns && analysisResult.error_patterns.length > 0}
              <div class="analysis-section-group">
                <h4>错误模式</h4>
                {#each analysisResult.error_patterns as pattern}
                  <div class="pattern-card">
                    <strong>{pattern.pattern}</strong>
                    <p>{pattern.detail}</p>
                  </div>
                {/each}
              </div>
            {/if}

            {#if analysisResult.learning_suggestions && analysisResult.learning_suggestions.length > 0}
              <div class="analysis-section-group">
                <h4>学习建议</h4>
                {#each analysisResult.learning_suggestions as suggestion}
                  <div class="suggestion-card {suggestion.priority}">
                    <span class="badge pri-{suggestion.priority}">
                      {suggestion.priority === "high" ? "优先" : suggestion.priority === "medium" ? "建议" : "可选"}
                    </span>
                    <span>{suggestion.suggestion}</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if analysisResult.raw}
              <div class="analysis-raw">{analysisResult.raw}</div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="group-list">
        {#each grouped as group}
          <div class="group">
            <div class="group-header">
              <span class="group-tag">{group.tag}</span>
              <button
                class="kp-nav-btn"
                onclick={() => onNavigate("knowledge-detail", { tag: group.tag })}
                title="查看知识点"
              >
                📖 知识点
              </button>
              <span class="group-wrong">错 {group.totalWrong} 次</span>
            </div>
            {#if group.totalQuestions > 0}
              <div class="group-mastery">
                <div class="progress-bar-wrap">
                  <div class="progress-bar-fill" style="width: {group.mastery}%"></div>
                </div>
                <span class="mastery-label">{group.mastery}% 掌握</span>
              </div>
            {/if}
            <div class="group-questions">
              {#each group.questions as q}
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
          </div>
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
  .group-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .schedule-section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .schedule-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: none;
    color: var(--text);
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }
  .schedule-header .chevron {
    margin-left: auto;
    transition: transform 0.2s;
  }
  .schedule-header .chevron.open {
    transform: rotate(180deg);
  }
  .schedule-body {
    padding: 0 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .schedule-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .schedule-row.overdue .schedule-label {
    color: var(--danger);
    font-weight: 700;
  }
  .schedule-label {
    font-size: 12px;
    color: var(--text-muted);
    min-width: 44px;
    font-weight: 600;
  }
  .schedule-count {
    font-size: 11px;
    color: var(--text-dim);
    background: var(--bg-surface);
    padding: 1px 8px;
    border-radius: 8px;
    font-variant-numeric: tabular-nums;
  }
  .schedule-questions {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
    flex: 1;
  }
  .schedule-q {
    font-size: 11px;
    padding: 2px 8px;
    background: var(--bg-surface);
    color: var(--accent);
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: all 0.15s;
  }
  .schedule-q:active {
    transform: scale(0.95);
    border-color: var(--accent);
  }
  .schedule-more {
    font-size: 11px;
    color: var(--text-dim);
  }
  .schedule-row.later {
    opacity: 0.5;
  }
  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 8px;
  }
  .group-tag {
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
    text-transform: none;
  }
  .group-wrong {
    margin-left: auto;
    font-size: 11px;
    color: var(--text-dim);
    background: var(--danger-bg);
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
  }
  .kp-nav-btn {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 600;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .kp-nav-btn:hover {
    border-color: var(--accent-dim);
  }
  .kp-nav-btn:active {
    transform: scale(0.92);
  }
  .group-mastery {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 0 8px;
  }
  .progress-bar-wrap {
    flex: 1;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--accent);
    transition: width 0.4s var(--spring);
  }
  .mastery-label {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .group-questions {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
  .review-content {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
    margin: 12px 0 0;
    white-space: pre-wrap;
  }
  .review-answer {
    background: var(--accent-bg);
    border: 1px solid var(--accent-dim);
    border-radius: var(--radius);
    padding: 16px 20px;
    animation: fadeIn 0.25s ease;
  }
  .review-answer strong {
    font-size: 13px;
    color: var(--text-muted);
    display: block;
    margin-bottom: 4px;
  }
  .review-answer-text {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
    white-space: pre-wrap;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
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
  .analysis-section {
    margin: 4px 0 8px;
  }
  .analysis-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    font-size: 14px;
    font-weight: 600;
    background: var(--accent-bg);
    border: 1px solid var(--accent-dim);
    color: var(--accent);
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.2s;
  }
  .analysis-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .analysis-btn:active:not(:disabled) {
    background: var(--accent);
    color: #fff;
  }
  .analysis-error {
    font-size: 13px;
    color: var(--danger);
    padding: 8px 0;
  }
  .analysis-result {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 12px;
  }
  .analysis-summary {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }
  .analysis-section-group h4 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    margin: 0 0 8px;
  }
  .analysis-card {
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    margin-bottom: 8px;
    background: var(--bg-card);
  }
  .analysis-card.high {
    border-left: 3px solid var(--danger);
  }
  .analysis-card.medium {
    border-left: 3px solid #eab308;
  }
  .analysis-card.low {
    border-left: 3px solid var(--text-dim);
  }
  .analysis-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .analysis-point {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .analysis-card-text {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-muted);
    margin: 4px 0;
  }
  .analysis-count {
    font-size: 11px;
    color: var(--text-dim);
    font-variant-numeric: tabular-nums;
  }
  .badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .badge.sev-high, .badge.pri-high {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .badge.sev-medium, .badge.pri-medium {
    background: #fef3c7;
    color: #92400e;
  }
  .badge.sev-low, .badge.pri-low {
    background: var(--bg-surface);
    color: var(--text-dim);
  }
  .pattern-card {
    padding: 10px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    margin-bottom: 6px;
  }
  .pattern-card strong {
    font-size: 13px;
    color: var(--text);
  }
  .pattern-card p {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-muted);
    margin: 4px 0 0;
  }
  .suggestion-card {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    margin-bottom: 6px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text);
  }
  .suggestion-card.high {
    background: var(--accent-bg);
    border-color: var(--accent-dim);
  }
  .suggestion-card.medium {
    background: var(--bg-card);
  }
  .suggestion-card.low {
    background: var(--bg-surface);
  }
  .analysis-raw {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-muted);
    white-space: pre-wrap;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px;
  }

  /* ── Mobile ── */
  @media (max-width: 480px) {
    .filter-tabs {
      gap: 6px;
    }
    .filter-tab {
      font-size: 12px;
      padding: 6px 12px;
    }
    .q-item {
      padding: 12px;
    }
    .schedule-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    .schedule-label {
      min-width: auto;
    }
    .schedule-questions {
      width: 100%;
      flex-wrap: wrap;
    }
    .schedule-questions button {
      flex: 1;
      min-width: 0;
    }
    .detail-card-inner {
      padding: 14px;
    }
  }
</style>
