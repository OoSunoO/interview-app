<script>
  import { onMount, onDestroy } from "svelte";
  import { api } from "../lib/local-api.js";
  import { store } from "../lib/stores.svelte.js";

  let { onNavigate } = $props();

  let open = $state(false);
  let query = $state("");
  let inputEl = $state(null);
  let dialogEl = $state(null);
  let selectedIndex = $state(0);

  function trapFocus(e, container) {
    if (e.key !== "Tab" || !container) return;
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  let allQuestions = $state([]);

  // ── Command sources ──

  const pageCommands = [
    { id: "nav-home", label: "首页", page: "home", keywords: "home 主页" },
    { id: "nav-browse", label: "题库浏览", page: "browse", keywords: "browse 题库 浏览" },
    { id: "nav-quiz", label: "随机一题", page: "quiz", keywords: "quiz 练习 随机" },
    { id: "nav-wrong", label: "错题本", page: "wrong", keywords: "wrong 错题" },
    { id: "nav-review", label: "间隔复习", page: "review-session", keywords: "review 复习" },
    { id: "nav-quick-review", label: "速记模式", page: "quick-review", keywords: "quick 速记" },
    { id: "nav-stats", label: "学习进度", page: "stats", keywords: "stats 统计 进度" },
    { id: "nav-knowledge", label: "知识点", page: "knowledge", keywords: "knowledge 知识点" },
    { id: "theme-toggle", label: "切换主题", page: "__theme__", keywords: "theme 主题 深色 浅色 dark light" },
  ];

  let results = $derived.by(() => {
    if (!query.trim()) {
      return pageCommands.map((c) => ({ type: "page", ...c }));
    }
    const q = query.toLowerCase().trim();
    const pages = pageCommands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.toLowerCase().includes(q),
    ).map((c) => ({ type: "page", ...c }));

    const questions = allQuestions
      .filter((qq) => qq.title.toLowerCase().includes(q))
      .slice(0, 15)
      .map((qq) => ({ type: "question", ...qq }));

    return [...pages, ...questions];
  });

  // auto-focus input when palette opens
  $effect(() => {
    if (open) {
      requestAnimationFrame(() => inputEl?.focus());
    }
  });

  // reset selection when results change
  $effect(() => {
    if (results.length > 0) selectedIndex = 0;
  });

  function handleKeydown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      open = !open;
      if (open) {
        query = "";
        selectedIndex = 0;
      }
      return;
    }
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      open = false;
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
      scrollIntoView();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      scrollIntoView();
      return;
    }
    if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      execute(results[selectedIndex]);
      return;
    }
  }

  function scrollIntoView() {
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-index="${selectedIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    });
  }

  function execute(item) {
    open = false;
    if (item.type === "page") {
      if (item.id === "nav-quiz") {
        onNavigate("quiz");
      } else if (item.id === "theme-toggle") {
        store.toggleTheme();
      } else {
        onNavigate(item.page);
      }
    } else if (item.type === "question") {
      onNavigate("quiz", { questionId: item.id });
    }
  }

  function handleOverlayClick() {
    open = false;
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    try {
      allQuestions = api.questions.list({ page_size: 9999 });
    } catch {
      // silently fail — palette just won't show question results
    }
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="cp-overlay" onclick={handleOverlayClick} onkeydown={(e) => { if (e.key === "Escape") open = false; }}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="cp-dialog" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { trapFocus(e, dialogEl); if (e.key === "Escape") open = false; }} bind:this={dialogEl}>
      <div class="cp-input-wrap">
        <svg class="cp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          class="cp-input"
          placeholder="搜索题目或页面…"
          bind:value={query}
          bind:this={inputEl}
          onkeydown={handleKeydown}
        />
        <kbd class="cp-hint">ESC</kbd>
      </div>

      {#if results.length === 0}
        <div class="cp-empty">无匹配结果</div>
      {:else}
        <div class="cp-results">
          {#each results as item, i}
            <button
              class="cp-item"
              class:cp-selected={i === selectedIndex}
              data-index={i}
              onclick={() => execute(item)}
              onmouseenter={() => (selectedIndex = i)}
            >
              {#if item.type === "page"}
                <span class="cp-item-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </span>
                <span class="cp-item-label">{item.label}</span>
                <span class="cp-item-hint">页面</span>
              {:else}
                <span class="cp-item-icon cp-question-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </span>
                <span class="cp-item-label cp-item-qtitle">{item.title}</span>
                <span class="tag diff {item.difficulty}">{item.difficulty}</span>
              {/if}
            </button>
          {/each}
        </div>
        <div class="cp-footer">
          <span><kbd>↑↓</kbd> 导航</span>
          <span><kbd>↵</kbd> 打开</span>
          <span><kbd>ESC</kbd> 关闭</span>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .cp-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-modal-overlay);
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 80px 20px 20px;
    animation: fade-in 0.15s both;
  }
  .cp-dialog {
    width: 100%;
    max-width: 520px;
    background: var(--bg-elevated);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius);
    box-shadow: var(--glass-shadow);
    overflow: hidden;
    animation: scale-in 0.2s var(--spring) both;
  }
  .cp-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }
  .cp-search-icon {
    flex-shrink: 0;
    color: var(--text-dim);
    opacity: 0.5;
  }
  .cp-input {
    flex: 1;
    border: none;
    background: none;
    color: var(--text);
    font-size: 16px;
    font-family: inherit;
    outline: none;
    padding: 0;
  }
  .cp-input::placeholder {
    color: var(--text-dim);
  }
  .cp-hint {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--bg-surface);
    color: var(--text-dim);
    border: 1px solid var(--border);
    font-family: inherit;
  }
  .cp-empty {
    padding: 32px 16px;
    text-align: center;
    color: var(--text-dim);
    font-size: 14px;
  }
  .cp-results {
    max-height: 340px;
    overflow-y: auto;
    padding: 6px;
  }
  .cp-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text);
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
  }
  .cp-item.cp-selected {
    background: var(--accent-bg);
    outline: 1px solid var(--accent);
    outline-offset: -1px;
  }
  .cp-item:active {
    transform: none;
  }
  .cp-item-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface);
    color: var(--text-dim);
  }
  .cp-question-icon {
    color: var(--accent);
    background: var(--accent-bg);
  }
  .cp-item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }
  .cp-item-qtitle {
    font-weight: 600;
  }
  .cp-item-hint {
    font-size: 10px;
    color: var(--text-dim);
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--bg-surface);
    border: 1px solid var(--border-hairline);
    flex-shrink: 0;
  }
  .cp-footer {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 8px 14px;
    border-top: 1px solid var(--border);
    background: var(--bg-surface);
  }
  .cp-footer span {
    font-size: 11px;
    color: var(--text-dim);
  }
  .cp-footer kbd {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-family: inherit;
    font-weight: 600;
  }
</style>
