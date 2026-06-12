<script>
  import { onMount } from "svelte";
  import NavBar from "./components/NavBar.svelte";
  import Home from "./pages/Home.svelte";
  import { fade } from "svelte/transition";
  import { api, ready } from "./lib/local-api.js";
  import { store } from "./lib/stores.svelte.js";
  import CommandPalette from "./components/CommandPalette.svelte";
  import Toast from "./components/Toast.svelte";
  import KeyboardHelp from "./components/KeyboardHelp.svelte";
  import GistSetup from "./components/GistSetup.svelte";
  import SyncStatus from "./components/SyncStatus.svelte";
  import { gistSync } from "./lib/gist-sync.js";

  let page = $state("home");
  let selectedQuestionId = $state(null);
  let selectedTag = $state(null);
  let reviewConfig = $state(null);
  let mockInterviewConfig = $state(null);
  let showGistSetup = $state(false);
  let showGistBtn = $state(false);
  let appReady = $state(false);

  function navigate(to, params = {}) {
    selectedQuestionId = params.questionId ?? null;
    selectedTag = params.tag ?? null;
    reviewConfig = params.reviewConfig ?? null;
    mockInterviewConfig = params.mockInterview ?? null;
    page = to;
  }

  function handleGistComplete(result) {
    showGistSetup = false;
    showGistBtn = true;
    if (result?.restored) {
      store.refreshStats();
      store.refreshDue();
      store.refreshWrong();
      store.refreshDailyStats();
    }
  }

  function openGistSetup() {
    showGistSetup = true;
  }

  let loadError = $state(null);
  let showQuotaWarning = $state(false);

  function dismissQuotaWarning() {
    showQuotaWarning = false;
  }

  onMount(async () => {
    document.addEventListener("storage-quota-exceeded", () => { showQuotaWarning = true; });
    try {
      await ready;
    } catch (e) {
      loadError = e?.message || "加载题库数据失败";
      return;
    }
    api.migrateProgress();
    store.refreshDue();

    gistSync.installBeforeUnloadHook();
    gistSync.migrateToSlotKeys();

    if (!gistSync.hasUsername()) {
      showGistSetup = true;
    } else {
      showGistBtn = true;
      if (gistSync.hasToken()) {
        gistSync.queueSync();
      }
    }

    appReady = true;
  });

  let Page = $state(Home);
  let pageLoading = $state(false);

  const _loaders = {
    browse: () => import("./pages/Browse.svelte"),
    quiz: () => import("./pages/Quiz.svelte"),
    wrong: () => import("./pages/WrongBook.svelte"),
    knowledge: () => import("./pages/KnowledgePoints.svelte"),
    "knowledge-detail": () => import("./pages/KnowledgePointDetail.svelte"),
    stats: () => import("./pages/Stats.svelte"),
    "quick-review": () => import("./pages/QuickReview.svelte"),
    "review-session": () => import("./pages/ReviewSession.svelte"),
    "learning-paths": () => import("./pages/LearningPaths.svelte"),
    "ai-interview": () => import("./pages/AIMockInterview.svelte"),
    bookmarks: () => import("./pages/Bookmarks.svelte"),
  };

  $effect(() => {
    const p = page;
    if (p === "home") {
      Page = Home;
      pageLoading = false;
      return;
    }
    pageLoading = true;
    Page = null;
    const loader = _loaders[p];
    if (loader) {
      loader().then(mod => {
        if (page === p) {
          Page = mod.default;
          pageLoading = false;
        }
      });
    }
  });
</script>

<div class="app-shell">
  {#if loadError}
    <div class="app-load-error">
      <p>加载失败: {loadError}</p>
      <button onclick={() => location.reload()}>刷新页面</button>
    </div>
  {:else if !appReady}
    <div class="app-loading-inner"></div>
  {:else}
  <main class="content">
    {#if Page}
      <div transition:fade={{ duration: 150 }}>
        <Page
          onNavigate={navigate}
          questionId={selectedQuestionId}
          tag={selectedTag}
          config={reviewConfig}
          mockInterview={mockInterviewConfig}
        />
      </div>
    {:else if pageLoading}
      <div class="page-loading">加载中...</div>
    {/if}
  </main>
  <NavBar current={page} onNavigate={(p) => navigate(p)} />
  <CommandPalette onNavigate={navigate} />
  <KeyboardHelp />
  <Toast />

  {#if showGistSetup && appReady}
    <GistSetup onComplete={handleGistComplete} />
  {/if}

  {#if showGistBtn}
    <button class="app-sync-btn" onclick={openGistSetup} data-testid="open-gist-settings" title="同步设置">
      <SyncStatus />
    </button>
  {/if}

  {#if showQuotaWarning}
    <div class="app-quota-warn" role="alert">
      <span>存储空间不足，请及时导出备份以防数据丢失</span>
      <div class="app-quota-actions">
        <button class="app-quota-btn" onclick={() => navigate("stats")}>去导出</button>
        <button class="app-quota-close" onclick={dismissQuotaWarning}>✕</button>
      </div>
    </div>
  {/if}
  {/if}
</div>

<style>
  .app-shell {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .page-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    font-size: 14px;
  }
  .app-quota-warn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: var(--z-modal, 100);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
    background: var(--warning-bg, #fef3c7);
    color: var(--warning, #d97706);
    font-size: 13px;
    font-weight: 500;
    border-top: 1px solid var(--warning-glow, #f59e0b33);
    animation: slideUp 0.3s ease;
  }
  .app-quota-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .app-quota-btn {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
    background: var(--warning, #d97706);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s;
  }
  .app-quota-btn:active { opacity: 0.8; }
  .app-quota-close {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: none;
    border: 1px solid var(--warning-glow, transparent);
    color: var(--warning, #d97706);
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .app-quota-close:active {
    background: var(--warning-bg, transparent);
  }

  .app-sync-btn {
    position: fixed;
    top: 12px;
    right: max(12px, var(--safe-right));
    z-index: var(--z-sticky);
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    font-family: inherit;
  }
  .app-sync-btn:active {
    transform: none;
  }
  .app-load-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 16px;
    color: var(--text-secondary, #8a8a9a);
  }
  .app-load-error button {
    padding: 8px 24px;
    border-radius: 8px;
    border: 1px solid var(--border, #333);
    background: var(--bg-card, #1a1a2e);
    color: var(--text-primary, #e0e0e0);
    cursor: pointer;
    font-size: 14px;
  }
</style>
