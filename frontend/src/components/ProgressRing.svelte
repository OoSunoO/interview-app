<script>
  let { percentage = 0, size = 80, strokeWidth = 6 } = $props();
  const radius = $derived((size - strokeWidth) / 2);
  const circumference = $derived(2 * Math.PI * radius);
  const offset = $derived(circumference - (percentage / 100) * circumference);
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}">
  <circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    stroke="var(--border)"
    stroke-width={strokeWidth}
    fill="none"
  />
  <circle
    cx={size / 2}
    cy={size / 2}
    r={radius}
    stroke="var(--accent)"
    stroke-width={strokeWidth}
    fill="none"
    stroke-linecap="round"
    stroke-dasharray={circumference}
    stroke-dashoffset={offset}
    transform="rotate(-90, {size / 2}, {size / 2})"
    style="transition: stroke-dashoffset 0.5s"
  />
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    fill="var(--text)"
    font-size="16"
    font-weight="700"
  >
    {Math.round(percentage)}%
  </text>
</svg>
