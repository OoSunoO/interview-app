<script>
  import { onMount } from "svelte";
  import { api } from "../lib/api.js";
  import { store } from "../lib/stores.js";

  let { onNavigate } = $props();
  let recommend = $state([]);
  let dueCount = $state(0);

  onMount(async () => {
    const [questions, due, stats] = await Promise.all([
      api.questions.list({ page_size: 3 }),
      api.progress.dueReviews(),
      api.progress.stats(),
    ]);
    recommend = questions.slice(0, 3);
    dueCount = due.length;
    store.stats = stats;
  });
</script>

<div class="page home">
  <h1 class="title">面试题练习</h1>
  <p class="subtitle">7 个领域 · 持续学习</p>

  <div class="card due-card" class:has-due={dueCount > 0}>
    <span class="due-label">待复习</span>
    <span class="due-count">{dueCount}</span>
    <button class="due-btn" onclick={() => onNavigate("wrong")}>
      开始复习 →
    </button>
  </div>

  <h2 class="section-title">今日推荐</h2>
  <div class="recommend-list">
    {#each recommend as q}
      <button class="card recommend-item" onclick={() => onNavigate("quiz", { questionId: q.id })}>
        <div class="rec-header">
          <span class="tag category">{q.category}</span>
          <span class="tag diff {q.difficulty}">{q.difficulty}</span>
        </div>
        <p class="rec-title">{q.title}</p>
        <span class="rec-type">{q.type}</span>
      </button>
    {/each}
  </div>

  <button class="start-btn" onclick={() => onNavigate("browse")}>
    开始刷题
  </button>
</div>

<style>
  .home { display: flex; flex-direction: column; gap: 20px; }
  .title { font-size: 28px; font-weight: 700; margin-top: 8px; }
  .subtitle { color: var(--text-muted); margin-top: -12px; }
  .section-title { font-size: 18px; font-weight: 600; }
  .card { background: var(--bg-card); border-radius: var(--radius); padding: 16px; }
  .due-card { display: flex; align-items: center; gap: 12px; }
  .due-card.has-due { border-left: 4px solid var(--danger); }
  .due-label { font-size: 14px; color: var(--text-muted); }
  .due-count { font-size: 32px; font-weight: 700; color: var(--danger); margin-left: auto; }
  .due-btn { font-size: 13px; padding: 8px 14px; }
  .recommend-list { display: flex; flex-direction: column; gap: 12px; }
  .recommend-item { text-align: left; width: 100%; background: var(--bg-card); }
  .recommend-item:active { background: var(--bg-hover); }
  .rec-header { display: flex; gap: 8px; margin-bottom: 8px; }
  .tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: var(--bg-hover); }
  .tag.easy { background: #166534; color: #4ade80; }
  .tag.medium { background: #713f12; color: #fbbf24; }
  .tag.hard { background: #7f1d1d; color: #f87171; }
  .rec-title { font-size: 15px; line-height: 1.4; margin-bottom: 4px; }
  .rec-type { font-size: 12px; color: var(--text-muted); }
  .start-btn { width: 100%; padding: 14px; font-size: 16px; font-weight: 600; }
</style>
