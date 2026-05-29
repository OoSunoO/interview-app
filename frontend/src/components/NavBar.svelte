<script>
  import { store } from "../lib/stores.svelte.js";
  let { current = "home", onNavigate } = $props();

  const tabs = [
    { id: "home", label: "首页", icon: "home" },
    { id: "browse", label: "题库", icon: "browse" },
    { id: "knowledge", label: "知识点", icon: "knowledge" },
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
        {:else if tab.icon === "knowledge"}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
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
  <button class="theme-btn" onclick={() => store.toggleTheme()} aria-label="切换主题">
    {#if store.theme === "dark"}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    {:else}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>
    {/if}
  </button>
</nav>

<style>
  .nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: var(--nav-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid var(--border);
    padding-bottom: var(--safe-bottom);
    z-index: 100;
    height: var(--nav-height);
    transition: background-color 0.3s ease, border-color 0.3s ease;
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
  .theme-btn {
    position: absolute;
    top: 8px;
    right: 12px;
    padding: 6px;
    background: none;
    color: var(--text-dim);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s, transform 0.2s;
  }
  .theme-btn:active { transform: scale(0.85); color: var(--accent); }
</style>
