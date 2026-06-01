# Handoff — 面试刷题 App

**日期：** 2026-06-02
**当前状态：** 核心功能已完成，UI 清理中

---

## 项目概况

纯前端 + FastAPI 后端的面试刷题应用，覆盖 7 个技术领域。

- 前端：Svelte 5 (runes) + Vite + PWA
- 后端：Python FastAPI + SQLite（生产用 Docker Compose）
- 部署：GitHub Pages（前端）+ Docker（后端）
- 数据：纯本地，知识内容来自 JavaGuide 真实资料

## 已完成

- 选择题 / 判断题 / 多选题 题型支持 ✅
- 知识点模块（预存知识讲解 + 题目→知识点跳转 + 双向关联）✅
- AI 评分 + 苏格拉底式对话（Anthropic / OpenAI / DeepSeek）✅
- 错题分组（按知识点标签）✅
- 搜索增强（覆盖标签/答案，结果计数 + 清除按钮）✅
- 浏览/刷题模式切换 ✅
- 版本号系统 ✅
- CI/CD（svelte-check + prettier + vitest + data-validation）✅
- GitHub Pages 自动部署 ✅
- Docker 生产部署 ✅
- JavaGuide 真实知识内容（替换了 AI 生成内容）✅

## 当前未提交的工作

有 3 个文件已修改但未 commit：

1. `frontend/src/lib/knowledge-data.js` — 精简知识内容（移除已不再需要的字段）
2. `frontend/src/lib/local-api.js` — 配套调整
3. `frontend/src/pages/KnowledgePointDetail.svelte` — 移除"外部来源链接"UI，因为所有知识点已有本地内容

这些改动是 UI 清理的一部分，可以直接 commit 或继续调整。

## 架构要点

- **后端 API**：`GET /api/questions`（列表）、`GET /api/questions/{id}`（详情）、`POST /api/version`（版本）
- **前端数据流**：`src/lib/question-data.js` + `src/lib/knowledge-data.js` → Svelte 组件
- **题库**：`backend/seed_data/*.json`，每个文件一个类别（`java_basic.json`, `java_basic_choice.json` 等）
- **知识点**：`frontend/src/lib/knowledge-data.js`，纯前端加载
- **E2E 测试**：`frontend/e2e/app.spec.js`，Playwright
- **数据校验**：`backend/scripts/validate-data.py` — CI 中跑

## 常用命令

```bash
# 后端
cd backend && pip install -r requirements.txt && python3 -m database && python3 -m seed && uvicorn main:app --reload --port 8000

# 前端
cd frontend && npm install && npm run dev

# 测试
npm run format:check && npm run check && npm test

# 生产
docker compose up -d
```

## 种子数据文件一览

`backend/seed_data/` 下 20 个文件：

- `java_basic.json`, `java_basic_choice.json` — Java 基础
- `java_advanced.json`, `java_advanced_choice.json` — Java 进阶
- `java_collections.json`, `java_collections_choice.json` — Java 集合
- `java_true_false.json` — 判断题
- `java_multiple_choice.json` — 多选题
- `agent.json`, `ai.json`, `algorithm.json`, `cs_basics.json` 等

## 可能的后续方向

1. UI 继续打磨（当前简化纯色主题，无 AI 痕迹）
2. 知识内容补充（更多真实来源的摘要）
3. 刷题统计和进度追踪增强
4. 更多题型（如填空题、连线题）
5. 性能优化（首屏加载速度、题库懒加载）

## 设计文档

`~/DEV/docs/项目设计/interview/` 下有 spec 和 WBS，可以参考。
