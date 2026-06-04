<script>
  /**
   * GitHub-style contribution heatmap showing daily review activity.
   * Columns = weeks, rows = days (Sun–Sat).
   * Cell color intensity = number of reviews that day.
   *
   * Props:
   *   data  — Record<YYYY-MM-DD, { reviewed: number }>
   */
  let { data = {} } = $props();

  function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  /** Build the 53×7 grid. Last column is always the most recent complete week. */
  let grid = $derived.by(() => {
    const today = new Date();
    const end = new Date(today);
    // Rewind to last Saturday so we always end on a full week
    end.setDate(end.getDate() - ((end.getDay() + 1) % 7));

    const start = new Date(end);
    start.setDate(start.getDate() - 53 * 7 + 1);

    const cell = (d) => {
      const key = dateKey(d);
      return { date: key, count: data[key]?.reviewed || 0 };
    };

    const weeks = [];
    const cur = new Date(start);
    while (cur <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(cell(cur));
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  });

  let maxCount = $derived(Math.max(1, ...grid.flat().map((d) => d.count)));

  function level(count) {
    if (count === 0) return 0;
    const r = count / maxCount;
    if (r <= 0.25) return 1;
    if (r <= 0.5) return 2;
    if (r <= 0.75) return 3;
    return 4;
  }

  /** Month labels: show the month name at the first week where it changes. */
  let monthLabels = $derived.by(() => {
    const labels = [];
    let lastMonth = -1;
    for (let wi = 0; wi < grid.length; wi++) {
      const d = new Date(grid[wi][0].date + "T00:00:00");
      if (d.getMonth() !== lastMonth) {
        labels.push({ weekIndex: wi, label: `${d.getMonth() + 1}月` });
        lastMonth = d.getMonth();
      }
    }
    return labels;
  });

  const dayLabels = ["", "一", "", "三", "", "五", ""];
</script>

<div class="heatmap-wrap">
  <div class="heatmap">
    <!-- month labels -->
    <div class="hm-months">
      <span class="hm-spacer"></span>
      <div class="hm-labels-row">
        {#each monthLabels as ml}
          <span class="hm-month" style="grid-column: {ml.weekIndex + 2}">{ml.label}</span>
        {/each}
      </div>
    </div>

    <!-- grid rows -->
    <div class="hm-body">
      <div class="hm-days-col">
        {#each dayLabels as dl, ri}
          <span class="hm-day-label">{dl}</span>
        {/each}
      </div>
      <div class="hm-grid">
        {#each grid as week, wi}
          <div class="hm-week" style="grid-row: 1">
            {#each week as cell, di}
              <div
                class="hm-cell l{level(cell.count)}"
                title="{cell.date} · {cell.count} 题"
              ></div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- legend -->
  <div class="hm-legend">
    <span class="hm-legend-label">少</span>
    <div class="hm-cell l0"></div>
    <div class="hm-cell l1"></div>
    <div class="hm-cell l2"></div>
    <div class="hm-cell l3"></div>
    <div class="hm-cell l4"></div>
    <span class="hm-legend-label">多</span>
  </div>
</div>

<style>
  .heatmap-wrap {
    overflow-x: auto;
    padding: 4px 0;
    max-width: 100%;
  }
  .heatmap {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 580px;
  }

  /* Month labels row */
  .hm-months {
    display: flex;
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 2px;
  }
  .hm-spacer {
    width: 28px;
    flex-shrink: 0;
  }
  .hm-labels-row {
    display: flex;
    gap: 3px;
    flex: 1;
  }
  .hm-month {
    width: 11px;
  }

  /* Body: day labels + grid */
  .hm-body {
    display: flex;
    gap: 4px;
  }
  .hm-days-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 14px;
    flex-shrink: 0;
  }
  .hm-day-label {
    font-size: 9px;
    color: var(--text-dim);
    height: 11px;
    line-height: 11px;
  }

  .hm-grid {
    display: flex;
    gap: 3px;
    flex: 1;
  }
  .hm-week {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .hm-cell {
    width: 11px;
    height: 11px;
    border-radius: 2px;
    background: var(--border);
    transition: background 0.15s;
  }
  .hm-cell.l0 { background: var(--border); }
  .hm-cell.l1 { background: color-mix(in srgb, var(--success) 25%, transparent); }
  .hm-cell.l2 { background: color-mix(in srgb, var(--success) 50%, transparent); }
  .hm-cell.l3 { background: color-mix(in srgb, var(--success) 75%, transparent); }
  .hm-cell.l4 { background: var(--success); }

  /* Legend */
  .hm-legend {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-top: 6px;
    justify-content: flex-end;
    font-size: 10px;
    color: var(--text-dim);
  }
  .hm-legend-label {
    font-size: 10px;
  }
</style>
