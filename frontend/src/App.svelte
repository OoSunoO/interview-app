<script>
  import NavBar from "./components/NavBar.svelte";
  import Home from "./pages/Home.svelte";
  import Browse from "./pages/Browse.svelte";
  import Quiz from "./pages/Quiz.svelte";
  import WrongBook from "./pages/WrongBook.svelte";
  import Stats from "./pages/Stats.svelte";

  let page = $state("home");
  let selectedQuestionId = $state(null);

  function navigate(to, params = {}) {
    if (params.questionId) selectedQuestionId = params.questionId;
    page = to;
  }
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
    {:else if page === "stats"}
      <Stats />
    {/if}
  </main>
  <NavBar current={page} onNavigate={(p) => navigate(p)} />
</div>

<style>
  .app-shell { height: 100%; display: flex; flex-direction: column; }
  .content { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
</style>
