<script>
  let { current = "home", onNavigate } = $props();

  const tabs = [
    { id: "home", label: "首页", icon: "🏠" },
    { id: "browse", label: "题库", icon: "📚" },
    { id: "wrong", label: "错题", icon: "❌" },
    { id: "stats", label: "进度", icon: "📊" },
  ];
</script>

<nav class="nav">
  {#each tabs as tab}
    <button
      class="nav-item"
      class:active={current === tab.id}
      onclick={() => onNavigate(tab.id)}
    >
      <span class="icon">{tab.icon}</span>
      <span class="label">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: var(--bg-card);
    border-top: 1px solid var(--border);
    padding-bottom: var(--safe-bottom);
    z-index: 100;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 0;
    background: none;
    color: var(--text-muted);
    border-radius: 0;
  }
  .nav-item.active { color: var(--accent); }
  .icon { font-size: 20px; line-height: 1; }
  .label { font-size: 11px; }
</style>
