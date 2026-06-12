<script>
  import {
    PROVIDERS,
    getAIConfig,
    saveAIConfig,
    setProvider,
    testConnection,
    getConnectionStatus,
  } from "../lib/ai.js";

  let { onSave } = $props();

  let apiKeyInput = $state(getAIConfig().key);
  let apiProvider = $state(getAIConfig().provider ?? 0);
  let testing = $state(false);
  let testResult = $state(null);
  let connectionStatus = $state(getConnectionStatus());

  function save() {
    setProvider(apiProvider);
    saveAIConfig({ key: apiKeyInput });
    connectionStatus = getConnectionStatus();
    onSave?.(!!apiKeyInput);
  }

  async function handleTest() {
    testing = true;
    testResult = null;
    try {
      await testConnection(apiKeyInput, apiProvider);
      testResult = "success";
      save();
    } catch (e) {
      testResult = e.message;
    }
    testing = false;
  }
</script>

<div class="ai-config">
  <p class="config-hint">选择 AI 服务商并输入 API Key</p>

  {#if connectionStatus?.ok}
    <p class="connection-ok">已通过 {connectionStatus.provider} 连接成功</p>
  {/if}

  <select class="provider-select" bind:value={apiProvider}>
    {#each PROVIDERS as p, i}
      <option value={i}>{p.label}</option>
    {/each}
  </select>

  <div class="config-row">
    <input type="password" bind:value={apiKeyInput} placeholder="输入 API Key..." />
    <button class="config-save" onclick={save}>保存</button>
  </div>

  <button class="test-btn" onclick={handleTest} disabled={!apiKeyInput || testing}>
    {testing ? "测试中..." : "测试连接"}
  </button>

  {#if testResult === "success"}
    <p class="test-ok">连接成功</p>
  {:else if testResult}
    <p class="test-err">{testResult}</p>
  {/if}
</div>

<style>
  .ai-config {
    padding: 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .config-hint {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }
  .connection-ok {
    font-size: 12px;
    color: var(--success);
    margin: 0;
    padding: 6px 10px;
    background: var(--success-bg);
    border-radius: var(--radius-sm);
  }
  .provider-select {
    padding: 8px 10px;
    font-size: 13px;
    border-radius: var(--radius-sm);
    background: var(--bg-elevated);
    color: var(--text);
    border: 1px solid var(--border);
    font-family: inherit;
  }
  .config-row {
    display: flex;
    gap: 8px;
  }
  .config-row input {
    flex: 1;
    padding: 8px 10px;
    font-size: 13px;
    border-radius: var(--radius-sm);
    background: var(--bg-elevated);
    color: var(--text);
    border: 1px solid var(--border);
    font-family: inherit;
  }
  .config-save {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s var(--spring);
  }
  .config-save:active {
    transform: scale(0.97);
  }
  .test-btn {
    padding: 7px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background: var(--bg-elevated);
    color: var(--text-muted);
    border: 1px solid var(--border);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }
  .test-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .test-btn:not(:disabled):active {
    transform: scale(0.97);
  }
  .test-ok {
    font-size: 12px;
    color: var(--success);
    margin: 0;
  }
  .test-err {
    font-size: 12px;
    color: var(--danger);
    margin: 0;
  }
</style>
