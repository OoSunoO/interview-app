# 多租户方案：GitHub Gist 答题记录同步

## 目标

题库共享 + 答题记录按用户隔离。不引入第三方云服务，不走后端。

## 现状

- 题库已编译进前端 `question-data.js`
- 答题记录全部存 **localStorage**：`quiz_progress`（SM-2 状态）、`quiz_review_sessions`（最近 500 条）、`quiz_daily_stats`（365 天打卡）
- 后端 FastAPI 未在生产代码中使用
- 多用户隔离 → 首次打开输用户名，各用各的 localStorage 槽位

## 方案概要

用 **GitHub Gist** 做答题记录的云端备份和跨设备恢复。

```
首次打开 → 弹窗输入 GitHub PAT（仅 gist 权限）
            ↓
自动创建隐藏 Gist 存答题记录
            ↓
每次答题后 → 自动同步到 Gist（500ms 防抖合并）
            ↓
换设备/清缓存 → 输入同一个 Token → 自动恢复
            ↓
无网络 → 纯离线，不阻塞答题
```

## 数据格式

```json
{
  "version": 1,
  "revision": 1,
  "updated_at": "2026-06-04T12:00:00Z",
  "username": "peter",
  "progress": { /* quiz_progress 内容 */ },
  "sessions": [ /* review_sessions 最近 500 条 */ ],
  "daily_stats": { /* quiz_daily_stats */ },
  "daily_goal": 20
}
```

## 新增文件

| 文件 | 说明 |
|------|------|
| `src/lib/gist-sync.js` | Gist 同步层：Token 管理、CRUD、同步引擎、防抖队列 |
| `src/components/GistSetup.svelte` | Token 输入弹窗，支持「跳过，仅本地使用」 |
| `src/components/SyncStatus.svelte` | 同步状态指示器（闲置/同步中/失败） |

## 修改文件

| 文件 | 改动 |
|------|------|
| `src/lib/local-api.js` | `saveProgress()`/`saveSessions()` 底部加 `gistSync.queueSync()` |
| `src/lib/stores.svelte.js` | `markProgress()`/`rateAndAdvance()` 后触发同步 |
| `App.svelte` | 集成 GistSetup 和 SyncStatus |

## 核心逻辑

### gist-sync.js 接口

```javascript
getToken()            // 从 localStorage 读取 PAT
setToken(token)       // 存储 + 立即验证有效性
hasToken()            // → boolean
clearToken()          // 登出
findOrCreateGist()    // 按 description 查找，不存在就创建
readProgress(gistId)  // 从 Gist 拉取
writeProgress(gistId, data)  // 覆写 + revision++
syncOut()             // localStorage → Gist（push）
syncIn()              // Gist → localStorage（pull）
queueSync()           // 防抖，500ms 合并
```

### 同步规则

- `syncIn()` 首次恢复：Gist 有数据 → 以 Gist 为准覆盖本地；Gist 空 → 推本地上去
- `syncOut()` 同步时机：每次答题后 queueSync()、页面切换时、beforeunload 强制同步
- 冲突处理：compareVersions(local, remote) → 按 revision 大小判断新旧

## 实施顺序

### 第一阶段（P0）
1. 新建 `lib/gist-sync.js` — 核心 CRUD + Token 管理
2. 修改 `lib/local-api.js` — 加 hook
3. 新建 `GistSetup.svelte` — 基础弹窗

### 第二阶段（P1）
4. 防抖同步 + beforeunload 兜底
5. 新建 `SyncStatus.svelte`
6. 首次设备恢复流程

### 第三阶段（P2）
7. 版本冲突检测
8. 手动「立即同步」按钮
9. 单元测试

## 注意事项

- ❌ 不要每题触发 Gist 写入，防抖必须
- ✅ 无网络时纯离线，不阻塞
- ✅ Gist 被删除 → 自动重建
- ✅ 401 错误 → 提示 Token 失效
- ✅ Token 仅需 `gist` scope，不涉及 repo
