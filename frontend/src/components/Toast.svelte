<script>
  import { onMount, onDestroy } from "svelte";
  import { subscribe } from "../lib/toast.js";

  let toasts = $state([]);

  let unsub = () => {};
  onMount(() => {
    unsub = subscribe((ev) => {
      if (ev.type === "add") {
        toasts = [...toasts, { id: ev.id, message: ev.message, variant: ev.variant }];
      } else if (ev.type === "dismiss") {
        toasts = toasts.filter((t) => t.id !== ev.id);
      }
    });
  });
  onDestroy(() => unsub());
</script>

{#if toasts.length > 0}
  <div class="toast-container">
    {#each toasts as toastItem (toastItem.id)}
      <div class="toast toast-{toastItem.variant}" role="status">
        {#if toastItem.variant === "success"}
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        {:else if toastItem.variant === "error"}
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        {:else}
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        {/if}
        <span>{toastItem.message}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: calc(80px + var(--nav-height) + var(--safe-bottom));
    left: 50%;
    transform: translateX(-50%);
    z-index: var(--z-toast);
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    pointer-events: none;
    max-width: 90vw;
  }
  .toast {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: var(--radius-pill);
    background: var(--bg-elevated);
    border: 1px solid var(--glass-border);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    animation: toast-in 0.3s var(--spring) both;
    white-space: nowrap;
    pointer-events: auto;
  }
  .toast-info {
    color: var(--text);
  }
  .toast-success {
    color: var(--success);
  }
  .toast-error {
    color: var(--danger);
  }
  @keyframes toast-in {
    0% { opacity: 0; transform: translateY(12px) scale(0.92); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
