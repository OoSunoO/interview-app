<script>
  import { onMount, onDestroy } from "svelte";
  import { gistSync } from "../lib/gist-sync.js";

  let status = $state("idle");
  let errorMsg = $state(null);
  let lastSync = $state(null);

  let unsub = () => {};

  onMount(() => {
    const s = gistSync.getSyncStatus();
    status = s.status;
    errorMsg = s.error;
    lastSync = s.lastSync;

    unsub = gistSync.onStatusChange((s) => {
      status = s.status;
      errorMsg = s.error;
      lastSync = s.lastSync;
    });
  });

  onDestroy(() => unsub());

  let hasToken = $derived(gistSync.hasToken());

  function formatTime(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "刚刚";
      if (diffMin < 60) return `${diffMin}分钟前`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}小时前`;
      return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }
</script>

{#if hasToken}
  <div class="ss-status" data-testid="sync-status" class:ss-idle={status === "idle"} class:ss-syncing={status === "syncing"} class:ss-synced={status === "synced"} class:ss-error={status === "error"}>
    {#if status === "syncing"}
      <span class="ss-spinner"></span>
      <span class="ss-text">同步中</span>
    {:else if status === "synced"}
      <svg class="ss-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span class="ss-text" title={lastSync ? `上次同步: ${lastSync}` : ""}>
        已同步{formatTime(lastSync) ? ` ${formatTime(lastSync)}` : ""}
      </span>
    {:else if status === "error"}
      <svg class="ss-icon ss-icon-error" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span class="ss-text" title={errorMsg || ""}>同步失败</span>
    {:else}
      <svg class="ss-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
      </svg>
      <span class="ss-text">等待同步</span>
    {/if}
  </div>
{/if}

<style>
  .ss-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.3px;
    transition: all 0.3s var(--spring);
  }
  .ss-idle {
    background: var(--bg-surface);
    color: var(--text-dim);
    border: 1px solid var(--border-hairline);
  }
  .ss-syncing {
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px solid var(--accent-glow);
  }
  .ss-synced {
    background: var(--success-bg);
    color: var(--success);
    border: 1px solid var(--success-glow);
  }
  .ss-error {
    background: var(--danger-bg);
    color: var(--danger);
    border: 1px solid var(--danger-glow);
  }
  .ss-spinner {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ss-spin 0.6s linear infinite;
  }
  .ss-icon {
    flex-shrink: 0;
  }
  .ss-icon-error {
    color: var(--danger);
  }
  .ss-text {
    white-space: nowrap;
  }
  @keyframes ss-spin {
    to { transform: rotate(360deg); }
  }
</style>
