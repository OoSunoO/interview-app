# ADR 001: GitHub Pages 部署 + GitHub Flow

## 决策

- 前端通过 GitHub Actions 自动部署到 GitHub Pages
- 分支策略采用 GitHub Flow（feature branch → PR → main）
- main 分支开启保护：禁止直接推送，必须走 PR

## 原因

- 纯前端 SPA，不需要后端渲染，GitHub Pages 零成本
- Vite 构建产物是静态文件，完美匹配 Pages
- CI 直接在 PR 上验证，合入即部署
- 国内 HTTPS 访问需要 SSH remote（GFW 拦截 HTTPS 到 GitHub）
