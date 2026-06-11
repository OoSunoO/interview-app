export const knowledge = {
  "Docker 核心概念": {
    category: "devops",
    domain: "devops",
    source: "Docker 官方文档",
    content: `## Docker 核心概念

> 来源：Docker 官方文档

### 镜像与容器
- **镜像（Image）**：只读模板，包含应用及其依赖。由多层（Layer）组成，每层是 Dockerfile 指令的结果。
- **容器（Container）**：镜像的运行实例，可读写。本质是 Namespace（隔离） + Cgroups（限制） + 联合文件系统（OverlayFS）。

### Dockerfile 最佳实践
- 选择合适的基础镜像：alpine（5MB）> slim（~100MB）> full
- 多阶段构建：构建阶段用 SDK 镜像，运行阶段只拷贝产物
- 利用缓存：先 COPY 依赖文件（变更少），再 COPY 源码（变更多）
- \`RUN\` 命令合并：减少层数
- 非 root 运行：\`RUN adduser -D app && USER app\`

### 网络模式
| 模式 | 场景 |
|------|------|
| bridge（默认） | 端口映射，容器间通过 IP 通信 |
| host | 共享宿主机网络栈，性能最高 |
| overlay | Swarm/K8s 跨主机通信 |
| macvlan | 容器直接分配物理网络 IP |

### 数据持久化
- **Volume**（推荐）：\`docker volume create\`，由 Docker 管理
- **Bind mount**：\`-v /host/path:/container/path\`
- **tmpfs mount**：内存中，临时数据`,
  },
  "Docker Compose": {
    category: "devops",
    domain: "devops",
    source: "Docker 官方文档",
    content: `## Docker Compose

> 来源：Docker 官方文档

### 核心概念
- 通过 YAML 定义多容器应用（服务、网络、卷）
- \`docker compose up -d\` 一键启动
- \`docker compose down\` 清理资源

### 常用配置
\`\`\`yaml
services:
  web:
    build: .
    ports: ["8080:80"]
    depends_on:
      - db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      retries: 3
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: \${DB_PASSWORD}

volumes:
  pgdata:
\`\`\`

### 生产建议
- 本地开发用 Compose，生产用 K8s
- \`depends_on\` 只控制启动顺序，不等待服务就绪
- 使用 \`healthcheck\` 确保服务真正可用
- 环境变量用 \`.env\` 文件管理`,
  },
  "Kubernetes 核心概念": {
    category: "kubernetes",
    domain: "devops",
    source: "K8s 官方文档 / CKA 考点",
    content: `## Kubernetes 核心概念

> 来源：K8s 官方文档 / CKA 考点

### 核心资源
- **Pod**：最小调度单位，一个或多个容器共享网络/存储
- **Deployment**：声明式 Pod 管理（滚动更新、回滚、副本控制）
- **Service**：Pod 的稳定网络入口（ClusterIP/NodePort/LoadBalancer）
- **ConfigMap / Secret**：配置和敏感数据
- **Ingress**：7 层 HTTP 路由

### 调度与资源
- **requests**：调度时保证的最小资源
- **limits**：Pod 可使用的上限（CPU 可超卖，内存不可）
- **QoS 类别**：Guaranteed > Burstable > BestEffort
- **Node Selector / Affinity**：控制 Pod 调度位置

### 网络模型
- 每个 Pod 有独立 IP（flat network）
- CNI 实现：Calico（策略丰富）、Flannel（简单）、Cilium（eBPF）
- NetworkPolicy：防火墙规则（默认允许全部）

### 排障命令
\`\`\`
kubectl get pods -n <ns>
kubectl describe pod <name>
kubectl logs <name> -c <container>
kubectl exec -it <name> -- sh
kubectl get events --sort-by='.lastTimestamp'
\`\`\``,
  },
  "Git 工作流": {
    category: "devops",
    domain: "devops",
    source: "Pro Git Book",
    content: `## Git 工作流

> 来源：Pro Git Book

### 核心操作
- \`git rebase\` vs \`git merge\`：rebase 线性历史（改写），merge 保留分支（安全）
- 黄金法则：不要对已推送的公共分支 rebase
- \`git reset --soft/mixed/hard\`：移动 HEAD + 暂存区/工作区
- \`git revert\`：创建反向提交（安全撤销已推送的提交）
- \`git stash\`：暂存工作区修改
- \`git bisect\`：二分定位 Bug

### 分支策略
| 策略 | 适用场景 |
|------|---------|
| GitHub Flow | 简单，一个 main 分支 + feature 分支 |
| Git Flow | 复杂，main/develop/release/hotfix 多分支 |
| Trunk-Based | 高频合并到 main，配合 Feature Flag |

### 高级技巧
- \`git reflog\`：查看所有 HEAD 移动记录（恢复误删）
- \`git cherry-pick\`：挑选特定提交
- \`git submodule\`：嵌入其他仓库
- \`git worktree\`：同时检出多个分支`,
  },
  "CI/CD 流水线": {
    category: "devops",
    domain: "devops",
    source: "综合整理",
    content: `## CI/CD 流水线

> 来源：综合整理

### CI（持续集成）
- 频繁合并代码到主干，每次合并自动构建 + 测试
- 快速反馈：提交后 10 分钟内得知是否出错
- 工具：GitHub Actions、GitLab CI、Jenkins

### CD（持续部署/交付）
- **持续交付**：代码随时可部署到生产（手动触发）
- **持续部署**：通过测试后自动部署到生产
- **策略**：蓝绿部署、金丝雀发布、滚动更新

### 发布策略对比
| 策略 | 风险 | 回滚速度 | 成本 |
|------|------|---------|------|
| 蓝绿 | 低 | 秒级 | 高（双倍资源） |
| 金丝雀 | 极低 | 秒级 | 中（部分流量） |
| 滚动 | 中 | 分钟级 | 低 |
| 灰度 | 低 | 秒级 | 中（按用户） |

### 流水线阶段
1. **代码检查**：Lint、格式化
2. **单元测试**：Jest/Pytest/JUnit
3. **构建**：编译 + 打包 Docker 镜像
4. **集成测试**：多服务联调
5. **安全扫描**：SAST/DAST/镜像漏洞
6. **部署**：推送到测试/预发/生产`,
  },
};
