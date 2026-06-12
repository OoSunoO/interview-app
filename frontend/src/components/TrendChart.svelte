<script>
  let { data = [] } = $props();

  let hovered = $state(null);
  let svgEl = $state(null);

  const W = 600, H = 200;
  const padL = 36, padR = 12, padT = 16, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  let maxReviewed = $derived(Math.max(...data.map(d => d.reviewed), 1));

  let step = $derived(chartW / Math.max(data.length - 1, 1));
  let linePoints = $derived(
    data.map((d, i) => `${padL + i * step},${padT + chartH - (d.retention / 100) * chartH}`).join(' ')
  );

  function barHeight(reviewed) {
    return Math.max(2, (reviewed / maxReviewed) * chartH * 0.4);
  }

  function handleMouseEnter(i) {
    hovered = data[i];
  }

  function handleMouseLeave() {
    hovered = null;
  }

  function handleTouch(e, i) {
    e.preventDefault();
    hovered = hovered?.date === data[i]?.date ? null : data[i];
  }
</script>

{#if data.length >= 2}
  <div class="tc-wrap">
    <svg viewBox="0 0 {W} {H}" class="tc-svg" bind:this={svgEl} role="img" aria-label="掌握率趋势图">
      <defs>
        <linearGradient id="tc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.15" />
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      {#each [0, 25, 50, 75, 100] as pct}
        <line
          x1={padL} y1={padT + chartH - (pct / 100) * chartH}
          x2={W - padR} y2={padT + chartH - (pct / 100) * chartH}
          stroke="currentColor" stroke-opacity="0.06" stroke-width="1"
        />
        <text
          x={padL - 4} y={padT + chartH - (pct / 100) * chartH + 3}
          text-anchor="end" fill="currentColor" fill-opacity="0.3" font-size="8"
        >{pct}%</text>
      {/each}

      <path
        d="M{linePoints} L{padL + (data.length - 1) * step},{padT + chartH} L{padL},{padT + chartH}Z"
        fill="url(#tc-area)"
      />

      {#each data as d, i}
        <rect
          x={padL + i * step - step / 3}
          y={padT + chartH - barHeight(d.reviewed)}
          width={step * 0.6}
          height={barHeight(d.reviewed)}
          fill="var(--accent)" fill-opacity="0.08"
          rx="1"
        />
      {/each}

      <polyline
        points={linePoints}
        fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      />

      {#each data as d, i}
        <g role="button" tabindex="0"
          onmouseenter={() => handleMouseEnter(i)}
          onmouseleave={handleMouseLeave}
          ontouchstart={(e) => handleTouch(e, i)}
          onfocus={() => handleMouseEnter(i)}
          onblur={handleMouseLeave}
          onkeydown={(e) => { if (e.key === 'Escape') hovered = null; }}
          style="cursor:pointer"
        >
          <circle
            cx={padL + i * step}
            cy={padT + chartH - (d.retention / 100) * chartH}
            r="3"
            fill={hovered?.date === d.date ? 'var(--accent)' : 'var(--bg-elevated)'}
            stroke="var(--accent)" stroke-width="2"
          />
          {#if step > 20}
            <text
              x={padL + i * step}
              y={H - 4}
              text-anchor="middle"
              fill="currentColor" fill-opacity="0.35"
              font-size="7"
            >{d.label}</text>
          {/if}
        </g>
      {/each}
    </svg>

    {#if hovered}
      <div class="tc-tooltip" style="left:{padL + data.findIndex(d => d.date === hovered.date) * step}px">
        <div class="tc-tooltip-date">{hovered.date}</div>
        <div class="tc-tooltip-row">
          <span class="tc-tooltip-dot" style="background:var(--accent)"></span>
          <span>掌握率 <strong>{hovered.retention}%</strong></span>
        </div>
        <div class="tc-tooltip-row">
          <span class="tc-tooltip-dot" style="background:var(--accent);opacity:0.4"></span>
          <span>复习 <strong>{hovered.reviewed}</strong> 题</span>
        </div>
      </div>
    {/if}
  </div>
{:else if data.length === 1}
  <div class="tc-single">今日掌握率：{data[0].retention}%（{data[0].reviewed} 题）</div>
{/if}

<style>
  .tc-wrap {
    position: relative;
    width: 100%;
    overflow: visible;
  }
  .tc-svg {
    width: 100%;
    height: auto;
    display: block;
  }
  .tc-tooltip {
    position: absolute;
    top: 0;
    transform: translate(-50%, -100%);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .tc-tooltip-date {
    font-size: 10px;
    color: var(--text-dim);
    margin-bottom: 4px;
  }
  .tc-tooltip-row {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text);
    line-height: 1.6;
  }
  .tc-tooltip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .tc-single {
    font-size: 13px;
    color: var(--text-muted);
    padding: 12px 0;
  }
</style>
