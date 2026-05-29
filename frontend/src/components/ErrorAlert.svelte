<script>
  let { message = "出错了", onRetry } = $props();
</script>

<div class="error-shell">
  <div class="error-inner">
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <p class="error-msg">{message}</p>
    {#if onRetry}
      <button class="error-retry" onclick={onRetry}>重试</button>
    {/if}
  </div>
</div>

<style>
  .error-shell {
    background: var(--glass-bg);
    border: 1px solid rgba(248, 113, 113, 0.15);
    border-radius: var(--radius);
    padding: 4px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .error-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 16px;
    background: var(--danger-bg);
    border-radius: calc(var(--radius) - 2px);
    color: var(--danger);
    text-align: center;
  }
  .error-msg {
    font-size: 14px;
    line-height: 1.5;
  }
  .error-retry {
    margin-top: 4px;
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
    background: var(--danger);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .error-retry:active {
    transform: scale(0.96);
  }
</style>
