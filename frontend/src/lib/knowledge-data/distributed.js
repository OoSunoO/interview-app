export const knowledge = {
  分布式基础: {
    category: "distributed",
    domain: "distributed",
    source: "综合整理",
    content: `## 分布式基础

> 来源：综合整理

### CAP 定理
- **C（一致性）**：所有节点同一时刻看到相同数据
- **A（可用性）**：每个请求都能得到响应
- **P（分区容错）**：系统允许网络分区
- **CP vs AP**：网络分区时二选一，实际多数场景选 AP + 最终一致性

### BASE 理论
- **BA**：基本可用（允许降级）
- **S**：软状态（中间状态）
- **E**：最终一致性
- 用牺牲强一致性换取可用性

### 一致性模型
| 模型 | 说明 | 场景 |
|------|------|------|
| 强一致性 | 写后立即读 | 强一致（Raft/ZK） |
| 最终一致性 | 无冲突则最终一致 | DNS、CDN |
| 因果一致性 | 有因果关系的操作有序 | 社交评论 |
| 读己所写 | 自己写的一定能读到 | Session |

### 分布式协议
- **2PC/3PC**：传统分布式事务（XA，性能差）
- **TCC**：Try-Confirm-Cancel（业务补偿）
- **SAGA**：长事务拆分子事务+补偿
- **Paxos/Raft**：共识算法（Leader 选举 + 日志复制）`,
  },
  分布式系统设计: {
    category: "distributed",
    domain: "distributed",
    source: "综合整理",
    content: `## 分布式系统设计

> 来源：综合整理

### 负载均衡
- **DNS 轮询**：跨地域路由
- **Nginx/LVS**：4 层/7 层 LB
- **一致性 Hash**：缓存节点增减影响最小
- **算法**：轮询、最小连接、IP Hash、加权

### 服务发现
- **客户端发现**：Consul/Eureka（客户端缓存）
- **服务端发现**：K8s Service（iptables/IPVS）

### 分布式 ID
| 方案 | 特点 |
|------|------|
| UUID | 不依赖中心，但无序、长 |
| Snowflake | 趋势递增，依赖时钟 |
| Redis incr | 自增，性能好 |
| Leaf（美团） | 号段模式，预分配 |

### 分布式链路追踪
- **Trace**：一次请求的完整调用链
- **Span**：调用链中的每个节点
- 实现：OpenTelemetry（收集）+ Jaeger/Zipkin（展示）

### 限流
- **令牌桶**：允许突发（Guava RateLimiter）
- **漏桶**：固定速率（保护下游）
- **滑动窗口**：精确控制窗口内请求数`,
  },
  "Raft 共识算法": {
    category: "distributed",
    domain: "distributed",
    source: "Raft 论文 / MIT 6.824",
    content: `## Raft 共识算法

> 来源：Raft 论文 / MIT 6.824

### 角色
- **Leader**：处理所有写请求，管理日志复制
- **Follower**：被动接收日志
- **Candidate**：发起选举

### Leader 选举
1. Follower 超时未收到心跳 → 变为 Candidate
2. 自增 term，发起投票
3. 获得多数（N/2+1）票 → 成为 Leader
4. Leader 定期发心跳维持权威

### 日志复制
1. Client 发请求给 Leader
2. Leader 追加到本地日志
3. 并行发 AppendEntries RPC 给所有 Follower
4. 多数写入后 → 应用到状态机 → 响应 Client

### 安全性
- **Election Safety**：一个 term 只有一个 Leader
- **Log Matching**：日志条目索引+term 唯一
- **Leader Completeness**：被选上的 Leader 一定包含所有已提交日志

### 工程实践
- etcd、Consul、TiDB 使用 Raft
- 集群大小建议 3 或 5 节点
- 避免跨机房部署（网络延迟影响选举）`,
  },
};
