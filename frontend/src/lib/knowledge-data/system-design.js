export const knowledge = {
  Docker: {
    category: "devops",
    content:
      "##Docker 核心概念\n\n### 什么是容器？\n容器是将软件打包成标准化单元，用于开发、交付和部署。容器镜像是轻量、可执行的独立软件包，包含代码、运行时、系统工具、库和设置。\n\n### 容器 vs 虚拟机\n| 特性 | 容器 | 虚拟机 |\n|------|------|--------|\n| 抽象层 | 应用层（虚拟化操作系统） | 物理硬件层 |\n| 占用空间 | 小（镜像通常几十兆） | 大 |\n| 启动速度 | 瞬间 | 缓慢（需启动完整 OS） |\n| 内核 | 共享宿主机内核 | 每个 VM 包含完整 OS |\n| 隔离性 | 进程级隔离 | 彻底隔离运行环境 |\n\n### 三大基本概念\n- **镜像（Image）**：特殊文件系统，分层存储（基于 Union FS），不可变。\n- **容器（Container）**：镜像运行时的实体，本质是进程，运行于独立命名空间。删除容器存储层数据丢失，应使用数据卷（Volume）。\n- **仓库（Repository）**：集中存放镜像的地方（如 Docker Hub）。\n\n### Docker Compose\n通过 YAML 文件配置多容器服务，一条命令 docker-compose up 启动所有服务。\n\n### 核心技术\n基于 Linux 内核的 CGroup（资源限制）和 namespace（命名空间隔离），以及 UnionFS（联合文件系统），实现操作系统层面的虚拟化。\n",
    source: null,
    domain: "devops",
  },
  分布式: {
    category: "java_advanced",
    content:
      "## 分布式系统基础\n\n> 来源：JavaGuide\n\n### 什么是分布式系统？\n分布式系统是由多台计算机通过网络通信协作完成任务的系统，对外表现为一个整体。\n\n### CAP 定理\n分布式系统只能同时满足以下三个中的两个：\n| 特性 | 说明 |\n|------|------|\n| **C**（一致性） | 所有节点同一时刻看到相同数据 |\n| **A**（可用性） | 每次请求都能获得正常响应 |\n| **P**（分区容错） | 网络分区时系统仍能工作 |\n\n- CP 系统（ZooKeeper、etcd）：牺牲可用性保证一致性。\n- AP 系统（Eureka、Cassandra）：牺牲一致性保证可用性。\n- CA 系统：实际不存在（网络分区必然发生）。\n\n### BASE 理论\n- **Basically Available**（基本可用）：允许部分功能降级。\n- **Soft State**（软状态）：允许中间状态。\n- **Eventually Consistent**（最终一致性）：经过一段时间数据趋于一致。\n\n### 常见分布式技术\n| 领域 | 技术 |\n|------|------|\n| 服务发现 | ZooKeeper、Eureka、Nacos、Consul |\n| 配置中心 | Apollo、Nacos Config |\n| 分布式锁 | Redis Redisson、ZooKeeper |\n| 消息队列 | Kafka、RocketMQ、RabbitMQ |\n| 分布式事务 | Seata（AT/TCC/Saga）、2PC/3PC |\n| 负载均衡 | Nginx、Spring Cloud Gateway |\n| 远程调用 | Dubbo、gRPC、Feign |\n",
    source: "JavaGuide",
    domain: "java_advanced",
  },
  安全: {
    category: "java_advanced",
    content:
      "## Java 安全基础\n\n> 来源：JavaGuide\n\n### 常见安全漏洞\n\n**SQL 注入**：拼接 SQL 字符串导致攻击者注入恶意 SQL。\n- 防御：使用 PreparedStatement（参数化查询）、MyBatis #{} 占位符。\n\n**XSS（跨站脚本）**：攻击者在页面注入恶意脚本。\n- 防御：输出编码（HTML Entity）、Content-Security-Policy 头。\n\n**CSRF（跨站请求伪造）**：利用用户已登录状态发起恶意请求。\n- 防御：CSRF Token、SameSite Cookie 属性、验证 Referer。\n\n**SSRF（服务端请求伪造）**：服务端发起请求时被引导访问内网资源。\n- 防御：白名单 URL、禁用协议（file://）、内网地址过滤。\n\n**敏感信息泄露**：密码、密钥、Token 硬编码在代码中。\n- 防御：环境变量、配置中心（Nacos）、密钥管理（Vault）、.gitignore。\n\n### 认证与授权\n- **认证（Authentication）**：验证身份（你是谁）。常见：JWT、Session-Cookie、OAuth2、SSO。\n- **授权（Authorization）**：验证权限（你能做什么）。常见：RBAC（基于角色）、ABAC（基于属性）。\n\n### Spring Security 基础\n- 认证过滤器链：UsernamePasswordAuthenticationFilter → BasicAuthenticationFilter → ... \n- 常见配置：formLogin()、oauth2Login()、csrf().disable()（需谨慎）。\n- BCryptPasswordEncoder：推荐密码加密方式，自动加盐。\n",
    source: "JavaGuide",
    domain: "security",
  },
  架构: {
    category: "system_design",
    content:
      "## 系统架构设计\n\n> 来源：JavaGuide\n\n### 架构模式\n\n**单体架构**：所有功能打包在一个应用中。\n- 优点：开发简单，部署单一。\n- 缺点：团队协作困难，难以扩展，牵一发而动全身。\n\n**分层架构**：将系统分为展示层、业务层、持久层等。\n- 每层职责明确，上层依赖下层。\n- 典型代表：Spring MVC（Controller → Service → DAO）。\n\n**微服务架构**：将应用拆分为一系列小的、独立的服务。\n- 每个服务独立开发、部署、扩展。\n- 优点：技术多样性、独立部署、容错隔离。\n- 挑战：服务治理（发现/配置/网关）、数据一致性（分布式事务）、运维复杂度。\n\n**事件驱动架构**：组件通过事件异步通信。\n- 松耦合、高扩展、支持 CQRS 和 Event Sourcing。\n- 典型：Kafka、RabbitMQ。\n\n### 分层设计原则\n- **单一职责**：每层只关注自己的职责。\n- **依赖倒置**：上层不直接依赖下层实现，依赖抽象接口。\n- **接口隔离**：不强迫调用者依赖不需要的方法。\n- **无环依赖**：避免循环依赖（A→B→A）。\n",
    source: "JavaGuide",
    domain: "system_design_main",
  },
  微服务架构: {
    category: "microservices",
    content:
      "## 微服务架构核心概念\n\n### 什么是微服务？\n将单体应用拆分为多个独立部署的小服务，每个服务围绕特定业务能力构建，拥有独立的数据库、部署流水线和运维边界。\n\n### 微服务 vs 单体\n\n| 维度 | 单体架构 | 微服务架构 |\n|------|---------|-----------|\n| 部署 | 单一部署单元 | 独立部署，服务间通过 API 通信 |\n| 扩展 | 整体水平扩展 | 按需扩展单个服务 |\n| 开发 | 统一技术栈 | 服务可选用不同技术栈 |\n| 团队 | 按功能分层协作 | 按业务领域组织（康威定律） |\n| 测试 | 端到端测试较简单 | 需契约测试、服务桩 |\n| 运维 | 单一监控和日志 | 分布式追踪、集中式日志 |\n\n### 服务拆分原则\n- **领域驱动设计（DDD）**：按限界上下文（Bounded Context）拆分\n- **单一职责**：每个服务只负责一个业务能力\n- **无共享**：数据库不共享，通过 API 交换数据\n- **自治性**：服务可独立开发、测试、部署、扩展\n\n### 服务通信\n- **同步**：REST / gRPC。简单直接，但会产生调用链依赖和级联故障\n- **异步**：消息队列（Kafka / RabbitMQ）。解耦削峰，但增加最终一致性复杂度\n- **gRPC**：基于 HTTP/2 + Protocol Buffers，高效双向流，适合内部服务间通信\n\n### 微服务痛点\n\n| 问题 | 解决方案 |\n|------|---------|\n| 配置管理 | 配置中心（Nacos / Apollo / Consul） |\n| 服务发现 | Eureka / Nacos / Consul / Kubernetes Service |\n| 负载均衡 | Ribbon / Spring Cloud LoadBalancer / K8s Service |\n| 熔断降级 | Hystrix / Sentinel / Resilience4j |\n| 分布式事务 | Seata（AT / TCC / Saga） |\n| 分布式追踪 | Jaeger / Zipkin / Skywalking |\n| 日志聚合 | ELK / Loki + Grafana |\n| 监控告警 | Prometheus + Grafana |\n\n### 微服务设计模式\n- **服务注册与发现**：新服务启动时注册，客户端从注册中心获取地址\n- **API 网关**：统一入口，负责路由、认证、限流、协议转换\n- **熔断器（Circuit Breaker）**：快速失败防止级联雪崩\n- **舱壁隔离（Bulkhead）**：将资源池隔离，防止一个服务耗尽所有线程\n- **重试与超时**：设置合理的重试策略和超时时间\n- **Sidecar**：将服务治理能力剥离到独立进程（Istio / Linkerd）\n- **Saga**：长事务拆分为本地事务 + 补偿操作\n\n### 容器化与编排\n- **Docker**：将服务和依赖打包为容器镜像\n- **Kubernetes**：容器编排平台，提供自动部署、伸缩、服务管理\n- **Service Mesh**：将通信逻辑从业务代码中剥离到 Sidecar 代理（Istio 数据面为 Envoy）\n",
    source: "综合整理",
    domain: "microservices",
  },
  系统设计: {
    category: "system_design",
    content:
      "## 系统设计核心要点\n\n### 设计流程\n1. **需求澄清**：功能需求 + 非功能需求（QPS、延迟、可用性、一致性要求）\n2. **估算**：QPS、存储量、带宽。例如日活 1 亿，每个用户每天 10 条消息 → QPS ≈ 10^8*10/86400 ≈ 11500\n3. **数据模型设计**：ER 图，选择存储系统（关系型 / NoSQL / 缓存 / 对象存储）\n4. **高层设计**：系统架构图，核心模块划分\n5. **详细设计**：深入关键组件，权衡取舍\n\n### 关键指标\n\n| 指标 | 说明 | 目标参考 |\n|------|------|---------|\n| QPS | 每秒查询数 | 单机 ~1k-2k（MySQL），~5-10k（Redis） |\n| 延迟 | 请求响应时间 | <100ms 优秀，<500ms 可接受 |\n| P99 延迟 | 99% 请求的延迟上界 | <200ms 优秀 |\n| 可用性 | 系统正常运行时间比 | 99.9%（3 个 9）≈ 8.7h/年 故障 |\n| SLA | 服务等级协议 | 99.99%（4 个 9）≈ 52min/年 故障 |\n\n### 常见系统设计题\n\n#### 短链服务（TinyURL）\n- 核心操作：create(长链) → 短链；访问短链 → 302 重定向\n- 发号器：自增 ID（雪花算法 / Redis incr）→ Base62 编码（6-7 位）\n- 读写比 ≈ 1:10000，缓存热点短链\n- 预估：每日 1 亿新短链，QPS 约 1150（写） + 1150w（读）\n\n#### 分布式 KV 存储\n- 一致性哈希解决数据分片和扩缩容\n- 虚拟节点减少数据倾斜\n- Gossip 协议维护集群成员\n- Vector Clock / CRDT 处理冲突\n- Hinted Handoff + Read Repair 保证最终一致性\n\n#### 实时消息系统\n- WebSocket 长连接保持实时推送\n- 消息可靠性：至少一次 / 最多一次 / 恰好一次\n- 消息有序性：单分区/单线程保证顺序\n- 离线消息：消息持久化 + 拉取模式\n- 大规模连接管理：连接池 + 心跳检测\n\n#### 限流设计\n- 令牌桶：固定速率放入令牌，突发时消耗累积令牌\n- 漏桶：固定速率流出，超出的请求排队或丢弃\n- 滑动窗口：在时间窗口内计数，更平滑的限流\n- 分布式限流：Redis + Lua 脚本实现原子计数\n\n### 数据库扩展策略\n- **读写分离**：主库写，从库读（只对读多写少场景有效）\n- **分库分表**：按业务分库（垂直），按 ID 范围/哈希分表（水平）\n- **CQRS**：命令和查询分离，写模型和读模型使用不同数据结构\n\n### 缓存策略\n- **旁路缓存（Cache-Aside）**：读时先查缓存，miss 则查 DB 并回填\n- **穿透缓存（Read-Through）**：缓存层代为查询 DB\n- **写回缓存（Write-Back）**：先写缓存，异步写 DB\n- **缓存更新**：先写 DB 再删缓存（Cache Aside Pattern）\n\n### 一致性方案\n- **强一致性**：分布式事务（2PC / 3PC），性能低\n- **最终一致性**：消息队列 + 重试 + 对账\n- **补偿事务**：Saga（Choreography / Orchestration）\n- **共识算法**：Paxos / Raft，用于配置同步和选主\n",
    source: "综合整理",
    domain: "system_design_main",
  },
  消息队列: {
    category: "mq",
    content:
      "## 消息队列核心概念\n\n### 什么是消息队列\n消息队列（Message Queue）是分布式系统中的异步通信中间件，生产者发送消息到队列，消费者从队列拉取或接收推送。解耦生产者和消费者，实现削峰填谷、异步处理。\n\n### 主流消息队列对比\n\n| 特性 | Kafka | RabbitMQ | RocketMQ | Pulsar |\n|------|-------|---------|---------|--------|\n| 性能 | 最高（百万级/秒） | 中等（万级/秒） | 高（十万级/秒） | 高（十万级/秒） |\n| 吞吐 | 日志、流处理场景 | 低延迟业务场景 | 金融级事务场景 | 云原生、多租户 |\n| 消息模型 | 分区日志（Pub/Sub） | 队列 + Exchange | Topic + Queue | Topic + 分层存储 |\n| 顺序消息 | 分区内有序 | 单队列有序 | 分区有序 | 分区有序 |\n| 消息可靠性 | ACK + ISR 副本 | 持久化 + 确认 | 同步刷盘 + 同步复制 | BookKeeper 持久化 |\n| 延迟消息 | 不支持原生 | 支持（插件） | 支持（内置） | 支持 |\n| 死信队列 | 支持 | 支持 | 支持 | 支持 |\n| 事务消息 | 支持（2PC） | 不支持 | 支持 | 支持 |\n\n### Kafka 核心概念\n- **Topic**：消息的逻辑分类\n- **Partition**：Topic 的分片，每个 Partition 是有序的日志文件\n- **Producer**：消息生产者，可指定 partition key\n- **Consumer Group**：消费者组，组内消费者分摊分区消费\n- **Broker**：Kafka 服务器节点，每个节点管理多个 Partition\n- **Offset**：消息在 Partition 内的偏移量，消费者通过 offset 追踪消费位置\n- **ISR（In-Sync Replica）**：与 Leader 保持同步的副本集合\n\n#### Kafka 关键特性\n- **顺序写磁盘**：利用磁盘顺序 I/O（≈600MB/s），远快于随机 I/O\n- **零拷贝**：利用 sendfile() 系统调用，数据直接从 PageCache → 网卡，绕过应用程序内存\n- **批量压缩**：批量发送消息，支持 gzip / snappy / lz4 / zstd 压缩\n- **分区自平衡**：新增或下线 Broker 时自动触发 Rebalance\n\n#### Kafka 消息可靠性\n- **acks=0**：不等待确认，可能丢消息（最快）\n- **acks=1**：Leader 写入即确认（默认）\n- **acks=-1(all)**：所有 ISR 写入后确认（最可靠）\n- **min.insync.replicas**：设定最小同步副本数，配合 acks=all 保证不丢\n\n### RabbitMQ 核心概念\n- **Exchange**：交换机，决定消息路由到哪些队列\n  - Direct：精确匹配 routing key\n  - Topic：通配符匹配 routing key（* 匹配一个词，# 匹配零或多个词）\n  - Fanout：广播到所有绑定队列\n  - Headers：根据消息头属性匹配\n- **Binding**：Exchange 和 Queue 之间的绑定规则\n- **Virtual Host**：逻辑隔离，多租户支持\n\n### RocketMQ 核心概念\n- **NameServer**：注册中心，维护 Topic 路由信息\n- **Producer Group**：生产者分组，事务消息回查\n- **Consumer Group**：消费者分组，消费进度管理\n- **消息类型**：普通消息、顺序消息、事务消息、延时消息\n\n### 消息可靠性保证\n- **生产端**：发送确认 + 重试机制\n- **服务端**：持久化存储 + 多副本同步\n- **消费端**：手动 ACK + 幂等消费\n- **最终一致性**：事务消息 + 本地事务表\n\n### 使用场景\n- **异步处理**：用户注册后异步发送邮件和短信\n- **流量削峰**：秒杀请求先入队列，后端按能力消费\n- **日志收集**：各服务日志 → Kafka → 实时计算 + 归档\n- **事件驱动**：订单状态变更 → 发送事件 → 下游服务响应\n- **系统解耦**：上下游服务通过 MQ 通信，变更不影响对方\n",
    source: "综合整理",
    domain: "mq",
  },
};
