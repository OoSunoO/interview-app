<script>
  let { current = "home", onNavigate } = $props();

  const tabs = [
    { id: "home", label: "首页", icon: "home" },
    { id: "browse", label: "题库", icon: "browse" },
    { id: "wrong", label: "错题", icon: "wrong" },
    { id: "stats", label: "进度", icon: "stats" },
  ];
</script>

<nav class="nav">
  {#each tabs as tab}
    <button
      class="nav-item"
      class:active={current === tab.id}
      onclick={() => onNavigate(tab.id)}
    >
      <span class="icon-wrap">
        {#if tab.icon === "home"}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/>
          </svg>
        {:else if tab.icon === "browse"}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            <path d="M8 7h8M8 11h6"/>
          </svg>
        {:else if tab.icon === "wrong"}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        {:else if tab.icon === "stats"}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
        {/if}
      </span>
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
    background: rgba(21, 31, 56, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--border);
    padding-bottom: var(--safe-bottom);
    z-index: 100;
    height: var(--nav-height);
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 0;
    background: none;
    color: var(--text-dim);
    border-radius: 0;
    position: relative;
    transition: color 0.2s;
  }
  .nav-item.active { color: var(--accent); }
  .nav-item.active::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: var(--accent);
    border-radius: 0 0 2px 2px;
  }
  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    transition: transform 0.2s;
  }
  .nav-item:active .icon-wrap { transform: scale(0.85); }
  .label { font-size: 10px; letter-spacing: 0.2px; }
</style>
