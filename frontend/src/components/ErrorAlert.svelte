<script>
  let { message = "出错了", onRetry } = $props();
</script>

<div class="error-alert">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
  <p class="error-msg">{message}</p>
  {#if onRetry}
    <button class="retry-btn" onclick={onRetry}>重试</button>
  {/if}
</div>

<style>
  .error-alert {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 16px;
    background: var(--danger-bg);
    border: 1px solid rgba(248, 113, 113, 0.3);
    border-radius: var(--radius);
    color: var(--danger);
    text-align: center;
  }
  .error-msg { font-size: 14px; line-height: 1.5; }
  .retry-btn {
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
  .retry-btn:active { transform: scale(0.96); }
</style>
