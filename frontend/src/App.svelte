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
  import { api } from "./lib/local-api.js";

  let page = $state("home");
  let selectedQuestionId = $state(null);
  let selectedTag = $state(null);
  let reviewConfig = $state(null);

  function navigate(to, params = {}) {
    if (params.questionId) selectedQuestionId = params.questionId;
    if (params.tag) selectedTag = params.tag;
    if (params.reviewConfig) reviewConfig = params.reviewConfig;
    page = to;
  }

  onMount(() => {
    api.migrateProgress();
  });
</script>

<div class="app-shell">
  <main class="content">
    {#if page === "home"}
      <Home onNavigate={navigate} />
    {:else if page === "browse"}
      <Browse onNavigate={navigate} />
    {:else if page === "quiz"}
      <Quiz questionId={selectedQuestionId} onNavigate={navigate} />
    {:else if page === "wrong"}
      <WrongBook onNavigate={navigate} />
    {:else if page === "knowledge"}
      <KnowledgePoints onNavigate={navigate} />
    {:else if page === "knowledge-detail"}
      <KnowledgePointDetail tag={selectedTag} onNavigate={navigate} />
    {:else if page === "stats"}
      <Stats />
    {:else if page === "quick-review"}
      <QuickReview config={reviewConfig} onNavigate={navigate} />
    {:else if page === "review-session"}
      <ReviewSession config={reviewConfig} onNavigate={navigate} />
    {/if}
  </main>
  <NavBar current={page} onNavigate={(p) => navigate(p)} />
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
</style>
