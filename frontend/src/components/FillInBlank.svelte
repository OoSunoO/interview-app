<script>
  /**
   * Fill-in-the-blank question component
   * Renders ___ placeholders as blank slots and shows candidate words as pills.
   */
  import { store } from "../lib/stores.svelte.js";

  let { question, onAnswered } = $props();

  // Parsed answer data
  let correctGroups = $state([]);
  let poolItems = $state([]);
  let filledBlanks = $state([]);
  let submitted = $state(false);
  let blankResults = $state([]);
  let showHints = $state(false);
  let showResult = $state(false);

  // Derived: all blanks filled
  let allFilled = $derived(filledBlanks.every((b) => b !== null));

  // Derived: blank placeholders from content
  let blankSlots = $derived.by(() => {
    const matches = question.content.match(/___/g);
    return matches ? matches.length : 0;
  });

  function initFillInBlank() {
    if (!question || !question.answer) return;
    let answerData;
    try {
      answerData = JSON.parse(question.answer);
    } catch {
      // If answer is not JSON, try to treat it as a simple comma-separated list
      answerData = {
        correct: question.answer.split(/[,，、]/).map((s) => [s.trim()]),
        distractors: [],
      };
    }

    correctGroups = answerData.correct || [];
    const distractors = answerData.distractors || [];

    // Build initial pool: all candidate words from correct groups + distractors
    const correctWords = correctGroups.flat();
    const allWords = [...correctWords, ...distractors];

    // Count occurrences of each word in the pool
    const countMap = {};
    for (const w of allWords) {
      countMap[w] = (countMap[w] || 0) + 1;
    }
    poolItems = shuffleArray(
      Object.entries(countMap).map(([word, count]) => ({ word, count }))
    );

    // Initialize filled blanks
    filledBlanks = Array(correctGroups.length).fill(null);
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

  function handlePillClick(word) {
    if (submitted) return;

    // Find the pool item
    const poolIdx = poolItems.findIndex((p) => p.word === word);
    if (poolIdx === -1 || poolItems[poolIdx].count <= 0) return;

    // Find first empty blank
    const emptyIdx = filledBlanks.findIndex((b) => b === null);
    if (emptyIdx === -1) return;

    // Decrement pool count
    poolItems = poolItems.map((item, idx) =>
      idx === poolIdx
        ? { ...item, count: item.count - 1 }
        : item
    );

    // Fill the blank
    const newFilled = [...filledBlanks];
    newFilled[emptyIdx] = word;
    filledBlanks = newFilled;
  }

  function handleBlankClick(blankIdx) {
    if (submitted) return;

    const word = filledBlanks[blankIdx];
    if (word === null) return;

    // Clear the blank
    const newFilled = [...filledBlanks];
    newFilled[blankIdx] = null;
    filledBlanks = newFilled;

    // Increment pool count
    const poolIdx = poolItems.findIndex((p) => p.word === word);
    if (poolIdx !== -1) {
      poolItems = poolItems.map((item, idx) =>
        idx === poolIdx
          ? { ...item, count: item.count + 1 }
          : item
      );
    }
  }

  async function handleSubmit() {
    submitted = true;
    showResult = true;

    // Check each blank
    const results = [];
    for (let i = 0; i < correctGroups.length; i++) {
      const userWord = filledBlanks[i];
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
  <!-- Question content with blanks rendered -->
  <div class="f-content">
    {#each splitContent(question.content) as part, i}
      {#if part.type === "text"}
        <span>{part.text}</span>
      {:else if part.type === "blank"}
        {@const blankIdx = part.index}
        <button
          class="blank-slot"
          class:filled={filledBlanks[blankIdx] !== null}
          class:correct={submitted && blankResults[blankIdx]?.isCorrect}
          class:wrong={submitted && blankResults[blankIdx] && !blankResults[blankIdx].isCorrect}
          onclick={() => handleBlankClick(blankIdx)}
          disabled={submitted}
        >
          {#if submitted && blankResults[blankIdx]}
            <span class="blank-word">{blankResults[blankIdx].userWord}</span>
            {#if !blankResults[blankIdx].isCorrect}
              <span class="blank-correct">[{blankResults[blankIdx].correctAnswer}]</span>
            {/if}
          {:else if filledBlanks[blankIdx] !== null}
            {filledBlanks[blankIdx]}
          {:else}
            <span class="blank-placeholder">?</span>
          {/if}
        </button>
      {/if}
    {/each}
  </div>

  <!-- Hints -->
  {#if question.hints.length > 0 && !submitted}
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

  <!-- Candidate pills -->
  {#if !submitted}
    <div class="pool">
      <p class="pool-label">点击词语填入空白：</p>
      <div class="pill-grid">
        {#each poolItems as item}
          <button
            class="candidate-pill"
            disabled={item.count <= 0}
            class:used={item.count <= 0}
            onclick={() => handlePillClick(item.word)}
          >
            {item.word}
            {#if item.count > 1}
              <span class="pill-count">×{item.count}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
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
    line-height: 2.2;
    font-size: 15px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .f-content span {
    line-height: 1.75;
  }

  .blank-slot {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 80px;
    min-height: 32px;
    padding: 2px 10px;
    border: 2px dashed var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    cursor: pointer;
    transition: all 0.2s var(--spring);
    font-family: inherit;
  }

  .blank-slot.filled {
    border-style: solid;
    border-color: var(--accent-dim);
    background: var(--accent-bg);
  }

  .blank-slot:active:not(:disabled) {
    transform: scale(0.95);
  }

  .blank-slot.correct {
    border-color: var(--success);
    background: var(--success-bg);
    color: var(--success);
  }

  .blank-slot.wrong {
    border-color: var(--danger);
    background: var(--danger-bg);
    color: var(--danger);
  }

  .blank-slot:disabled {
    cursor: default;
    opacity: 1;
  }

  .blank-placeholder {
    color: var(--text-dim);
    font-weight: 400;
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

  .pool {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 14px;
  }

  .pool-label {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .pill-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .candidate-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px solid var(--accent-dim);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s var(--spring);
    font-family: inherit;
  }

  .candidate-pill:active:not(:disabled) {
    transform: scale(0.93);
  }

  .candidate-pill:disabled {
    opacity: 0.3;
    cursor: default;
    text-decoration: line-through;
  }

  .pill-count {
    font-size: 10px;
    opacity: 0.7;
    font-weight: 400;
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
