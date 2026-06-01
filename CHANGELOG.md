# Changelog

## [Unreleased]

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
