<script>
  import { gistSync } from "../lib/gist-sync.js";

  let { onComplete = () => {} } = $props();

  let username = $state(gistSync.getUsername() || "");
  let token = $state(gistSync.getToken() || "");
  let step = $state("form"); // form | validating | done
  let error = $state(null);
  let showSettings = $state(false);
  let initial = $state(false); // true = first-time setup

  // Detect if this is first-time setup (no username and no token)
  function checkInitial() {
    initial = !gistSync.hasUsername() && !gistSync.hasToken();
  }

  checkInitial();

  let userInputEl = $state(null);
  let tokenInputEl = $state(null);

  $effect(() => {
    if (step === "form" && !username && userInputEl) {
      requestAnimationFrame(() => userInputEl?.focus());
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) {
      error = "请输入用户名";
      return;
    }
    if (!token.trim()) {
      error = "请输入 GitHub Personal Access Token";
      return;
    }

    step = "validating";
    error = null;

    const result = await gistSync.setupSync(token.trim(), username.trim());
    if (result.ok) {
      step = "done";
      gistSync.installBeforeUnloadHook();
      gistSync.migrateToSlotKeys();
      setTimeout(() => {
        onComplete({ restored: result.restored });
      }, 800);
    } else {
      error = result.error;
      step = "form";
    }
  }

  function handleSkip() {
    // Save username only (no token)
    if (username.trim()) {
      gistSync.setUsername(username.trim());
      gistSync.migrateToSlotKeys();
    }
    onComplete({ skipped: true });
  }

  function handleCancel() {
    showSettings = false;
  }

  function handleDisconnect() {
    gistSync.teardownSync();
    token = "";
    showSettings = false;
    // Re-show setup as initial since token is gone
    initial = true;
  }

  function openSettings() {
    showSettings = true;
    step = "form";
    error = null;
  }

  // When username changes, save it immediately
  $effect(() => {
    if (username.trim() && !token.trim()) {
      gistSync.setUsername(username.trim());
    }
  });
</script>

{#if initial || showSettings}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="gs-overlay" onclick={showSettings ? handleCancel : undefined} onkeydown={(e) => { if (e.key === "Escape" && showSettings) handleCancel(); }}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="gs-dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()}>
      {#if step === "done"}
        <div class="gs-done">
          <svg class="gs-done-icon" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2 class="gs-title">同步就绪</h2>
          <p class="gs-desc">
            {#if initial}
              答题记录将自动备份到 GitHub Gist，并可跨设备恢复。
            {:else}
              同步配置已更新。
            {/if}
          </p>
          {#if token}
            <p class="gs-tagged"><span class="gs-tag">Token ✓</span> <span class="gs-tag">Gist ✓</span></p>
          {/if}
        </div>
      {:else}
        <div class="gs-header">
          <h2 class="gs-title">
            {#if showSettings}
              同步设置
            {:else}
              欢迎使用面试题 App
            {/if}
          </h2>
          <p class="gs-desc">
            {#if showSettings}
              配置或修改 GitHub Gist 同步。
            {:else}
              配置用户名和 GitHub Token 以启用多设备同步。
            {/if}
          </p>
        </div>

        <form class="gs-form" onsubmit={handleSubmit}>
          <label class="gs-label">
            用户名
            <input
              class="gs-input"
              type="text"
              placeholder="例如：peter"
              bind:value={username}
              bind:this={userInputEl}
              data-testid="gist-username-input"
              autocomplete="username"
            />
            <span class="gs-hint">用于多设备间识别您的答题记录</span>
          </label>

          <label class="gs-label">
            GitHub Personal Access Token
            <input
              class="gs-input"
              type="password"
              placeholder="ghp_..."
              bind:value={token}
              bind:this={tokenInputEl}
              data-testid="gist-token-input"
              autocomplete="off"
            />
            <span class="gs-hint">
              仅需 <code>gist</code> 权限。
              <a href="https://github.com/settings/tokens/new?scopes=gist&description=面试题App同步"
                target="_blank" rel="noopener noreferrer">创建 Token</a>
            </span>
          </label>

          {#if error}
            <div class="gs-error" role="alert" data-testid="gist-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          {/if}

          <div class="gs-actions">
            <button
              class="gs-btn gs-btn-primary"
              type="submit"
              disabled={step === "validating"}
              data-testid="gist-submit-btn"
            >
              {#if step === "validating"}
                <span class="gs-spinner"></span>
                验证中…
              {:else}
                {#if showSettings}
                  保存
                {:else}
                  同步并开始
                {/if}
              {/if}
            </button>

            {#if initial && !showSettings}
              <button type="button" class="gs-btn gs-btn-skip" onclick={handleSkip} data-testid="gist-skip-btn">
                跳过，仅本地使用
              </button>
            {/if}
          </div>
        </form>

        {#if showSettings && (gistSync.hasToken() || gistSync.hasUsername())}
          <div class="gs-footer">
            <button type="button" class="gs-btn gs-btn-danger" onclick={handleDisconnect}>
              断开同步并清除 Token
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}

<style>
  .gs-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal-overlay);
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: gs-fade-in 0.2s both;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .gs-dialog {
    width: 100%;
    max-width: 420px;
    background: var(--bg-elevated);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-shadow);
    padding: 28px 24px 24px;
    animation: gs-scale-in 0.25s var(--spring) both;
  }
  .gs-header {
    margin-bottom: 20px;
  }
  .gs-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.3px;
    margin: 0 0 6px;
  }
  .gs-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0;
  }
  .gs-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .gs-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }
  .gs-input {
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text);
    font-size: 15px;
    outline: none;
    font-family: inherit;
    transition: border-color 0.2s;
  }
  .gs-input:focus {
    border-color: var(--accent);
    background: var(--bg-elevated);
  }
  .gs-input::placeholder {
    color: var(--text-dim);
  }
  .gs-hint {
    font-size: 11px;
    color: var(--text-dim);
    font-weight: 400;
  }
  .gs-hint a {
    color: var(--accent);
    text-decoration: none;
  }
  .gs-hint a:hover {
    text-decoration: underline;
  }
  .gs-hint code {
    font-size: 11px;
    padding: 1px 5px;
    border-radius: 3px;
    background: var(--bg-surface);
    border: 1px solid var(--border-hairline);
  }
  .gs-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    background: var(--danger-bg);
    border: 1px solid var(--danger-glow);
    color: var(--danger);
    font-size: 13px;
    font-weight: 500;
  }
  .gs-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }
  .gs-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 20px;
    border-radius: var(--radius-sm);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .gs-btn:active {
    transform: scale(0.97);
  }
  .gs-btn:disabled {
    opacity: 0.5;
    cursor: default;
    transform: none;
  }
  .gs-btn-primary {
    background: var(--accent-gradient);
    color: #fff;
    box-shadow: 0 2px 8px var(--accent-glow);
  }
  .gs-btn-primary:hover:not(:disabled) {
    box-shadow: 0 4px 16px var(--accent-glow);
  }
  .gs-btn-skip {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .gs-btn-skip:hover {
    color: var(--text);
    border-color: var(--text-dim);
  }
  .gs-btn-danger {
    background: transparent;
    color: var(--danger);
    border: 1px solid var(--danger-glow);
    font-size: 13px;
  }
  .gs-btn-danger:hover {
    background: var(--danger-bg);
  }
  .gs-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: gs-spin 0.6s linear infinite;
  }
  .gs-done {
    text-align: center;
    padding: 12px 0;
  }
  .gs-done-icon {
    margin: 0 auto 12px;
    color: var(--success);
  }
  .gs-tagged {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
  }
  .gs-tag {
    font-size: 11px;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    background: var(--success-bg);
    color: var(--success);
    font-weight: 600;
  }
  .gs-footer {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: center;
  }
  @keyframes gs-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes gs-scale-in {
    0% { opacity: 0; transform: scale(0.92) translateY(8px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes gs-spin {
    to { transform: rotate(360deg); }
  }
</style>
