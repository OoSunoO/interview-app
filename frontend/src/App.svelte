<script>
  import { onMount } from "svelte";
  import NavBar from "./components/NavBar.svelte";
  import Home from "./pages/Home.svelte";
  import Browse from "./pages/Browse.svelte";
  import Quiz from "./pages/Quiz.svelte";
  import WrongBook from "./pages/WrongBook.svelte";
  import Stats from "./pages/Stats.svelte";
  import KnowledgePoints from "./pages/KnowledgePoints.svelte";
  import KnowledgePointDetail from "./pages/KnowledgePointDetail.svelte";
  import QuickReview from "./pages/QuickReview.svelte";
  import ReviewSession from "./pages/ReviewSession.svelte";
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
    // If restored from Gist, refresh all views
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

  onMount(async () => {
    try {
      await ready;
    } catch (e) {
      loadError = e?.message || "加载题库数据失败";
      return;
    }
    api.migrateProgress();
    store.refreshDue();

    // Install beforeunload hook for last-chance sync
    gistSync.installBeforeUnloadHook();
    gistSync.migrateToSlotKeys();

    // Show GistSetup if first time (no username)
    if (!gistSync.hasUsername()) {
      showGistSetup = true;
    } else {
      showGistBtn = true;
      // If token is set, queue an initial sync
      if (gistSync.hasToken()) {
        gistSync.queueSync();
      }
    }

    appReady = true;
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
    {#key page}
      <div transition:fade={{ duration: 150 }}>
        {#if page === "home"}
          <Home onNavigate={navigate} />
        {:else if page === "browse"}
          <Browse onNavigate={navigate} />
        {:else if page === "quiz"}
          <Quiz questionId={selectedQuestionId} onNavigate={navigate} mockInterview={mockInterviewConfig} />
        {:else if page === "wrong"}
          <WrongBook onNavigate={navigate} />
        {:else if page === "knowledge"}
          <KnowledgePoints onNavigate={navigate} />
        {:else if page === "knowledge-detail"}
          <KnowledgePointDetail tag={selectedTag} onNavigate={navigate} />
        {:else if page === "stats"}
          <Stats onNavigate={navigate} />
        {:else if page === "quick-review"}
          <QuickReview config={reviewConfig} onNavigate={navigate} />
        {:else if page === "review-session"}
          <ReviewSession config={reviewConfig} onNavigate={navigate} />
        {/if}
      </div>
    {/key}
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
