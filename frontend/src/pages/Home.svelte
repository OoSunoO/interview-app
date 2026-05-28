<script>
  import { onMount } from "svelte";
  import { api } from "../lib/api.js";
  import ErrorAlert from "../components/ErrorAlert.svelte";

  let { onNavigate } = $props();
  let recommend = $state([]);
  let dueCount = $state(0);
  let loading = $state(true);
  let error = $state(null);

  async function loadData() {
    loading = true;
    error = null;
    try {
      const [questions, due, stats] = await Promise.all([
        api.questions.list({ page_size: 3 }),
        api.progress.dueReviews(),
        api.progress.stats(),
      ]);
      recommend = questions.slice(0, 3);
      dueCount = due.length;
      store.stats = stats;
    } catch (e) {
      error = e.message ?? "加载数据失败";
    } finally {
      loading = false;
    }
  }

  onMount(loadData);
</script>

<div class="page home">
  <div class="hero">
    <h1 class="page-title">面试题练习</h1>
    <p class="hero-sub">温故而知新</p>
    {#if loading}
      <div class="hero-stats-skeleton">
        <div class="skeleton-box" style="width:60px;height:48px"></div>
        <div class="skeleton-box" style="width:60px;height:48px"></div>
        <div class="skeleton-box" style="width:60px;height:48px"></div>
      </div>
    {:else}
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="hero-num">{store.stats?.total ?? 0}</span>
          <span class="hero-lbl">总题</span>
        </div>
        <div class="hero-stat">
          <span class="hero-num accent">{store.stats?.done ?? 0}</span>
          <span class="hero-lbl">掌握</span>
        </div>
        <div class="hero-stat">
          <span class="hero-num" class:danger={dueCount > 0}>{dueCount}</span>
          <span class="hero-lbl">复习</span>
        </div>
      </div>
    {/if}
  </div>

  {#if error}
    <ErrorAlert message={error} onRetry={loadData} />
  {:else if loading}
    <div class="skeleton-card" style="height:52px"></div>
    <div class="section-hdr">
      <span class="section-line"></span>
      <span class="section-title">今日推荐</span>
      <span class="section-line"></span>
    </div>
    <div class="recommend-list">
      <div class="skeleton-card" style="height:80px"></div>
      <div class="skeleton-card" style="height:80px"></div>
      <div class="skeleton-card" style="height:80px"></div>
    </div>
  {:else}
    {#if dueCount > 0}
      <button class="due-card card" onclick={() => onNavigate("wrong")}>
        <div class="due-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <div class="due-text">
          <span class="due-lbl">待复习提醒</span>
          <span class="due-cnt">{dueCount} 道题待巩固</span>
        </div>
        <svg class="due-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    {:else}
      <div class="all-clear card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>暂无待复习题目</span>
      </div>
    {/if}

    <div class="section-hdr">
      <span class="section-line"></span>
      <span class="section-title">今日推荐</span>
      <span class="section-line"></span>
    </div>

    {#if recommend.length === 0}
      <p class="empty-rec">暂无推荐 — 去题库开始刷题吧</p>
    {:else}
      <div class="recommend-list">
        {#each recommend as q}
          <button class="card recommend-item" onclick={() => onNavigate("quiz", { questionId: q.id })}>
            <div class="rec-top">
              <span class="tag">{q.category}</span>
              <span class="tag diff {q.difficulty}">{q.difficulty}</span>
            </div>
            <p class="rec-title">{q.title}</p>
            <span class="rec-type">{q.type}</span>
          </button>
        {/each}
      </div>
    {/if}
  {/if}

  <button class="start-btn btn-gradient" onclick={() => onNavigate("browse")}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
    开始刷题
  </button>
</div>

<style>
  .home { display: flex; flex-direction: column; gap: 16px; padding-top: 0; }

  .hero {
    position: relative;
    margin: 0 -18px;
    padding: 32px 18px 24px;
    background: linear-gradient(180deg, rgba(96, 165, 250, 0.12) 0%, transparent 100%);
    border-bottom: 1px solid rgba(96, 165, 250, 0.08);
    text-align: center;
    overflow: hidden;
  }
  .hero::before {
    content: "";
    position: absolute;
    top: -40%;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .page-title { margin-bottom: 4px; }
  .hero-sub { color: var(--text-muted); font-size: 13px; letter-spacing: 1px; margin-bottom: 20px; }

  .hero-stats { display: flex; justify-content: center; gap: 32px; position: relative; z-index: 1; }
  .hero-stat { text-align: center; }
  .hero-num { display: block; font-size: 26px; font-weight: 700; color: var(--text); }
  .hero-num.accent { color: var(--accent); }
  .hero-num.danger { color: var(--danger); }
  .hero-lbl { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

  .due-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    text-align: left;
    width: 100%;
    color: var(--text);
    border-left: 3px solid var(--accent-dim);
  }
  .due-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--accent-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--accent);
  }
  .due-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .due-lbl { font-size: 13px; font-weight: 600; color: var(--text); }
  .due-cnt { font-size: 12px; color: var(--text-muted); }
  .due-arrow { color: var(--text-dim); flex-shrink: 0; }

  .all-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    font-size: 14px;
    color: var(--text-muted);
  }

  .section-hdr {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
  }
  .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); }
  .section-title { font-size: 13px; font-weight: 600; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }

  .recommend-list { display: flex; flex-direction: column; gap: 10px; }
  .recommend-item { text-align: left; width: 100%; padding: 14px; }
  .rec-top { display: flex; gap: 6px; margin-bottom: 8px; }
  .rec-title { font-size: 15px; line-height: 1.45; margin-bottom: 4px; }
  .rec-type { font-size: 12px; color: var(--text-dim); }

  .start-btn {
    width: 100%;
    padding: 15px;
    font-size: 16px;
    font-weight: 600;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .hero-stats-skeleton { display: flex; justify-content: center; gap: 32px; position: relative; z-index: 1; }
  .skeleton-box { background: var(--bg-surface); border-radius: var(--radius-sm); animation: pulse 1.5s ease infinite; }
  .skeleton-card { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); animation: pulse 1.5s ease infinite; }
  .empty-rec { text-align: center; color: var(--text-muted); font-size: 14px; padding: 16px 0; }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.25; }
  }
</style>
