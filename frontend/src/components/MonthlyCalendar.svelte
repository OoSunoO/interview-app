<script>
  let { data = {} } = $props();

  const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  let viewDate = $state(new Date());

  function goMonth(delta) {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + delta);
    viewDate = d;
  }

  function resetToday() {
    viewDate = new Date();
  }

  let grid = $derived.by(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const totalCells = startPad + lastDay.getDate();
    const weeks = Math.ceil(totalCells / 7);

    const cells = [];
    let cellDate = new Date(firstDay);
    cellDate.setDate(cellDate.getDate() - startPad);

    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = dateKey(cellDate);
        const dayData = data[key];
        const isCurrentMonth = cellDate.getMonth() === month;
        const isToday = key === dateKey(new Date());
        let retention = null;
        if (dayData && dayData.reviewed > 0) {
          retention = Math.round((dayData.remembered / dayData.reviewed) * 100);
        }
        week.push({
          date: key,
          day: cellDate.getDate(),
          count: dayData?.reviewed || 0,
          retention,
          remembered: dayData?.remembered || 0,
          forgot: dayData?.forgot || 0,
          hard: dayData?.hard || 0,
          isCurrentMonth,
          isToday,
        });
        cellDate.setDate(cellDate.getDate() + 1);
      }
      weeks.length;
      cells.push(week);
    }
    return cells;
  });

  let monthTotal = $derived.by(() => {
    let reviewed = 0, remembered = 0;
    for (const week of grid) {
      for (const day of week) {
        reviewed += day.count;
        remembered += day.remembered;
      }
    }
    return { reviewed, retention: reviewed > 0 ? Math.round((remembered / reviewed) * 100) : null };
  });

  function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function retentionClass(retention) {
    if (retention === null) return "";
    if (retention >= 70) return "good";
    if (retention >= 40) return "ok";
    return "bad";
  }

  const dayHeaders = ["日", "一", "二", "三", "四", "五", "六"];
</script>

<div class="mc-wrap">
  <div class="mc-header">
    <button class="mc-nav" onclick={() => goMonth(-1)} aria-label="上个月">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    </button>
    <span class="mc-title" role="button" tabindex="0" onclick={resetToday} onkeydown={(e) => e.key === 'Enter' && resetToday()}>
      {viewDate.getFullYear()}年{MONTHS[viewDate.getMonth()]}
    </span>
    <button class="mc-nav" onclick={() => goMonth(1)} aria-label="下个月">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  </div>

  {#if monthTotal.reviewed > 0}
    <div class="mc-month-summary">
      <span class="mc-ms-item">本月 {monthTotal.reviewed} 题</span>
      {#if monthTotal.retention !== null}
        <span class="mc-ms-item {retentionClass(monthTotal.retention)}">{monthTotal.retention}% 掌握率</span>
      {/if}
    </div>
  {/if}

  <div class="mc-grid">
    <div class="mc-row mc-headers">
      {#each dayHeaders as h}
        <span class="mc-header-cell">{h}</span>
      {/each}
    </div>
    {#each grid as week}
      <div class="mc-row">
        {#each week as cell}
          <div
            class="mc-cell"
            class:mc-other={!cell.isCurrentMonth}
            class:mc-today={cell.isToday}
            class:has-data={cell.count > 0}
            title={cell.count > 0
              ? `${cell.date}
复习 ${cell.count} 题
掌握率 ${cell.retention}%
正确 ${cell.remembered} · 待巩固 ${cell.hard} · 忘记 ${cell.forgot}`
              : cell.date}
          >
            <span class="mc-day">{cell.day}</span>
            {#if cell.count > 0}
              <span class="mc-count {retentionClass(cell.retention)}">{cell.count}</span>
              {#if cell.retention !== null}
                <span class="mc-ret {retentionClass(cell.retention)}">{cell.retention}%</span>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .mc-wrap {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px;
    max-width: 100%;
  }
  .mc-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  .mc-nav {
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-dim);
    transition: all 0.15s;
    font-family: inherit;
  }
  .mc-nav:active {
    background: var(--bg-surface);
    color: var(--text);
  }
  .mc-title {
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    color: var(--text);
    padding: 2px 8px;
    border-radius: 6px;
    transition: background 0.15s;
    user-select: none;
  }
  .mc-title:active {
    background: var(--bg-surface);
  }
  .mc-month-summary {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 10px;
    font-size: 12px;
  }
  .mc-ms-item {
    color: var(--text-muted);
  }
  .mc-ms-item.good { color: var(--success); }
  .mc-ms-item.ok { color: var(--warning); }
  .mc-ms-item.bad { color: var(--danger); }
  .mc-grid {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .mc-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
  }
  .mc-headers {
    margin-bottom: 2px;
  }
  .mc-header-cell {
    text-align: center;
    font-size: 10px;
    color: var(--text-dim);
    font-weight: 600;
    padding: 2px 0;
  }
  .mc-cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    gap: 1px;
    padding: 2px;
    cursor: default;
    transition: background 0.15s;
    position: relative;
  }
  .mc-cell.mc-today {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  .mc-cell.mc-other {
    opacity: 0.3;
  }
  .mc-cell.has-data {
    cursor: pointer;
  }
  .mc-cell.has-data:active {
    transform: scale(0.95);
  }
  .mc-day {
    font-size: 11px;
    font-weight: 600;
    color: var(--text);
    line-height: 1;
  }
  .mc-count {
    font-size: 9px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    padding: 1px 4px;
    border-radius: 3px;
    background: var(--bg-surface);
  }
  .mc-count.good { background: var(--success-bg, rgba(34,197,94,0.15)); color: var(--success); }
  .mc-count.ok { background: var(--warning-bg, rgba(234,179,8,0.15)); color: var(--warning); }
  .mc-count.bad { background: var(--danger-bg, rgba(239,68,68,0.15)); color: var(--danger); }
  .mc-ret {
    font-size: 7px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .mc-ret.good { color: var(--success); }
  .mc-ret.ok { color: var(--warning); }
  .mc-ret.bad { color: var(--danger); }
</style>
