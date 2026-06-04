<script>
  let { page, totalPages, onPageChange } = $props();

  let pageVal = $derived(Number(page) || 1);
  let totalVal = $derived(Number(totalPages) || 1);

  let pages = $derived.by(() => {
    const p = pageVal;
    const t = totalVal;
    if (t <= 7) {
      return Array.from({ length: t }, (_, i) => i + 1);
    }
    const result = [];
    // Always include first page
    result.push(1);
    // Left ellipsis zone
    if (p > 4) {
      result.push("...");
    }
    // Middle window: up to 5 pages around current
    let start = Math.max(2, p - 2);
    let end = Math.min(t - 1, p + 2);
    // Adjust if near boundaries
    if (p <= 4) {
      start = 2;
      end = Math.min(5, t - 1);
    }
    if (p >= t - 3) {
      start = Math.max(t - 4, 2);
      end = t - 1;
    }
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    // Right ellipsis zone
    if (p < t - 3) {
      result.push("...");
    }
    // Always include last page
    if (t > 1) {
      result.push(t);
    }
    return result;
  });

  function go(n) {
    if (n < 1 || n > totalVal || n === pageVal) return;
    onPageChange(n);
  }
</script>

<div class="pagination">
  <button
    class="page-btn prev"
    disabled={pageVal <= 1}
    onclick={() => go(pageVal - 1)}
    aria-label="上一页"
  >
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    <span class="btn-label">上一页</span>
  </button>

  <div class="page-numbers">
    {#each pages as p}
      {#if p === "..."}
        <span class="ellipsis">…</span>
      {:else}
        <button
          class="page-num"
          class:active={p === pageVal}
          onclick={() => go(p)}
          aria-label="第 {p} 页"
          aria-current={p === pageVal ? "page" : undefined}
        >
          {p}
        </button>
      {/if}
    {/each}
  </div>

  <button
    class="page-btn next"
    disabled={pageVal >= totalVal}
    onclick={() => go(pageVal + 1)}
    aria-label="下一页"
  >
    <span class="btn-label">下一页</span>
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </button>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 0;
    flex-wrap: wrap;
  }

  .page-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill, 20px);
    background: var(--bg-card);
    color: var(--text);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s var(--spring, cubic-bezier(0.34, 1.56, 0.64, 1));
    font-family: inherit;
    white-space: nowrap;
    user-select: none;
  }
  .page-btn:disabled {
    opacity: 0.35;
    cursor: default;
    pointer-events: none;
  }
  .page-btn:not(:disabled):hover {
    border-color: var(--accent-dim, rgba(100, 180, 255, 0.3));
    color: var(--accent);
  }
  .page-btn:not(:disabled):active {
    transform: scale(0.94);
  }
  .btn-label {
    display: inline;
  }

  .page-numbers {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .page-num {
    min-width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    border: 1px solid transparent;
    border-radius: var(--radius-pill, 20px);
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s var(--spring, cubic-bezier(0.34, 1.56, 0.64, 1));
    font-family: inherit;
    user-select: none;
  }
  .page-num:hover {
    background: var(--bg-surface);
    color: var(--text);
  }
  .page-num.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    font-weight: 700;
  }
  .page-num:active:not(.active) {
    transform: scale(0.88);
  }

  .ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    color: var(--text-dim);
    font-size: 13px;
    letter-spacing: 1px;
    user-select: none;
  }

  /* Narrow screen: hide page numbers, show simple prev/next */
  @media (max-width: 420px) {
    .page-numbers {
      display: none;
    }
    .pagination {
      gap: 8px;
    }
    .page-btn {
      font-size: 12px;
      padding: 5px 10px;
    }
  }
</style>
