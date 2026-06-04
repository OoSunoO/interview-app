<script>
  let open = $state(false);

  const shortcuts = [
    { keys: ["⌘K", "Ctrl+K"], desc: "打开命令面板" },
    { keys: ["?"], desc: "显示键盘快捷键" },
    { keys: ["/"], desc: "聚焦搜索（题库页）" },
    { keys: ["Esc"], desc: "关闭弹窗 / 返回" },
  ];

  const quizShortcuts = [
    { keys: ["Space"], desc: "查看答案" },
    { keys: ["1"], desc: "速记：不会" },
    { keys: ["2"], desc: "速记：大概会" },
    { keys: ["3"], desc: "速记：已掌握" },
    { keys: ["R"], desc: "速记 / 复习：重新开始" },
    { keys: ["Esc"], desc: "速记 / 复习：退出" },
  ];

  function handleKeydown(e) {
    if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      e.preventDefault();
      open = !open;
      return;
    }
    if (e.key === "Escape" && open) {
      open = false;
    }
  }

  $effect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });
</script>

<button class="kh-trigger" onclick={() => (open = !open)} aria-label="键盘快捷键" title="键盘快捷键 (?)">
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12" />
  </svg>
</button>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="kh-overlay" onclick={() => (open = false)} onkeydown={(e) => { if (e.key === "Escape") open = false; }}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="kh-dialog" role="dialog" aria-modal="true" aria-label="键盘快捷键" tabindex="-1" onclick={(e) => e.stopPropagation()}>
      <div class="kh-header">
        <span class="kh-title">键盘快捷键</span>
        <button class="kh-close" onclick={() => (open = false)} aria-label="关闭">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div class="kh-section">
        <div class="kh-section-title">全局</div>
        {#each shortcuts as s}
          <div class="kh-row">
            <div class="kh-keys">
              {#each s.keys as k, i}
                <kbd class="kh-kbd">{k}</kbd>
                {#if i < s.keys.length - 1}<span class="kh-or">或</span>{/if}
              {/each}
            </div>
            <span class="kh-desc">{s.desc}</span>
          </div>
        {/each}
      </div>

      <div class="kh-section">
        <div class="kh-section-title">速记 / 复习</div>
        {#each quizShortcuts as s}
          <div class="kh-row">
            <div class="kh-keys">
              {#each s.keys as k, i}
                <kbd class="kh-kbd">{k}</kbd>
                {#if i < s.keys.length - 1}<span class="kh-or">或</span>{/if}
              {/each}
            </div>
            <span class="kh-desc">{s.desc}</span>
          </div>
        {/each}
      </div>

      <div class="kh-footer">
        <span class="kh-hint">按 <kbd class="kh-kbd">?</kbd> 随时打开此面板</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .kh-trigger {
    position: fixed;
    bottom: calc(var(--nav-height, 64px) + 12px + var(--safe-bottom, 0px));
    right: 12px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-dim);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-fab, 50);
    opacity: 0.5;
    transition: opacity 0.2s, transform 0.2s var(--spring);
    padding: 0;
  }
  .kh-trigger:hover {
    opacity: 1;
  }
  .kh-trigger:active {
    transform: scale(0.88);
  }

  .kh-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal-overlay, 100);
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fade-in 0.15s both;
  }
  .kh-dialog {
    background: var(--bg-elevated);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius);
    box-shadow: var(--glass-shadow);
    width: 100%;
    max-width: 380px;
    max-height: 80vh;
    overflow-y: auto;
    animation: scale-in 0.2s var(--spring) both;
  }
  .kh-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px 12px;
    border-bottom: 1px solid var(--border);
  }
  .kh-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  .kh-close {
    width: 28px;
    height: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    border-radius: 6px;
  }
  .kh-close:hover {
    background: var(--bg-surface);
    color: var(--text);
  }
  .kh-section {
    padding: 12px 18px;
  }
  .kh-section + .kh-section {
    border-top: 1px solid var(--border);
  }
  .kh-section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text-dim);
    margin-bottom: 8px;
  }
  .kh-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 5px 0;
  }
  .kh-keys {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .kh-kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 600;
    font-family: inherit;
    border-radius: 4px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .kh-or {
    font-size: 10px;
    color: var(--text-dim);
    margin: 0 2px;
  }
  .kh-desc {
    font-size: 13px;
    color: var(--text-muted);
    text-align: right;
    flex-shrink: 1;
    min-width: 0;
  }
  .kh-footer {
    padding: 10px 18px;
    border-top: 1px solid var(--border);
    background: var(--bg-surface);
    border-radius: 0 0 var(--radius) var(--radius);
  }
  .kh-hint {
    font-size: 11px;
    color: var(--text-dim);
  }
  .kh-hint .kh-kbd {
    min-width: 18px;
    height: 18px;
    font-size: 10px;
    padding: 0 4px;
  }
</style>
