#!/usr/bin/env python3
"""Expand mq.json with 28 additional questions (12→40)."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    # ---- Kafka deep-dive ----
    q('mq', 'hard', '问答', 'Kafka Producer 架构与分区写入策略',
      '详细说明 Kafka Producer 的内部架构，包括分区器（Partitioner）、累加器（RecordAccumulator）、Sender 线程的工作流程。\n\n讨论生产者如何选择目标分区（key hash 轮询、自定义分区器、粘性分区 Sticky Partition），以及批次发送与缓冲区控制（buffer.memory、max.block.ms）。',
      'Kafka Producer 架构：\n\n1. **RecordAccumulator**：生产者将消息放入对应分区的批次（batch）中，每个批次默认 16KB（batch.size），使用缓冲区池复用内存。\n\n2. **Sender 线程**：后台线程不断轮询 RecordAccumulator，取出已准备好发送的批次，按目标 broker 分组后通过网络层发送。\n\n3. **分区策略**：\n   - 指定 key：对 key 哈希取模 → 相同 key 进入同一分区\n   - 不指定 key：使用粘性分区（Sticky Partitioner），先填满一个分区的批次再切换，提高批次效率\n   - 自定义 Partitioner 接口\n\n4. **关键参数**：linger.ms（等待时间）、batch.size（批次大小）、buffer.memory（总缓冲区）、max.request.size（单请求大小）\n\n5. **幂等与事务**：enable.idempotence=true 时 producer 附带 Producer ID + 序列号实现精确一次语义。',
      ['Producer 使用双缓冲机制（RecordAccumulator）分离生产与发送', '粘性分区相比轮询分区能显著提升批次填充率', '幂等生产者通过 PID + 序列号实现精确一次'], ['kafka', 'producer']),

    q('mq', 'hard', '问答', 'Kafka Consumer Group 与 Rebalance 协议',
      '深入分析 Kafka Consumer Group 的协调机制，包括 GroupCoordinator、ConsumerCoordinator、Rebalance 的触发场景与流程（Eager 与 Cooperative 两种策略）。讨论静态分组（Static Group Membership）如何减少不必要的 Rebalance。',
      'Consumer Group 机制：\n\n1. **GroupCoordinator**：每个 broker 上管理部分 consumer group 的元数据，通过 topic __consumer_offsets 存储 offset 信息。\n\n2. **Rebalance 触发**：消费者加入/离开、分区数变化、订阅 topic 变更。\n\n3. **Eager Rebalance（旧）**：所有消费者 revoked 分区 → 停止消费 → 重新分配 → 恢复消费。Stop The World 问题。\n\n4. **Cooperative Rebalance（增量式）**：分多轮进行，只 revoked 需要重新分配的分区，未受影响的分区继续消费，减少停顿。\n\n5. **Static Group Membership**：group.instance.id 使消费者 session 超时后保持 group 归属，避免不必要的 rebalance。\n\n6. **分区分配策略**：RangeAssignor（按 topic 范围）、RoundRobinAssignor（轮询）、StickyAssignor（最小移动）、CooperativeStickyAssignor。',
      ['Eager 是 Stop The World，Cooperative 是增量重新分配', 'Static Group Membership 通过固定实例 ID 避免临时断开触发 rebalance', 'CooperativeSticky 是目前推荐的分区分配策略'], ['kafka', 'consumer', 'rebalance']),

    q('mq', 'medium', '问答', 'Kafka 日志压缩（Log Compaction）原理',
      '解释 Kafka 日志压缩（Log Compaction）的工作原理。它与基于时间的日志保留策略（TTL）有何区别？在什么场景下使用 Log Compaction？cleanup.policy=compact 的配置对 broker 和 topic 的影响是什么？',
      'Log Compaction：\n\n1. **原理**：Kafka 保留每个 key 的最新值，对于相同 key 的旧消息进行删除（compact）。与 TTL 不同——TTL 按时间删除，Log Compaction 按 key 保留最新版本。\n\n2. **工作机制**：\n   - Log Cleaner 后台线程对日志段进行遍历\n   - 构建 Offset Map（key → 最新 offset）\n   - 生成干净的替换段（保留最新值，删除旧值）\n   - 使用清理点（cleaner point）跟踪进度\n\n3. **关键配置**：cleanup.policy=compact、min.cleanable.dirty.ratio（默认 0.5）、delete.retention.ms（墓碑保留时间）\n\n4. **使用场景**：\n   - 数据库变更日志（CDC）、实体状态快照\n   - KV 存储的事件溯源\n   - 配置同步（每个配置项是 key，最新值生效）\n   - 不适合：日志聚合、metrics 流式数据',
      ['Log Compaction 按 key 保留最新值，不是按时间', 'min.cleanable.dirty.ratio 控制清理触发频率（默认 50% 脏数据）', '墓碑消息（null value）在 delete.retention.ms 后才被清理'], ['kafka', 'compaction']),

    q('mq', 'hard', '问答', 'Kafka 精确一次语义（Exactly-Once Semantics）',
      '详细阐述 Kafka 如何实现精确一次语义（EOS）。包括幂等生产者、事务性 API（Transactional API）的工作原理、事务协调器（Transaction Coordinator）、以及跨分区原子写入的实现机制。',
      'Kafka EOS 实现：\n\n1. **幂等生产者**：Producer 附带 PID（Producer ID）和序列号，broker 过滤重复序列号实现分区级别精确一次。\n\n2. **事务 API**：\n   - **Transaction Coordinator**：负责管理事务状态\n   - 通过 __transaction_state topic 持久化事务元数据\n   - **事务协议流程**：InitTransactions → BeginTransaction → AddPartitionsToTxn → Produce → CommitTransaction/AbortTransaction\n\n3. **关键机制**：\n   - 控制消息（Control Messages）：COMMIT/ABORT 标记告知消费者事务结果\n   - LSO（Last Stable Offset）：消费者通过 isolation.level 决定是否读取未提交消息\n   - Write-Ahead Log：事务状态变更记录到日志保证持久化\n\n4. **消费端**：\n   - read_committed：过滤未提交消息\n   - read_uncommitted：看到所有消息\n\n5. **局限**：事务性写入要关闭幂等（自动开启），性能开销约 10-20%。',
      ['EOS 通过 PID + 序列号（幂等）和事务协调器（跨分区原子性）实现', '控制消息（COMMIT/ABORT）告诉消费者事务结果', 'read_committed 隔离级别隐藏未提交消息'], ['kafka', 'exactly-once']),

    q('mq', 'medium', '问答', 'Kafka Connect 架构与实践',
      '介绍 Kafka Connect 的架构设计：Source Connector、Sink Connector、Worker 节点（Standalone vs Distributed 模式）、任务与分片机制。讨论如何实现自定义 Connector，以及 Connect 在 CDC 场景中的典型应用。',
      'Kafka Connect 架构：\n\n1. **组件**：\n   - Connector：定义数据源/目标的连接逻辑\n   - Task：实际的数据读取/写入线程，可并行\n   - Worker：运行 Connector/Task 的进程\n   - Converters：数据格式转换（Avro、JSON、Protobuf）\n   - Transforms：单条消息的轻量转换（Mask、Filter、Rename）\n\n2. **运行模式**：\n   - Standalone：单进程，适合开发测试\n   - Distributed：多 Worker 集群，自动故障转移和任务再分配\n\n3. **CDC 场景**：\n   - Debezium MySQL/MongoDB Connector → 捕获 binlog 变更\n   - 输出到 Kafka topic → 下游同步或处理\n\n4. **最佳实践**：\n   - 使用 Distributed 模式 + REST API 管理\n   - 配置 offset.storage.topic / config.storage.topic / status.storage.topic\n   - 监控 connector 状态和 lag',
      ['Connector 定义连接逻辑，Task 执行数据读写', 'Distributed 模式提供高可用和水平扩展', 'Debezium + Kafka Connect 是 CDC 的标准方案'], ['kafka', 'connect']),

    q('mq', 'hard', '问答', 'Kafka Streams 时间窗口与状态存储',
      '分析 Kafka Streams 的窗口操作（Tumbling Window、Hopping Window、Sliding Window、Session Window）及其内部实现。讨论状态存储（State Store）的类型（持久化 vs 内存，KeyValue  vs WindowStore）以及 RocksDB 在 Streams 中的作用。',
      'Kafka Streams：\n\n1. **窗口类型**：\n   - Tumbling：固定大小不重叠\n   - Hopping：固定大小可重叠（前进步长 < 窗口大小）\n   - Sliding：基于时间差，用于 JOIN\n   - Session：基于活动间隙，适合用户行为分析\n\n2. **State Store**：\n   - KeyValueStore：普通 kv 存储\n   - WindowStore：带时间戳的窗口数据\n   - SessionStore：会话数据\n   - 实现：RocksDB（持久化+磁盘存储）、InMemory（纯内存）\n\n3. **RocksDB**：\n   - LSM-Tree 结构，支持海量状态存储\n   - 与 Changelog topic 配合实现故障恢复\n   - 可调压缩、缓存和 Bloom Filter\n\n4. **时间语义**：\n   - event-time（记录时间戳）、processing-time（处理时间）、ingestion-time（写入 Kafka 时间）\n   - TimestampExtractor 接口自定义\n\n5. **保障**：\n   - exactly-once 处理语义\n   - 故障时从 changelog topic 恢复状态',
      ['四种窗口满足不同聚合场景：固定/滚动/滑动/会话', 'RocksDB 支持大规模状态存储，通过 changelog topic 做故障恢复', 'Kafka Streams 提供 exactly-once 处理语义'], ['kafka', 'streams']),

    q('mq', 'medium', '问答', 'Kafka 分区键设计与数据倾斜治理',
      '讨论 Kafka 分区键（Message Key）的设计策略，分析数据倾斜（Data Skew）的成因与影响。如何通过分区键设计和分区数规划来避免热点分区？列举常见的倾斜治理手段。',
      '分区键设计与倾斜治理：\n\n1. **分区键设计策略**：\n   - 高基数 key（用户ID、订单ID）：天然均匀分布\n   - 低基数 key（地区、类型）：易导致倾斜\n   - 复合 key：低基数前綴 + 随机后缀 → 人工增加基数\n\n2. **数据倾斜成因**：\n   - Key 分布不均（某业务线数据量远大于其他）\n   - 使用带倾斜的默认分区策略\n   - 特定分区 broker 故障导致分区 leader 集中\n\n3. **治理手段**：\n   - **消息层面**：加盐（salting），给 key 追加随机后缀\n   - **分区层面**：增加分区数 + 自定义分区器\n   - **消费者层面**：多线程消费 + 内部聚合后再分发\n   - **监控**：通过 kafka-consumer-groups lag、JMX 指标监控分区偏移\n\n4. **分区数规划**：\n   - 分区数 ≤ broker 数 × 预期并发度\n   - 分区数过多：文件句柄、leader 选举开销大\n   - 分区数过少：并发能力受限',
      ['低基数 key 需要人工加盐（salting）来打散', '分区数不是越多越好，需平衡并发与元数据开销', '通过消费者 lag 可以发现分区级别的倾斜'], ['kafka', 'partitioning']),

    q('mq', 'hard', '问答', 'Kafka 分层存储（Tiered Storage）设计',
      '解释 Kafka 3.6+ 引入的分层存储（Tiered Storage）架构。分层存储如何解决本地磁盘容量限制？Remote Log Manager 与 Remote Storage 层的工作原理是什么？讨论生产环境中使用分层存储的利弊。',
      'Kafka Tiered Storage：\n\n1. **架构**：\n   - **Local Tier**：本地磁盘，存储热数据（最新分段时间）\n   - **Remote Tier**：远程存储（S3、GCS、HDFS），存储冷数据\n   - **Remote Log Manager**：管理远程日志段的复制、读取和清理\n\n2. **工作原理**：\n   - 当本地日志段达到指定时间（segment.ms）且被标记为 "冷冻" → 异步上传到远程\n   - 消费者读取时，如果需要的数据不在本地 → 从远程存储获取\n   - 远程数据可以被安全地删除本地备份\n\n3. **优势**：\n   - 突破本地磁盘容量天花板\n   - 降低 broker 磁盘成本（远程存储成本远低于本地 SSD）\n   - 保留更长的历史数据\n\n4. **代价**：\n   - 增加读取延迟（冷数据读取加网络延迟）\n   - 运维复杂度（配置远程存储权限、网络带宽）\n   - 不支持事务和 EOS 的高阶特性\n   - 不支持 Log Compaction',
      ['分层存储分离热（本地）和冷（远程）数据', '降低磁盘成本但增加冷读延迟', '不支持事务和 Log Compaction'], ['kafka', 'tiered-storage']),

    q('mq', 'medium', '问答', 'Kafka 集群迁移：MirrorMaker 2.0 与跨集群复制',
      '说明 Kafka MirrorMaker 2.0 的架构设计与使用场景。与 MirrorMaker 1 相比有哪些改进？讨论跨集群复制的常见拓扑（Active-Active、Active-Standby）及在数据迁移/灾备中的最佳实践。',
      'MirrorMaker 2.0：\n\n1. **架构**：基于 Kafka Connect 框架，使用 Source/Sink Connector 实现跨集群复制。\n\n2. **相比 MM1 的改进**：\n   - 自动创建/同步 topic 配置\n   - 同步消费者组 offset\n   - 支持双向复制（Active-Active）\n   - 内置连接检查和健康监测\n   - 单条消息复制而非多线程消费者\n\n3. **拓扑模式**：\n   - **Active-Standby**：主集群 → 备集群单向复制，用于灾备\n   - **Active-Active**：双向复制，需要处理循环复制（通过 header 标记源集群）\n   - **Stretch Cluster**：跨 AZ 的单一集群\n\n4. **最佳实践**：\n   - 数据迁移：使用 MM2 + 消费者组 offset 同步实现无缝切换\n   - 灾备：复制因子 3 + 跨机房 MM2\n   - 监控 replication lag 和 connector 状态',
      ['MM2 基于 Kafka Connect，比 MM1 更强大和可靠', '循环复制通过源集群 header 避免', '同步消费者组 offset 实现客户端无感切换'], ['kafka', 'mirrormaker', 'disaster-recovery']),

    # ---- RabbitMQ deep-dive ----
    q('mq', 'medium', '问答', 'RabbitMQ 集群架构与镜像队列',
      '介绍 RabbitMQ 集群的工作原理，包括节点类型（Disk Node vs RAM Node）、Erlang Cookie 认证机制、以及镜像队列（Mirrored Queues）和仲裁队列（Quorum Queues）的高可用实现。对比镜像队列和仲裁队列的优劣。',
      'RabbitMQ 集群：\n\n1. **节点类型**：\n   - Disk Node：元数据持久化到磁盘（至少一个）\n   - RAM Node：元数据在内存中，性能更好但非持久化\n\n2. **镜像队列**：\n   - master 节点 + 多个 slave 节点\n   - 所有操作在 master 执行，同步到 slave\n   - 故障时从 slave 选举新 master\n   - 策略配置：ha-mode（all/exactly/nodes）\n\n3. **仲裁队列（RabbitMQ 3.8+）**：\n   - 基于 Raft 协议，多数派一致性\n   - 比镜像队列更好的网络分区容忍性\n   - 支持 Eager/OnDemand/Lazy 三种同步策略\n\n4. **对比**：\n   - 镜像队列：异步复制性能更好，但脑裂风险高\n   - 仲裁队列：Raft 保证一致性，更适合关键业务\n   - 实践建议：新系统优先使用仲裁队列',
      ['仲裁队列基于 Raft，解决了镜像队列的脑裂问题', '集群至少需要 1 个 Disk Node', '仲裁队列适合关键业务，镜像队列适合性能要求高的场景'], ['rabbitmq', 'cluster']),

    q('mq', 'hard', '问答', 'RabbitMQ 死信队列与消息 TTL 机制',
      '详细解释 RabbitMQ 的死信交换器（DLX）和消息 TTL 机制。消息在哪些情况下会成为死信？死信交换器的配置参数有哪些？如何使用 TTL 和 DLX 实现延迟队列？给出完整的延迟队列设计方案。',
      '死信队列与 TTL：\n\n1. **死信条件**：\n   - 消息被消费者拒绝（basic.reject / basic.nack）且 requeue=false\n   - 消息 TTL 过期\n   - 队列达到最大长度\n\n2. **DLX 配置**：\n   - x-dead-letter-exchange：指定死信转发到的 Exchange\n   - x-dead-letter-routing-key：死信的路由键（不指定则用原路由键）\n\n3. **TTL 类型**：\n   - 消息 TTL（x-message-ttl）：单条消息的存活时间\n   - 队列 TTL（x-expires）：队列空闲多久后自动删除\n\n4. **延迟队列方案**：\n   - 主队列不设消费者，消息 TTL = 延迟时间\n   - 消息过期后转发到 DLX → 路由到实际消费队列\n   - 缺陷：先到期的消息被后面的阻塞（队列内 TTL 只能按 FIFO 顺序淘汰）\n   - 改进：每个 TTL 创建一个专用队列（更精确但管理复杂）\n   - RabbitMQ 3.12+ 原生支持 delayed message exchange 插件',
      ['死信由拒绝/过期/队列满三种情况触发', 'RabbitMQ 的队列 TTL 是 FIFO 的——前面的消息过期才会检查后面的', '使用 DLX 实现延迟队列需要多个 TTL 粒度或使用官方插件'], ['rabbitmq', 'dlx', 'ttl']),

    q('mq', 'hard', '问答', 'RabbitMQ Shovel 与 Federation 跨集群转发',
      '对比 RabbitMQ 的 Shovel 和 Federation 两种跨集群消息转发机制。它们各自的架构、适用场景、配置方式有何不同？如何选择？在跨机房数据同步场景下，哪种更合适？',
      'Shovel vs Federation：\n\n1. **Shovel**：\n   - 插件：rabbitmq_shovel\n   - 工作方式：源队列消费消息 → 发送到目标 exchange/queue\n   - 支持动态配置（动态 Shovel）和静态配置\n   - 可靠性：内部 consumer 确认机制保证至少一次\n   - 适用：点对点消息迁移、简单跨集群转发\n\n2. **Federation**：\n   - 插件：rabbitmq_federation\n   - 工作方式：在目标集群联邦 exchange/queue，拉取源集群消息\n   - 支持联邦 Exchange（类型一致）和联邦 Queue\n   - 更灵活：可定义策略（max_hops、expires）\n   - 适用：多级分发、跨地域同步\n\n3. **选择建议**：\n   - 简单数据迁移 → Shovel\n   - 跨地域持续同步 + 复杂拓扑 → Federation\n   - Federation 配置管理更方便（多策略模式）\n   - Shovel 更简单直接，但大规模管理不便',
      ['Shovel 是推模式（源 → 目标），Federation 是拉模式（目标 ← 源）', 'Federation 支持更复杂的拓扑和策略管理', '跨机房持续同步推荐使用 Federation'], ['rabbitmq', 'shovel', 'federation']),

    # ---- RocketMQ deep-dive ----
    q('mq', 'hard', '问答', 'RocketMQ Broker 架构与刷盘机制',
      '深入分析 RocketMQ Broker 的架构：包括消息存储结构（CommitLog、ConsumeQueue、IndexFile）、刷盘策略（同步刷盘 vs 异步刷盘）、以及 RAFT-based DLedger 的高可用实现。对比同步刷盘和异步刷盘的性能与可靠性差异。',
      'RocketMQ Broker：\n\n1. **存储结构**：\n   - **CommitLog**：所有消息的顺序写入文件，单一文件追加\n   - **ConsumeQueue**：每个队列的消费逻辑偏移索引（固定长度 20 bytes）\n   - **IndexFile**：按 key 和时间查询的索引结构\n\n2. **刷盘策略**：\n   - **同步刷盘**：消息写入内存 → 调用 FlushRealTimeService → 确认写入磁盘 → 返回客户端。延迟高但绝对可靠。\n   - **异步刷盘**：消息写入内存 → 直接返回客户端。后台线程批量刷盘（默认 500ms 间隔）。吞吐量高但有数据丢失窗口。\n\n3. **DLedger 高可用**：\n   - 基于 Raft 协议，3 节点集群容忍 1 故障\n   - Broker 组内自动选主，故障自动切换\n   - 写请求必须多数派成功才确认\n\n4. **性能对比**：\n   - 同步刷盘：TPS ~5万（典型）\n   - 异步刷盘：TPS ~30万（典型 SSD）\n   - 选择：金融/交易场景用同步刷盘，日志/监控用异步',
      ['CommitLog 顺序写（高吞吐）、ConsumeQueue 索引读（快速定位）', '同步刷盘 ≈ 更低吞吐但零丢失，异步刷盘 ≈ 更高吞吐但窗口期丢失', 'DLedger 用 Raft 替代主从同步，自动故障转移'], ['rocketmq', 'broker', 'storage']),

    q('mq', 'hard', '问答', 'RocketMQ 消费者模型：Pull vs Push 与负载均衡',
      '对比 RocketMQ 的 DefaultMQPushConsumer 与 DefaultMQPullConsumer 的设计差异。分析 RocketMQ 的 Rebalance 机制（平均分配算法 vs 一致性哈希）以及消息队列分配策略对消费并发度的影响。',
      'RocketMQ Consumer：\n\n1. **Pull 模式**：\n   - 客户端主动拉取\n   - 完全控制拉取频率和时机\n   - 需自行管理 offset\n\n2. **Push 模式（实际是长轮询 Pull）**：\n   - DefaultMQPushConsumer 封装了拉取和 offset 管理\n   - 客户端发送拉取请求 → 无消息时 Broker hold 请求（长轮询）→ 有新消息或超时返回\n   - 注册 MessageListener 处理消息\n\n3. **Rebalance 机制**：\n   - 消费者变化、topic 队列数变化时触发\n   - **平均分配**：队列按消费者平均分布\n   - **一致性哈希**：按哈希值分配，更适合队列数动态变化场景\n   - AllocateMessageQueueStrategy 接口可自定义\n\n4. **负载均衡**：\n   - 集群模式：队列在消费者间均匀分配，每条消息只被一个消费\n   - 广播模式：每个消费者收到全部消息\n   - 建议：消费者实例数与队列数匹配（避免队列争用或空闲）',
      ['RocketMQ Push 本质是长轮询 Pull，不是真正的推送', '集群模式队列级负载均衡——队列数决定最大并发度', '消费者数 > 队列数时多出的消费者闲置'], ['rocketmq', 'consumer']),

    q('mq', 'medium', '问答', 'RocketMQ 延迟消息与定时消息机制',
      '说明 RocketMQ 实现延迟消息/定时消息的技术原理。RocketMQ 支持哪些延迟级别？解释延迟消息的存储结构——Schedule topic 中如何进行消息分级存储，以及延迟到期后如何投递。对比 Kafka 需要外部实现的延迟方案。',
      'RocketMQ 延迟消息：\n\n1. **延迟级别**：\n   - 固定 18 级：1s/5s/10s/30s/1m/2m/3m/4m/5m/6m/7m/8m/9m/10m/20m/30m/1h/2h\n   - 通过 message.setDelayTimeLevel(level) 设置\n   - 不支持自定义秒数（需要自定义实现）\n\n2. **存储结构**：\n   - 写入时：Topic → SCHEDULE_TOPIC_XXXX 的某个队列（按延迟级别分队列）\n   - 每个延迟级别对应 ConsumeQueue 中的特定队列\n   - 定时任务：ScheduleMessageService 遍历延迟队列 → 到期消息重新写入原 Topic\n\n3. **对比 Kafka**：\n   - Kafka 不原生支持延迟消息\n   - 外部方案：时间轮（Netty HashedWheelTimer）、Redis 延迟队列、Kafka 层级时间轮\n   - RocketMQ 延迟消息是内置特性，简单易用\n\n4. **局限**：\n   - 固定延迟级别不够灵活\n   - 高精度延迟不适用（秒级精度）\n   - 大量延迟消息会挤占普通消息的处理资源',
      ['延迟队列按固定级别分队列存储，到期后重新投递原 Topic', '18 个延迟级别覆盖 1 秒到 2 小时', 'RocketMQ 延迟消息比 Kafka 方案更简单但灵活性差'], ['rocketmq', 'delay']),

    # ---- Pulsar deep-dive ----
    q('mq', 'hard', '问答', 'Apache Pulsar Geo-Replication 原理与设计',
      '阐述 Apache Pulsar 的异地复制（Geo-Replication）实现原理。包括跨地域复制的配置模型、复制保证级别、以及使用 BookKeeper 的分布式存储如何在物理上支持数据同步。与 Kafka MirrorMaker 对比优劣。',
      'Pulsar Geo-Replication：\n\n1. **原理**：\n   - 基于 Pulsar 的 topic 级别配置自动复制\n   - 每个集群有独立的 BookKeeper 存储\n   - Producer 写入本地 → Broker 异步复制到其他集群\n   - Replication 使用 Pulsar 自己的客户端（非外部工具）\n\n2. **复制模式**：\n   - 主动-主动：双向复制\n   - 主动-备用：单向复制\n   - 通过配置 namespaces 的 clusters 列表实现\n\n3. **BookKeeper 支持**：\n   - 每个 entry 跨多个 bookie 同步复制\n   - ledger 级别的故障恢复\n   - 跨集群时每个集群维护独立的 ledger\n\n4. **与 Kafka MM2 对比**：\n   - Pulsar：内建、无需额外组件、配置驱动\n   - MM2：基于 Connect 框架、功能丰富但运维复杂\n   - Pulsar 优势：延迟更低、管理简单\n   - MM2 优势：异构集群兼容、offset 同步',
      ['Pulsar 异地复制是内建特性，无需额外工具', '基于 namespace 级别配置，操作简单', '每个集群有独立存储，复制通过异步分发实现'], ['pulsar', 'geo-replication']),

    q('mq', 'medium', '问答', 'Pulsar Functions 与 Kafka Streams 对比',
      '比较 Apache Pulsar Functions 与 Kafka Streams 的流处理程序设计思想。各自的编程模型、部署方式、状态管理、和弹性伸缩能力有何异同？什么场景选择哪种更合适？',
      'Pulsar Functions vs Kafka Streams：\n\n1. **编程模型**：\n   - Pulsar Functions：单记录处理（map/filter/flatMap），简单函数式接口\n   - Kafka Streams：DSL + Processor API，更丰富的窗口和 JOIN 操作\n\n2. **部署方式**：\n   - Pulsar Functions：作为独立进程或 Kubernetes Deployment 部署\n   - Kafka Streams：作为应用内库运行，随应用扩缩\n\n3. **状态管理**：\n   - Pulsar Functions：通过 Pulsar State Store（基于 BookKeeper）\n   - Kafka Streams：RocksDB + changelog topic\n\n4. **弹性伸缩**：\n   - Pulsar Functions：手动调整 parallelism\n   - Kafka Streams：基于分区数量自动匹配并发\n\n5. **选择建议**：\n   - 轻量/简单处理 → Pulsar Functions（无运维依赖）\n   - 复杂流处理/有状态聚合 → Kafka Streams\n   - Pulsar 生态内 → Functions 更集成\n   - 已有 Kafka 基础设施 → Kafka Streams',
      ['Pulsar Functions 是轻量 serverless 处理，Kafka Streams 是应用内库', 'Kafka Streams 流处理能力更强（窗口、JOIN、聚合）', 'Pulsar Functions 适合简单转换，Kafka Streams 适合复杂业务逻辑'], ['pulsar', 'pulsar-functions', 'kafka-streams']),

    # ---- General MQ concepts ----
    q('mq', 'hard', '问答', '消息顺序保证：全局有序与分区有序的设计',
      '深入讨论消息队列中顺序保证的设计方案。全局有序和分区（partition）有序各自如何实现？Kafka、RocketMQ、RabbitMQ 分别如何保证消息顺序？顺序消费的实现对性能的影响以及常见的顺序消费误区。',
      '消息顺序保证：\n\n1. **全局有序**：\n   - 单分区/单队列（牺牲吞吐量）\n   - 适用：日志审计、数据库 binlog 同步\n\n2. **分区有序**：\n   - 相同 key → 同一分区 → 分区内严格有序\n   - Kafka：指定 key 哈希到同一分区，单分区内有序\n   - RocketMQ：相同 MessageQueue 内有序\n   - RabbitMQ：单队列内 FIFO（无并发消费）\n\n3. **实现机制**：\n   - Kafka：生产者指定 key → 分区器路由 → 消费者单线程拉取\n   - RocketMQ：MessageQueueSelector → 同一 Queue 下顺序写入 → 顺序消费\n   - RabbitMQ：单消费者 + ack 串行处理\n\n4. **常见误区**：\n   - 多分区不保证全局有序\n   - 重试消息可能打乱顺序（失败消息放回队列头部或使用专门的重试队列）\n   - 异步发送 + 回调处理可能乱序\n\n5. **性能影响**：\n   - 顺序消费 = 等待前面的消息处理完成\n   - 单分区吞吐量受限 → 多分区 + key 路由是合理折中',
      ['分区有序是性能与顺序需求的合理折中', '顺序消费需要生产者（分区路由）和消费者（串行处理）两端配合', '重试逻辑会破坏顺序，需要特殊设计'], ['mq', 'ordering']),

    q('mq', 'medium', '问答', '消息幂等消费与去重方案设计',
      '讨论分布式消息系统中幂等消费的设计策略。为什么消息可能被重复消费？列举常见的去重方案（唯一键法、状态机法、事务法、幂等表），分析各自的适用场景和局限性。',
      '幂等消费方案：\n\n1. **重复消费原因**：\n   - 消费者处理完成但 offset 未提交\n   - 生产者重试导致消息重复\n   - 网络故障导致 broker 未收到确认\n\n2. **去重方案**：\n   - **唯一键法**：每条消息带唯一 ID，消费者记录已处理 ID（Redis 布隆过滤器/DB 唯一索引），性能好、有内存开销\n   - **状态机法**：业务记录带状态字段（如 order.status），只有当前状态允许时才处理（如待支付→已支付），天然幂等但需要业务配合\n   - **事务法**：消费逻辑和 offset 提交在一个事务内，实现复杂\n   - **幂等表**：在业务数据库建立去重表（消息 ID + 处理状态），利用数据库唯一约束保证不重复\n\n3. **推荐方案**：\n   - 低并发 + DB 场景 → 幂等表（业务 DB 唯一约束）\n   - 高并发场景 → Redis 布隆过滤器（快速去重）\n   - 业务有状态 → 状态机法（最彻底）\n   - 最坏情况：接口保证幂等性（业务侧容错）',
      ['幂等消费是消费端逻辑，不是消息队列的特性', '唯一键 + 去重表是最通用的方案', '接口幂等设计比去重更本质——重复消费也产生正确结果'], ['mq', 'idempotent']),

    q('mq', 'hard', '问答', '消息队列的反压（Backpressure）机制',
      '解释消息队列系统中的反压机制。当消费者跟不上生产者速度时，不同 MQ 系统如何应对？Kafka 的 throttling、RocketMQ 的流控策略（Broker 流控 vs Consumer 流控）、RabbitMQ 的 credit 流控分别如何工作？',
      '反压机制：\n\n1. **Kafka**：\n   - 无显式反压——Broker 持续接受消息（磁盘扩展）\n   - 消费者滞后通过 lag 指标反映\n   - producer 端：max.block.ms 控制阻塞时间、buffer.memory 限制缓存\n   - 配额（Quota）限制：网络带宽和请求频率\n\n2. **RocketMQ**：\n   - **Broker 流控**：CommitLog 文件超过阈值 → 减慢写入\n   - **Consumer 流控**：消费速度慢影响 Broker 的 ConsumeQueue 堆积\n   - 客户端流控：拉取间隔自适应、队列分配均衡\n\n3. **RabbitMQ**：\n   - **Credit 流控**：每个消费者与 channel 之间维护 credit（信用额度）\n   - 消息预取（prefetch count）控制消费者未确认消息数\n   - 达到 prefetch 上限 → 不再下发消息\n   - 内存/磁盘告警：达到阈值 → 阻塞所有生产者\n\n4. **设计哲学差异**：\n   - Kafka：设计为日志存储，认为消费者总会 catch up\n   - RabbitMQ：以内存为中心，必须严格流控\n   - RocketMQ：折中，有一定缓存但设限',
      ['RabbitMQ 以内存为中心所以反压最严格（prefetch + credit）', 'Kafka 依赖磁盘扩展性，反压主要在生产者端', '合理设置消费者的 prefetch/拉取参数可以避免大部分反压问题'], ['mq', 'backpressure']),

    q('mq', 'medium', '问答', '消息重试与死信处理最佳实践',
      '设计一个健壮的消息重试与死信处理架构。消费失败时应该如何分级重试？重试队列和死信队列的典型架构是怎样的？讨论重试退避策略（立即重试 vs 延迟重试 vs 指数退避）的选择和实现。',
      '消息重试与死信处理：\n\n1. **重试层级**：\n   - 第一层：应用内重试（瞬时异常，如网络抖动）≤3 次\n   - 第二层：重试队列（业务异常，如依赖服务不可用）延迟重试\n   - 第三层：死信队列（超过最大重试次数 → 人工介入）\n\n2. **架构设计**：\n   - 主队列 → 消费失败 → 重试 Exchange + 重试队列（带 TTL）\n   - 重试队列消息 TTL 到期 → 再次回到主队列\n   - 重试次数超过阈值 → 进入死信队列\n   - 死信队列告警 → 人工或自动修复 → 重新投递\n\n3. **退避策略**：\n   - 固定延迟：简单但不能有效解决持续故障\n   - 指数退避：+ 随机抖动（推荐），适合大多数场景\n   - **指数退避公式**：min(base * 2^n + random(jitter), max_delay)\n   - 建议：第 1 次 10s、第 2 次 30s、第 3 次 1min、第 4 次 3min、第 5 次 10min\n\n4. **注意事项**：\n   - 幂等消费是重试的前提\n   - 死信告警要有值班响应\n   - 重试不能影响正常消息处理（隔离队列）',
      ['三级重试：应用内 → 延迟重试 → 死信', '指数退避 + 随机抖动是标准做法', '死信队列需要监控告警和自动/人工处理流程'], ['mq', 'retry', 'dead-letter']),

    q('mq', 'medium', '问答', '消息队列的流量控制：削峰填谷与令牌桶',
      '讨论消息队列在流量控制中的作用。如何利用消息队列实现削峰填谷（Traffic Smoothing）？生产者端的令牌桶限流、消费者端的速率控制分别如何配置？给出一个从网关到 MQ 到消费端的完整限流方案。',
      '流量控制方案：\n\n1. **削峰填谷**：\n   - 请求高峰 → 消息入队（削峰）\n   - 消费者匀速处理（填谷）\n   - 队列作为缓冲区吸收突发流量\n\n2. **生产者限流**：\n   - **令牌桶**：Guava RateLimiter、Redisson RRateLimiter\n   - 每个消息发送前获取令牌\n   - 分布式限流：Redis 令牌桶（Lua 脚本实现）\n\n3. **消费者速率控制**：\n   - Kafka：max.poll.records 控制每批次拉取数\n   - RocketMQ：消费线程数 + consumeMessageBatchMaxSize\n   - RabbitMQ：prefetch count 控制预取数量\n   - 自定义：信号量控制并发处理数\n\n4. **完整方案**：\n   - 网关层：Nginx rate limiting + IP/user 维度的令牌桶\n   - 写入 MQ：消息带时间戳和优先级\n   - 消费端：固定速率 + 自适应速率（根据下游处理能力调整拉取量）\n   - 监控：队列深度、消费 lag、处理时间分布\n\n5. **注意**：\n   - 削峰填谷不能解决持续超出容量的场景\n   - 需要设置队列最大长度和丢弃策略\n   - 消费速率需要动态适配下游处理能力',
      ['消息队列的核心价值之一是缓冲（削峰填谷）', '令牌桶在生产者端控制写入速率', '消费者速率需要配合下游处理能力动态调整'], ['mq', 'flow-control', 'rate-limiting']),

    q('mq', 'hard', '问答', '消息轨迹追踪与全链路 Tracing',
      '如何实现消息队列全链路追踪？从生产者 → Broker → 消费者的完整追踪方案。基于 OpenTelemetry 的消息追踪实现、消息 Trace 与业务 Trace 的关联、以及主流 MQ 系统（Kafka/RocketMQ）内置的 Trace 支持。',
      '消息链路追踪：\n\n1. **OpenTelemetry 方案**：\n   - 生产者：创建 Span（PRODUCER）→ 将 Context 注入消息 header\n   - Broker：透传 header（自动 Instrumentation）\n   - 消费者：从消息 header 提取 Context → 创建 Span（CONSUMER）→ 关联父子\n\n2. **RocketMQ Trace**：\n   - 内置 TraceTopic（RMQ_SYS_TRACE_TOPIC）\n   - 通过 AsyncTraceDispatcher 异步发送 Trace 数据\n   - json 格式记录：pub time、broker、cost time、success/fail\n\n3. **Kafka**：\n   - 无内置 Trace——依赖客户端自定义 header 透传\n   - Confluent 提供拦截器（ProducerInterceptor/ConsumerInterceptor）\n   - 推荐：通过 record headers 传递 Trace Context\n\n4. **最佳实践**：\n   - Trace ID 在所有系统间透传（HTTP header → MQ header → downstream）\n   - baggage 传播低基数属性（用户 ID、业务类型）\n   - 采样策略：错误消息 100% 采样，高吞吐场景用概率采样\n   - 存储：Jaeger、Tempo、Zipkin',
      ['使用消息 header 透传 Trace Context（traceId + spanId）', 'OpenTelemetry 标准提供了 PRODUCER/CONSUMER Span 规范', 'RocketMQ 内置 Trace、Kafka 靠拦截器、RabbitMQ 靠插件'], ['mq', 'tracing', 'observability']),

    q('mq', 'medium', '问答', '消息队列选型指南：Kafka vs RocketMQ vs RabbitMQ vs Pulsar',
      '从架构设计、性能特征、功能特性、运维复杂度等维度对比四大主流消息队列的选型。给出不同业务场景下的推荐选择：日志收集、业务异步解耦、金融交易、IoT 数据流、事件驱动架构。',
      'MQ 选型对比：\n\n| 维度 | Kafka | RocketMQ | RabbitMQ | Pulsar |\n|------|-------|----------|----------|--------|\n| 设计定位 | 日志存储/流处理 | 业务消息 | 消息代理 | 云原生消息+流 |\n| 吞吐量 | 极高（百万/s） | 高（数十万/s） | 中（数万/s） | 极高（百万/s） |\n| 延迟 | 毫秒级 | 毫秒级 | 微秒级 | 毫秒级 |\n| 消息顺序 | 分区有序 | 队列有序 | 单队列有序 | 分区有序 |\n| 延迟消息 | 不支持（需外部） | 原生支持 | 插件/TTL | 原生支持 |\n| 运维复杂度 | 中等 | 中等 | 简单 | 较高 |\n| 持久化 | 本地磁盘 | 本地磁盘 | 内存/磁盘 | BookKeeper（分离）|\n\n2. **场景推荐**：\n   - **日志/监控/流处理** → Kafka（吞吐量是一切）\n   - **业务解耦/交易** → RocketMQ（可靠 + 事务消息）\n   - **轻量业务系统** → RabbitMQ（简单 + 灵活路由）\n   - **云原生/多租户** → Pulsar（存算分离 + 原生分片）\n   - **IoT 数据流** → Kafka 或 Pulsar（高吞吐 + 保留期长）',
      ['Kafka 擅长大吞吐量流处理，RabbitMQ 擅长灵活路由和低延迟', 'RocketMQ 在业务消息场景（事务、延迟）最成熟', 'Pulsar 存算分离架构更适合云原生和多租户'], ['mq', 'comparison']),

    q('mq', 'medium', '问答', 'MQ 的 Exactly-Once 投递语义实现',
      '讨论消息队列中三种投递语义（At-Most-Once、At-Least-Once、Exactly-Once）的含义和实现方式。在分布式系统中实现真正的 Exactly-Once 投递为什么困难？Kafka 和 RocketMQ 各自如何实现 Exactly-Once？',
      '投递语义：\n\n1. **语义定义**：\n   - **At-Most-Once**：最多一次（可能丢失），发送不重试\n   - **At-Least-Once**：至少一次（可能重复），发送失败重试 + 消费确认\n   - **Exactly-Once**：精确一次（不丢不重），最理想也最复杂\n\n2. **Exactly-Once 难点**：\n   - 生产者重试 → 可能重复写入\n   - 消费确认和 offset 提交不是原子操作\n   - 分布式网络故障导致状态不确定\n\n3. **Kafka 实现**：\n   - 生产者：幂等（PID + 序列号）+ 事务 API\n   - 消费者：read_committed + 事务性 offset 提交\n   - 局限：只能在单 Kafka 集群内实现\n\n4. **RocketMQ 实现**：\n   - 事务消息：半消息 → 本地事务 → COMMIT/ROLLBACK\n   - 回查机制：Broker 反查 Producer 确认事务状态\n   - 消费侧：业务幂等 + 重试\n\n5. **现实建议**：\n   - 真正的端到端 Exactly-Once 极难（涉及外部系统）\n   - 务实方案：MQ 语义 At-Least-Once + 消费端幂等\n   - 仅在 MQ 到 MQ 的场景追求 Exactly-Once',
      ['消息队列只能保证自身的 Exactly-Once，端到端需要消费端配合', 'Kafka 幂等生产者 + 事务 API 实现 EOS', 'RocketMQ 事务消息 + 回查机制实现 EOS'], ['mq', 'exactly-once', 'semantics']),

    q('mq', 'medium', '问答', 'MQ 大规模消息积压的排查与处理',
      '当消息队列出现大规模积压时，应该如何快速排查和处理？积压的常见原因（消费者故障、处理能力不足、下游抖动、消息体过大）及对应的处理策略。给出一个系统化的积压响应流程。',
      '积压排查与处理：\n\n1. **排查步骤**：\n   - 查看消费者是否在线（组协调器状态）\n   - 检查消费者处理时延（处理一条消息平均耗时）\n   - 分析积压分布（所有分区均匀还是某个分区倾斜？）\n   - 查看下游服务状态（是否限流或故障）\n   - 检查消息体大小（过大消息占用更多带宽和时间）\n\n2. **处理策略**：\n   - **增加消费者**：Kafka 增加消费者需同时增加分区数\n   - **临时扩容**：增加 MQ 分区 + 启动更多消费者实例\n   - **消息体过大**：压缩消息或消息体存 OSS，MQ 只传引用\n   - **消费者慢**：异步化处理、批量处理、业务降级\n   - **跳过积压**：对于过期无关重要的消息，跳过积压部分\n\n3. **预防措施**：\n   - 监控告警：队列深度、消费 lag 设置阈值\n   - 容量规划：预估峰值流量、预留 buffer\n   - 压测：定期压测消费端处理能力\n   - 限流降级：在生产者端控制流量',
      ['Kafka 增加消费者需要先增加分区数（消费者数 ≤ 分区数）', '积压处理优先级：保消费 > 全量追平 > 精确顺序', '大面积积压时考虑消息降级（跳过不重要消息）'], ['mq', 'backlog', 'troubleshooting']),

    q('mq', 'medium', '问答', 'MQ 网络分区对消费行为的影响',
      '讨论消息队列在网络分区（Network Partition）场景下的行为。Kafka 的 ISR 收缩与 leader 选举、RocketMQ 的 broker 不可用对生产消费的影响、RabbitMQ 的网络分区处理策略（pause_minority / pause_if_all_down 等）。',
      '网络分区影响：\n\n1. **Kafka**：\n   - ISR 收缩：follower 无法跟上 leader → 移出 ISR\n   - min.insync.replicas + acks=all 确保写入一致性\n   - 分区 leader 选举：优先从 ISR 中选（不丢消息）\n   - 可用性 vs 一致性：unclean.leader.election.enable 控制是否允许非 ISR 副本成为 leader\n\n2. **RocketMQ**：\n   - DLedger 组：不满足多数派 → 不能选主（无主）\n   - 非 DLedger 主从：主备切换由 NameServer 感知（最长 120s 延迟）\n   - 影响：生产不可用（没有 master）或消费可用但数据滞后\n\n3. **RabbitMQ**：\n   - pause_minority：少数分区节点自动停止服务\n   - pause_if_all_down：无法连接到预设节点时停止\n   - autoheal：判定多数分区后重启其他节点\n   - 镜像队列：网络分区可能导致脑裂、消息丢失\n\n4. **建议**：\n   - 使用仲裁队列（Raft）而非镜像队列\n   - Kafka 关闭 unclean leader election 保一致性\n   - 网络分区后人工介入 + 检查数据完整性',
      ['网络分区时必须在可用性和一致性之间取舍', 'Kafka ISR + acks=all 保证一致性，但降低可用性', 'RabbitMQ 仲裁队列比镜像队列对网络分区容忍更好'], ['mq', 'network-partition', 'consistency']),
]

def main():
    path = os.path.join(os.path.dirname(__file__), 'mq.json')
    with open(path) as f:
        data = json.load(f)
    before = len(data)
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
