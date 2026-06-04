# Handoff — 面试刷题 App

**日期：** 2026-06-05
**版本：** v1.4.7
**当前状态：** 5196 题，51 分类全部 100+，243 单元测试全绿，29 E2E 全绿，构建 846ms

---

## 项目概况

纯前端 Svelte 5 面试刷题应用（100% 客户端），后端 FastAPI + SQLite 为平行实现。

- **前端：** Svelte 5 (runes) + Vite + PWA (Service Worker + manifest)
- **后端：** Python FastAPI + SQLite（Docker Compose 部署）
- **部署：** GitHub Pages（前端），Docker（后端）
- **数据：** 前端 100% localStorage，后端 SQLite 独立运行
- **内容：** 5196 题，51 分类，覆盖 Java、系统设计、数据库、算法、AI/Agent、分布式、前端、DevOps 等**
- **状态：** 51 分类全部 ≥ 100 题

## 完成的功能

### 数据与内容
- 5196 道题，覆盖 short_answer / coding / choice / true_false / multiple_choice / fill_in_blank
- 懒加载：974KB 索引预加载，51 个分类按需加载（import.meta.glob）
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

### 测试提升 (v1.4.2)
- 新增 50+ 单元测试覆盖 12 个先前未测试的函数/分支
- `local-api.js` 覆盖率达 94.74% statements / 96.55% lines
- 新增覆盖：related()、companies()、weeklyActivity()、allDailyStats()、sort_by 全部分支、bookmarked 筛选、tag 搜索、记录复习活动（hard 评分 + 数据裁剪）、usernameSuffix、knowledge.list 内容搜索、knowledge-only 标签、migrateProgress 无操作路径
- 修复 E2E `.dialog-overlay` 陈旧选择器（v1.4.1 overlay 重构后漏改）

### UI Polish (v1.4.3)
- 新增 5 组分类颜色 CSS 变量（java、frontend、ai、system-design、project-mgmt）及深色/浅色模式适配
- 新增搜索高亮 CSS 变量 `--search-hl-bg` / `--search-hl-color`，统一 Browse.svelte 和 WrongBook.svelte 的 `search-hl` 样式
- 移除 Quiz.svelte 中 12 处 `.cat-pill.*` 硬编码颜色，全部映射为 CSS 变量
- 移除 Browse.svelte 和 WrongBook.svelte 中的硬编码 `search-hl` 颜色
- 至此所有 Svelte 组件内无残留硬编码颜色值

### Feature (v1.4.4)
- QuickReview 速记模式新增历史记录：完成时自动保存结果（时间、题数、掌握率），可在汇总页面查看最近 50 次记录
- 历史记录弹窗：展示日期、掌握/待巩固/待复习计数、掌握率百分比，支持清除
- 新增 Quiz self-evaluation E2E 测试，使用 Browse→Quiz 导航路径提升稳定性

### Feature (v1.4.5)
- QuickReview 汇总页新增"再来一轮"按钮，使用相同筛选条件重启新会话
- QuickReview 筛选设置持久化（分类/难度/题型/题量跨会话保留）
- QuickReview 新增题型筛选（问答题/选择题/多选题/判断题/编程题/填空题）
- 新增 setProvider 无效索引边界测试，分支覆盖率 85.74% → 85.96%

### Feature (v1.4.6)
- QuickReview 活动状态头部显示筛选项（如"数据库 · 中等"），提示当前复习范围
- Browse 页面"速记"按钮新增题型筛选传递，与 QuickReview 筛选联动
- QuickReview 汇总页显示本次速记用时（如"用时 3 分 25 秒"）
- Mock Interview 设置持久化（分类/难度/题量/限时跨会话保留）
- QuickReview 新增快捷键：Escape 退出（活动态/汇总态），R 键一键重启

### Feature (v1.4.7)
- Stats 页面新增"速记记录"版块：显示 QuickReview 总次数/复习题数/平均掌握率，最近 20 次速记会话列表（已掌握/待巩固/需复习/用时），含"去速记"导航按钮
- Stats 页面浏览历史项显示来源标签（"速记" vs 常规练习）
- QuickReview 保存会话用时到历史记录，Stats 页面每条记录显示用时
- Quiz 普通模式计时器新增超时提醒：>2 分钟橙色警告，>5 分钟红色脉冲
- Quiz 会话总结页新增"速记错题"按钮，快速跳转 QuickReview 复习错题
- QuickReview 支持 questionIds 参数，可接收任意题目集合
- Browse 详情面板显示答题进度（已答次数/错误次数/掌握状态）
- E2E 测试：Stats 页面 QuickReview 历史展示 + Escape 键退出速记
- 深色/浅色主题（respects prefers-reduced-motion）
- Cmd+K 命令面板，/ 聚焦搜索，? 快捷键帮助
- 每日目标 + 复习提醒
- 进度导入/导出
- 键盘快捷键帮助弹窗
- PWA：可安装，Service Worker 自动更新

### 测试
- 243 单元测试（Vitest，+2 QuickReview keyboard shortcuts）
- 31 E2E 测试（Playwright，+1 quiz self-evaluation，+1 QR stats history，+1 QR Escape）
- 106 后端测试（pytest，含书签和 QuickReview 端点）
- 覆盖率：95.35% statements, 85.96% branches（JS 模块）
- `local-api.js`：94.47% statements, 84.78% branches（核心业务逻辑）

### 后端补齐
- 书签：POST toggle + GET list（`/api/progress/{id}/bookmark`, `/api/progress/bookmarks`）
- QuickReview：POST start + POST rate + GET history（`/api/quick-review/start`, `/api/quick-review/rate`, `/api/quick-review/history`）

### CI/CD
- GitHub Actions：3 个并行 CI Job（backend / frontend / data-validation）
- CI 通过后自动部署到 GitHub Pages
- 门禁：format:check + svelte-check + vitest + data-validation

## 当前未提交的工作

## 架构要点

### 前端数据流
```
seed_data/*.json
  → scripts/generate-data.js (自动生成)
    → src/lib/question-data/index.js (索引，预加载)
    → src/lib/question-data/categories/{name}.js (51 个文件，按需加载)
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

`backend/seed_data/` 下 80 个 JSON 文件（含子目录），每个对应 1-2 个分类：

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
