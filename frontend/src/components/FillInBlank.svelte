<script>
  /**
   * Fill-in-the-blank question component
   * Renders ___ placeholders as <select> dropdowns with candidate words.
   */
  import { store } from "../lib/stores.svelte.js";

  let { question, onAnswered } = $props();

  // Parsed answer data
  let correctGroups = $state([]);
  let allCandidates = $state([]);
  let selectedAnswers = $state([]);
  let submitted = $state(false);
  let blankResults = $state([]);
  let showHints = $state(false);
  let showResult = $state(false);

  // Derived: all blanks filled
  let allFilled = $derived(selectedAnswers.every((a) => a !== null && a !== ""));

  // Derived: blank count from content
  let blankCount = $derived.by(() => {
    const matches = question.content.match(/___/g);
    return matches ? matches.length : 0;
  });

  function initFillInBlank() {
    if (!question || !question.answer) return;
    let answerData;
    try {
      answerData = JSON.parse(question.answer);
    } catch {
      answerData = {
        correct: question.answer.split(/[,，、]/).map((s) => [s.trim()]),
        distractors: [],
      };
    }

    correctGroups = answerData.correct || [];
    const distractors = answerData.distractors || [];

    // Collect all unique candidate words from correct groups + distractors
    const correctWords = correctGroups.flat();
    const allWords = [...new Set([...correctWords, ...distractors])];
    allCandidates = shuffleArray(allWords);

    // Initialize selected answers
    selectedAnswers = Array(correctGroups.length).fill("");
    blankResults = Array(correctGroups.length).fill(null);
  }

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Initialize on mount / question change
  $effect(() => {
    if (question) {
      submitted = false;
      showResult = false;
      showHints = false;
      initFillInBlank();
    }
  });

  function handleSelectChange(index, value) {
    const newSelected = [...selectedAnswers];
    newSelected[index] = value;
    selectedAnswers = newSelected;
  }

  async function handleSubmit() {
    submitted = true;
    showResult = true;

    // Check each blank
    const results = [];
    for (let i = 0; i < correctGroups.length; i++) {
      const userWord = selectedAnswers[i];
      const accepted = correctGroups[i];
      const isCorrect = accepted.includes(userWord);
      results.push({
        isCorrect,
        userWord,
        correctAnswer: accepted[0],
        acceptedWords: accepted,
      });
    }
    blankResults = results;

    // Mark progress
    const allCorrect = results.every((r) => r.isCorrect);
    await store.markProgress(
      question.id,
      allCorrect ? "correct" : "wrong",
      0
    );
    question.status = allCorrect ? "correct" : "wrong";

    if (onAnswered) {
      onAnswered(allCorrect);
    }
  }

  function handleRetry() {
    submitted = false;
    showResult = false;
    initFillInBlank();
  }
</script>

<div class="fill-in-blank">
  <!-- Question content with blanks rendered as dropdowns -->
  <div class="f-content">
    {#each splitContent(question.content) as part, i}
      {#if part.type === "text"}
        <span>{part.text}</span>
      {:else if part.type === "blank"}
        {@const blankIdx = part.index}
        {#if submitted && blankResults[blankIdx]}
          <span
            class="blank-result"
            class:correct={blankResults[blankIdx].isCorrect}
            class:wrong={!blankResults[blankIdx].isCorrect}
          >
            <span class="blank-word">{blankResults[blankIdx].userWord}</span>
            {#if !blankResults[blankIdx].isCorrect}
              <span class="blank-correct">[{blankResults[blankIdx].correctAnswer}]</span>
            {/if}
          </span>
        {:else}
          <select
            class="blank-select"
            value={selectedAnswers[blankIdx]}
            onchange={(e) => handleSelectChange(blankIdx, e.target.value)}
          >
            <option value="">请选择</option>
            {#each allCandidates as word}
              <option value={word}>{word}</option>
            {/each}
          </select>
        {/if}
      {/if}
    {/each}
  </div>

  <!-- Hints -->
  {#if question.hints?.length > 0 && !submitted}
    <button class="hint-trigger" onclick={() => (showHints = !showHints)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
      {showHints ? "收起提示" : "显示提示"} ({question.hints.length})
    </button>
    {#if showHints}
      <ul class="hints-list">
        {#each question.hints as hint}
          <li>{hint}</li>
        {/each}
      </ul>
    {/if}
  {/if}

  <!-- Submit / Retry -->
  {#if !submitted}
    <button
      class="submit-btn"
      onclick={handleSubmit}
      disabled={!allFilled}
    >
      提交答案
    </button>
  {:else}
    <button class="retry-btn" onclick={handleRetry}>
      重新作答
    </button>
  {/if}
</div>

<!-- Helper function to split content -->
<script module>
  /**
   * Splits content text into text segments and blank placeholders.
   * Each blank gets an index number.
   */
  export function splitContent(content) {
    if (!content) return [];
    const parts = [];
    const segments = content.split(/(___)/g);
    let blankIndex = 0;
    for (const seg of segments) {
      if (seg === "___") {
        parts.push({ type: "blank", index: blankIndex });
        blankIndex++;
      } else if (seg) {
        parts.push({ type: "text", text: seg });
      }
    }
    return parts;
  }
</script>

<style>
  .fill-in-blank {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .f-content {
    line-height: 2.4;
    font-size: 15px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .f-content span {
    line-height: 1.75;
  }

  .blank-select {
    display: inline-block;
    min-width: 110px;
    padding: 6px 28px 6px 10px;
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    cursor: pointer;
    transition: all 0.2s var(--spring);
    font-family: inherit;
    appearance: auto;
    -webkit-appearance: auto;
    -moz-appearance: auto;
  }

  .blank-select:focus {
    border-color: var(--accent);
    outline: none;
    box-shadow: 0 0 0 2px var(--accent-bg);
  }

  .blank-result {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 80px;
    min-height: 32px;
    padding: 2px 10px;
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    font-size: 14px;
    font-weight: 600;
  }

  .blank-result.correct {
    border-color: var(--success);
    background: var(--success-bg);
    color: var(--success);
  }

  .blank-result.wrong {
    border-color: var(--danger);
    background: var(--danger-bg);
    color: var(--danger);
  }

  .blank-word {
    color: inherit;
  }

  .blank-correct {
    font-size: 11px;
    color: var(--success);
    background: rgba(74, 222, 128, 0.15);
    padding: 1px 5px;
    border-radius: 3px;
    white-space: nowrap;
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
    cursor: pointer;
    transition: all 0.3s var(--spring);
    font-family: inherit;
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

  .submit-btn {
    width: 100%;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    border: none;
    background: var(--accent);
    color: #fff;
    cursor: pointer;
    transition: all 0.3s var(--spring);
    font-family: inherit;
  }

  .submit-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .submit-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .retry-btn {
    width: 100%;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.3s var(--spring);
    font-family: inherit;
  }

  .retry-btn:active {
    transform: scale(0.98);
  }
</style>
