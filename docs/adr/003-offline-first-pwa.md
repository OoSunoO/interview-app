# ADR 003: 离线优先 PWA 架构

## 决策

- 题库数据编译为静态 JS 嵌入（`question-data.js`）
- 学习进度存 localStorage
- 使用 Vite PWA 插件 + workbox 缓存全部静态资源

## 原因

- 面试题场景经常发生在无网络环境（地铁、通勤）
- 纯本地数据保证秒开，不需要 loading 状态
- 部署到 GitHub Pages 后也是纯静态，无服务器端
