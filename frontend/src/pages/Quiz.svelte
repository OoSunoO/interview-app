<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.svelte.js";
  import CodeBlock from "../components/CodeBlock.svelte";
  import { hasAI, getAIConfig, saveAIConfig, setProvider, PROVIDERS, gradeAnswer } from "../lib/ai.js";

  let { questionId, onNavigate } = $props();
  let q = $state(null);
  let showAnswer = $state(false);
  let showHints = $state(false);
  let timer = $state(0);
  let timerInterval = $state(null);
  let saving = $state(false);
  let selectedOption = $state(null);
  let wrongAttempts = $state(0);
  let userAnswer = $state("");
  let showSubmitResult = $state(false);
  let aiGrade = $state(null);
  let aiLoading = $state(false);
  let showAIConfig = $state(false);
  let apiKeyInput = $state(getAIConfig().key);
  let apiProvider = $state(getAIConfig().provider ?? 0);

  let sessionProgress = $derived.by(() => {
    const n = store.quizSessionLength;
    if (n === 0) return null;
    return { index: store.quizIndex + 1, total: n };
  });

  onMount(async () => {
    q = await store.loadQuestionDetail(questionId);
    timerInterval = setInterval(() => timer++, 1000);
  });

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
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
    showAnswer = true;
    saving = false;
  }

  async function gradeWithAI() {
    if (!hasAI()) { showAIConfig = true; return; }
    aiLoading = true;
    aiGrade = null;
    try {
      aiGrade = await gradeAnswer(q.title + "\n" + q.content, userAnswer, q.answer);
    } catch (e) {
      aiGrade = "评分解读失败：" + e.message;
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
    return parts.map(p => {
      const match = p.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) return { type: "code", lang: match[1], code: match[2].trimEnd() };
      return { type: "text", content: p };
    });
  }

  function isOptionCorrect(opt) {
    if (!q) return false;
    if (q.type === "true_false") return q.answer.startsWith(opt);
    return q.answer.startsWith(opt.substring(0, 2));
  }

  function renderAnswer(text) {
    if (!text) return [];
    const lines = text.split('\n');
    const sections = [];
    let curType = "answer";
    let curLines = [];
    const headerRe = /^(答案|解析|扩展延伸|推荐阅读)[：:]\s*/;

    for (const line of lines) {
      const h = line.match(headerRe);
      if (h) {
        if (curLines.length) sections.push({ type: curType, text: curLines.join('\n').trim() });
        curType = { 答案: "answer", 解析: "explanation" }[h[1]] ?? "extension";
        curLines = [line.slice(h[0].length)];
      } else {
        curLines.push(line);
      }
    }
    if (curLines.length) sections.push({ type: curType, text: curLines.join('\n').trim() });

    const hasMarkers = lines.some(l => headerRe.test(l));
    if (!hasMarkers) {
      const t = text.trim();
      return t ? [{ type: "answer", parts: renderContent(t) }] : [];
    }
    return sections.map(s => ({ type: s.type, parts: renderContent(s.text) }));
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
    showAnswer = false;
    showHints = false;
    selectedOption = null;
    wrongAttempts = 0;
    userAnswer = "";
    showSubmitResult = false;
    aiGrade = null;
    timer = 0;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  async function goNext() {
    if (!store.hasNext) return;
    store.advanceQuiz();
    const nextId = store.quizSession[store.quizIndex].id;
    resetState();
    q = await store.loadQuestionDetail(nextId);
    timerInterval = setInterval(() => timer++, 1000);
  }

  async function goPrev() {
    if (!store.hasPrev) return;
    store.retreatQuiz();
    const prevId = store.quizSession[store.quizIndex].id;
    resetState();
    q = await store.loadQuestionDetail(prevId);
    timerInterval = setInterval(() => timer++, 1000);
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
    if (q.type === "true_false") {
      if (e.key === "1" && selectedOption === null) selectOption(q.options[0]);
      if (e.key === "2" && selectedOption === null) selectOption(q.options[1]);
    }
    if (selectedOption !== null && !isOptionCorrect(selectedOption) && !showAnswer) {
      if (e.key === "r" || e.key === "R") retry();
      if (e.key === "g" || e.key === "G") giveUp();
    }
    if (!showAnswer && !showSubmitResult && (q.type !== "choice" && q.type !== "true_false")) {
      if (e.key === "Enter" && userAnswer.trim()) submitAnswer();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="page quiz">
  {#if !q}
    <p class="loading">加载中...</p>
  {:else}
    <div class="q-meta">
      <span class="tag">{q.category}</span>
      <span class="tag diff {q.difficulty}">{q.difficulty}</span>
      <span class="tag">{q.type}</span>
      {#if sessionProgress}
        <span class="progress-text">{sessionProgress.index}/{sessionProgress.total}</span>
      {/if}
      {#if sessionProgress && !showAnswer}
        <button class="shuffle-btn" onclick={shuffleRemaining} title="随机后续题目">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8"/>
            <line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/>
            <line x1="15" y1="15" x2="21" y2="21"/>
            <line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
        </button>
      {/if}
      <span class="timer">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
    </div>

    {#if sessionProgress}
      <div class="progress-bar">
        <div class="progress-fill" style="transform: scaleX({sessionProgress.index / sessionProgress.total})"></div>
      </div>
    {/if}

    <h2 class="q-title">{q.title}</h2>

    <div class="q-content">
      {#each renderContent(q.content) as part}
        {#if part.type === "code"}
          <CodeBlock code={part.code} lang={part.lang} />
        {:else}
          <p>{part.content}</p>
        {/if}
      {/each}
    </div>

    {#if q.hints.length > 0 && !showAnswer}
      <button class="hint-btn" onclick={() => showHints = !showHints}>
        {showHints ? "隐藏提示" : "显示提示"} ({q.hints.length})
      </button>
      {#if showHints}
        <ul class="hints">
          {#each q.hints as hint}
            <li>{hint}</li>
          {/each}
        </ul>
      {/if}
    {/if}

    {#if q.type === "choice" || q.type === "true_false"}
      <div class="options" role="group" aria-label="选项">
        {#each q.options as opt, i}
          <button class="option-btn"
            class:selected={selectedOption === opt}
            class:correct={selectedOption !== null && isOptionCorrect(opt)}
            class:wrong={selectedOption === opt && !isOptionCorrect(opt)}
            disabled={selectedOption !== null}
            onclick={() => selectOption(opt)}
          >
            {q.options.length > 1 && q.type === "choice" ? `${i + 1}. ` : ""}{opt}
          </button>
        {/each}
      </div>
      {#if selectedOption !== null && !isOptionCorrect(selectedOption) && !showAnswer}
        <div class="retry-actions">
          <button class="retry-btn" onclick={retry}>再试一次</button>
          <button class="giveup-btn" onclick={giveUp}>看答案</button>
        </div>
      {/if}
    {:else}
      {#if !showAnswer}
        <div class="input-area">
          {#if q.type === "coding"}
            <textarea class="code-input" bind:value={userAnswer} placeholder="写下你的代码..." rows="8" spellcheck="false"></textarea>
          {:else}
            <textarea class="answer-input" bind:value={userAnswer} placeholder="写下你的答案..." rows="4"></textarea>
          {/if}
        </div>
        {#if !showSubmitResult}
          <button class="submit-btn" onclick={submitAnswer} disabled={!userAnswer.trim()}>提交答案</button>
        {:else}
          <div class="self-eval">
            <p class="eval-hint">对比参考答案，你答对了吗？</p>
            <div class="eval-actions">
              <button class="wrong-btn" onclick={() => selfEvaluate(false)}>答错了</button>
              <button class="correct-btn" onclick={() => selfEvaluate(true)}>答对了</button>
            </div>
            <button class="ai-grade-btn" onclick={gradeWithAI} disabled={aiLoading}>
              {aiLoading ? "AI 评分中..." : "🤖 AI 评分"}
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
              {#each aiGrade.split('\n') as line}
                <p>{line}</p>
              {/each}
            </div>
          {/if}
        {/if}
      {/if}
    {/if}

    {#if showSubmitResult || showAnswer}
      <div class="answer-sections">
        {#each renderAnswer(q.answer) as section}
          <div class="answer-section {section.type}">
            <h3>
              {#if section.type === "answer"}参考答案
              {:else if section.type === "explanation"}解析
              {:else}扩展延伸
              {/if}
            </h3>
            {#each section.parts as part}
              {#if part.type === "code"}
                <CodeBlock code={part.code} lang={part.lang} />
              {:else}
                <p>{part.content}</p>
              {/if}
            {/each}
          </div>
        {/each}
      </div>

      {#if showAnswer}
        {#if sessionProgress}
          <div class="nav-actions">
            <button onclick={exit} class="nav-btn">返回题库</button>
            {#if store.hasPrev}
              <button onclick={goPrev} class="nav-btn">← 上一题</button>
            {/if}
            {#if store.hasNext}
              <button onclick={goNext} class="nav-btn primary">下一题 →</button>
            {:else}
              <button onclick={exit} class="nav-btn primary">完成</button>
            {/if}
          </div>
        {:else}
          <div class="after-actions">
            <button onclick={() => onNavigate("browse")}>返回题库</button>
            <button onclick={() => onNavigate("wrong")}>查看错题本</button>
          </div>
        {/if}
      {/if}
    {/if}
  {/if}
</div>

<style>
  .quiz { display: flex; flex-direction: column; gap: 14px; }
  .loading { text-align: center; color: var(--text-muted); padding: 60px 0; }
  .q-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .progress-text { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-left: 4px; }
  .shuffle-btn { background: none; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 4px; cursor: pointer; line-height: 1; display: inline-flex; align-items: center; color: var(--text-muted); }
  .shuffle-btn:active { transform: scale(0.88); }
  .timer { margin-left: auto; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--text-muted); }
  .progress-bar { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transform-origin: left; transition: transform 0.3s ease; }
  .q-title { font-size: 17px; font-weight: 600; }
  .q-content { line-height: 1.7; font-size: 15px; }
  .q-content p { margin-bottom: 8px; }
  .hint-btn { background: none; color: var(--warning); border: 1px solid var(--warning); padding: 8px; }
  .hints { padding-left: 20px; color: var(--text-muted); font-size: 14px; }
  .hints li { margin-bottom: 6px; }
  .answer-sections { display: flex; flex-direction: column; gap: 12px; }
  .answer-section { border-radius: var(--radius); padding: 16px; border: 1px solid; }
  .answer-section.answer { background: var(--ans-answer-bg); border-color: var(--ans-answer-border); }
  .answer-section.answer h3 { color: var(--ans-answer-text); }
  .answer-section.explanation { background: var(--ans-explanation-bg); border-color: var(--ans-explanation-border); }
  .answer-section.explanation h3 { color: var(--ans-explanation-text); }
  .answer-section.extension { background: var(--ans-extension-bg); border-color: var(--ans-extension-border); }
  .answer-section.extension h3 { color: var(--ans-extension-text); }
  .answer-section h3 { font-size: 14px; margin-bottom: 8px; }
  .answer-section p { font-size: 14px; line-height: 1.7; }
  .wrong-btn { background: var(--danger); }
  .wrong-btn:disabled { background: var(--danger-bg); }
  .correct-btn { background: var(--success); }
  .correct-btn:disabled { background: var(--success-bg); }
  .options { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .option-btn { width: 100%; padding: 14px; font-size: 15px; text-align: left; background: var(--bg-card); color: var(--text); border: 2px solid var(--border); transition: all 0.2s; }
  .option-btn:active { transform: scale(0.98); }
  .option-btn.selected { border-color: var(--accent); }
  .option-btn.correct { border-color: var(--success); background: var(--success-bg); color: var(--success); }
  .option-btn.wrong { border-color: var(--danger); background: var(--danger-bg); color: var(--danger); }
  .option-btn:disabled { cursor: default; opacity: 1; }
  .option-btn:disabled:not(.correct):not(.wrong) { opacity: 0.6; }
  .nav-actions, .after-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .nav-btn { flex: 1; min-width: 100px; padding: 12px; font-size: 14px; text-align: center; background: var(--bg-card); color: var(--text); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; }
  .nav-btn:active { transform: scale(0.97); }
  .nav-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); font-weight: 600; }
  .after-actions button { flex: 1; padding: 12px; font-size: 14px; }
  .input-area { display: flex; flex-direction: column; gap: 8px; }
  .answer-input, .code-input { resize: vertical; min-height: 80px; line-height: 1.6; font-size: 16px; }
  .code-input { font-family: "SF Mono", "Fira Code", "JetBrains Mono", monospace; font-size: 13px; tab-size: 2; background: var(--code-bg); border-color: var(--border); }
  .code-input:focus { border-color: var(--accent-dim); }
  .submit-btn { width: 100%; padding: 14px; font-size: 15px; font-weight: 600; }
  .submit-btn:disabled { opacity: 0.4; cursor: default; }
  .self-eval { display: flex; flex-direction: column; gap: 10px; }
  .eval-hint { text-align: center; font-size: 14px; color: var(--text-muted); }
  .eval-actions { display: flex; gap: 12px; }
  .eval-actions button { flex: 1; padding: 14px; font-size: 15px; font-weight: 600; }
  .ai-grade-btn { width: 100%; margin-top: 8px; padding: 10px; font-size: 14px; background: none; border: 1px solid var(--border); color: var(--text-muted); }
  .ai-grade-btn:disabled { opacity: 0.5; }
  .ai-grade { background: var(--ans-extension-bg); border: 1px solid var(--ans-extension-border); border-radius: var(--radius-sm); padding: 12px 16px; margin-top: 8px; font-size: 14px; line-height: 1.6; }
  .ai-grade p { margin-bottom: 4px; }
  .ai-config { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; }
  .config-hint { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
  .provider-select { margin-bottom: 8px; }
  .config-row { display: flex; gap: 8px; }
  .config-row input { flex: 1; }
  .config-save { white-space: nowrap; padding: 10px 16px; }
  .retry-actions { display: flex; gap: 8px; margin-top: 4px; }
  .retry-btn { flex: 1; padding: 12px; background: none; color: var(--accent); border: 1px solid var(--accent); }
  .giveup-btn { flex: 1; padding: 12px; background: none; color: var(--text-muted); border: 1px solid var(--border); }
  .giveup-full { width: 100%; padding: 12px; background: none; color: var(--text-muted); border: 1px solid var(--border); margin-top: 4px; }

  @media (max-width: 480px) {
    .q-title { font-size: 16px; }
    .q-content { font-size: 14px; }
    .answer-input, .code-input { min-height: 120px; font-size: 16px; }
    .option-btn { padding: 12px; font-size: 14px; }
    .eval-actions button { padding: 14px; }
    .page { padding: 14px 12px; }
  }
</style>
