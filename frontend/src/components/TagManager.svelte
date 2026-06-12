<script>
  import { api } from "../lib/local-api.js";

  let { show = false, questions = [], onclose, onchange } = $props();

  const TAG_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#a855f7"];

  let userTagDefs = $state([]);
  let editingTag = $state(null);
  let newTagName = $state("");
  let newTagColor = $state(TAG_COLORS[0]);

  function loadDefs() {
    userTagDefs = api.tags.definitions();
  }

  $effect(() => {
    if (show) {
      loadDefs();
      editingTag = null;
      newTagName = "";
      newTagColor = TAG_COLORS[0];
    }
  });

  function editTag(tag) {
    editingTag = tag;
    newTagName = tag.name;
    newTagColor = tag.color;
  }

  function addTag() {
    const name = newTagName.trim();
    if (!name) return;
    if (editingTag) {
      editingTag.name = name;
      editingTag.color = newTagColor;
      userTagDefs = api.tags.saveDefinition(editingTag);
      editingTag = null;
    } else {
      const id = "ut_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
      const tag = { id, name, color: newTagColor };
      userTagDefs = api.tags.saveDefinition(tag);
    }
    newTagName = "";
    newTagColor = TAG_COLORS[0];
    onchange?.(userTagDefs);
  }

  function deleteTag(tagId) {
    userTagDefs = api.tags.deleteDefinition(tagId);
    editingTag = null;
    onchange?.(userTagDefs);
  }

  function close() {
    onclose?.();
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={close}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="tag-manager" onclick={(e) => e.stopPropagation()}>
      <div class="tm-header">
        <h3>标签管理</h3>
        <button class="tm-close" onclick={close}>✕</button>
      </div>
      <div class="tm-form">
        <input
          class="tm-input"
          placeholder="标签名称"
          bind:value={newTagName}
          onkeydown={(e) => e.key === "Enter" && addTag()}
        />
        <div class="tm-colors">
          {#each TAG_COLORS as c}
            <button
              class="tm-color-btn"
              class:active={newTagColor === c}
              style="background:{c}"
              onclick={() => (newTagColor = c)}
              aria-label="选择颜色"
            ></button>
          {/each}
        </div>
        <div class="tm-form-actions">
          <button class="tm-add-btn" onclick={addTag} disabled={!newTagName.trim()}>
            {editingTag ? "保存" : "添加"}
          </button>
          {#if editingTag}
            <button class="tm-cancel-btn" onclick={() => { editingTag = null; newTagName = ""; newTagColor = TAG_COLORS[0]; }}>取消</button>
          {/if}
        </div>
      </div>
      <div class="tm-list">
        {#each userTagDefs as tag}
          <div class="tm-item">
            <span class="tm-dot" style="background:{tag.color}"></span>
            <span class="tm-name">{tag.name}</span>
            <span class="tm-usage">{(questions.filter((q) => (q.user_tags || []).includes(tag.id)).length)} 题</span>
            <button class="tm-edit-btn" onclick={() => editTag(tag)} title="编辑">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="tm-del-btn" onclick={() => deleteTag(tag.id)} title="删除">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        {:else}
          <p class="tm-empty">暂无标签，在上方创建你的第一个标签</p>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
  }
  .tag-manager {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    max-width: 420px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .tm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tm-header h3 {
    font-size: 15px;
    font-weight: 600;
    margin: 0;
  }
  .tm-close {
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    border-radius: 4px;
  }
  .tm-close:active { color: var(--text); }
  .tm-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tm-input {
    width: 100%;
    padding: 8px 10px;
    font-size: 13px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text);
    font-family: inherit;
    box-sizing: border-box;
  }
  .tm-colors {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .tm-color-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
  }
  .tm-color-btn.active {
    border-color: var(--text);
    transform: scale(1.15);
  }
  .tm-color-btn:active {
    transform: scale(0.9);
  }
  .tm-form-actions {
    display: flex;
    gap: 8px;
  }
  .tm-add-btn {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
  .tm-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .tm-add-btn:active:not(:disabled) { opacity: 0.85; }
  .tm-cancel-btn {
    padding: 8px 16px;
    font-size: 13px;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
  }
  .tm-cancel-btn:active { color: var(--text); }
  .tm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .tm-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--bg-surface);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  .tm-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .tm-name {
    font-size: 13px;
    font-weight: 600;
    flex: 1;
    color: var(--text);
  }
  .tm-usage {
    font-size: 11px;
    color: var(--text-dim);
    font-variant-numeric: tabular-nums;
  }
  .tm-edit-btn, .tm-del-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--text-dim);
    border-radius: 4px;
    display: inline-flex;
  }
  .tm-edit-btn:active, .tm-del-btn:active { color: var(--text); background: var(--bg-card); }
  .tm-empty {
    font-size: 13px;
    color: var(--text-dim);
    text-align: center;
    padding: 20px 0;
  }
</style>
