<script>
  import { onMount } from "svelte";
  import { store } from "../lib/stores.svelte.js";
  import { categoryLabel } from "../lib/categories.js";
  import CodeBlock from "../components/CodeBlock.svelte";
  import ErrorAlert from "../components/ErrorAlert.svelte";
  import FillInBlank from "../components/FillInBlank.svelte";
  import { renderContent, renderAnswer } from "../lib/render-utils.js";
  import { api } from "../lib/local-api.js";
  import { toast } from "../lib/toast.js";
  import QuizAIConfig from "../components/QuizAIConfig.svelte";
  import QuizSessionSummary from "../components/QuizSessionSummary.svelte";

  let { questionId, onNavigate, mockInterview = null } = $props();
  let q = $state(null);
  let loadError = $state(null);
  let showAnswer = $state(false);
  let showHints = $state(false);
  let browseMode = $state(false);
  let expandedSections = $state({ answer: true, explanation: false, extension: false });

  // Mock interview mode
  let interviewed = $derived(!!mockInterview);
  let timeLimit = $derived(mockInterview?.timeLimit ?? 0);
  let countdown = $state(0);
  let autoAdvancing = $state(false);

  function miFilterLabel(config) {
    const parts = [];
    if (config?.category) parts.push(config.category);
    if (config?.difficulty) parts.push({ easy: "简单", medium: "中等", hard: "困难" }[config.difficulty] || config.difficulty);
    if (config?.tag) parts.push(config.tag);
    return parts.length ? parts.join(" · ") : null;
  }

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
  let sessionResults = $state([]);
  let showSessionSummary = $state(false);
  let sessionSummary = $derived.by(() => {
    const correct = sessionResults.filter(r => r.status === "correct").length;
    const wrong = sessionResults.filter(r => r.status === "wrong" || r.status === "timeout").length;
    const total = sessionResults.length;
    const totalTime = sessionResults.reduce((sum, r) => sum + (r.duration || 0), 0);
    return {
      correct, wrong, total, pct: total > 0 ? Math.round(correct / total * 100) : 0,
      totalTime, avgTime: total > 0 ? Math.round(totalTime / total) : 0,
    };
  });
  let knowledgeTags = $state([]);

  let notesText = $state("");
  let notesSaved = $state(false);
  let notesSaving = $state(false);

  let questionHistory = $state([]);
  let showShortcuts = $state(false);
  let showSessionMap = $state(false);
  let relatedQuestions = $state([]);
  let mapDialog = $state(null);
  let shortcutsDialog = $state(null);

  function trapFocus(e, container) {
    if (e.key !== "Tab" || !container) return;
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  $effect(() => {
    if (showSessionMap && mapDialog) {
      mapDialog.focus();
    }
  });

  $effect(() => {
    if (showShortcuts && shortcutsDialog) {
      shortcutsDialog.focus();
    }
  });

  const SHORTCUTS = [
    { keys: "← →", desc: "上一题 / 下一题" },
    { keys: "1-9", desc: "选择选项" },
    { keys: "Enter", desc: "提交答案 / 提交多选" },
    { keys: "R", desc: "重做当前题" },
    { keys: "G", desc: "答错后看答案" },
    { keys: "1 2", desc: "自评答错 / 答对" },
    { keys: "B", desc: "收藏 / 取消收藏" },
    { keys: "Esc", desc: "退出当前会话" },
    { keys: "?", desc: "显示此帮助" },
  ];

  $effect(() => {
    if (q) {
      notesText = q.notes || "";
      loadQuestionHistory();
      relatedQuestions = api.questions.related(q.id, 5);
    }
  });

  function loadQuestionHistory() {
    if (!q) return;
    const all = api.progress.reviewHistory(200);
    questionHistory = all.filter((s) => s.question_id === q.id).slice(0, 10);
  }

  async function saveNotes() {
    notesSaving = true;
    try {
      await api.progress.update(q.id, { notes: notesText });
      notesSaved = true;
      toast.success("笔记已保存");
      setTimeout(() => (notesSaved = false), 2000);
    } catch {
      /* ignore */
    } finally {
      notesSaving = false;
    }
  }

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

  let sessionStatusMap = $derived.by(() => {
    const map = Object.create(null);
    for (const r of sessionResults) map[r.id] = r.status;
    return map;
  });

  async function loadQuestion() {
    loadError = null;
    q = null;

    // Try to restore session from backup on page refresh
    if (!questionId && store.quizSessionLength === 0) {
      const restored = await store.restoreFromBackup();
      if (restored && store.quizSessionLength > 0) {
        const firstId = store.quizSession[store.quizIndex]?.id;
        if (firstId) {
          return loadQuestionById(firstId);
        }
      }
    }

    try {
      const result = await store.loadQuestionDetail(questionId);
      if (result) {
        q = result;
        loadKnowledgeTags();
        countdown = interviewed ? timeLimit : 0;
        timerInterval = setInterval(() => {
          timer++;
          if (interviewed) { countdown--; if (countdown <= 0) { stopTimer(); handleTimeout(); } }
        }, 1000);
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

  function handleTimeout() {
    if (autoAdvancing) return;
    autoAdvancing = true;
    recordSessionResult("timeout");
    feedbackResult = "wrong";
    showAnswer = true;
    setTimeout(() => {
      autoAdvancing = false;
      if (store.hasNext) goNext();
      else finishSession();
    }, 2000);
  }

  function submitAnswer() {
    showSubmitResult = true;
  }

  async function selfEvaluate(correct) {
    stopTimer();
    saving = true;
    const status = correct ? "correct" : "wrong";
    const rating = correct ? "good" : "forgot";
    await store.markProgress(q.id, status, timer, rating);
    recordSessionResult(status);
    q.status = status;
    feedbackResult = status;
    showAnswer = true;
    saving = false;
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
    recordSessionResult(status);
    q.status = status;
    feedbackResult = status;
    showAnswer = true;
    saving = false;
  }

  async function selectOption(opt) {
    if (selectedOption !== null) return;
    if (isOptionCorrect(opt)) {
      selectedOption = opt;
      stopTimer();
      saving = true;
      await store.markProgress(q.id, "correct", timer);
      recordSessionResult("correct");
      feedbackResult = "correct";
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
    recordSessionResult("wrong");
    q.status = "wrong";
    feedbackResult = "wrong";
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
    countdown = interviewed ? timeLimit : 0;
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
        countdown = interviewed ? timeLimit : 0;
        timerInterval = setInterval(() => {
          timer++;
          if (interviewed) {
            countdown--;
            if (countdown <= 0) { stopTimer(); handleTimeout(); }
          }
        }, 1000);
        return true;
      }
      loadError = store.error ?? "加载题目失败";
      return false;
    } catch (e) {
      loadError = e.message ?? "加载题目失败";
      return false;
    }
  }

  function recordSessionResult(status) {
    if (!sessionProgress || !q) return;
    const ans = q.type === "choice" || q.type === "true_false"
      ? (selectedOption || "")
      : q.type === "multiple_choice"
        ? (selectedOptions.length > 0 ? selectedOptions.join("; ") : "")
        : userAnswer || "";
    sessionResults = [...sessionResults, { id: q.id, title: q.title, status, category: q.category, difficulty: q.difficulty, duration: timer, userAnswer: ans, correctAnswer: answerBody() }];
  }

  async function goNext() {
    if (!store.hasNext) return;
    store.advanceQuiz();
    const nextId = store.quizSession[store.quizIndex].id;
    resetState();
    window.scrollTo({ top: 0, behavior: "smooth" });
    await loadQuestionById(nextId);
  }

  async function goPrev() {
    if (!store.hasPrev || interviewed) return;
    store.retreatQuiz();
    const prevId = store.quizSession[store.quizIndex].id;
    resetState();
    window.scrollTo({ top: 0, behavior: "smooth" });
    await loadQuestionById(prevId);
  }

  async function shuffleRemaining() {
    const session = store.quizSession;
    const idx = store.quizIndex;
    const done = session.slice(0, idx + 1);
    const rest = session.slice(idx + 1);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    await store.startQuiz([...done, ...rest]);
  }

  function jumpToQuestion(index) {
    if (!store.goToQuestion(index)) return;
    const targetId = store.quizSession[store.quizIndex].id;
    showSessionMap = false;
    resetState();
    loadQuestionById(targetId);
  }

  function finishSession() {
    store._clearSessionBackup();
    showSessionSummary = true;
    // Persist last session to sessionStorage for Home page
    try {
      const s = sessionSummary;
      sessionStorage.setItem("last_quiz_session", JSON.stringify({
        correct: s.correct,
        wrong: s.wrong,
        total: s.total,
        pct: s.pct,
        totalTime: s.totalTime,
        avgTime: s.avgTime,
        interviewed: sessionResults.length > 0 && sessionResults[0].duration !== undefined,
        completedAt: new Date().toISOString(),
        results: sessionResults.map(r => ({
          id: r.id, title: r.title, status: r.status,
          category: r.category, userAnswer: r.userAnswer,
          correctAnswer: r.correctAnswer
        }))
      }));
      // Persist mock interview session to long-term history
      if (interviewed) {
        api.mockInterview.saveHistory({
          correct: s.correct,
          wrong: s.wrong,
          total: s.total,
          pct: s.pct,
          totalTime: s.totalTime,
          timeLimit,
          category: mockInterview.category || undefined,
          difficulty: mockInterview.difficulty || undefined,
          type: mockInterview.type || undefined,
          tag: mockInterview.tag || undefined,
        });
      }
    } catch (_) { /* ignore quota errors */ }
  }

  async function exit() {
    await store.startQuiz([]);
    store._clearSessionBackup();
    sessionResults = [];
    showSessionSummary = false;
    onNavigate("browse");
  }

  function handleKeydown(e) {
    if (!q) return;

    // Block keyboard input when overlays are open (map, shortcuts)
    if (showSessionMap || showShortcuts) return;

    // Escape to exit (all phases)
    if (e.key === "Escape" && !showSessionSummary) { e.preventDefault(); exit(); return; }

    // Left/Right navigation — answer-shown and browse modes
    if (browseMode || showAnswer || showSubmitResult) {
      if (e.key === "ArrowLeft" && !interviewed) { e.preventDefault(); goPrev(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); return; }
      if (e.key === "Enter" && (browseMode || showAnswer)) { e.preventDefault(); goNext(); return; }
      if (e.key === "r" || e.key === "R") {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault(); const id = q.id; resetState(); loadQuestionById(id); return;
        }
      }
      if (showSubmitResult && !showAnswer && e.target.tagName !== "TEXTAREA") {
        if (e.key === "1") { selfEvaluate(false); return; }
        if (e.key === "2") { selfEvaluate(true); return; }
      }
    }

    // Answering interactions (blocked when answer is revealed)
    if (showAnswer || showSubmitResult) return;

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
    if (selectedOption !== null && !isOptionCorrect(selectedOption)) {
      if (e.key === "r" || e.key === "R") retry();
      if (e.key === "g" || e.key === "G") giveUp();
    }
    if (!showSubmitResult && e.target.tagName !== "TEXTAREA" && q.type !== "choice" && q.type !== "true_false" && q.type !== "multiple_choice") {
      if (e.key === "Enter" && userAnswer.trim()) submitAnswer();
    }
    if (e.key === "b" || e.key === "B") {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") handleToggleBookmark();
    }
    if (e.key === "?") {
      e.preventDefault();
      showShortcuts = !showShortcuts;
    }
  }

  function handleToggleBookmark() {
    if (!q) return;
    const newVal = api.progress.toggleBookmark(q.id);
    q.bookmarked = newVal;
    toast.success(newVal ? "已收藏" : "已取消收藏");
  }

  function copyQuestion() {
    if (!q) return;
    const parts = [`# ${q.title}`, q.content || ""];
    if (showAnswer || browseMode) {
      const ans = q.answer ? q.answer.replace(/^答案[：:]\s*/m, "").trim() : "";
      if (ans) parts.push("", "---", ans);
    }
    if (q.options?.length > 0) {
      parts.push("", q.options.map((o, i) => `${i + 1}. ${o}`).join("\n"));
    }
    navigator.clipboard.writeText(parts.join("\n\n")).then(
      () => toast.success("已复制"),
      () => toast.error("复制失败"),
    );
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (!(browseMode || showAnswer)) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.5) return;
    if (dx > 0) { !interviewed && store.hasPrev && goPrev(); } else { store.hasNext && goNext(); }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="page quiz" ontouchstart={handleTouchStart} ontouchend={handleTouchEnd}>
  {#if loadError}
    <ErrorAlert message={loadError} onRetry={loadQuestion} />
  {:else if !q}
    <div class="skeleton" style="height:240px"></div>
  {:else}
    <div class="q-meta">
      {#if interviewed}
        <span class="mi-badge">模拟面试</span>
        {#if miFilterLabel(mockInterview)}
          <span class="mi-filter-label">{miFilterLabel(mockInterview)}</span>
        {/if}
      {/if}
      {#if sessionProgress}
        <span class="q-number-badge">{sessionProgress.index}/{sessionProgress.total}</span>
        <button class="map-btn" onclick={() => (showSessionMap = !showSessionMap)} title="题目列表">
          <svg aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
        </button>
      {/if}
      {#if !interviewed}
        <button class="browse-toggle" class:active={browseMode} onclick={toggleBrowseMode}>
          {browseMode ? "浏览" : "答题"}
        </button>
      {/if}
      {#if sessionProgress && !showAnswer && !interviewed}
        <button class="shuffle-btn" onclick={shuffleRemaining} title="随机后续题目">
          <svg aria-hidden="true"
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
      {#if interviewed}
        <span class="q-timer" class:critical={countdown <= 10} class:warn={countdown <= 30 && countdown > 10}>
          {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
        </span>
      {:else}
        <span class="q-timer" class:warn={timer > 120} class:critical={timer > 300}>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
      {/if}
      <button
        class="quiz-bm-btn"
        class:active={q.bookmarked}
        onclick={handleToggleBookmark}
        title={q.bookmarked ? "取消收藏" : "收藏此题"}
      >
        <svg aria-hidden="true"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={q.bookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ><polygon points="19 21 12 17.27 5 21 5 3 19 3 19 21" /></svg>
      </button>
      <button class="help-btn" onclick={() => (showShortcuts = !showShortcuts)} title="快捷键">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
      </button>
      <button class="copy-btn" onclick={copyQuestion} title="复制题目">
        <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      </button>
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
        <span class="cat-pill {q.category}">{categoryLabel(q.category)}</span>
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
          <svg aria-hidden="true"
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
          <span class="kt-label"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> 相关知识：</span>
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
            </div>
            <QuizAIConfig {q} {userAnswer} />
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
              <svg aria-hidden="true"
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

    <!-- Your Answer (show for typed answers when answer is revealed) -->
    {#if userAnswer && showAnswer && !browseMode}
      <div class="user-answer-section">
        <div class="ua-header">
          <span class="ua-label">你的回答</span>
        </div>
        <div class="ua-body">{userAnswer}</div>
        <div class="ua-status">
          {#if feedbackResult === "correct"}
            <span class="ua-correct">✓ 自评正确</span>
          {:else if feedbackResult === "wrong"}
            <span class="ua-wrong">✗ 自评错误</span>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Notes -->
    {#if q && (browseMode || showAnswer)}
      <div class="notes-section">
        <div class="notes-header">
          <span class="notes-label">学习笔记</span>
          {#if notesSaved}
            <span class="notes-saved-msg">已保存</span>
          {/if}
        </div>
        <textarea
          class="notes-input"
          bind:value={notesText}
          placeholder="记录你的思考、心得或记忆技巧…"
          rows="3"
          onblur={saveNotes}
        ></textarea>
        <button class="notes-save-btn" onclick={saveNotes} disabled={notesSaving}>
          {notesSaving ? "保存中…" : notesSaved ? "已保存" : "保存笔记"}
        </button>
      </div>
    {/if}

    {#if questionHistory.length > 0}
      <div class="q-history">
        <div class="qh-header">
          <span class="qh-label">答题历史</span>
          <span class="qh-count">最近 {questionHistory.length} 次</span>
        </div>
        <div class="qh-list">
          {#each questionHistory as h}
            <div class="qh-item" class:qh-correct={h.result === "correct"} class:qh-wrong={h.result === "wrong" || h.result === "forgot"}>
              <span class="qh-dot"></span>
              <span class="qh-result">{h.result === "correct" ? "正确" : h.result === "wrong" ? "错误" : h.result}</span>
              <span class="qh-time">{new Date(h.reviewed_at).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              <span class="qh-dur">{h.duration_seconds ? `${h.duration_seconds}秒` : ""}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if (browseMode || showAnswer) && relatedQuestions.length > 0}
      <div class="related-section">
        <div class="related-header">
          <span class="related-label">相关题目</span>
        </div>
        <div class="related-list">
          {#each relatedQuestions as rq}
            <button
              class="related-item"
              onclick={() => onNavigate("quiz", { questionId: rq.id })}
            >
              <div class="related-item-badges">
                <span class="tag">{categoryLabel(rq.category)}</span>
                <span class="tag diff {rq.difficulty}">{rq.difficulty}</span>
              </div>
              <span class="related-item-title">{rq.title}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if browseMode || showAnswer}
      {#if sessionProgress}
        <div class="nav-actions">
          <button class="nav-btn exit" onclick={exit}>返回题库</button>
          {#if store.hasPrev && !interviewed}
            <button class="nav-btn prev" onclick={goPrev}>← 上一题</button>
          {/if}
          <button class="nav-btn retry" onclick={() => { const id = q.id; resetState(); loadQuestionById(id); }}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            重做
          </button>
          {#if store.hasNext}
            <button class="nav-btn next" onclick={goNext}>下一题 →</button>
          {:else}
            <button class="nav-btn next" onclick={finishSession}>完成</button>
          {/if}
        </div>
      {:else}
        <div class="nav-actions single">
          <button class="nav-btn exit" onclick={() => onNavigate("browse")}>返回题库</button>
          <button class="nav-btn next" onclick={() => onNavigate("wrong")}>错题本</button>
        </div>
      {/if}
    {/if}

    {#if showSessionSummary}
      <QuizSessionSummary
        {sessionResults}
        {interviewed}
        {mockInterview}
        {onNavigate}
        onRetryWrong={(id) => { showSessionSummary = false; resetState(); loadQuestionById(id); }}
        onReset={() => { showSessionSummary = false; sessionResults = []; }}
      />
    {/if}
  {/if}
</div>

{#if showShortcuts}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="shortcuts-overlay" onclick={() => (showShortcuts = false)} onkeydown={(e) => { if (e.key === "Escape") showShortcuts = false; }}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="shortcuts-dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { trapFocus(e, shortcutsDialog); if (e.key === "Escape") showShortcuts = false; }} bind:this={shortcutsDialog}>
      <div class="shortcuts-title">键盘快捷键</div>
      <div class="shortcuts-list">
        {#each SHORTCUTS as sc}
          <div class="shortcut-row">
            <kbd class="shortcut-key">{sc.keys}</kbd>
            <span class="shortcut-desc">{sc.desc}</span>
          </div>
        {/each}
      </div>
      <button class="shortcuts-close" onclick={() => (showShortcuts = false)}>关闭</button>
    </div>
  </div>
{/if}

{#if showSessionMap && sessionProgress}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div class="overlay" onclick={() => (showSessionMap = false)} onkeydown={(e) => { if (e.key === "Escape") showSessionMap = false; }}>
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="map-dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { trapFocus(e, mapDialog); if (e.key === "Escape") showSessionMap = false; }} bind:this={mapDialog}>
      <div class="map-title">题目列表</div>
      <div class="map-legend">
        <span class="map-legend-item"><span class="map-dot correct"></span>已掌握</span>
        <span class="map-legend-item"><span class="map-dot wrong"></span>答错</span>
        <span class="map-legend-item"><span class="map-dot current"></span>当前</span>
        <span class="map-legend-item"><span class="map-dot pending"></span>未答</span>
      </div>
      <div class="map-grid">
        {#each store.quizSession as sq, i}
          {@const status = sessionStatusMap[sq.id] || "pending"}
          <button
            class="map-item"
            class:map-correct={status === "correct"}
            class:map-wrong={status === "wrong" || status === "forgot"}
            class:map-current={i === store.quizIndex}
            onclick={() => jumpToQuestion(i)}
            title={sq.title}
          >
            {i + 1}
          </button>
        {/each}
      </div>
      <button class="map-close" onclick={() => (showSessionMap = false)}>关闭</button>
    </div>
  </div>
{/if}

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
  .map-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
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
  .map-btn:active {
    transform: scale(0.88);
    color: var(--accent);
    border-color: var(--accent-dim);
  }
  .q-timer {
    margin-left: auto;
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
    transition: color 0.3s ease;
  }
  .q-timer.warn {
    color: var(--warning, #e6a23c);
  }
  .q-timer.critical {
    color: var(--danger, #e74c3c);
    animation: pulse-timer 0.5s ease-in-out infinite alternate;
  }
  @keyframes pulse-timer {
    from { opacity: 1; }
    to { opacity: 0.4; }
  }
  .help-btn,
  .copy-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--text-dim);
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    transition: all 0.2s var(--spring);
  }
  .help-btn:active,
  .copy-btn:active {
    transform: scale(0.85);
    color: var(--accent);
  }
  .quiz-bm-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--text-dim);
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    transition: all 0.2s var(--spring);
  }
  .quiz-bm-btn.active {
    color: var(--warning);
  }
  .quiz-bm-btn:active {
    transform: scale(0.85);
  }
  .mi-badge {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    border-radius: var(--radius-pill);
    background: var(--danger, #e74c3c);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  .mi-filter-label {
    font-size: 11px;
    color: var(--text-dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    background: var(--accent-bg);
    color: var(--accent);
  }
  .cat-pill.algorithm {
    background: var(--success-bg);
    color: var(--success);
  }
  .cat-pill.database {
    background: var(--warning-bg);
    color: var(--warning);
  }
  .cat-pill.linux {
    background: var(--danger-bg);
    color: var(--danger);
  }
  .cat-pill.devops {
    background: var(--ans-extension-bg);
    color: var(--ans-extension-text);
  }
  .cat-pill.java_basic,
  .cat-pill.java_advanced,
  .cat-pill.java_collections {
    background: var(--cat-java-bg);
    color: var(--cat-java);
  }
  .cat-pill.react,
  .cat-pill.frontend {
    background: var(--cat-frontend-bg);
    color: var(--cat-frontend);
  }
  .cat-pill.ai,
  .cat-pill.agent {
    background: var(--cat-ai-bg);
    color: var(--cat-ai);
  }
  .cat-pill.system_design {
    background: var(--cat-system-design-bg);
    color: var(--cat-system-design);
  }
  .cat-pill.project_mgmt {
    background: var(--cat-project-mgmt-bg);
    color: var(--cat-project-mgmt);
  }
  .cat-pill.product {
    background: var(--success-bg);
    color: var(--success);
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
    background: var(--accent-bg);
    color: var(--accent);
  }
  .type-pill.true_false {
    background: var(--ans-extension-bg);
    color: var(--ans-extension-text);
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
    background: var(--warning-bg);
    color: var(--warning);
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

  /* ── Knowledge Tags ── */
  .knowledge-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .kt-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
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

  /* ── Related Questions ── */
  .related-section {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
  }
  .related-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .related-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .related-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .related-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 10px 12px;
    text-align: left;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    transition: all 0.15s;
  }
  .related-item:active {
    transform: scale(0.99);
    border-color: var(--accent-dim);
  }
  .related-item-badges {
    display: flex;
    gap: 4px;
  }
  .related-item-title {
    line-height: 1.4;
    font-weight: 500;
  }

  /* ── User Answer ── */
  .user-answer-section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ua-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ua-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .ua-body {
    font-size: 14px;
    line-height: 1.65;
    color: var(--text);
    white-space: pre-wrap;
    background: var(--bg-surface);
    padding: 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    max-height: 200px;
    overflow-y: auto;
  }
  .ua-status {
    font-size: 12px;
    font-weight: 600;
  }
  .ua-correct { color: var(--success); }
  .ua-wrong { color: var(--danger); }

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
  .nav-btn.retry {
    background: none;
    color: var(--text-muted);
    border: 1px solid var(--border);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .nav-btn.retry:hover {
    border-color: var(--accent-dim);
    color: var(--accent);
  }

  /* ── Notes ── */
  .notes-section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .notes-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .notes-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .notes-saved-msg {
    font-size: 11px;
    color: var(--success);
    font-weight: 600;
    animation: fade-up 0.2s var(--spring);
  }
  .notes-input {
    resize: vertical;
    min-height: 60px;
    font-size: 13px;
    line-height: 1.6;
  }
  .notes-save-btn {
    align-self: flex-end;
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text);
    transition: all 0.2s var(--spring);
  }
  .notes-save-btn:active {
    transform: scale(0.96);
  }
  .notes-save-btn:disabled {
    opacity: 0.5;
  }

  /* ── Question History ── */
  .q-history {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
  }
  .qh-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .qh-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .qh-count {
    font-size: 11px;
    color: var(--text-dim);
    margin-left: auto;
  }
  .qh-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .qh-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-muted);
    padding: 4px 6px;
    border-radius: 4px;
  }
  .qh-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-dim);
    flex-shrink: 0;
  }
  .qh-correct .qh-dot {
    background: var(--success);
  }
  .qh-wrong .qh-dot {
    background: var(--danger);
  }
  .qh-result {
    font-weight: 600;
    min-width: 32px;
  }
  .qh-correct .qh-result {
    color: var(--success);
  }
  .qh-wrong .qh-result {
    color: var(--danger);
  }
  .qh-time {
    color: var(--text-dim);
    font-size: 11px;
    margin-left: auto;
  }
  .qh-dur {
    color: var(--text-dim);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  /* ── Shortcuts Help ── */
  .shortcuts-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal-overlay);
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fade-in 0.2s both;
  }
  .shortcuts-dialog {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    width: 100%;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: scale-in 0.3s var(--spring) both;
  }
  .shortcuts-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
  }
  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .shortcut-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .shortcut-key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 28px;
    padding: 0 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 5px;
    font-family: "SF Mono", "Fira Code", "JetBrains Mono", monospace;
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    text-align: center;
    letter-spacing: 0.3px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  .shortcut-desc {
    font-size: 14px;
    color: var(--text);
  }
  .shortcuts-close {
    width: 100%;
    padding: 10px;
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
  .shortcuts-close:active {
    transform: scale(0.97);
  }

  /* ── Session Map ── */
  .map-dialog {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    width: 100%;
    max-width: 340px;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: scale-in 0.3s var(--spring) both;
  }
  .map-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }
  .map-legend {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .map-legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-muted);
  }
  .map-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .map-dot.correct { background: var(--success); }
  .map-dot.wrong { background: var(--danger); }
  .map-dot.current { background: var(--accent); }
  .map-dot.pending { background: var(--text-dim); }
  .map-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
    gap: 6px;
  }
  .map-item {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    padding: 0;
  }
  .map-item:active {
    transform: scale(0.9);
  }
  .map-item.map-correct {
    background: var(--success-bg);
    color: var(--success);
    border-color: var(--success);
  }
  .map-item.map-wrong {
    background: var(--danger-bg);
    color: var(--danger);
    border-color: var(--danger);
  }
  .map-item.map-current {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    box-shadow: 0 0 8px rgba(108, 140, 255, 0.4);
  }
  .map-close {
    width: 100%;
    padding: 10px;
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
  .map-close:active {
    transform: scale(0.97);
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
      padding: 18px 14px calc(var(--nav-height) + 18px + var(--safe-bottom));
    }
  }
</style>
