<script>
  import { onMount } from "svelte";
  import { PATHS } from "../lib/learning-paths.js";
  import { api } from "../lib/local-api.js";
  import { categoryLabel } from "../lib/categories.js";

  let { onNavigate } = $props();
  let paths = $state([]);
  let selectedPath = $state(null);
  let loading = $state(true);

  onMount(async () => {
    await loadPaths();
  });

  async function loadPaths() {
    loading = true;
    try {
      const stats = await api.progress.pathProgress(PATHS);
      paths = stats;
    } catch {
      paths = PATHS.map((p) => ({ ...p, stages: [], overallTotal: 0, overallDone: 0, pct: 0 }));
    }
    loading = false;
  }

  function pathIcon(icon) {
    const icons = {
      coffee: "M8 2v4M12 2v4M16 2v4M3 10h18l-1 10H4L3 10zM8 14h8",
      layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
      brain: "M9 3a6 6 0 0 0-6 6c0 2.2 1.2 4.1 3 5.1V21l3-2 3 2 3-2 3 2v-6.9A6 6 0 0 0 9 3z",
      code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
    };
    return icons[icon] || icons.code;
  }

  function pathBg(color) {
    return `linear-gradient(135deg, ${color}15, transparent)`;
  }

  function selectPath(path) {
    selectedPath = selectedPath?.id === path.id ? null : path;
  }
</script>

<div class="page lp-page">
  <h1 class="page-title">学习路径</h1>
  <p class="page-desc">根据目标岗位定制学习路线，按阶段系统化完成面试准备</p>

  {#if loading}
    <div class="skeleton" style="height:160px;margin-bottom:12px"></div>
    <div class="skeleton" style="height:160px;margin-bottom:12px"></div>
  {:else if paths.length === 0}
    <p class="empty">暂无学习路径</p>
  {:else}
    <div class="path-list">
      {#each paths as path}
        <div
          class="path-card"
          class:expanded={selectedPath?.id === path.id}
          style="background: {pathBg(path.color)}; border-color: {path.color}33"
        >
          <button class="path-header" onclick={() => selectPath(path)}>
            <div class="path-icon-wrap" style="background: {path.color}18; color: {path.color}">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d={pathIcon(path.icon)} />
              </svg>
            </div>
            <div class="path-info">
              <span class="path-title">{path.title}</span>
              <span class="path-desc">{path.description}</span>
            </div>
            <div class="path-meta">
              <span class="path-weeks">{path.estimatedWeeks} 周</span>
              <div class="path-ring">
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border)" stroke-width="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke={path.color} stroke-width="3"
                    stroke-dasharray="97.4" stroke-dashoffset={97.4 - (97.4 * path.pct) / 100}
                    stroke-linecap="round" transform="rotate(-90, 18, 18)" />
                </svg>
                <span class="path-ring-text">{path.pct}%</span>
              </div>
            </div>
          </button>

          {#if selectedPath?.id === path.id}
            <div class="path-stages">
              {#each path.stages as stage, si}
                <div class="stage-card" style="animation-delay: {si * 60}ms">
                  <div class="stage-header">
                    <div class="stage-title-row">
                      <span class="stage-num">{si + 1}</span>
                      <span class="stage-title">{stage.title}</span>
                    </div>
                    <span class="stage-pct" class:done={stage.pct >= 100}>
                      {stage.totalDone}/{stage.totalRequired}
                    </span>
                  </div>
                  <p class="stage-desc">{stage.description}</p>
                  <div class="stage-bar-track">
                    <div class="stage-bar-fill" style="width: {stage.pct}%; background: {path.color}"></div>
                  </div>
                  <div class="stage-targets">
                    {#each stage.targets as target}
                      <button class="target-chip" onclick={() => onNavigate("browse", { tag: target.label })}>
                        <span class="target-label">{categoryLabel(target.category) || target.label}</span>
                        <span class="target-count" class:done={target.done >= target.required}>
                          {Math.min(target.done, target.required)}/{target.required}
                        </span>
                      </button>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .lp-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .page-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    margin: -8px 0 4px;
  }
  .path-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .path-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: all 0.3s var(--spring);
  }
  .path-card.expanded {
    border-color: var(--accent-dim);
  }
  .path-header {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 16px;
    text-align: left;
    color: var(--text);
    font-family: inherit;
    font-size: inherit;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }
  .path-header:active {
    background: var(--bg-surface);
  }
  .path-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .path-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .path-title {
    font-size: 15px;
    font-weight: 700;
  }
  .path-desc {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .path-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .path-weeks {
    font-size: 11px;
    color: var(--text-dim);
    font-weight: 500;
  }
  .path-ring {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .path-ring-text {
    position: absolute;
    font-size: 9px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
  }
  .path-stages {
    padding: 0 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fade-in 0.3s var(--spring) both;
  }
  .stage-card {
    padding: 12px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    animation: fade-in 0.4s var(--spring) both;
  }
  .stage-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .stage-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .stage-num {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .stage-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .stage-pct {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .stage-pct.done {
    color: var(--success);
  }
  .stage-desc {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0 0 8px 28px;
  }
  .stage-bar-track {
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  .stage-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s var(--spring);
  }
  .stage-targets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .target-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .target-chip:active {
    background: var(--bg-card-hover);
    border-color: var(--accent-dim);
  }
  .target-label {
    color: var(--text);
  }
  .target-count {
    font-weight: 700;
    color: var(--text-dim);
  }
  .target-count.done {
    color: var(--success);
  }
  .empty {
    text-align: center;
    padding: 40px 0;
    color: var(--text-muted);
    font-size: 14px;
  }
</style>
