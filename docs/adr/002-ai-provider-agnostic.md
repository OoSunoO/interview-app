# ADR 002: AI Provider 无关设计

## 决策

AI 模块（`src/lib/ai.js`）同时支持 Anthropic Messages API 和 OpenAI 兼容格式，用户可选提供商。

## 原因

- 国内用户可能无法直接访问 Anthropic API
- 多个提供商（DeepSeek、Zhipu、SiliconFlow）都兼容 OpenAI 格式
- localStorage 存储 API key，PWA 离线也可用
- provider 无关设计让用户自由选择可用服务
