<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.svelte.js";
  import CodeBlock from "../components/CodeBlock.svelte";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import FillInBlank from "../components/FillInBlank.svelte";
  import { api } from "../lib/local-api.js";
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

  let { questionId, onNavigate } = $props();
  let q = $state(null);
  let loadError = $state(null);
  let showAnswer = $state(false);
  let showHints = $state(false);
  let browseMode = $state(false);
  let expandedSections = $state({ answer: true, explanation: false, extension: false });

  function toggleBrowseMode() {
    browseMode = !browseMode;
    if (browseMode) {
      showAnswer = true;
      expandedSections = { answer: true, explanation: true, extension: true };
    } else {
      resetState();
    }
  }

  function toggleSection(type) {
    expandedSections = { ...expandedSections, [type]: !expandedSections[type] };
  }
  let timer = $state(0);
  let timerInterval = $state(null);
  let saving = $state(false);
  let selectedOption = $state(null);
  let selectedOptions = $state([]);
  let wrongAttempts = $state(0);
  let userAnswer = $state("");
  let showSubmitResult = $state(false);
  let multiSubmitted = $state(false);
  let feedbackResult = $state(null);
  let aiGrade = $state(null);
  let aiLoading = $state(false);
  let showAIConfig = $state(false);
  let showScoreHistory = $state(false);
  let apiKeyInput = $state(getAIConfig().key);
  let apiProvider = $state(getAIConfig().provider ?? 0);

  let scoreHistory = $state([]);
  let knowledgeTags = $state([]);

  // Load knowledge tags for the current question
  function loadKnowledgeTags() {
    if (q) {
      knowledgeTags = api.knowledge.getTagsForQuestion(q.id).filter((t) => t.has_content);
    }
  }

  let sessionProgress = $derived.by(() => {
    const n = store.quizSessionLength;
    if (n === 0) return null;
    return { index: store.quizIndex + 1, total: n };
  });

  async function loadQuestion() {
    loadError = null;
    q = null;
    scoreHistory = getScoreHistory();
    try {
      const result = await store.loadQuestionDetail(questionId);
      if (result) {
        q = result;
        loadKnowledgeTags();
        timerInterval = setInterval(() => timer++, 1000);
      } else {
        loadError = store.error ?? "加载题目失败";
      }
    } catch (e) {
      loadError = e.message ?? "加载题目失败";
    }
  }

  onMount(loadQuestion);

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function submitAnswer() {
    showSubmitResult = true;
  }

  async function selfEvaluate(correct) {
    stopTimer();
    saving = true;
    const status = correct ? "correct" : "wrong";
    await store.markProgress(q.id, status, timer);
    q.status = status;
    feedbackResult = status;
    showAnswer = true;
    saving = false;
  }

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

  function renderContent(text) {
    if (!text) return [{ type: "text", content: "" }];
    const parts = text.split(/(```\w*\n[\s\S]*?```)/g);
    return parts.map((p) => {
      const match = p.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) return { type: "code", lang: match[1], code: match[2].trimEnd() };
      return { type: "text", content: p };
    });
  }

  function answerBody() {
    return q.answer.replace(/^答案[：:]\s*/, "");
  }

  function isOptionCorrect(opt) {
    if (!q) return false;
    if (q.type === "true_false") return answerBody().startsWith(opt);
    const prefix = opt.substring(0, 2).trim().replace(/\.$/, "");
    return answerBody().startsWith(prefix);
  }

  function parseCorrectOptions(answer) {
    const stripped = answer.replace(/^答案[：:]/, "");
    const dot = stripped.indexOf("。");
    const prefix = dot > 0 ? stripped.slice(0, dot).trim() : stripped.trim();
    return prefix.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
  }

  function toggleOption(opt) {
    if (multiSubmitted) return;
    const idx = selectedOptions.indexOf(opt);
    if (idx === -1) {
      selectedOptions = [...selectedOptions, opt];
    } else {
      selectedOptions = selectedOptions.filter((o) => o !== opt);
    }
  }

  async function submitMultiChoice() {
    if (selectedOptions.length === 0) return;
    multiSubmitted = true;
    stopTimer();
    const correct = parseCorrectOptions(q.answer);
    const selected = selectedOptions.map((o) => o.substring(0, 2).trim().replace(/\.$/, ""));
    const allCorrect = correct.length === selected.length &&
      correct.every((c) => selected.includes(c));
    const status = allCorrect ? "correct" : "wrong";
    saving = true;
    await store.markProgress(q.id, status, timer);
    q.status = status;
    feedbackResult = status;
    showAnswer = true;
    saving = false;
  }

  function renderAnswer(text) {
    if (!text) return [];
    const lines = text.split("\n");
    const sections = [];
    let curType = "answer";
    let curLines = [];
    const headerRe = /^(答案|解析|扩展延伸|推荐阅读)[：:]\s*/;

    for (const line of lines) {
      const h = line.match(headerRe);
      if (h) {
        if (curLines.length) sections.push({ type: curType, text: curLines.join("\n").trim() });
        curType = { 答案: "answer", 解析: "explanation" }[h[1]] ?? "extension";
        curLines = [line.slice(h[0].length)];
      } else {
        curLines.push(line);
      }
    }
    if (curLines.length) sections.push({ type: curType, text: curLines.join("\n").trim() });

    const hasMarkers = lines.some((l) => headerRe.test(l));
    if (!hasMarkers) {
      const t = text.trim();
      return t ? [{ type: "answer", parts: renderContent(t) }] : [];
    }
    return sections.map((s) => ({ type: s.type, parts: renderContent(s.text) }));
  }

  async function selectOption(opt) {
    if (selectedOption !== null) return;
    if (isOptionCorrect(opt)) {
      selectedOption = opt;
      stopTimer();
      saving = true;
      await store.markProgress(q.id, "correct", timer);
      showAnswer = true;
      saving = false;
    } else {
      selectedOption = opt;
      wrongAttempts++;
    }
  }

  function retry() {
    selectedOption = null;
  }

  async function giveUp() {
    if (!selectedOption) return;
    stopTimer();
    saving = true;
    await store.markProgress(q.id, "wrong", timer);
    q.status = "wrong";
    showAnswer = true;
    saving = false;
  }

  function resetState() {
    q = null;
    loadError = null;
    showAnswer = browseMode;
    showHints = false;
    expandedSections = browseMode
      ? { answer: true, explanation: true, extension: true }
      : { answer: true, explanation: false, extension: false };
    selectedOption = null;
    selectedOptions = [];
    multiSubmitted = false;
    wrongAttempts = 0;
    userAnswer = "";
    showSubmitResult = false;
    feedbackResult = null;
    aiGrade = null;
    timer = 0;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  async function loadQuestionById(id) {
    loadError = null;
    try {
      const result = await store.loadQuestionDetail(id);
      if (result) {
        q = result;
        loadKnowledgeTags();
        timerInterval = setInterval(() => timer++, 1000);
        return true;
      }
      loadError = store.error ?? "加载题目失败";
      return false;
    } catch (e) {
      loadError = e.message ?? "加载题目失败";
      return false;
    }
  }

  async function goNext() {
    if (!store.hasNext) return;
    store.advanceQuiz();
    const nextId = store.quizSession[store.quizIndex].id;
    resetState();
    await loadQuestionById(nextId);
  }

  async function goPrev() {
    if (!store.hasPrev) return;
    store.retreatQuiz();
    const prevId = store.quizSession[store.quizIndex].id;
    resetState();
    await loadQuestionById(prevId);
  }

  function shuffleRemaining() {
    const session = store.quizSession;
    const idx = store.quizIndex;
    const done = session.slice(0, idx + 1);
    const rest = session.slice(idx + 1);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    store.startQuiz([...done, ...rest]);
  }

  function exit() {
    store.startQuiz([]);
    onNavigate("browse");
  }

  function handleKeydown(e) {
    if (!q || showAnswer) return;
    if (q.type === "choice" && selectedOption === null) {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < q.options.length) {
        selectOption(q.options[idx]);
      }
    }
    if (q.type === "multiple_choice" && !multiSubmitted) {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < q.options.length) {
        toggleOption(q.options[idx]);
      }
      if (e.key === "Enter") submitMultiChoice();
    }
    if (q.type === "true_false") {
      if (e.key === "1" && selectedOption === null) selectOption(q.options[0]);
      if (e.key === "2" && selectedOption === null) selectOption(q.options[1]);
    }
    if (selectedOption !== null && !isOptionCorrect(selectedOption) && !showAnswer) {
      if (e.key === "r" || e.key === "R") retry();
      if (e.key === "g" || e.key === "G") giveUp();
    }
    if (!showAnswer && !showSubmitResult && e.target.tagName !== "TEXTAREA" && q.type !== "choice" && q.type !== "true_false" && q.type !== "multiple_choice") {
      if (e.key === "Enter" && userAnswer.trim()) submitAnswer();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="page quiz">
  {#if loadError}
    <ErrorAlert message={loadError} onRetry={loadQuestion} />
  {:else if !q}
    <p class="loading">加载中...</p>
  {:else}
    <div class="q-meta">
      {#if sessionProgress}
        <span class="q-number-badge">{sessionProgress.index}/{sessionProgress.total}</span>
      {/if}
      <button class="browse-toggle" class:active={browseMode} onclick={toggleBrowseMode}>
        {browseMode ? "浏览" : "答题"}
      </button>
      {#if sessionProgress && !showAnswer}
        <button class="shuffle-btn" onclick={shuffleRemaining} title="随机后续题目">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        </button>
      {/if}
      <span class="q-timer">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
    </div>

    {#if sessionProgress}
      <div class="progress-track">
        <div
          class="progress-fill"
          style="transform: scaleX({sessionProgress.index / sessionProgress.total})"
        ></div>
      </div>
    {/if}

    <div
      class="q-card"
      class:feedback-correct={feedbackResult === "correct"}
      class:feedback-wrong={feedbackResult === "wrong"}
    >
      <div class="q-card-header">
        <span class="cat-pill {q.category}">{q.category}</span>
        <span class="diff-pill {q.difficulty}">{q.difficulty}</span>
        <span class="type-pill {q.type}">{q.type}</span>
      </div>

      <h2 class="q-title" data-testid="question-title">{q.title}</h2>

      {#if q.type !== "fill_in_blank"}
        <div class="q-content">
          {#each renderContent(q.content) as part}
            {#if part.type === "code"}
              <CodeBlock code={part.code} lang={part.lang} />
            {:else}
              <p>{part.content}</p>
            {/if}
          {/each}
        </div>
      {/if}

      {#if q.hints.length > 0 && !showAnswer && !browseMode}
        <button class="hint-trigger" onclick={() => (showHints = !showHints)}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><path
              d="M12 17h.01"
            />
          </svg>
          {showHints ? "收起提示" : "显示提示"} ({q.hints.length})
        </button>
        {#if showHints}
          <ul class="hints-list" data-testid="hints-list">
            {#each q.hints as hint}
              <li>{hint}</li>
            {/each}
          </ul>
        {/if}
      {/if}

      {#if knowledgeTags.length > 0}
        <div class="knowledge-tags">
          <span class="kt-label">📖 相关知识：</span>
          {#each knowledgeTags as kt}
            <button
              class="kt-btn"
              onclick={() => onNavigate("knowledge-detail", { tag: kt.name })}
            >
              {kt.name}
            </button>
          {/each}
        </div>
      {/if}

      {#if !browseMode}
        {#if q.type === "choice" || q.type === "true_false" || q.type === "multiple_choice"}
        <div class="options" role="group" aria-label="选项">
          {#each q.options as opt, i}
            <button
              class="opt-btn" data-testid="option-button"
              class:selected={q.type === "multiple_choice" ? selectedOptions.includes(opt) : selectedOption === opt}
              class:correct={q.type === "multiple_choice" ? (multiSubmitted && parseCorrectOptions(q.answer).includes(opt.substring(0, 2).trim().replace(/\.$/, ""))) : (selectedOption !== null && isOptionCorrect(opt))}
              class:wrong={q.type === "multiple_choice" ? (multiSubmitted && selectedOptions.includes(opt) && !parseCorrectOptions(q.answer).includes(opt.substring(0, 2).trim().replace(/\.$/, ""))) : (selectedOption === opt && !isOptionCorrect(opt))}
              disabled={q.type === "multiple_choice" ? multiSubmitted : selectedOption !== null}
              onclick={() => q.type === "multiple_choice" ? toggleOption(opt) : selectOption(opt)}
            >
              {q.type === "multiple_choice" ? opt : q.options.length > 1 && q.type === "choice" ? `${i + 1}. ` : ""}{opt}
            </button>
          {/each}
        </div>
        {#if q.type === "multiple_choice"}
          {#if !multiSubmitted}
            <button class="submit-btn multi-submit" onclick={submitMultiChoice} disabled={selectedOptions.length === 0}>
              确认提交（已选 {selectedOptions.length} 项）
            </button>
          {:else if !showAnswer}
            <div class="choice-actions">
              <button class="choice-retry" onclick={() => { multiSubmitted = false; selectedOptions = []; }}>重选</button>
              <button class="choice-giveup" onclick={giveUp}>看答案</button>
            </div>
          {/if}
        {/if}
        {#if q.type !== "multiple_choice" && selectedOption !== null && !isOptionCorrect(selectedOption) && !showAnswer}
          <div class="choice-actions">
            <button class="choice-retry" onclick={retry}>再试一次</button>
            <button class="choice-giveup" onclick={giveUp}>看答案</button>
          </div>
        {/if}
      {:else if q.type === "fill_in_blank"}
        <FillInBlank question={q} onAnswered={() => showAnswer = true} />
      {:else}
        {#if !showAnswer}
          <div class="input-area">
            {#if q.type === "coding"}
              <textarea
                class="code-input"
                bind:value={userAnswer}
                placeholder="写下你的代码..."
                rows="8"
                spellcheck="false"
              ></textarea>
            {:else}
              <textarea
                class="answer-input"
                bind:value={userAnswer}
                placeholder="写下你的答案..."
                rows="4"
              ></textarea>
            {/if}
          </div>
          {#if !showSubmitResult}
            <button class="submit-btn" onclick={submitAnswer} disabled={!userAnswer.trim()}
              >提交答案</button
            >
          {:else}
            <div class="self-eval">
              <p class="eval-hint">对比参考答案，你答对了吗？</p>
              <div class="eval-actions">
                <button class="eval-wrong" onclick={() => selfEvaluate(false)}>答错了</button>
                <button class="eval-correct" onclick={() => selfEvaluate(true)}>答对了</button>
              </div>
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
          {/if}
        {/if}
      {/if}
    {/if}
    </div>

    {#if browseMode || showSubmitResult || showAnswer}
      {#key q.id}
        {@const sections = renderAnswer(q.answer)}
        {#each sections as section, i}
          <div class="ans-section {section.type}" data-testid="answer-section" style="animation-delay: {i * 60}ms">
            <button
              class="ans-header"
              onclick={() => toggleSection(section.type)}
              aria-expanded={expandedSections[section.type]}
            >
              <span class="ans-label">
                {#if section.type === "answer"}参考答案
                {:else if section.type === "explanation"}解析
                {:else}扩展延伸
                {/if}
              </span>
              <svg
                class="chevron"
                class:open={expandedSections[section.type]}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {#if expandedSections[section.type]}
              <div class="ans-body">
                {#each section.parts as part}
                  {#if part.type === "code"}
                    <CodeBlock code={part.code} lang={part.lang} />
                  {:else}
                    <p>{part.content}</p>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/key}
    {/if}

    {#if browseMode || showAnswer}
      {#if sessionProgress}
        <div class="nav-actions">
          <button class="nav-btn exit" onclick={exit}>返回题库</button>
          {#if store.hasPrev}
            <button class="nav-btn prev" onclick={goPrev}>← 上一题</button>
          {/if}
          {#if store.hasNext}
            <button class="nav-btn next" onclick={goNext}>下一题 →</button>
          {:else}
            <button class="nav-btn next" onclick={exit}>完成</button>
          {/if}
        </div>
      {:else}
        <div class="nav-actions single">
          <button class="nav-btn exit" onclick={() => onNavigate("browse")}>返回题库</button>
          <button class="nav-btn next" onclick={() => onNavigate("wrong")}>错题本</button>
        </div>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .quiz {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .loading {
    text-align: center;
    color: var(--text-muted);
    padding: 60px 0;
  }

  /* ── Meta Bar ── */
  .q-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .browse-toggle {
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    letter-spacing: 0.5px;
    transition: all 0.3s var(--spring);
  }
  .browse-toggle.active {
    background: var(--accent-bg);
    color: var(--accent);
    border-color: var(--accent);
  }
  .shuffle-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: all 0.3s var(--spring);
  }
  .shuffle-btn:active {
    transform: scale(0.88);
  }
  .q-timer {
    margin-left: auto;
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
  }
  .q-number-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    height: 26px;
    padding: 0 10px;
    border-radius: var(--radius-pill);
    background: var(--accent-bg);
    color: var(--accent);
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  /* ── Progress ── */
  .progress-track {
    height: 2px;
    background: var(--border);
    border-radius: 1px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 1px;
    transform-origin: left;
    transition: transform 0.5s var(--spring);
  }

  /* ── Question Card (Double-Bezel) ── */
  .q-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: calc(var(--radius-lg) + 2px);
    padding: 5px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all 0.4s var(--spring);
  }
  .q-card > :not(:first-child) {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 20px;
    border: 1px solid var(--border-hairline);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.04);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .q-card.feedback-correct > :first-child + * {
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.04),
      0 0 28px var(--success-glow);
    border-color: rgba(74, 222, 128, 0.2);
  }
  .q-card.feedback-wrong > :first-child + * {
    animation: shake 0.35s var(--spring) both;
    border-color: rgba(248, 113, 113, 0.2);
  }

  .q-card-header {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  }

  .cat-pill,
  .diff-pill,
  .type-pill {
    font-size: 10px;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .cat-pill.cs_basics {
    background: rgba(108, 140, 255, 0.1);
    color: #6c8cff;
  }
  .cat-pill.algorithm {
    background: rgba(74, 222, 128, 0.1);
    color: #4ade80;
  }
  .cat-pill.database {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }
  .cat-pill.linux {
    background: rgba(248, 113, 113, 0.1);
    color: #f87171;
  }
  .cat-pill.devops {
    background: rgba(167, 139, 250, 0.1);
    color: #a78bfa;
  }
  .cat-pill.java_basic,
  .cat-pill.java_advanced,
  .cat-pill.java_collections {
    background: rgba(244, 114, 182, 0.1);
    color: #f472b6;
  }
  .cat-pill.react,
  .cat-pill.frontend {
    background: rgba(56, 189, 248, 0.1);
    color: #38bdf8;
  }
  .cat-pill.ai,
  .cat-pill.agent {
    background: rgba(232, 121, 249, 0.1);
    color: #e879f9;
  }
  .cat-pill.system_design {
    background: rgba(251, 146, 60, 0.1);
    color: #fb923c;
  }
  .cat-pill.project_mgmt {
    background: rgba(148, 163, 184, 0.1);
    color: #94a3b8;
  }
  .cat-pill.product {
    background: rgba(74, 222, 128, 0.1);
    color: #4ade80;
  }
  .diff-pill.easy {
    background: var(--success-bg);
    color: var(--success);
  }
  .diff-pill.medium {
    background: var(--warning-bg);
    color: var(--warning);
  }
  .diff-pill.hard {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .type-pill {
    background: var(--bg-surface);
    color: var(--text-muted);
  }
  .type-pill.choice {
    background: rgba(108, 140, 255, 0.1);
    color: #6c8cff;
  }
  .type-pill.true_false {
    background: rgba(167, 139, 250, 0.1);
    color: #a78bfa;
  }
  .type-pill.short_answer {
    background: var(--success-bg);
    color: var(--success);
  }
  .type-pill.coding {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .type-pill.fill_in_blank {
    background: rgba(251, 191, 36, 0.12);
    color: #fbbf24;
  }

  .q-title {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.2px;
    color: var(--text);
  }
  .q-content {
    line-height: 1.75;
    font-size: 15px;
    color: var(--text);
  }
  .q-content p {
    margin-bottom: 8px;
    color: var(--text);
  }

  .hint-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    color: var(--warning);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: var(--radius-pill);
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    width: fit-content;
    transition: all 0.3s var(--spring);
  }
  .hint-trigger:active {
    transform: scale(0.96);
  }
  .hints-list {
    padding-left: 20px;
    color: var(--text-muted);
    font-size: 14px;
  }
  .hints-list li {
    margin-bottom: 6px;
  }

  /* ── Options ── */
  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }
  .opt-btn {
    width: 100%;
    padding: 14px 16px;
    font-size: 15px;
    text-align: left;
    background: var(--bg-surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    transition: all 0.3s var(--spring);
  }
  .opt-btn:active {
    transform: scale(0.98);
  }
  .opt-btn.selected {
    border-color: var(--accent);
    background: var(--accent-bg);
  }
  .opt-btn.correct {
    border-color: var(--success);
    background: var(--success-bg);
    color: var(--success);
    animation: spring-in 0.45s var(--spring) both;
  }
  .opt-btn.wrong {
    border-color: var(--danger);
    background: var(--danger-bg);
    color: var(--danger);
    animation: shake 0.35s var(--spring) both;
  }
  .opt-btn:disabled {
    cursor: default;
    opacity: 1;
  }
  .opt-btn:disabled:not(.correct):not(.wrong) {
    opacity: 0.5;
  }

  .choice-actions {
    display: flex;
    gap: 8px;
  }
  .choice-retry {
    flex: 1;
    padding: 10px;
    background: none;
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
  }
  .choice-giveup {
    flex: 1;
    padding: 10px;
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px;
  }

  /* ── Answer Sections ── */
  .ans-section {
    border-radius: var(--radius);
    overflow: hidden;
    animation: scale-in 0.4s var(--spring) both;
  }
  .ans-section.answer {
    background: var(--ans-answer-bg);
    border: 1px solid var(--ans-answer-border);
  }
  .ans-section.explanation {
    background: var(--ans-explanation-bg);
    border: 1px solid var(--ans-explanation-border);
  }
  .ans-section.extension {
    background: var(--ans-extension-bg);
    border: 1px solid var(--ans-extension-border);
  }
  .ans-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;
    background: none;
    color: inherit;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    border-radius: 0;
    transition: background 0.3s var(--spring);
  }
  .ans-header:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  .ans-header:active {
    transform: none;
  }
  .ans-section.answer .ans-header {
    color: var(--ans-answer-text);
  }
  .ans-section.explanation .ans-header {
    color: var(--ans-explanation-text);
  }
  .ans-section.extension .ans-header {
    color: var(--ans-extension-text);
  }
  .chevron {
    transition: transform 0.3s var(--spring);
    flex-shrink: 0;
  }
  .chevron.open {
    transform: rotate(180deg);
  }
  .ans-body {
    padding: 0 16px 14px;
    animation: fade-up 0.25s var(--spring);
  }
  .ans-body p {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text);
  }
  .ans-body p:not(:last-child) {
    margin-bottom: 8px;
  }

  /* ── Input ── */
  .input-area {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .answer-input,
  .code-input {
    resize: vertical;
    min-height: 80px;
    line-height: 1.6;
    font-size: 16px;
  }
  .code-input {
    font-family: "SF Mono", "Fira Code", "JetBrains Mono", monospace;
    font-size: 13px;
    tab-size: 2;
    background: var(--code-bg);
  }
  .submit-btn {
    width: 100%;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-sm);
  }
  .submit-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  /* ── Self Eval ── */
  .self-eval {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .eval-hint {
    text-align: center;
    font-size: 13px;
    color: var(--text-muted);
  }
  .eval-actions {
    display: flex;
    gap: 10px;
  }
  .eval-wrong {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    background: var(--danger);
    border-radius: var(--radius-sm);
  }
  .eval-correct {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    background: var(--success);
    border-radius: var(--radius-sm);
  }
  .ai-grade-trigger {
    width: 100%;
    padding: 10px;
    font-size: 13px;
    background: none;
    border: 1px solid var(--border);
    color: var(--text-muted);
    border-radius: var(--radius-sm);
  }
  .ai-grade-trigger:disabled {
    opacity: 0.5;
  }

  .ai-grade {
    background: var(--ans-extension-bg);
    border: 1px solid var(--ans-extension-border);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.6;
  }
  .ai-grade p {
    margin-bottom: 4px;
  }
  .grade-dimensions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }
  .grade-dim-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
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
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
    margin: 4px 0;
  }
  .grade-bar-fill {
    height: 100%;
    border-radius: 3px;
    background: var(--accent);
    transition: width 0.6s var(--spring);
  }
  .grade-dim-comment {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.4;
  }
  .grade-suggestion {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    margin-top: 8px;
  }
  .history-toggle {
    width: 100%;
    padding: 8px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--text-dim);
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .score-history {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
    max-height: 300px;
    overflow-y: auto;
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
    gap: 8px;
  }
  .score-entry-title {
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .score-entry-overall {
    color: var(--accent);
    font-weight: 600;
    white-space: nowrap;
  }
  .score-entry-dims {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }
  .score-mini-dim {
    font-size: 10px;
    padding: 1px 6px;
    background: var(--accent-bg);
    color: var(--accent);
    border-radius: 3px;
    font-variant-numeric: tabular-nums;
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

  /* ── Knowledge Tags ── */
  .knowledge-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .kt-label {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
  }
  .kt-btn {
    font-size: 11px;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px solid var(--accent-dim);
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s var(--spring);
  }
  .kt-btn:active {
    transform: scale(0.95);
  }

  /* ── Navigation ── */
  .nav-actions {
    display: flex;
    gap: 8px;
  }
  .nav-actions.single {
    flex-wrap: wrap;
  }
  .nav-btn {
    flex: 1;
    min-width: 90px;
    padding: 12px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    border-radius: var(--radius-sm);
    transition: all 0.3s var(--spring);
  }
  .nav-btn:active {
    transform: scale(0.97);
  }
  .nav-btn.exit {
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .nav-btn.prev {
    background: var(--bg-card);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .nav-btn.next {
    background: var(--accent);
    color: #fff;
    border: none;
  }

  @media (max-width: 480px) {
    .q-title {
      font-size: 15px;
    }
    .q-content {
      font-size: 14px;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .q-content :global(pre),
    .q-content :global(code) {
      max-width: 100%;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .answer-input,
    .code-input {
      min-height: 120px;
      font-size: 16px;
    }
    .opt-btn {
      padding: 12px;
      font-size: 14px;
    }
    .choice-actions {
      flex-direction: column;
    }
    .choice-actions button {
      width: 100%;
    }
    .ans-body {
      font-size: 13px;
      overflow-wrap: break-word;
    }
    .ans-body :global(pre),
    .ans-body :global(code) {
      max-width: 100%;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .nav-actions {
      flex-direction: column;
    }
    .nav-actions .nav-btn {
      width: 100%;
    }
    .page {
      padding: 18px 14px;
    }
  }
</style>
