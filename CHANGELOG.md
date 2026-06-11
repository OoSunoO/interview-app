# Changelog

## [1.1.0] - 2026-06-12

### Added
- 领域知识体系（domains.js）：9 大顶层领域树，层级浏览
- 6 个新知识文件：Linux、DevOps、Security、Redis、MQ、分布式系统
- 知识页（KnowledgePoints）树状浏览：顶层领域 → 子领域 → 知识点
- Stats 页 Tab 分区：统计/记录/薄弱，13+ 区块分组管理
- Home 页 action 按钮响应式 grid（3列→2列→1列）
- WrongBook 页 Tab 分离：错题列表/AI 分析
- Browse 页宽屏详情面板从右侧滑入
- 全局 tablet(768px) + desktop(1024px) 断点

### Changed
- 12 个知识文件迁移 domain/source 字段
- company 字段重命名为 source（后端 + 前端 + 数据）
- 版本号提升至 1.1.0

### Fixed
- 首页 CTA 按钮全宽堆叠改为 grid 排列
- 详情面板始终底部弹出（宽屏改侧边）

## [1.0.0] - 2026-06

### Added
- v1.0.0 版本号系统：前端页面底部显示版本号 + 后端 /api/version 端点
- AI 评分和苏格拉底式对话（支持 Anthropic / OpenAI / DeepSeek）
- 选择题和判断题题型，带重试机制
- 简答/编码题的输入框和提交流程
- CI 质量门禁：svelte-check + prettier + vitest
- GitHub Pages 自动部署
- GitHub Flow 分支策略 + main 分支保护

### Fixed
- iOS Safari 输入框自动缩放
- 进度条 layout 卡顿（改用 transform）
- 简答题自评逻辑改为先看答案再自评

### Changed
- UI 简化为纯色主题，消除 AI 痕迹
- 移动端响应式适配
