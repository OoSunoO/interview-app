#!/usr/bin/env python3
"""Expand mq.json from 50 to ~100 questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('mq', 'hard', 'short_answer', 'Kafka 日志存储原理与文件格式',
      '深入分析 Kafka 日志存储结构。日志段（Log Segment）的文件组成：.log/.index/.timeindex/.txnindex。消息的物理存储格式——Record Batch 的封装（CRC/attributes/timestamp/offsets）。日志索引的二分查找实现。日志压缩（Log Compaction）的 Cleaner 线程工作流程。',
      'Kafka 日志存储：\n\n1. **Log Segment 结构**：\n   - `.log`：消息数据（Record Batch 序列）\n   - `.index`：偏移量 → 文件位置（稀疏索引，每 4KB 一个条目）\n   - `.timeindex`：时间戳 → 偏移量\n   - `.txnindex`：事务索引\n\n2. **Record Batch**：\n   - 一批消息的封装（提高 I/O 效率）\n   - Header：FirstOffset + Length + CRC + Attributes + LastOffsetDelta\n   - 压缩：Batch 级别整体压缩\n   - 格式：v0/v1/v2（v2 引入可变长度、Zig-Zag 编码）\n\n3. **索引查找**：\n   - `index` 文件：二分查找找到 ≤ 目标偏移量的最近条目\n   - 再到 `.log` 文件从该位置顺序扫描\n   - 时间复杂度：O(log(segment_count)) + O(batch_in_segment)\n\n4. **Log Compaction**：\n   - Cleaner 线程不断扫描\n   - 保留每个 key 的最新值（删除旧值）\n   - 通过 Cleaner Offset Checkpoint 追踪进度\n\n5. **关键配置**：\n   - segment.bytes：默认 1GB\n   - segment.ms：默认 7 天\n   - log.cleaner.threads：压缩线程数',
      ['Kafka 日志段 = .log + .index + .timeindex', 'Compaction 只保留每个 key 的最新值'], ['kafka', 'storage', 'log']),

    q('mq', 'hard', 'short_answer', 'Kafka 幂等生产者与事务的 Exactly-Once 语义',
      '深度分析 Kafka 生产者幂等性和事务的实现。幂等生产者——Producer ID（PID）+ Sequence Number 的去重机制。事务的原子性——Transaction Coordinator 和 Transaction Log。事务的 Commit 流程。事务与幂等的共同工作。',
      'Kafka Exactly-Once：\n\n1. **幂等生产者**：\n   - 每个 Producer 分配唯一 PID（Producer ID）\n   - 每分区维护 Sequence Number（从 0 递增）\n   - Broker 检测重复：新 seq = last_seq + 1\n   - 重试时相同的 seq 直接返回成功\n   - 配置：enable.idempotence=true\n\n2. **事务 API**：\n   - Transaction Coordinator 管理事务状态\n   - Transaction Log 记录事务状态（内部 Topic: __transaction_state）\n   - **流程**：\n     - InitTransactions → PID + Epoch\n     - BeginTransaction\n     - SendMessages + CommitOffsetsTransaction\n     - CommitTransaction/AbortTransaction\n\n3. **Commit 流程**：\n   - Write COMMIT_PID_MESSAGE to Transaction Log\n   - Append COMMIT markers to data partitions\n   - Consumers 通过 markers 判断消息可见性\n\n4. **隔离级别**：\n   - read_uncommitted：看到所有消息（包括未提交的）\n   - read_committed：只看到已提交消息\n\n5. **局限**：\n   - PID 重启后序列号重置 → 可能重复\n   - 事务在跨集群复制时复杂',
      ['PID + Sequence Number 实现幂等（去重机制）', '事务 = 批量消息原子提交 + consumer offset 原子提交'], ['kafka', 'exactly-once', 'idempotent']),

    q('mq', 'medium', 'short_answer', 'RabbitMQ 镜像队列与 Quorum Queue 对比',
      '对比 RabbitMQ 的镜像队列和 Quorum Queue。镜像队列的 Mnesia 同步机制和性能瓶颈。Quorum Queue 基于 Raft 的实现——Leader/Follower 模型、多数派写入。Quorum Queue 的数据安全性和性能权衡。从镜像队列迁移到 Quorum Queue。',
      'RabbitMQ 队列对比：\n\n1. **镜像队列**：\n   - Mnesia 数据库同步\n   - 全量同步模式（所有节点存所有数据）\n   - **问题**：网络分区时脑裂、性能差（全量复制）\n   - **已废弃**：RabbitMQ 3.8+ 不推荐\n\n2. **Quorum Queue**：\n   - 基于 Raft 共识\n   - 3-5 个副本（默认 3）\n   - 多数派写入（写入 2/3 节点成功 → 返回确认）\n   - **Leader**：处理所有读写请求\n   - **Follower**：复制数据\n\n3. **数据安全性**：\n   - 镜像队列：网络分区 → 数据不一致\n   - Quorum Queue：Raft 保证一致性\n   - Quorum Queue 支持 poison message handling\n\n4. **性能**：\n   - 镜像队列：同步复制（性能差）\n   - Quorum Queue：多数派写入（性能中等）\n   - 单节点 Classic Queue：最快但不安全\n\n5. **迁移指南**：\n   - 3.13+ 强制推荐 Quorum Queue\n   - 策略：ha-mode → quorum_queue\n   - 所有新项目默认使用 Quorum Queue',
      ['Quorum Queue（Raft）替代镜像队列（Mnesia）成为推荐方案', '多数派写入 = 写入 3 副本中的 2 个成功才算确认'], ['rabbitmq', 'quorum-queue', 'raft']),

    q('mq', 'medium', 'short_answer', 'Kafka Streams 的状态存储与容错',
      '分析 Kafka Streams 的状态存储机制。状态存储的类型：KeyValueStore/WindowStore/SessionStore。RocksDB 的状态存储实现。状态存储的 changelog topic 容错——通过消费 changelog 恢复状态。Standby Replicas 的热备加速。',
      'Kafka Streams 状态：\n\n1. **状态存储类型**：\n   - **KeyValueStore**：按键查询（最常用）\n   - **WindowStore**：窗口聚合\n   - **SessionStore**：会话聚合\n\n2. **RocksDB**：\n   - 内嵌 LSM-Tree KV 存储\n   - 磁盘存储（不依赖堆内存）\n   - 压缩：Snappy/ZSTD\n   - 写满内存 → flush SST\n\n3. **容错机制**：\n   - 每个状态存储对应一个 changelog topic（__{appId}-{storeName}-changelog）\n   - 每次状态变更写入 changelog\n   - 故障 → 新 Task 消费 changelog 恢复状态\n   - **恢复时间**：取决于 changelog 大小\n\n4. **Standby Replicas**：\n   - 热备副本持续消费 changelog\n   - 故障时直接从 Standby 恢复（不需要消费全部 changelog）\n   - 减少恢复时间\n\n5. **配置**：\n   - num.standby.replicas：Standby 数\n   - state.dir：RocksDB 文件目录\n   - cache.max.bytes.buffering：缓存大小',
      ['RocksDB 存储全量状态，changelog topic 实现容错恢复', 'Standby Replicas 热备减少故障恢复时间'], ['kafka', 'streams', 'state-store']),

    q('mq', 'hard', 'short_answer', 'RocketMQ 的 DLEDger 自动选主与故障转移',
      '深入分析 RocketMQ DLedger（Raft）的自动选主和故障转移机制。DLedger Commitlog 的多副本写入。Leader 选举——基于 Raft 的 PreVote/RequestVote。Broker 故障后的自动转移流程和写请求中断时间。DLedger 的读写性能开销。',
      'RocketMQ DLedger：\n\n1. **DLedger Commitlog**：\n   - 替代传统 Commitlog + ConsumeQueue 的主从模式\n   - 3 节点集群（容忍 1 节点故障）\n   - 多数派写入：写入完成需要多数节点确认\n\n2. **选主流程**：\n   - Leader 心跳超时 → Follower 发起 PreVote（确认是否可能赢）\n   - 获得多数支持 → RequestVote\n   - 获得多数投票 → 成为新 Leader\n   - **时间**：典型情况 3-5 秒\n\n3. **故障时写中断**：\n   - Leader 故障 → 不可写直到选出新 Leader\n   - 中断时间：Leader 检测超时（~1-3s）+ 选举（~1-2s）\n   - 总中断：3-7 秒\n\n4. **性能开销**：\n   - 相比异步复制：吞吐下降 30-50%\n   - 相比同步复制：差异不大\n   - 写延迟增加（多数派确认）\n\n5. **部署建议**：\n   - 3 节点部署在不同机器/机架\n   - 网络延迟 < 5ms（同一机房）\n   - 跨机房部署不推荐（延迟太高）',
      ['DLedger = Raft on RocketMQ（3 节点容忍 1 故障）', '故障切换 3-7 秒（Leader 检测 + 选举）'], ['rocketmq', 'dledger', 'raft']),

    q('mq', 'medium', 'short_answer', 'Pulsar 的 BookKeeper 存储架构',
      '深入分析 Pulsar 的消息存储层 BookKeeper。Ledger 和 Entry 的管理。Bookie 的读写分离架构——Journal（WAL）+ Entry Log 的写入模式。Ensemble/Write Quorum/Ack Quorum（E/W/Q）的配置。BookKeeper 的自动恢复机制（Auto Recovery）。',
      'Pulsar BookKeeper：\n\n1. **Ledger & Entry**：\n   - **Ledger**：有序 Entry 序列（类似 Kafka Partition）\n   - **Entry**：单条消息\n   - Ledger 是写入单元（只能追加，关闭后只读）\n\n2. **Bookie 存储**：\n   - **Journal**：WAL（顺序写入，快速确认）\n   - **Entry Log**：实际数据存储（多个 Ledger 共享）\n   - **Ledger Index**：Entry 的索引\n   - 读时先找 Index → 再到 Entry Log 读取\n\n3. **E/W/Q 配置**：\n   - **E（Ensemble）**：存储数据的节点集合数\n   - **W（Write Quorum）**：每条 Entry 写入的节点数\n   - **A（Ack Quorum）**：确认写入需要的节点数\n   - 典型配置：E=3, W=3, A=2（容忍 1 节点故障）\n\n4. **Auto Recovery**：\n   - Bookie 故障 → 自动检测\n   - 故障 Bookie 的 Ledger 数据 → 复制到其他 Bookie\n   - 写入和读取在恢复过程中不受影响\n\n5. **对比 Kafka**：\n   - Kafka：Partition 在固定 Broker\n   - Pulsar：Ledger 分散在所有 Bookie\n   - Pulsar 扩缩容不需要 rebalance（BookKeeper 分层存储）',
      ['BookKeeper 的 Journal + Entry Log 类似数据库 WAL + 数据文件', 'E/W/Q 灵活配置数据分布和持久化级别'], ['pulsar', 'bookkeeper', 'storage']),

    q('mq', 'medium', 'short_answer', '消息队列中的死信队列与重试策略',
      '讨论消息队列的死信策略。RabbitMQ 的 DLX + TTL 实现延迟重试。Kafka 的 Dead Letter Topic。RocketMQ 的重试队列与死信队列。消息重试间隔策略——固定间隔/指数退避/最大重试次数。死信消息的手动干预方案。',
      '死信队列：\n\n1. **RabbitMQ DLX**：\n   - 消息过期（TTL）→ Dead Letter Exchange\n   - 队列达到最大长度 → DLX\n   - 消息被拒绝（basic.reject/basic.nack with requeue=false）\n\n2. **Kafka 死信**：\n   - 消费失败 → 写入 Dead Letter Topic\n   - Spring Kafka：@RetryableTopic 注解\n   - 支持拓扑：main-topic → retry-topic-1 → retry-topic-2 → dlt\n\n3. **RocketMQ 重试**：\n   - %RETRY%{consumerGroup} 重试队列\n   - 16 个等级（每次等待不同时间）\n   - 最大重试次数 16\n   - 超过 → %DLQ%{consumerGroup} 死信队列\n\n4. **重试策略**：\n   - **固定间隔**：简单但可能引起 thundering herd\n   - **指数退避**：推荐（1s → 2s → 4s → 8s...）\n   - **指数退避 + 随机抖动**：避免同时重试\n   - 最大重试次数：防止无限循环\n\n5. **死信处理**：\n   - 告警通知\n   - 人工干预修复后重新投递\n   - 自动重试（修复 bug 后重放）\n   - 死信 Web 管理界面',
      ['指数退避 + 随机抖动是最优重试策略', '死信队列告警 + 人工干预是兜底方案'], ['dlq', 'retry', 'dead-letter']),

    q('mq', 'hard', 'short_answer', 'Kafka 控制器（Controller）架构与优化',
      '深入分析 Kafka Controller 的角色和功能。Controller 的选举——基于 ZooKeeper 的临时节点（/controller）。Controller 的分区状态机和副本状态机。Controller 故障时的重新选举和数据重建。KRaft 模式下的 Controller 架构变化。',
      'Kafka Controller：\n\n1. **Controller 职责**：\n   - 分区 Leader 选举\n   - 分区分配和移动\n   - Broker 上下线处理\n   - Topic 创建/删除/修改\n\n2. **选举**：\n   - ZooKeeper 中创建临时节点 /controller\n   - 第一个创建的成为 Controller\n   - 失败时节点消失 → 其他 Broker 竞争创建\n\n3. **状态机**：\n   - **Partition State Machine**：管理分区状态（NonExistent → Online → Offline）\n   - **Replica State Machine**：管理副本状态（OnlineReplica → OfflineReplica）\n\n4. **故障处理**：\n   - Controller 故障 → 新 Controller 从 ZK 读取全量状态\n   - 大规模集群下状态恢复慢（ZK 读取 + 全量构建）\n   - 优化：增加分区数时 Controller 压力增大\n\n5. **KRaft（Kafka Raft）**：\n   - 去除 ZooKeeper 依赖\n   - Controller 节点组成 Raft 集群\n   - 元数据 Topic（__cluster_metadata）存储所有元数据\n   - 元数据版本管理\n   - 优势：元数据一致性更高、运维更简单',
      ['Controller 管理分区和副本的 Leader 选举', 'KRaft 替代 ZK 实现自管理的元数据一致性'], ['kafka', 'controller', 'kraft']),

    q('mq', 'medium', 'short_answer', 'MQ 跨地域复制对比：MM2 vs Pulsar Geo vs RocketMQ',
      '对比三大消息队列的跨地域复制方案。Kafka MirrorMaker 2——Source Mirror 的偏移量同步和 Topic 自动创建。Pulsar Geo-Replication——基于 BookKeeper 的原生异步复制。RocketMQ 的 DLedger 跨集群复制。延迟、吞吐和一致性权衡。',
      '跨地域复制：\n\n1. **Kafka MM2**：\n   - Source Mirror：消费源集群 → 写入目标集群\n   - 偏移量同步：偏移量存储到内部 Topic（mm2-offsets）\n   - Topic 自动创建（远程 Topic 映射）\n   - 支持双向复制（活跃-活跃）\n   - 重复检测：offset sync 跟踪\n\n2. **Pulsar Geo**：\n   - 原生异步复制\n   - 数据立即写入本地 BookKeeper → 异步复制到远程集群\n   - 每个 Region 独立（写入本 Region 无跨地域延迟）\n   - 复制延迟：跨地域 ~100ms-1s\n\n3. **RocketMQ**：\n   - DLedger 适合同城双活\n   - 跨地域：支持异步复制\n   - 不支持自动主备切换\n\n4. **对比**：\n   - **延迟**：Pulsar（本 Region 零影响）< 其他\n   - **一致性**：Kafka MM2（偏移量映射保证不丢不重）\n   - **运维**：Pulsar（原生）< Kafka MM2（额外组件）\n\n5. **选型建议**：\n   - 活跃-主动：Pulsar（原生支持）\n   - 主-备：Kafka MM2\n   - 简单跨地域：Kafka MM2',
      ['Pulsar 原生 Geo-Replication 最轻量', 'MM2 的 offset sync 保证消息不丢不重'], ['mq', 'geo-replication']),

    q('mq', 'medium', 'short_answer', 'Pulsar Functions 轻量计算',
      '介绍 Pulsar Functions 的轻量级消息处理能力。Function 的线程模型（Serverless 运行时）。Function 的状态存储（State Store）。Function 的窗口支持（Tumbling/Sliding Window）。Function vs Kafka Streams vs Flink。',
      'Pulsar Functions：\n\n1. **架构**：\n   - 处理每条消息的函数（输入 Pulsar Topic → 处理 → 输出 Pulsar Topic）\n   - 线程池模型（轻量级，不需要额外计算框架）\n   - 每个 Function 实例处理一个 Topic 的分区子集\n\n2. **状态存储**：\n   - Function 状态存入 BookKeeper\n   - 原子性读写\n   - 类似 Flink 的 KV State\n\n3. **窗口支持**：\n   - Tumbling Window：固定时间窗口\n   - Sliding Window：滑动时间窗口\n   - 累积窗口\n\n4. **Function vs Stream**：\n   - Pulsar Functions：单条消息处理、轻量、适合简单的 ETL\n   - Kafka Streams：有状态处理、连接操作、适合复杂流处理\n   - Flink：复杂事件处理、乱序处理、Exactly-Once 保证\n\n5. **适用场景**：\n   - 数据清洗和转换\n   - 路由过滤\n   - 简单聚合\n   - 事件驱动的微服务',
      ['Pulsar Functions = 轻量级 Topic-to-Topic 处理', '适合简单 ETL，复杂场景还是用 Flink/Kafka Streams'], ['pulsar', 'functions']),

    q('mq', 'hard', 'short_answer', 'Kafka 网络层与请求处理模型',
      '分析 Kafka 的服务器端网络架构。Acceptor（接受连接）→ Processor（网络线程）→ Handler（处理线程）。Java NIO Selector 的事件循环模型。请求队列（Request Queue）和响应队列（Response Queue）的编排。Kafka 的 CPU、内存、网络配置最佳实践。',
      'Kafka 网络架构：\n\n1. **三层线程模型**：\n   - **Acceptor**：1 个线程，接受新 TCP 连接\n   - **Processor**（网络线程）：N 个线程（num.network.threads，默认 3）\n     - 从连接读取请求 → 放入 Request Queue\n     - 从 Response Queue 取响应 → 写入连接\n   - **Handler**（处理线程）：M 个线程（num.io.threads，默认 8）\n     - 从 Request Queue 取请求处理\n     - 处理完放入 Response Queue\n\n2. **Selector**：\n   - Java NIO Selector 事件循环\n   - OP_ACCEPT → OP_READ → OP_WRITE\n   - 非阻塞 I/O\n\n3. **请求队列**：\n   - 每个 Processor 或 Handler 消费\n   - 背压：队列满 → Processor 停止读取（反压到 TCP）\n\n4. **配置**：\n   - **num.network.threads**：CPU 核数或 ×2\n   - **num.io.threads**：磁盘和计算密集，通常 = CPU × 2\n   - **queued.max.requests**：请求队列大小\n   - **socket.send.buffer.bytes**：Socket 缓冲区',
      ['Acceptor → Processor（网络）→ Handler（IO）三层线程模型', '请求/响应队列解耦网络层和 IO 层'], ['kafka', 'networking', 'architecture']),

    q('mq', 'medium', 'short_answer', 'RocketMQ 的 NameServer 路由发现',
      '介绍 RocketMQ NameServer 的路由管理机制。NameServer 的路由表存储——Topic → Broker Queue 的映射。NameServer 无状态设计（不通信、不选举）。Broker 心跳注册和探活。Producer 和 Consumer 的路由发现时机和缓存。',
      'RocketMQ NameServer：\n\n1. **功能**：\n   - 路由管理：存储 Topic → Broker Queue 映射\n   -  Broker 注册：接收 Broker 心跳\n   -  Producer/Consumer 获取路由信息\n\n2. **无状态设计**：\n   - 多个 NameServer 独立运行（不互相通信）\n   - 每个 Broker 向所有 NameServer 注册\n   - NameServer 之间不选举（无 Leader）\n   - 客户端随机连接一个 NameServer\n\n3. **Broker 心跳**：\n   -  Broker 每隔 30s 发送心跳\n   -  NameServer 120s 未收到心跳 → 移除 Broker\n   - 心跳包含：Broker 地址、Topic 列表、Queue 数量\n\n4. **路由发现**：\n   - Producer 首次发送消息时拉取路由 → 缓存到本地\n   - Topic 路由变更 → NameServer 会在下次拉取时返回新路由\n   - 客户端每隔 30s 更新路由\n\n5. **对比**：\n   - Kafka：ZooKeeper/KRaft 存储元数据（强一致）\n   - RocketMQ：NameServer（最终一致）\n   - Pulsar：ZooKeeper（元数据） + BookKeeper（数据）',
      ['NameServer 无状态设计（不通信、不选举、简单可靠）', '路由信息最终一致（~30s 传播延迟）'], ['rocketmq', 'nameserver']),

    q('mq', 'medium', 'short_answer', '消息队列在事件溯源（Event Sourcing）中的应用',
      '讨论 MQ 作为事件存储实现事件溯源模式。Event Store vs 传统 MQ 在事件溯源中的角色差异。事件的不可变性和回溯重放。Kafka 作为 Event Store（日志即事件流）的优势。CQRS + Event Sourcing 与 MQ 的集成。',
      'MQ + Event Sourcing：\n\n1. **事件溯源**：\n   - 所有状态变更作为不可变事件存储\n   - 当前状态 = 所有事件的叠加效果\n   - 支持任意时刻回溯重放\n\n2. **Kafka 作为 Event Store**：\n   - 不可变日志（消息不可修改）\n   - 按 Partition 顺序保证\n   - 支持时间回溯消费\n   - 长保留期（retention 可设为 -1 永久）\n   - **优势**：天然适合事件溯源\n\n3. **与传统 MQ 差异**：\n   - 传统 MQ（RabbitMQ/RocketMQ）：消费后删除\n   - Event Store 需要保留（Kafka 默认保留 7 天 +）\n   - 传统 MQ 适合命令/任务分发\n   - Event Store 适合事件存档\n\n4. **CQRS 集成**：\n   - 命令（Command）→ 写入 Event Store\n   - 事件 → 更新查询数据库\n   - 查询 → 读数据库\n   - 问题：数据库和 Event Store 的双写一致性\n\n5. **模式**：\n   - **Event sourcing + Kafka**：领域事件 → Kafka Topic\n   - 不同服务消费事件更新自己的视图\n   - **Outbox Pattern**：保证数据库和消息的一致',
      ['Kafka 的不可变日志天然适合 Event Store', 'CQRS + Event Sourcing 通过 Outbox Pattern 解决双写一致性问题'], ['event-sourcing', 'kafka', 'cqrs']),

    q('mq', 'hard', 'short_answer', '消息队列的存储格式与序列化优化',
      '讨论 MQ 消息的存储格式优化。Kafka Record Batch 的二进制格式。Avro/Protobuf/Thrift 编码对比。压缩编码：Varint + Zig-Zag 的整数编码。零拷贝在 MQ 中的应用（Kafka 的 sendfile Transferable Records）。',
      'MQ 序列化优化：\n\n1. **Kafka Record Batch**：\n   - BaseOffset + BatchLength + CRC + Attributes\n   - LastOffsetDelta + FirstTimestamp + MaxTimestamp\n   - Record 列表（每个 Record 长度可变）\n   - Varint 编码减小整数长度\n\n2. **序列化对比**：\n   - **Avro**：动态 Schema、压缩、写 Schema ID\n   - **Protobuf**：代码生成、更紧凑、无需 Registry\n   - **Thrift**：类似 Protobuf、TCompactProtocol 压缩\n   - 空间效率：Protobuf > Avro > Thrift > JSON\n\n3. **Varint + Zig-Zag**：\n   - Varint：小整数更短（1 byte for 0-127）\n   - Zig-Zag：有符号整数映射到无符号（-1 → 1, 1 → 2）\n   - Kafka v2 格式全面使用\n\n4. **零拷贝**：\n   - Kafka 消费时：File → Socket（sendfile）\n   - 数据直接从页缓存到网卡（不经过用户态）\n   - TransferableRecords：支持零拷贝的 Batch 格式\n\n5. **配置优化**：\n   - message.max.bytes：消息最大值\n   - compression.type：生产者压缩算法\n   - 使用 schema registry 减少消息头',
      ['Varint + Zig-Zag 编码减少整数存储空间', 'sendfile 零拷贝让 Kafka 消费绕过用户态'], ['serialization', 'avro', 'protobuf']),

    q('mq', 'medium', 'short_answer', 'RocketMQ 的 ConsumeQueue 与 IndexFile',
      '分析 RocketMQ 的存储文件结构。CommitLog 的追加写入。ConsumeQueue 的固定长度条目（20 bytes —— CommitLog Offset + Size + Tag Hash）。IndexFile 的哈希索引加速消息查询。刷盘策略：同步刷盘 vs 异步刷盘。',
      'RocketMQ 存储：\n\n1. **CommitLog**：\n   - 单一文件，消息顺序追加\n   - 所有 Topic 共享同一个 CommitLog\n   - 每个消息有唯一的物理偏移量\n   - 默认 1GB 后滚动新文件\n\n2. **ConsumeQueue**：\n   - 每个 Queue 一个 ConsumeQueue\n   - 固定 20 bytes 条目：CommitLog Offset(8) + Size(4) + Tag Hash(8)\n   - ConsumeQueue 是 CommitLog 的索引\n   - **设计哲学**：顺序读写 CommitLog，ConsumeQueue 只做索引\n\n3. **IndexFile**：\n   - 哈希索引（Hash Slot + Hash Chain）\n   - 按 Key 或时间范围查询消息\n   - 默认开启（索引数量有限制）\n\n4. **刷盘策略**：\n   - **同步刷盘**：写入物理磁盘才返回成功（最安全）\n   - **异步刷盘**：写入页缓存就返回（性能好，有丢失窗口）\n   - 配置：flushDiskType=SYNC_FLUSH/ASYNC_FLUSH\n\n5. **内存映射**：\n   - CommitLog：MappedByteBuffer 映射\n   - ConsumeQueue/IndexFile：内存映射\n   - 利用操作系统页缓存',
      ['ConsumeQueue 是 CommitLog 的索引（20 bytes 固定条目）', '同步刷盘保证零丢失，异步刷盘性能好但有丢失窗口'], ['rocketmq', 'storage']),

    q('mq', 'medium', 'short_answer', 'Pulsar 的消息 TTL、保留与分层的管理',
      '深入 Pulsar 的消息管理策略。TTL（消息自动过期）。Retention（保留已消费消息）。Backlog（未消费消息的限制和策略）。分层存储（Tiered Storage）——S3/GCS/Azure 作为远程存储。消息的生命周期管理。',
      'Pulsar 消息管理：\n\n1. **TTL**：\n   - 消息存活时间（默认不设置）\n   - 超过 TTL 未被消费 → 自动标记为 ACKed\n   - 策略级别配置\n\n2. **Retention**：\n   - 保留已消费消息以便重放\n   - size 和时间两个维度\n   - 配置：-1（无限保留）\n\n3. **Backlog**：\n   - 未消费消息队列\n   - Backlog 配额策略：Producer 阻塞 / 丢弃消息 / 抛出异常\n   - Backlog 大小告警\n\n4. **Tiered Storage**：\n   - 旧数据自动卸载到对象存储（S3/GCS/Azure）\n   - 本地 BookKeeper 作为热层\n   - 远程对象存储作为冷层\n   - 卸载后消费者仍然可以读取（透明）\n   - 配置：ManagedLedgerOffloader\n\n5. **生命周期**：\n   - 消息 → BookKeeper（热）→ 达到阈值 → S3（冷）→ TTL 过期 → 删除\n   - 每个阶段可配置时间和大小\n   - 查询自动跨越冷热层',
      ['TTL 控制消息存活，Retention 控制已消费消息保存', 'Tiered Storage 自动卸载旧数据到 S3 降低存储成本'], ['pulsar', 'ttl', 'tiered-storage']),

    q('mq', 'hard', 'short_answer', 'Kafka 消费端分区分配策略源码分析',
      '分析 Kafka 消费者组的三种分区分配策略。Range Assignor——按 Topic 分 Range 分配给消费者。RoundRobin Assignor——轮询分配（均匀）。Sticky Assignor——最大化分配稳定性（最小化分区移动）。Cooperative Sticky Assignor——增量重平衡。',
      '分区分配：\n\n1. **Range Assignor**（默认老版本）：\n   - 每个 Topic 独立分配\n   - 分 Range：(num_partitions / num_consumers)\n   - **问题**：不均匀（余数分配导致前面消费者多分区）\n   - 2 消费者、3 分区：C1=[0,1], C2=[2]\n\n2. **RoundRobin Assignor**：\n   - 所有 Topic 所有分区统一轮询\n   - 要求消费者订阅相同的 Topic 列表\n   - 分配最均匀\n\n3. **Sticky Assignor**：\n   - 目标：尽可能均匀分配\n   - 重平衡时：最大化保留现有分配\n   - 避免全量 Rebalance 的分区移动\n\n4. **Cooperative Sticky Assignor**：\n   - 增量重平衡（多个轮次）\n   - 每轮只 revoked 需要移动的分区\n   - 不需要 Stop-The-World\n   - **推荐新版本使用**\n\n5. **自定义 Assignor**：\n   - 实现 org.apache.kafka.clients.consumer.ConsumerPartitionAssignor\n   - 支持机架感知（同一机架的消费者优先）',
      ['Cooperative Sticky = 增量重平衡 + 最少移动', 'Range 不均匀，RoundRobin 均匀但重平衡全量移动'], ['kafka', 'consumer', 'partition-assignor']),

    q('mq', 'medium', 'short_answer', '消息队列的认证、授权与加密',
      '讨论消息队列的安全机制。Kafka 的认证（SASL/PLAIN/SCRAM/GSSAPI/Kerberos）+ 授权（ACL）。RabbitMQ 的认证和权限管理。RocketMQ 的 ACL。TLS 传输加密。安全最佳实践和常见误区。',
      'MQ 安全：\n\n1. **Kafka 认证**：\n   - SASL/PLAIN：用户名密码（简单但不安全）\n   - SASL/SCRAM：带盐的挑战-响应认证（推荐）\n   - SASL/GSSAPI：Kerberos（企业常用）\n   - **授权**：ACL（kafka-acls.sh）\n     - 模式：Principal + Host + Operation + PermissionType\n\n2. **RabbitMQ 认证**：\n   - 用户名/密码认证\n   - 权限：虚拟主机级别的 configure/read/write\n   - LDAP 集成\n\n3. **RocketMQ ACL**：\n   - 配置文件权限（plain_acl.yml）\n   - 资源：Topic/ConsumerGroup\n   - 操作：PUB/SUB\n\n4. **TLS 加密**：\n   - Kafka：ssl.keystore/truststore 配置\n   - RabbitMQ：启用 TLS 监听端口\n   - 证书管理（CA 签发）\n\n5. **最佳实践**：\n   - 内网可以不加密但要认证\n   - 跨网络必须 TLS + 认证\n   - 最小权限原则（只授权需要的操作）\n   - 定期轮换证书和密钥',
      ['SASL/SCRAM 认证推荐（比 PLAIN 安全）', '跨网络传输必须用 TLS 加密'], ['mq', 'security', 'authentication']),

    q('mq', 'medium', 'short_answer', 'Kafka 监控指标体系详解',
      '全面分析 Kafka 的可观测性指标。Kafka 内置指标——JMX MBeans 暴露。关键指标：Broker/Partition/Producer/Consumer 维度。消费延迟（Consumer Lag）的计算和告警策略。第三方监控方案：Kafka Exporter + Prometheus + Grafana。',
      'Kafka 监控：\n\n1. **Broker 指标**：\n   - BytesInPerSec/BytesOutPerSec：流量\n   - MessagesInPerSec：消息速率\n   - RequestQueueSize/ResponseQueueSize：请求队列\n   - NetworkProcessorAvgIdlePercent/RequestHandlerAvgIdlePercent\n\n2. **Partition 指标**：\n   - UnderReplicatedPartitions：未同步分区数（关键告警）\n   - OfflinePartitions：离线分区（严重告警）\n   - LeaderCount：分区 Leader 分布\n\n3. **Producer 指标**：\n   - request-latency-avg：请求延迟\n   - outgoing-byte-rate：发送速率\n   - batch-size-avg：批次大小\n   - compression-rate-avg：压缩率\n\n4. **Consumer 指标**：\n   - Consumer Lag（消费延迟）\n   - records-lag-max：最大延迟\n   - fetch-latency-avg：拉取延迟\n\n5. **告警规则**：\n   - UnderReplicatedPartitions > 0 → Broker 故障\n   - Consumer Lag 持续增长 → 消费方性能问题\n   - Request Queue > 1000 → Broker 过载\n   - NetworkProcessorAvgIdlePercent < 0.1 → 网络线程瓶颈\n\n6. **工具**：\n   - Kafka Exporter（Prometheus）\n   - Burrow（LinkedIn）Consumer Lag 监控\n   - Cruise Control：集群均衡',
      ['UnderReplicatedPartitions > 0 是最关键的 Broker 告警', 'Consumer Lag 持续增长 = 消费端跟不上'], ['kafka', 'monitoring']),

    q('mq', 'hard', 'short_answer', 'RocketMQ 的 Broker 路由与负载均衡',
      '分析 RocketMQ 的 Producer 和 Consumer 端负载均衡。Producer 端的发送队列选择——轮询/算法指定。Consumer 端的 Queue 均衡——平均分配/环形分配。Broker 故障时的路由感知和切换。消息发送到同机房 Broker 的延迟优化。',
      'RocketMQ 负载均衡：\n\n1. **Producer 负载均衡**：\n   - 默认轮询选择 Queue\n   - 支持自定义 MessageQueueSelector\n   - 延迟发送策略：故障规避\n\n2. **Consumer 负载均衡**：\n   - **平均分配**：所有消费者排序后平均分配 Queue\n   - **环形分配**：类似一致性哈希\n   - 消费者数量变化时触发 Rebalance\n   - Rebalance 由 Consumer 端发起\n\n3. **故障感知**：\n   - Producer 端维护 Broker 的可用状态\n   - 发送失败 → 尝试下一个 Broker\n   - 失败超过阈值 → 加入黑名单\n   - 定期重试\n\n4. **机架感知**：\n   - 消息优先发送到相同机房的 Broker\n   - 减少跨机房延迟\n   - 配置：sendLatencyFaultEnable=true\n\n5. **订阅关系一致性**：\n   - 同一消费者组的订阅必须一致\n   - 不一致导致 Queue 分配混乱',
      ['Producer 轮询/故障规避，Consumer 平均/环形分配', 'sendLatencyFaultEnable 实现机架感知发送'], ['rocketmq', 'load-balancing']),

    q('mq', 'medium', 'short_answer', 'Pulsar 的 Proxy 与 Gateway 架构',
      '介绍 Pulsar Proxy 的接入层架构。Proxy 的无状态设计——作为 Broker 的 TCP 代理。Proxy 的路由——基于 Topic 查找 Owner Broker。Pulsar 的多租户隔离。Proxy 的 TLS 终止和认证卸载。对比 Kafka Proxy 和 REST Proxy。',
      'Pulsar Proxy：\n\n1. **Proxy 架构**：\n   - 无状态 TCP 代理\n   - 客户端 → Proxy → Broker\n   - 支持自动发现 Broker 拓扑\n   - 负载均衡：Proxy 转发到正确的 Broker\n\n2. **路由机制**：\n   - 客户端连接 Proxy 并声明 Topic\n   - Proxy 向 Broker 查询（Lookup）Topic 的 Owner\n   - 建立到 Owner Broker 的连接\n   - 缓存查找结果\n\n3. **多租户**：\n   - Tenant → Namespace → Topic 层级\n   - 每个 Tenant 独立的认证和配额\n   - Namespace 级别的策略控制\n   - 不同 Tenant 的数据隔离\n\n4. **TLS 终止**：\n   - Proxy 处理 TLS 证书\n   - Broker 只接受 Proxy 的内部连接\n   - 客户端不需要直接连接到 Broker\n\n5. **其他 Proxy**：\n   - **Kafka REST Proxy**：HTTP → Kafka\n   - **Kafka Proxy**（Confluent）：协议代理\n   - **Pulsar Proxy**：内置、原生支持',
      ['Pulsar Proxy 是无状态接入层（TLS 终止、路由、认证）', '多租户通过 Tenant → Namespace → Topic 三层隔离'], ['pulsar', 'proxy']),

    q('mq', 'medium', 'short_answer', '消息队列的生产级部署架构',
      '设计生产级 MQ 的部署架构。集群拓扑：Kafka/RabbitMQ/RocketMQ/Pulsar 的典型部署。机架感知、跨可用区部署。资源的独立配置（CPU/内存/磁盘）。监控和告警基础设施。容量规划和扩缩容策略。',
      'MQ 部署架构：\n\n1. **Kafka 部署**：\n   - Broker 节点最少 3 副本\n   - 每个 Broker 独享磁盘（避免 IO 竞争）\n   - 机架感知分配副本\n   - zookeeper/KRaft 集群\n\n2. **RabbitMQ 部署**：\n   - 3 节点 Quorum Queue 集群\n   - HAProxy 前端负载均衡\n   - 内存高水位告警（vm_memory_high_watermark）\n\n3. **RocketMQ 部署**：\n   - 多组 Master-Slave（2m-2s 或 2m-2s-DLedger）\n   - NameServer 独立部署（2-3 台）\n   - Broker 同机架配对\n\n4. **Pulsar 部署**：\n   - Broker + BookKeeper 分离部署\n   - Broker 无状态（可水平扩展）\n   - BookKeeper Journal 放 SSD，Entry Log 放 HDD\n\n5. **容量规划**：\n   - 磁盘：保留时间 × 消息速率 × 消息大小 × 副本数\n   - 内存：页缓存 + JVM Heap\n   - 网络：总吞吐 × 副本因子\n   - CPU：线程数 × 分区数',
      ['Broker 和存储分离（Pulsar）vs 耦合（Kafka）', '磁盘 = 保留时间 × 速率 × 大小 × 副本'], ['mq', 'deployment', 'architecture']),

    q('mq', 'medium', 'short_answer', 'RabbitMQ Streams 与 Classic Queue 对比',
      '对比 RabbitMQ 的 Stream 和 Classic Queue。Stream 的仅追加日志结构与 Classic Queue 的即时删除。Stream 的消费模型——offset 追踪（类似 Kafka）。Stream 在大数据量场景下的优势和局限。何时选择 Stream 何时选择 Queue。',
      'RabbitMQ Streams：\n\n1. **Classic Queue**：\n   - 消费后删除消息\n   - 基于 AMQP 协议\n   - 消息确认机制\n   - 适合传统任务分发\n\n2. **Stream**：\n   - 仅追加日志（不删除消息）\n   - 类似 Kafka 的分区日志\n   - offset 消费追踪\n   - 支持时间范围回溯\n\n3. **Stream 特性**：\n   - 分层存储（磁盘 + 内存）\n   - 优先级队列\n   - 多消费者独立消费\n   - 高吞吐（比 Classic Queue 快 ~10x）\n\n4. **适用场景**：\n   - **Stream**：事件日志、审计追踪、大数据流处理\n   - **Classic Queue**：任务分发、RPC 模式\n   - **Quorum Queue**：需要确认的消息\n\n5. **性能对比**：\n   - Classic Queue：~10k msg/s\n   - Quorum Queue：~5k msg/s（Raft 开销）\n   - Stream：~100k msg/s\n   - RabbitMQ 3.13+ 推荐 Stream',
      ['Stream 的日志结构比 Classic Queue 快 ~10x', 'Stream 适合事件日志，Classic Queue 适合任务分发'], ['rabbitmq', 'stream']),

    q('mq', 'hard', 'short_answer', 'Kafka 多租户：配额、认证与隔离',
      '讨论 Kafka 多租户的实现机制。配额（Quota）管理——Network Quota 和 Request Rate Quota。双配额模型（Quota Window 和 Throttle）。Topic 级别的租户隔离。基于 ZooKeeper/KRaft 的 ACL 存储和验证。多租户下的性能隔离挑战。',
      'Kafka 多租户：\n\n1. **网络限速**：\n   - **Network Quota**：限制带宽（bytes/s）\n   - **Request Rate Quota**：限制请求率（requests/s）\n   - 窗口机制：累积配额使用量 × 响应门控\n   - 超限时：Broker 可以在响应中返回 ThrottleTime\n\n2. **Connection Quota**：\n   - 限制 IP 的连接数\n   - 每个 IP 最大连接数配置\n   - 防止一个租户消耗所有连接\n\n3. **Topic 隔离**：\n   - 不同租户使用不同 Topic 前缀（_tenant1_）\n   - ACL 限制 Topic 的访问\n   - 磁盘使用按分区分配\n\n4. **性能隔离**：\n   - 问题：一个租户的大流量影响其他租户\n   - 方案：单独集群/RBAC + 配额\n   - Confluent Kafka 的 Cluster Linking\n\n5. **管理**：\n   - kafka-acls.sh + kafka-configs.sh\n   - 自动化租户 onboarding\n   - 监控每个租户的配额使用',
      ['Network Quota + Request Rate Quota 控制租户资源使用', '性能隔离的终极方案 = 独立集群'], ['kafka', 'multi-tenant']),

    q('mq', 'medium', 'short_answer', 'RocketMQ 的定时消息与延迟消息实现',
      '分析 RocketMQ 的定时/延迟消息实现。延迟消息的固定等级（1s/5s/10s/30s/1m/2m...）。延迟消息的 SCHEDULE_TOPIC_XXXX 存储机制。定时消息的精确时间戳（OpenMessaging 2.0）。对比 Kafka 的时间戳与延迟消息实现。',
      'RocketMQ 延迟消息：\n\n1. **固定等级**：\n   - 18 个等级：1s/5s/10s/30s/1m/2m/3m/4m/5m/6m/7m/8m/9m/10m/20m/30m/1h/2h\n   - 生产者设置 messageDelayLevel\n   - 等级在 Broker 配置固定\n\n2. **存储机制**：\n   - 消息先写入 SCHEDULE_TOPIC_XXXX（内建 Topic）\n   - 延迟到时间 → 写入真实 Topic 的 ConsumeQueue\n   - 定时器：Deliver 线程扫描到期消息\n   - FlushConsumeQueue 间隔控制\n\n3. **精确时间戳**：\n   - OpenMessaging 2.0 的定时消息\n   - 精确到毫秒\n   - 支持任意时间点\n\n4. **Kafka 延迟消息**：\n   - 原生不支持延迟\n   - 方案：时间戳 Topic → Consumer 检查时间戳\n   - 外部定时器触发发布\n\n5. **应用场景**：\n   - 订单超时关闭\n   - 定时任务调度\n   - 重试延迟',
      ['RocketMQ 延迟消息 = SCHEDULE_TOPIC_XXXX 中转', 'Kafka 原生不支持延迟消息（需要外部实现）'], ['rocketmq', 'delay-message']),

    q('mq', 'medium', 'short_answer', 'Pulsar 的 Lightbend 与 KoP 协议兼容层',
      '介绍 Pulsar 的协议兼容层。KoP（Kafka on Pulsar）——在 Pulsar 上运行 Kafka 协议。MoP（MQTT on Pulsar）。AoP（AMQP on Pulsar）。协议兼容层的架构——协议处理插件（Protocol Handler）机制。多协议共存的场景和价值。',
      'Pulsar 协议兼容：\n\n1. **KoP（Kafka on Pulsar）**：\n   - Kafka 协议处理插件\n   - 客户端直接用 Kafka 原生协议连接\n   - 数据存储在 Pulsar 的 BookKeeper\n   - 迁移场景：Kafka → Pulsar，不改客户端\n\n2. **MoP（MQTT on Pulsar）**：\n   - MQTT 协议接入\n   - IoT 设备通过 MQTT 协议通信\n   - Pulsar 的 Topic 管理能力\n\n3. **AoP（AMQP on Pulsar）**：\n   - AMQP 0-9-1（RabbitMQ 协议）\n   - 兼容 RabbitMQ 客户端\n   - 支持 Exchange/Queue 模型映射\n\n4. **Protocol Handler 架构**：\n   - Pulsar Broker 加载协议处理插件\n   - 同一端口处理多种协议\n   - 共享 Broker 资源和 BookKeeper 存储\n\n5. **价值**：\n   - 减少集群数量（一个 Pulsar 替代多个 MQ）\n   - 数据共享（Kafka 和 Pulsar 客户端读写同一 Topic）\n   - 迁移成本低',
      ['KoP/MoP/AoP 让 Pulsar 原生支持 Kafka/MQTT/AMQP 协议', '协议兼容层降低迁移成本和运维复杂度'], ['pulsar', 'kop', 'protocol']),

    q('mq', 'hard', 'short_answer', 'Kafka 内存管理与页缓存优化',
      '讨论 Kafka 的 JVM 堆内存和 OS 页缓存使用策略。Kafka 为什么依赖页缓存（Page Cache）。JVM Heap 的合理大小（避免 GC 压力）。堆外内存（Off-Heap）的应用。Kafka 的零拷贝路径。内存调优案例分析。',
      'Kafka 内存管理：\n\n1. **页缓存优先**：\n   - Kafka 写操作写入 OS 页缓存（不是直接 JVM）\n   - 刷盘：内核异步刷新\n   - 读操作：直接从页缓存读取（命中率高）\n   - 页缓存命中率高 → 零磁盘读（热点数据）\n\n2. **JVM Heap**：\n   - Kafka 核心不存储消息数据在堆内\n   - 堆用于：请求处理、元数据、缓存引用\n   - Heap 推荐 4-8GB（过大 → GC 暂停影响延迟）\n   - GC 选型：G1GC（推荐）\n\n3. **堆外内存**：\n   - Direct Memory 用于网络 buffer\n   - MappedByteBuffer 映射文件\n   - 减少堆内对象创建\n\n4. **零拷贝路径**：\n   - 消费：PageCache → Socket（sendfile）\n   - 生产：Socket → PageCache\n   - 关键：数据在用户态零拷贝\n\n5. **调优**：\n   - 预留足够页缓存（内存的一半给页缓存）\n   - 监控：PageCache 命中率\n   - 磁盘 IO 使用率\n   - 内存不足时：减少脏页比例',
      ['Kafka 消息数据在页缓存中，不在 JVM 堆中', '预留系统内存给页缓存（至少一半）是关键调优'], ['kafka', 'memory', 'page-cache']),

    q('mq', 'medium', 'short_answer', 'Pulsar 的消息去重与消费幂等',
      '讨论 Pulsar 的 Producer 去重和 Consumer 幂等机制。Producer deduplication——Broker 端基于 Sequence ID 去重。Consumer 幂等消费的挑战。Pulsar 的 Exactly-Once 处理语义。批量消息的幂等处理策略。',
      'Pulsar 去重幂等：\n\n1. **Producer Deduplication**：\n   - Producer 每个消息带唯一 Sequence ID\n   - Broker 缓存最近的 Sequence ID\n   - 重复 ID → 返回已确认（不写入）\n   - 配置：deduplicationEnabled=true\n\n2. **Consumer 幂等**：\n   - 消费者处理完后提交 offset\n   - 如果处理完但提交失败 → 重启后重复消费\n   - **要求**：消费处理逻辑必须幂等\n\n3. **Exactly-Once**：\n   - Pulsar 的 Exactly-Once 在单 Topic 内保证\n   - 跨 Topic 需要外部事务协调\n   - 事务 API（Pulsar 2.8+）\n\n4. **批量幂等**：\n   - 批量消息去重：每个 batch 有 batch sequence ID\n   - 批量处理：事务性写入 DB + Commit offset\n   - Outbox Pattern + 幂等表\n\n5. **最佳实践**：\n   - 启用 deduplication\n   - 消费端幂等去重表\n   - 监控重复率',
      ['Producer deduplication 基于 Sequence ID 去重', '消费幂等需要业务层配合（去重表/幂等键）'], ['pulsar', 'deduplication', 'idempotent']),

    q('mq', 'medium', 'short_answer', 'MQ 与数据库一致性的 Outbox 模式',
      '深入分析 Outbox 模式如何解决本地事务和消息发送的一致性问题。Outbox 表的设计（业务事件 → 数据库 Outbox 表）。Transaction Outbox 的轮询/CDC 发件人。CDC 方案（Debezium + Kafka）——从数据库 Binlog 捕获 Outbox 事件。对比发件人模式的选择。',
      'Outbox 模式：\n\n1. **问题**：\n   - 业务操作写入 DB → 发送 MQ\n   - DB 提交成功但 MQ 发送失败 → 数据不一致\n   - MQ 发送成功但 DB 回滚 → 消息错误\n\n2. **Outbox 表**：\n   - 业务表和 outbox 表在同一个本地事务\n   - outbox 表字段：id, aggregate_id, event_type, payload, created_at, status\n   - 业务成功 = outbox 记录写入\n\n3. **发件人（Publisher）**：\n   - **轮询发件人**：定期扫描 outbox 表，发送消息，标记已发送\n   - **CDC 发件人**：Debezium 监听 binlog → 发送到 Kafka\n   - CDC 优点：零侵入、低延迟、不轮询\n\n4. **Debezium + Kafka**：\n   - Debezium 连接 DB Binlog\n   - Debezium 的 Outbox Event Router SMT\n   - 从 outbox 表生成 Kafka 消息\n   - 自动清理已处理记录\n\n5. **选型**：\n   - 简单场景：轮询发件人（容易实现）\n   - 高要求场景：CDC 发件人（无侵入、低延迟）\n   - 需要 DB 的 Debezium 支持',
      ['Outbox 模式 = 本地事务写 outbox 表 + 独立发件人转发到 MQ', 'CDC（Debezium）比轮询更优雅（零侵入、低延迟）'], ['outbox', 'pattern', 'consistency']),

    q('mq', 'hard', 'short_answer', 'Kafka 磁盘 I/O 优化与调度策略',
      '分析 Kafka 磁盘密集型的优化策略。Kafka 磁盘格式：顺序 I/O 优先。磁盘调度器选择（none/deadline/cfq/bfq/mq-deadline）。IO 线程模型和数据复制流程。磁盘故障的处理和恢复。SSD 和 HDD 的适用场景。',
      'Kafka 磁盘优化：\n\n1. **顺序 I/O**：\n   - 写：追加到日志（连续写）\n   - 读：批量读页面到缓存\n   - 顺序 I/O 比随机 I/O 快 ~100x（HDD）\n\n2. **磁盘调度器**：\n   - **none**：NVMe SSD 推荐（不需要调度）\n   - **deadline/mq-deadline**：SATA SSD 推荐\n   - **bfq**：HDD 多进程场景\n   - 配置：`echo none > /sys/block/sda/queue/scheduler`\n\n3. **数据复制**：\n   - Producer 数据 → Socket Buffer → Page Cache → Disk\n   - Consumer 数据 → Page Cache → Socket Buffer（sendfile）\n   - flush 策略：脏页比例 + 定期 fsync\n\n4. **磁盘故障**：\n   - 磁盘坏道 → Broker 下线\n   - 解决方案：RAID（不推荐用于 Kafka）、JBOD、多副本\n   - 监控：磁盘使用率、IO 延迟\n\n5. **SSD vs HDD**：\n   - SSD：随机读写快（ConsumeQueue）、低延迟\n   - HDD：顺序读写也够（CommitLog）\n   - 推荐：SSD 用于日志目录，HDD 不推荐',
      ['Kafka 顺序 I/O（追加写）让 HDD 也能工作', 'SSD 更适合 ConsumeQueue 的随机访问'], ['kafka', 'disk-io', 'optimization']),

    q('mq', 'medium', 'short_answer', 'RocketMQ 的 Tag 与 SQL92 过滤机制',
      '深入 RocketMQ 的消息过滤。Tag 过滤在 Broker 端的 ConsumeQueue Tag Hash 比对。SQL92 过滤的属性匹配实现。复杂过滤中 Broker 端和 Consumer 端处理。过滤性能对消费吞吐的影响。',
      'RocketMQ 过滤：\n\n1. **Tag 过滤流程**：\n   - Producer 设置消息 Tag（1 个）\n   - Consumer 订阅 Tag 表达式（TagA || TagB）\n   - ConsumeQueue 中 8-byte Tag Hash Code\n   - Broker 比较 Hash → → 匹配 Consumer Queue\n\n2. **SQL92 过滤**：\n   - 基于消息属性（Properties）的表达式\n   - 语法：`TAGS IS NOT NULL AND age > 18`\n   - 需要启用：enablePropertyFilter=true\n   - Broker 端解析执行\n\n3. **实现**：\n   - Tag：ConsumeQueue 级别过滤（20 bytes 条目中的 Tag Hash）\n   - SQL92：消费时对消息逐个匹配\n\n4. **性能影响**：\n   - Tag 过滤：无性能损失（ConsumeQueue 内置）\n   - SQL92 过滤：每条消息都需要属性匹配\n   - 高吞吐场景优先使用 Tag 过滤\n\n5. **最佳实践**：\n   - 简单分类用 Tag（性能最好）\n   - 复杂逻辑用 SQL92，但控制过滤表达式数量\n   - 可以用不同 Topic 代替复杂过滤',
      ['Tag 过滤零开销（ConsumeQueue 内置），SQL92 逐条匹配有额外成本', '尽量用 Tag + 多 Topic 组合避免复杂 SQL92 过滤'], ['rocketmq', 'filtering']),

    q('mq', 'hard', 'short_answer', 'Kafka 的 ZooKeeper 依赖与 KRaft 迁移',
      '分析 Kafka 的 ZooKeeper 元数据管理。ZK 存储的元数据（Broker 注册、Topic 配置、ACL、ISR）。ZK 在大规模集群下的性能瓶颈。KRaft（Kafka Raft Metadata Mode）的架构变化。ZK 到 KRaft 的迁移路径和注意事项。',
      'Kafka ZK → KRaft：\n\n1. **ZK 元数据**：\n   - /brokers/ids：Broker 注册\n   - /brokers/topics：Topic 配置和分区分配\n   - /config：配置变更\n   - /controller：控制器选举\n   - /admin：管理操作\n\n2. **ZK 瓶颈**：\n   - ZK 写性能：~10k ops/s（事务日志）\n   - 100k 分区时：ZK 读取压力大\n   - ZK 集群分裂风险（大规模）\n   - 运维：独立 ZK 集群、版本兼容性\n\n3. **KRaft 架构**：\n   - Controller 节点组成 Raft 集群\n   - 元数据作为日志存储在 __cluster_metadata Topic\n   - 不需要独立 ZK 集群\n   - Controller 数量建议 3（容忍 1）\n\n4. **迁移**：\n   - Kafka 3.5+：KRaft 生产就绪\n   - 迁移模式：ZK → Migration → KRaft\n   - 工具：kafka-metadata-migration\n   - 步骤：启用 migration → 切换 → 完成\n\n5. **注意事项**：\n   - KRaft 3.5+ 才 GA\n   - 不支持滚动降级到早期版本\n   - 先测试验证再迁移',
      ['KRaft 去除 ZK 依赖（自管理元数据）', '迁移路径：ZK → Migration → KRaft'], ['kafka', 'kraft', 'zookeeper']),

    q('mq', 'medium', 'short_answer', '消息队列消息体设计最佳实践',
      '讨论 MQ 消息体设计的原则。消息体大小控制（推荐 1KB-1MB）。消息中包含的字段：metadata + payload 分离。消息版本管理（Schema 演化）。二进制 vs 文本格式的选择。KIP（Kafka Improvement Proposal）的消息格式演进。',
      '消息体设计：\n\n1. **基本原则**：\n   - 消息体大小：1KB-1MB（太小 IOPS 高，太大吞吐低）\n   - 超过 1MB → 拆分或使用外部存储\n   - Metadata（header/properties）+ payload 分离\n\n2. **字段设计**：\n   - Header：message_id, timestamp, source, version, trace_id\n   - Payload：业务数据\n   - Header 标准化（W3C Trace-Context 等）\n\n3. **版本管理**：\n   - Schema Registry（Avro/Protobuf）\n   - 消息中加入 version 字段\n   - 向前/向后兼容\n\n4. **格式选择**：\n   - JSON：可读性好，但体积大\n   - Avro：Schema 驱动，紧凑\n   - Protobuf：最紧凑、强类型\n   - **推荐**：内部用 Protobuf/Avro，外部接口用 JSON\n\n5. **最佳实践**：\n   - 消息不可变（发送后不修改）\n   - 使用 Trace ID 关联链路\n   - 考虑压缩率和序列化开销',
      ['消息体 1KB-1MB 最佳（过小 IOPS 高、过大吞吐低）', '版本管理 + Schema Registry = 可靠的消息演化'], ['mq', 'message-design']),

    q('mq', 'medium', 'short_answer', 'Pulsar 的 Namespace 与 Bundle 负载管理',
      '分析 Pulsar 的 Bundle（分区元组）负载管理和分散。Namespace 的 Bundle 分割。Bundle 在 Broker 间的负载均衡（Load Manager）。Topic 的 Lookup 优化——Bundle 级别缓存。Bundle 数量规划和性能影响。',
      'Pulsar Bundle：\n\n1. **Bundle 概念**：\n   - Bundle：Namespace 的连续分区范围（hash 范围）\n   - 默认 4 个 Bundle（但可配）\n   - 每个 Bundle 绑定到一个 Broker\n   - Topic 通过 hash 分配到 Bundle\n\n2. **Bundle Split**：\n   - Bundle 负载过高 → 自动分裂\n   - 策略：Bundle 的 Topic 数/消息速率超过阈值\n   - 分裂后新的子 Bundle 可能分配到其他 Broker\n\n3. **Load Manager**：\n   - 监控所有 Broker 的负载\n   - 自动 Bundle 迁移（负载高的 Broker → 低的）\n   - 负载因素：CPU/内存/流量/Latency\n   - 定时评估负载均衡\n\n4. **Lookup 优化**：\n   - 客户端查询 Topic 的 Bundle 归属\n   - 缓存 Bundle → Broker 映射\n   - 减少 Lookup 请求\n\n5. **配置**：\n   - loadBalancerEnabled\n   - loadBalancerSheddingIntervalMinutes\n   - defaultNumberOfNamespaceBundles',
      ['Bundle 是 Pulsar 扩展性的核心（分裂 + 负载均衡）', 'Bundle 负载均衡实现 Broker 间的自动扩展'], ['pulsar', 'bundle', 'load-balancing']),

    q('mq', 'hard', 'short_answer', 'Kafka 时间戳提取器与自定义 Timestamp',
      '分析 Kafka Streams 的时间戳处理。TimestampExtractor 的四种时间语义：事件时间/处理时间/摄入时间。Kafka Streams 的 Timestamp 提取和分配。时间戳在窗口操作和乱序处理中的作用。乱序容忍（MaxOutOfOrderness）和 Grace Period。',
      'Kafka 时间戳：\n\n1. **三种时间**：\n   - **事件时间（Event Time）**：业务产生时间\n   - **处理时间（Processing Time）**：Streams 处理时\n   - **摄入时间（Ingestion Time）**：Broker 接收时\n\n2. **TimestampExtractor**：\n   - `extract(record, previousTimestamp)` → 返回事件时间\n   - 内置实现：\n     - FailOnInvalidTimestamp（默认，抛出异常）\n     - LogAndSkipOnInvalidTimestamp（跳过）\n     - WallclockTimestampExtractor（系统时钟）\n\n3. **窗口操作**：\n   - Tumbling/ Hopping/ Session Windows\n   - 窗口分配基于事件时间\n   - 乱序处理：允许事件迟到\n\n4. **乱序容忍**：\n   - **MaxOutOfOrderness**：最大乱序时间\n   - **Grace Period**：窗口关闭后的等待时间\n   - 超过 Grace → 丢弃\n   - 权衡：长 Grace = 更好的正确性但更多内存\n\n5. **最佳实践**：\n   - 始终在 Producer 端设置事件时间\n   - 根据业务容忍度设置乱序窗口\n   - 监控丢弃的事件数量',
      ['事件时间驱动窗口计算（处理时间只用于兜底）', 'Grace Period 控制乱序事件的容忍度'], ['kafka', 'streams', 'timestamp']),

    q('mq', 'medium', 'short_answer', 'MQ 从 Kafka 迁移到 Pulsar 实践',
      '讨论从 Kafka 迁移到 Pulsar 的策略。迁移方案：双写（Dual Write + 对比）+ 切流。KoP（Kafka on Pulsar）平滑过渡——不改客户端。迁移中的数据一致性和校验。回滚方案设计。迁移后的收益和挑战。',
      'Kafka → Pulsar：\n\n1. **迁移策略**：\n   - **影子读取**：消费 Kafka 数据同时在 Pulsar 验证\n   - **双写**：同时写入 Kafka 和 Pulsar\n   - **切流**：Producer/Consumer 逐步切到 Pulsar\n   - 步骤：影子 → 双写 → 切 Producer → 切 Consumer\n\n2. **KoP 方案**：\n   - 部署 Pulsar 集群 + KoP handler\n   - Kafka 客户端直接连接 Pulsar（不改代码）\n   - 数据存储在 BookKeeper\n   - 逐步迁移客户端\n\n3. **数据校验**：\n   - 比对 Kafka 和 Pulsar 的数据量\n   - 抽样校验消息内容\n   - 检查消费延迟\n\n4. **回滚**：\n   - 双写期间 Kafka 数据完整 → 可随时回滚\n   - KoP：切换回 Kafka 只需要改连接地址\n\n5. **收益与挑战**：\n   - 收益：运维简单、扩展性好、多租户、分层存储\n   - 挑战：BookKeeper 运维、延迟排查、中间件替换成本',
      ['双写 + 切流是安全迁移路径', 'KoP 零代码修改平滑过渡'], ['mq', 'migration']),

    q('mq', 'medium', 'short_answer', '消息队列事件流处理模式总结',
      '总结消息队列事件流处理的常见模式。事件通知（Event Notification）——通知下游。事件状态传递（Event Carried State Transfer）——减少查询。事件溯源（Event Sourcing）——重建状态。CQRS（Command Query Responsibility Segregation）——读写分离。事件编年（Event Chronicle）——审计日志。',
      '事件流模式：\n\n1. **Event Notification**：\n   - 通知某件事发生\n   - 下游根据需要查询详情\n   - 消息体小（只有事件 key 或 ID）\n   - 例子：订单创建 → 通知物流系统\n\n2. **Event Carried State Transfer**：\n   - 消息包含充足的数据\n   - 下游不查询也能处理\n   - 减少跨服务调用\n   - 例子：订单创建消息包含完整的订单信息\n\n3. **Event Sourcing**：\n   - 所有事件不可变存储\n   - 状态 = 事件流重放\n   - 审计追踪 + 时间旅行\n\n4. **CQRS**：\n   - 写模型（Command）→ Event Store\n   - 读模型（Query）→ 物化视图\n   - 事件 → 更新读模型\n\n5. **Event Chronicle**：\n   - 纯粹审计日志\n   - 不驱动业务流程\n   - 合规和追溯',
      ['Event Notification 最小耦合，Event Carried State Transfer 最少查询', 'Event Sourcing + CQRS 是最复杂但最强大的模式'], ['mq', 'event-driven', 'patterns']),

    q('mq', 'medium', 'short_answer', 'RocketMQ 的批量消息与事务批量处理',
      '分析 RocketMQ 的批量消息。批量发送的条件和限制（同一 Topic、同一批次）。批量消息的大小限制（默认 1MB）。事务批量消息的原子性。批量处理 vs 单条处理的性能对比。批量发送的配置和注意事项。',
      'RocketMQ 批量：\n\n1. **批量发送**：\n   - 同一 Topic、同一批次\n   - 批量大小不能超过 maxMessageSize（默认 4MB）\n   - 返回批量发送结果（其中一个失败 = 全部失败）\n\n2. **实现**：\n   - 消息合并为一个 Request\n   - Broker 端解包处理\n   - 减少网络往返次数\n\n3. **事务批量**：\n   - RocketMQ 事务消息不支持批量\n   - 需要第三方协调实现\n\n4. **性能**：\n   - 批量发送：吞吐提升 3-5x（短消息）\n   - 延迟：首条消息等待攒批增加延迟\n   - 权衡：吞吐 vs 延迟\n\n5. **配置建议**：\n   - 消息小（<1KB）→ 批量提升显著\n   - 消息大（>100KB）→ 不需要批量\n   - 批量大小根据网络和业务调整',
      ['批量发送吞吐提升 3-5x（小消息下）', '事务消息不支持批量（需要外部协调）'], ['rocketmq', 'batching']),

    q('mq', 'medium', 'short_answer', 'MQ 在微服务中的异步通信模式对比',
      '对比微服务中 MQ 异步通信的模式。异步请求-响应（Request-Async-Response）——通过回调队列实现 RPC over MQ。事件驱动协作。任务分发和工作队列。MQ 在微服务中的优势和引入的复杂度。',
      'MQ 微服务模式：\n\n1. **Request-Async-Response**：\n   - 服务 A 发请求到 Queue A\n   - 服务 B 消费处理\n   - 结果发送到 A 指定的 Reply Queue\n   - 类似 RPC over MQ\n\n2. **Event-Driven**：\n   - 服务发布事件 → 订阅者消费\n   - 松散耦合\n   - Saga 模式协调分布式事务\n\n3. **Work Queue**：\n   - 任务发布到 Queue\n   - 多个 Worker 竞争消费\n   - 任务分配和负载均衡\n\n4. **优势**：\n   - 解耦（服务不直接调用）\n   - 削峰填谷\n   - 故障隔离（下游故障不影响上游）\n   - 异步提升响应速度\n\n5. **复杂度**：\n   - 消息可靠性保证\n   - 消费幂等\n   - 调试困难（异步调用链）\n   - 分布式追踪',
      ['MQ 解耦、削峰、故障隔离 = 微服务核心通信方式', '但引入幂等、追踪、调试复杂度'], ['mq', 'microservices']),
]

def main():
    path = os.path.join(os.path.dirname(__file__), 'mq.json')
    with open(path) as f:
        data = json.load(f)
    existing_titles = {q['title'] for q in data}
    added = 0
    for q_item in NEW:
        if q_item['title'] not in existing_titles:
            data.append(q_item)
            existing_titles.add(q_item['title'])
            added += 1
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Added {added} questions to {path}')
    print(f'Total mq questions: {len(data)}')

if __name__ == '__main__':
    main()
