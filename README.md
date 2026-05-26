# 面试题 App

个人面试练习应用，覆盖 7 个技术领域：Java 基础、Java 进阶、AI、Agent、算法、系统设计、前端。

## 技术栈

- **前端**: Svelte 5 + Vite 6 + PWA（移动端可安装）
- **后端**: FastAPI + aiosqlite
- **数据库**: SQLite（无需额外部署）
- **部署**: Docker Compose

## 快速开始

```bash
docker compose up -d
```

- 前端: http://localhost:5173
- 后端 API: http://localhost:8000/api

## 开发

### 后端

```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m database   # 初始化数据库
python3 -m seed       # 导入题目
uvicorn main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/questions | 题目列表（支持 category/difficulty/search 筛选） |
| GET | /api/questions/{id} | 题目详情 |
| POST | /api/progress/{id} | 记录答题进度 |
| GET | /api/progress/stats | 学习统计 |
| GET | /api/progress/wrong | 错题列表 |
| GET | /api/progress/review/due | 待复习列表 |

## 功能

- 7 个领域共 70 道面试题
- 答题计时 + 提示系统
- 错题本 + 间隔重复复习
- 学习进度统计
- PWA 移动端支持
- 深色主题

## 数据

种子数据在 `backend/seed_data/` 目录下，每个领域 10 题，JSON 格式。
