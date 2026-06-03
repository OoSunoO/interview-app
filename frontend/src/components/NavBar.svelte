<script>
  import { store } from "../lib/stores.svelte.js";
  let { current = "home", onNavigate } = $props();

  const tabs = [
    { id: "home", label: "首页", icon: "home" },
    { id: "knowledge", label: "知识点", icon: "knowledge" },
    { id: "browse", label: "题库", icon: "browse" },
    { id: "wrong", label: "错题", icon: "wrong" },
    { id: "stats", label: "进度", icon: "stats" },
  ];

  const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "";
</script>

<nav class="nav-island">
  <div class="nav-inner">
    {#each tabs as tab}
      <button class="nav-item" class:active={current === tab.id} onclick={() => onNavigate(tab.id)}>
        <span class="icon-wrap">
          {#if tab.icon === "home"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"
              />
            </svg>
          {:else if tab.icon === "knowledge"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><path
                d="M12 17h.01"
              />
            </svg>
          {:else if tab.icon === "browse"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path
                d="M2 12l10 5 10-5"
              />
            </svg>
          {:else if tab.icon === "wrong"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          {:else if tab.icon === "stats"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          {/if}
        </span>
        <span class="label">{tab.label}</span>
      </button>
    {/each}
  </div>
  <button class="theme-toggle" onclick={() => store.toggleTheme()} aria-label="切换主题">
    {#if store.theme === "dark"}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    {:else}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    {/if}
  </button>
  {#if version}
    <div class="version-label">v{version}</div>
  {/if}
</nav>

<style>
  .nav-island {
    position: fixed;
    bottom: max(12px, var(--safe-bottom));
    left: max(12px, var(--safe-left, 0px));
    right: max(12px, var(--safe-right, 0px));
    z-index: var(--z-nav);
  }
  .nav-inner {
    display: flex;
    background: var(--nav-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    padding: 4px;
    height: var(--nav-height);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
    transition:
      background-color 0.4s var(--spring),
      border-color 0.4s var(--spring);
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    padding: 0 4px;
    background: none;
    color: var(--text-dim);
    border-radius: var(--radius-lg);
    position: relative;
    transition:
      color 0.3s var(--spring),
      background 0.3s var(--spring);
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
  .nav-item.active {
    color: var(--accent);
    background: var(--accent-bg);
  }
  .nav-item:active {
    transform: scale(0.94);
  }
  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    transition: transform 0.3s var(--spring);
  }
  .nav-item:active .icon-wrap {
    transform: scale(0.85);
  }
  .label {
    font-size: 9px;
    letter-spacing: 0.3px;
    font-weight: 600;
  }

  .theme-toggle {
    position: absolute;
    top: -44px;
    right: 4px;
    width: 34px;
    height: 34px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 50%;
    color: var(--text-muted);
    transition: all 0.3s var(--spring);
    cursor: pointer;
    z-index: calc(var(--z-nav) + 1);
  }
  .theme-toggle:active {
    transform: scale(0.88);
    color: var(--accent);
  }

  .version-label {
    position: absolute;
    top: -44px;
    left: 4px;
    font-size: 9px;
    color: var(--text-dim);
    font-weight: 500;
    letter-spacing: 0.5px;
    padding: 4px 10px;
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-pill);
  }

  /* ── Mobile ── */
  @media (max-width: 420px) {
    .nav-inner {
      padding: 2px;
      height: 52px;
    }
    .label {
      font-size: 8px;
    }
    .icon-wrap svg {
      width: 18px;
      height: 18px;
    }
  }
</style>
