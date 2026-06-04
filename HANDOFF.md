# Handoff — 面试刷题 App

**日期：** 2026-06-04
**版本：** v1.4.1
**当前状态：** 5176 题，51 分类全部 100+，202 单元测试全绿，28 E2E 全绿，构建 830ms

---

## 项目概况

纯前端 Svelte 5 面试刷题应用（100% 客户端），后端 FastAPI + SQLite 为平行实现。

- **前端：** Svelte 5 (runes) + Vite + PWA (Service Worker + manifest)
- **后端：** Python FastAPI + SQLite（Docker Compose 部署）
- **部署：** GitHub Pages（前端），Docker（后端）
- **数据：** 前端 100% localStorage，后端 SQLite 独立运行
- **内容：** 5176 题，51 分类，覆盖 Java、系统设计、数据库、算法、AI/Agent、分布式、前端、DevOps 等
- **状态：** 51 分类全部 ≥ 100 题

## 完成的功能

### 数据与内容
- 5176 道题，覆盖 short_answer / coding / choice / true_false / multiple_choice / fill_in_blank
- 懒加载：724KB 索引预加载，49 个分类按需加载（import.meta.glob）
- 数据生成管道：seed_data/*.json → generate-data.js → question-data/
- 数据校验（CI 中跑 validate-data.py）

### 题库浏览
- 分类/难度/状态/题型/来源 多维度筛选
- 搜索（标题 + 内容 + 答案 + 标签），结果计数 + 清除
- 排序（默认/难度/最近练习/随机）
- 分页

### 刷题
- 7 种题型支持
- AI 评分 + 苏格拉底式引导（Claude / GPT / DeepSeek）
- 知识点双向关联（题目→知识点跳转，知识点→相关题目）

### 复习系统
- SM-2 间隔重复（ReviewSession）：4 级自评（forgot/hard/good/easy）
- QuickReview 速记：3 级自评（不会/大概会/已掌握），暂停/恢复，结果汇总
- 到期复习提醒
- 错题本（按标签/知识点分组）

### 统计
- 概览卡片（总数/正确率/连续天数/掌握数）
- 日历热力图
- 趋势图 + 周柱状图
- 复习历史

### UI Polish (v1.4.1)
- 全 CSS 变量化：code block 背景、标签颜色、badge 颜色均使用 theme-aware 变量
- 全局 `.overlay` class 统一 5 个组件的弹窗遮罩层（-89 行 CSS 重复）
- CodeBlock 组件浅色模式修复（复制按钮背景/颜色适配主题）
- Playwright E2E storageState 预置用户名（跳过 GistSetup 首屏引导）
- question type 标签（choice/multiple_choice/fill_in_blank）使用语义 CSS 变量

### UI/UX
- 深色/浅色主题（respects prefers-reduced-motion）
- Cmd+K 命令面板，/ 聚焦搜索，? 快捷键帮助
- 每日目标 + 复习提醒
- 进度导入/导出
- 键盘快捷键帮助弹窗
- PWA：可安装，Service Worker 自动更新

### 测试
- 202 单元测试（Vitest）
- 28 E2E 测试（Playwright，含移动端视图 + 主题切换 + GistSetup bypass）
- 106 后端测试（pytest，含书签和 QuickReview 端点）
- 覆盖率：83.42% statements, 87.23% lines（JS 模块）

### 后端补齐
- 书签：POST toggle + GET list（`/api/progress/{id}/bookmark`, `/api/progress/bookmarks`）
- QuickReview：POST start + POST rate + GET history（`/api/quick-review/start`, `/api/quick-review/rate`, `/api/quick-review/history`）

### CI/CD
- GitHub Actions：3 个并行 CI Job（backend / frontend / data-validation）
- CI 通过后自动部署到 GitHub Pages
- 门禁：format:check + svelte-check + vitest + data-validation

## 当前未提交的工作

无。v1.4.1 已提交并推送。

## 架构要点

### 前端数据流
```
seed_data/*.json
  → scripts/generate-data.js (自动生成)
    → src/lib/question-data/index.js (索引，预加载)
    → src/lib/question-data/categories/{name}.js (49 个文件，按需加载)
```

### 前端 Store
- `src/lib/stores.svelte.js` — Svelte 5 runes 集中管理（questions / progress / stats / quiz / filter / theme）
- `src/lib/local-api.js` — 离线 API 层（questions CRUD + progress SM-2 + quickReview + knowledge）
- `src/lib/sm2.js` — SM-2 算法纯函数实现

### 后端
- FastAPI + SQLite（aiosqlite）
- `routes/questions.py` — 题目接口（列表/详情/随机/关联）
- `routes/progress.py` — 进度接口（更新/统计/错题/到期复习/知识点）
- `database.py` — SQLite 初始化 + 迁移（ALTER TABLE ADD COLUMN）
- `VERSION` — 版本号（当前 1.3.0）

### 需要注意
- **渲染工具：** `src/lib/render-utils.js` — renderContent() 解析代码块，renderAnswer() 解析中文标题分段
- **题库数据生成后需要清理 stale 文件：** generate-data.js 有 --clean 逻辑

## 种子数据目录

`backend/seed_data/` 下 44+ 个 JSON 文件，每个对应 1-2 个分类：

```
agent/, ai/, algorithm/, behavioral/, career/, cs_basics/ — 基础领域
java_basic/, java_advanced/, java_collections/ — Java 三大块
concurrency/, jvm/, design_patterns/, mq/ — 中间件/原理
database/, redis/, system_design/, microservices/, network/ — 架构
frontend/, react/, python/, kubernetes/, linux/ — 技术栈
devops/, product/, project_mgmt/ — 工程/管理
system_design_micro.json, ai_infra_extras.json, design_network_extras.json, gen_distributed.json — 补充/生成
```

## 设计文档

`~/DEV/docs/项目设计/interview/` 下有 spec 和 WBS。

## 可能的后续方向

1. **UI 打磨：** 继续一致性检查（图标、间距、交互反馈）
2. **性能优化：** 首屏加载速度、题库懒加载粒度进一步细化
3. **刷题统计增强：** 更多数据维度的统计分析
4. **AI 评分增强：** 支持更多模型、评分维度细化
5. **内容扩充：** 新增领域（Go/Rust、数据分析等）
6. **功能增强：** AI 评分、模拟面试、复习算法优化
7. **后端完善：** 补后端测试、提升覆盖率
