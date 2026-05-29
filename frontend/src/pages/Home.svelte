<script>
  import { onMount } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";
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
  <div class="hero-section">
    <div class="hero-content">
      <div class="eyebrow">面试准备</div>
      <h1 class="hero-title">温故而知新</h1>
      <p class="hero-desc">持续练习，巩固知识。每一次复习都是进步的阶梯。</p>
    </div>

    {#if loading}
      <div class="hero-stats-skeleton">
        <div class="skeleton-box" style="width:64px;height:52px"></div>
        <div class="skeleton-box" style="width:64px;height:52px"></div>
        <div class="skeleton-box" style="width:64px;height:52px"></div>
      </div>
    {:else}
      <div class="hero-stats">
        <div class="double-bezel">
          <div class="double-bezel-inner stat-inner">
            <span class="stat-num">{store.stats?.total ?? 0}</span>
            <span class="stat-lbl">总题数</span>
          </div>
        </div>
        <div class="double-bezel">
          <div class="double-bezel-inner stat-inner accent">
            <span class="stat-num">{store.stats?.done ?? 0}</span>
            <span class="stat-lbl">已掌握</span>
          </div>
        </div>
        <div class="double-bezel">
          <div class="double-bezel-inner stat-inner" class:attention={dueCount > 0}>
            <span class="stat-num">{dueCount}</span>
            <span class="stat-lbl">待复习</span>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="body-section">
    {#if error}
      <ErrorAlert message={error} onRetry={loadData} />
    {:else if loading}
      <div class="skeleton" style="height:52px"></div>
      <div class="skeleton" style="height:96px;margin-top:8px"></div>
      <div class="skeleton" style="height:96px;margin-top:8px"></div>
    {:else}
      {#if dueCount > 0}
        <button class="due-card" onclick={() => onNavigate("wrong")}>
          <div class="due-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <div class="due-body">
            <span class="due-lbl">待复习提醒</span>
            <span class="due-cnt">{dueCount} 道题待巩固</span>
          </div>
          <div class="due-arrow-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </button>
      {:else}
        <div class="all-clear">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>暂无待复习题目，继续保持</span>
        </div>
      {/if}

      <div class="section-divider">
        <span class="section-dot"></span>
        <span class="section-dot"></span>
        <span class="section-dot"></span>
      </div>

      <h2 class="section-heading">今日推荐</h2>

      {#if recommend.length === 0}
        <p class="empty-rec">暂无推荐 — 去题库开始刷题吧</p>
      {:else}
        <div class="recommend-list">
          {#each recommend as q, i}
            <button
              class="rec-card"
              style="animation-delay: {i * 80}ms"
              onclick={() => onNavigate("quiz", { questionId: q.id })}
            >
              <div class="rec-badges">
                <span class="tag">{q.category}</span>
                <span class="tag diff {q.difficulty}">{q.difficulty}</span>
              </div>
              <p class="rec-title">{q.title}</p>
              <span class="rec-type">{q.type}</span>
            </button>
          {/each}
        </div>
      {/if}

      <button class="btn-wrap start-cta" onclick={() => onNavigate("browse")}>
        开始刷题
        <span class="btn-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
      </button>
    {/if}
  </div>
</div>

<style>
  .home { display: flex; flex-direction: column; gap: 0; padding-top: 0; }

  /* ── Hero Section ── */
  .hero-section {
    position: relative;
    margin: 0 -20px;
    padding: 40px 20px 28px;
    background: linear-gradient(180deg, rgba(108, 140, 255, 0.08) 0%, transparent 100%);
    text-align: center;
    overflow: hidden;
  }
  .hero-section::before {
    content: "";
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(108, 140, 255, 0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .hero-content { position: relative; z-index: 1; }
  .eyebrow {
    display: inline-flex;
    padding: 4px 14px;
    border-radius: var(--radius-pill);
    background: var(--accent-bg);
    color: var(--accent);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .hero-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.15;
    color: var(--text);
    margin-bottom: 8px;
  }
  .hero-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }

  /* ── Stats ── */
  .hero-stats { display: flex; justify-content: center; gap: 12px; position: relative; z-index: 1; }
  .hero-stats .double-bezel { width: 98px; }
  .stat-inner { text-align: center; padding: 14px 8px; }
  .stat-num { display: block; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); line-height: 1.1; }
  .stat-inner.accent .stat-num { color: var(--accent); }
  .stat-inner.attention .stat-num { color: var(--danger); }
  .stat-lbl { font-size: 11px; color: var(--text-dim); margin-top: 4px; font-weight: 500; }
  .hero-stats-skeleton { display: flex; justify-content: center; gap: 12px; position: relative; z-index: 1; }
  .hero-stats-skeleton .skeleton-box { width: 98px; height: 88px; }

  /* ── Body Section ── */
  .body-section { display: flex; flex-direction: column; gap: 14px; }

  /* ── Due Card ── */
  .due-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    text-align: left;
    width: 100%;
    color: var(--text);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.3s var(--spring);
  }
  .due-card:active { background: var(--bg-card-hover); border-color: rgba(108, 140, 255, 0.2); transform: scale(0.99); }
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
  .due-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .due-lbl { font-size: 13px; font-weight: 600; color: var(--text); }
  .due-cnt { font-size: 12px; color: var(--text-muted); }
  .due-arrow-icon {
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

  .all-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    font-size: 14px;
    color: var(--text-muted);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  /* ── Section Divider ── */
  .section-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 2px 0;
  }
  .section-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
  }

  .section-heading {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.2px;
    color: var(--text);
  }

  /* ── Recommend ── */
  .recommend-list { display: flex; flex-direction: column; gap: 10px; }
  .rec-card {
    text-align: left;
    width: 100%;
    padding: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    animation: fade-in 0.6s var(--spring) both;
    transition: all 0.3s var(--spring);
  }
  .rec-card:active { background: var(--bg-card-hover); border-color: rgba(108, 140, 255, 0.2); transform: scale(0.99); }
  .rec-badges { display: flex; gap: 4px; margin-bottom: 8px; }
  .rec-title { font-size: 16px; font-weight: 700; line-height: 1.45; margin-bottom: 6px; letter-spacing: -0.2px; }
  .rec-type { font-size: 11px; color: var(--text-dim); font-weight: 500; }

  .empty-rec { text-align: center; color: var(--text-muted); font-size: 14px; padding: 20px 0; }

  /* ── CTA ── */
  .start-cta {
    width: 100%;
    justify-content: center;
    font-size: 16px;
    padding: 12px 24px 12px 28px;
  }
</style>
