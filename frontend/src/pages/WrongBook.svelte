<script>
  import { onMount } from "svelte";
  import { api } from "../lib/api.js";

  let { onNavigate } = $props();
  let wrongQuestions = $state([]);
  let reviewMode = $state(false);
  let currentIndex = $state(0);
  let showAnswer = $state(false);

  onMount(async () => { wrongQuestions = await api.progress.wrong(); });

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
</script>

<div class="page wrong">
  {#if reviewMode}
    <div class="review-header">
      <button class="back-btn" onclick={() => { reviewMode = false; showAnswer = false; }}>← 退出</button>
      <span>{currentIndex + 1}/{wrongQuestions.length}</span>
    </div>

    {#if wrongQuestions.length > 0}
      <h2>{wrongQuestions[currentIndex].title}</h2>
      <div class="q-info">
        <span class="tag">{wrongQuestions[currentIndex].category}</span>
        <span class="tag diff {wrongQuestions[currentIndex].difficulty}">{wrongQuestions[currentIndex].difficulty}</span>
        <span>答错 {wrongQuestions[currentIndex].wrong_count} 次</span>
      </div>

      <button class="reveal-btn" onclick={() => showAnswer = !showAnswer}>
        {showAnswer ? "隐藏答案" : "查看答案"}
      </button>

      {#if showAnswer}
        <div class="review-actions">
          <button class="wrong-btn" onclick={markWrongAgain}>还是不会</button>
          <button class="correct-btn" onclick={markCorrect}>掌握了</button>
        </div>
      {/if}
    {:else}
      <p class="empty">全部掌握！🎉</p>
    {/if}
  {:else}
    <h1 class="page-title">错题本</h1>

    {#if wrongQuestions.length === 0}
      <p class="empty">暂无错题，继续保持！ 🎉</p>
    {:else}
      <p class="summary">共 {wrongQuestions.length} 道待复习</p>
      <button class="start-review" onclick={() => reviewMode = true}>
        开始复习 ({wrongQuestions.length})
      </button>

      <div class="list">
        {#each wrongQuestions as q}
          <button class="card" onclick={() => onNavigate("quiz", { questionId: q.id })}>
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
  .wrong { display: flex; flex-direction: column; gap: 14px; }
  .page-title { font-size: 22px; font-weight: 700; }
  .empty { text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 18px; }
  .summary { color: var(--text-muted); font-size: 14px; }
  .start-review { padding: 14px; font-size: 16px; font-weight: 600; }
  .list { display: flex; flex-direction: column; gap: 10px; }
  .card { text-align: left; width: 100%; background: var(--bg-card); padding: 14px; border-radius: var(--radius); border: none; color: var(--text); cursor: pointer; }
  .card:active { background: var(--bg-hover); }
  .q-header { display: flex; gap: 8px; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; align-items: center; }
  .tag { font-size: 11px; padding: 2px 7px; border-radius: 4px; background: var(--bg-hover); }
  .tag.diff.easy { background: #166534; color: #4ade80; }
  .tag.diff.medium { background: #713f12; color: #fbbf24; }
  .tag.diff.hard { background: #7f1d1d; color: #f87171; }
  .wrong-count { margin-left: auto; color: var(--danger); font-size: 12px; }
  .q-title-text { font-size: 14px; line-height: 1.4; }
  .review-header { display: flex; justify-content: space-between; align-items: center; }
  .back-btn { background: none; color: var(--text-muted); padding: 8px 0; }
  .q-info { display: flex; gap: 8px; font-size: 13px; color: var(--text-muted); align-items: center; }
  .review-actions { display: flex; gap: 12px; margin-top: 16px; }
  .review-actions button { flex: 1; padding: 14px; font-weight: 600; }
  .reveal-btn { width: 100%; padding: 14px; background: var(--bg-hover); color: var(--text); border: 1px solid var(--border); }
  .correct-btn { background: var(--success); }
  .wrong-btn { background: var(--danger); }
</style>
