# -*- coding: utf-8 -*-
import json

questions = []

def q(cat, diff, typ, title, content, answer, hints, tags):
    questions.append({
        "category": cat,
        "difficulty": diff,
        "type": typ,
        "title": title,
        "content": content,
        "answer": answer,
        "hints": hints,
        "tags": tags
    })

# ==================== Kafka Architecture ====================

q("mq", "hard", "short_answer",
  "Kafka Controller 与 Broker 架构",
  "Kafka 集群中 Controller 的角色是什么？Controller 如何选举？Broker 故障时 Controller 如何处理分区 Leader 重新选举？KRaft 模式（KIP-500）如何取代 ZooKeeper？",
  "Kafka Controller 是集群的核心管理节点，负责分区和副本的元数据管理。\n\nController 职责：1）分区 Leader 选举——Broker 故障时选新 Leader。2）分区副本分配——新 Topic 或分区扩缩容时决定副本分布。3）元数据广播——将集群元数据变更（新 Topic、分区 ISR 变化）通过 UpdateMetadataRequest 广播给所有 Broker。4）分区重新分配——处理 kafka-reassign-partitions 的指令。\n\nController 选举（基于 ZooKeeper）：所有 Broker 在 ZK 的 /controller 节点注册临时 ZNode，第一个成功创建的成为 Controller。其他 Broker 监听该节点，如果 Controller 故障（Session 过期），触发新一轮选举。新 Controller 当选后需要重新读取所有 Topic/分区/副本状态并更新 epoch。\n\nBroker 故障处理：1）ZK 检测到 Broker Session 过期。2）Controller 收到通知，读取该 Broker 上所有的 Leader 分区。3）对每个分区，从 ISR 中选一个新 Leader（如果 ISR 为空则走 unclean.leader.election）。4）更新 ZK 中的分区状态 + 广播 UpdateMetadata 给所有 Broker。5）触发该 Broker 上其他分区的副本重新同步。\n\nKRaft 模式（KIP-500，Kafka 2.8+ 预览，3.3+ 生产就绪）：将 Controller 从 ZK 迁移到基于 KRaft（Kafka Raft Metadata 模式）的内部共识协议。架构变化：1）用 Kafka 自身的 Raft 实现替代 ZK，Controller Quorum 替代 ZK 集群。2）Controller 节点组成 Raft 组（奇数个），通过内部共识协议选举 Active Controller。3）元数据以 Topic（__cluster_metadata）形式存储在 Kafka 内部（不再依赖外部系统）。4）减少运维复杂度（不再维护 ZK 集群）。5）性能改善——Controller 故障切换更快（不再依赖 ZK Session 超时）。\n\n实际建议：生产环境在 Kafka 3.5+ 逐步采用 KRaft（部分大公司已迁移）。Kafka 4.0 将移除 ZK 模式（2024 年计划，最终转为强制 KRaft）。迁移期间注意元数据 Topic 的复制因子配置。",
  ["Controller 故障时如何选举新 Controller——ZK 临时 ZNode 竞争", "KRaft 相比 ZK 模式的核心优势——减少外部依赖 + 快故障切换"],
  ["Kafka", "Controller", "KRaft", "Broker", "架构"])

q("mq", "hard", "short_answer",
  "Kafka ISR 与副本同步协议",
  "Kafka 的 ISR（In-Sync Replicas）机制是如何工作的？Leader 如何确认消息被成功写入副本？High Watermark（高水位）和 Leader Epoch 的概念是什么？unclean.leader.election 的风险和权衡？",
  "ISR（In-Sync Replicas）是 Kafka 保证消息不丢失的核心机制。\n\nISR 维护：Leader 维护一个动态的 ISR 集合（所有与 Leader 保持同步的副本）。副本从 Leader 拉取数据，如果副本的 log-end-offset 落后 Leader 超过 replica.lag.max.messages（已废弃，由 replica.lag.time.max.ms 控制，默认 30 秒），Leader 将其移除 ISR。副本赶上来后重新加入 ISR。\n\n消息确认流程（acks=all）：1）Producer 发送消息到 Leader。2）Leader 将消息追加到本地 log。3）等待所有 ISR 副本都确认收到该消息。4）Leader 更新 High Watermark（HW）——指所有 ISR 副本都成功复制的最小 offset。5）HW 以下的消息对消费者可见。6）Leader 回复 Producer 确认。\n\nHigh Watermark 与 Leader Epoch：1）HW——所有 ISR 都复制到的最小 offset（定义了消费者可见的消息边界）。2）Leader Epoch——每任 Leader 的版本号（递增），用于解决 Leader 切换时的日志不一致问题（Kafka 0.11+）。场景：旧 Leader 宕机前有一些消息未复制到所有副本。新 Leader 上任后，旧 Leader 恢复回来发现自己的日志比新 Leader 长。Leader Epoch 允许旧 Leader 截断那些新 Leader 没有的消息（截断到新 Leader 的 log-end-offset）。\n\nunclean.leader.election（启用 enable.unclean.leader.election=true）：当 ISR 为空（所有副本都挂了），是否允许非 ISR 副本（落后很多）当选 Leader。风险：已经写入 HW+ 的消息会丢失（非 ISR 副本可能没有这些消息）。权衡：可用性 vs 一致性。关键业务必须保证不丢消息 → unclean.leader.election=false（分区不可用直到 ISR 恢复）。业务可以接受少量丢消息换取可用性 → unclean.leader.election=true。建议：核心业务 false，缓存类业务 true。\n\n监控指标：UnderReplicatedPartitions（分区副本同步滞后数）、ISRShrink/ISRExpand 速率（ISR 变化的频率）、LeaderElectionRateAndTimeMs（Leader 选举频率和耗时）。",
  ["ISR 和 ACK=all 如何配合保证消息不丢", "unclean.leader.election=true 会导致什么后果——HW 以上的消息丢失"],
  ["Kafka", "ISR", "副本", "High Watermark", "可靠性"])

q("mq", "medium", "short_answer",
  "Kafka 分区分配策略",
  "Kafka 消费者组的分区分配策略有哪些（Range、RoundRobin、Sticky、Cooperative Sticky）？各有什么优缺点？如何选择合适的分区分配策略？KIP-848 的新消费者组协议有什么变化？",
  "消费者组的分区分配策略决定 Topic 的多个分区如何分配给组内消费者。\n\n1）Range（默认）——按 Topic 分别分配：每个 Topic 的分区除以消费者数，余数分配给前几个消费者。问题：如果多个 Topic 的分区数相同，前几个消费者会多分很多（分配不均）。\n\n2）RoundRobin——全部 Topic 的所有分区一起排序（按 partition ID），轮询分配给消费者（类似发牌）。优点：分配均匀。缺点：不考虑 Topic 间的关联性（同一 Topic 的分区可能分散到所有消费者，无法利用局部性）。\n\n3）Sticky（Kafka 2.4+）——目标：在保持分配均匀的前提下，尽量维持上次的分配（减少重平衡时的分区移动）。策略：将分区按 Topic 分组，尽量保持上次分配的 consumer-partition 映射。优点：减少重平衡时的分区移动次数。缺点：实现更复杂。\n\n4）Cooperative Sticky（Kafka 2.4+）——Sticky 的增量合作版本。传统重平衡（Eager）过程：所有消费者停止消费 → 分配 → 重新消费。Cooperative 过程：只需要重新平衡变动部分的分区（不需要全部消费者 stop-the-world），多次收敛完成。优点：对大集群影响小（不用全组停止消费）。缺点：需要多次增量重平衡才能达到最终状态。\n\n重平衡触发条件：1）消费者加入/离开组。2）分区数变化（CreatePartitions）。3）订阅 Topic 变化。\n\nKIP-848（Kafka 3.7+，新一代消费者组协议）：1）Consumer Group 的元数据和协调逻辑从 Group Coordinator（Broker 端）向 Consumer 端迁移。2）引入基于 KRaft 的 Consumer Group 管理方式（不再依赖 ZK 或 Broker 的 GroupCoordinator）。3）减少重平衡期间 Stop-the-World 的时间。4）使用基于 Heartbeat 的故障检测（不再需要 LeaveGroup 请求）。注意：KIP-848 还处于早期阶段（3.7 是 Preview），大规模生产还需等待稳定版本。\n\n选择建议：如果只有一个 Topic → Range 足够。多个 Topic 且分区数差异大 → Sticky。需要减少重平衡影响 → Cooperative Sticky（推荐生产使用）。",
  ["Range 分配在多个 Topic 场景下的不均匀问题", "Cooperative Sticky 如何避免 Stop-the-World 型重平衡"],
  ["Kafka", "消费者组", "分区分配", "重平衡", "Sticky"])

# ==================== Kafka Security & Monitoring ====================

q("mq", "medium", "short_answer",
  "Kafka 安全认证与授权",
  "Kafka 支持哪些安全认证机制（SASL/SSL）？SASL/PLAIN、SASL/SCRAM、SASL/GSSAPI（Kerberos）各有什么区别和适用场景？ACL 如何配置？",
  "Kafka 安全分为三个层次：传输加密（SSL/TLS） + 认证（Authentication） + 授权（Authorization）。\n\nSSL/TLS 传输加密：Kafka 支持 Broker 之间、Client-Broker 之间的 SSL 加密。配置：Broker 需要 SSL 证书（或自签名证书），Client 配置 truststore 验证 Broker 身份，keystore 配置客户端证书。性能影响：SSL 增加约 15-30% CPU 开销（现代 CPU 有 AES-NI 加速）。\n\nSASL 认证机制：1）SASL/PLAIN——用户名密码明文传输（需要搭配 SSL 加密使用，否则密码暴露）。适用：小团队内部信任环境。缺点：密码存储在 ZooKeeper（或 Kafka 的配置文件中），动态更新需要重启 Broker。2）SASL/SCRAM（推荐）——基于 Salted Challenge Response，密码不在网络中传输明文。支持动态创建用户（kafka-configs.sh --alter --add-config 'SCRAM-SHA-256=[password]'）。适用：大多数生产环境。3）SASL/GSSAPI（Kerberos）——基于 Kerberos 票据认证（需要 KDC 服务器）。适用：已经部署 Kerberos 的大公司（如 Hadoop 生态系统集成）。配置复杂（keytab 文件管理、Ticket 更新）。4）SASL/OAUTHBEARER（Kafka 2.0+）——基于 OAuth 2.0 Bearer Token。适用于已有 OAuth 2.0 基础设施的组织。\n\nACL（Access Control Lists）：Kafka ACL 定义在 ZooKeeper 中（或 KRaft 模式的元数据 Topic 中）。格式：Principal（用户） + Permission（Allow/Deny） + Operation（Read/Write/Describe/Create/Alter/Delete） + Resource（Topic/ConsumerGroup/Cluster/TransactionalId）。\n\n配置方式：kafka-acls.sh --authorizer-properties ... --add --allow-principal User:alice --operation Read --topic my-topic --group my-group。授权模型：默认 Deny All，只有显式允许的操作才可执行。Super Users（super.users 配置）不受 ACL 限制。授权在 Broker 端执行（通过 Authorizer 接口的实现类，默认 AclAuthorizer）。\n\n最佳实践：1）启用 ACL 前准备好 Super User（用于管理）。2）先配置 Deny 规则排除特定用户，再配置 Allow。3）不要在 ACL 中使用通配符 *（易扩大授权范围）。4）敏感数据启用传输加密 + SCRAM 认证 + ACL 授权。监控 kafka.authorizer.log 中的拒绝请求日志。",
  ["SASL/PLAIN 为什么需要搭配 SSL——密码明文传输", "ACL 的 Deny 和 Allow 规则优先级——Deny 优先"],
  ["Kafka", "安全", "SASL", "ACL", "认证"])

q("mq", "medium", "short_answer",
  "Kafka 监控与运维指标",
  "Kafka 需要监控哪些核心指标？JMX 暴露哪些关键 Metric？消费者 Lag 如何监控和告警？如何进行 Kafka 集群的健康检查和容量规划？",
  "Kafka 的监控体系分为 Broker 级、Topic 级、消费者级、操作系统级。\n\nBroker 级核心指标（JMX MBeans）：1）UnderReplicatedPartitions——分区副本复制滞后数，> 0 说明某些副本同步异常（网络问题、磁盘满、Broker 故障）。2）ActiveControllerCount——Active Controller 数量（应该为 1，> 1 说明脑裂）。3）LeaderElectionRateAndTimeMs——Leader 选举频率。短时间内大量选举说明 Broker 不稳定。4）RequestHandlerAvgIdlePercent——请求处理线程平均空闲率，< 30% 表示 Broker 过载。5）NetworkProcessorAvgIdlePercent——网络线程空闲率，< 10% 说明网络瓶颈。6）BytesInPerSec/BytesOutPerSec——Broker 的入站出站流量（监控网络带宽利用率）。\n\nTopic/分区级指标：1）LogEndOffset（LEO）——分区最新消息偏移量。2）LogStartOffset——最早可消费偏移量。3）NumLogSegments——日志段文件数。日志段过多说明日志清理不及时。4）TotalProduceRequestsPerSec——分区写入 QPS。\n\n消费者 Lag 监控：Kafka 的消费 Lag = Producer 写入的最新 Offset - 消费者已提交的 Offset。核心工具：kafka-consumer-groups.sh --bootstrap-server ... --describe --group my-consumer 展示每个分区的 Current-Offset、Log-End-Offset、Lag。生产监控方案：1）Burrow（LinkedIn 开源）——基于窗口的 Lag 评估器，自动判断消费者是否健康。2）Prometheus + kafka-exporter——导出 Lag 指标（kafka_consumergroup_current_offset、kafka_consumergroup_lag）。3）Lag 告警阈值：Lag 持续增长 → 消费者处理跟不上生产速率（需要扩容消费者或优化处理逻辑）。Lag 增长速率 = 生产速率 - 消费速率，持续增长预警。\n\n容量规划：数据保留期（retention.ms/hours/bytes）决定存储空间。每天写入量 × 保留天数 × 副本因子 = 总存储空间。吞吐量：单个分区最大约 10-50 MB/s（取决于磁盘 IOPS），集群总吞吐 ≈ 节点数 × 每节点吞吐。网络带宽：入站流量 = 所有 Producer 写入速率；出站流量 = 非同步副本数 × 分区数 × Leader 写入速率 + 消费者数 × 消费速率。\n\n操作系统级：磁盘 IO 等待时间（iowait）、磁盘使用率（> 80% 需要告警）、页面错误（page fault）、网络带宽使用率、最大文件描述符数（ulimit -n 建议 > 100000）。",
  ["UnderReplicatedPartitions > 0 意味着什么——副本同步异常", "消费者 Lag 持续增长的根本原因和处理方式"],
  ["Kafka", "监控", "JMX", "Lag", "运维"])

# ==================== RocketMQ ====================

q("mq", "medium", "short_answer",
  "RocketMQ NameServer 架构",
  "RocketMQ 的 NameServer 的作用是什么？为什么 RocketMQ 用 NameServer 而不是 ZooKeeper（像 Kafka 一样）？NameServer 的无状态设计有什么好处？Broker 如何向 NameServer 注册？",
  "RocketMQ 的 NameServer 是轻量级的服务发现和路由组件（协调者），替代了 ZK 的作用但更简单。\n\nNameServer 的核心功能：1）路由管理——每个 Broker 启动时向所有 NameServer 注册（注册 Topic 和 Queue 的路由信息）。2）心跳监控——Broker 每 30 秒向 NameServer 发送心跳。如果 NameServer 120 秒没收到心跳，移除该 Broker 的路由（但 NameServer 不主动做故障转移——由客户端当检测到 Broker 不可用时切换到其他 Broker）。3）无状态——NameServer 之间不互相通信，也不持久化数据。每个 NameServer 独立维护全量路由（多个 NameServer 之间最终一致，不是强一致）。\n\n为什么不用 ZooKeeper：1）去 ZK 依赖——RocketMQ 设计目标是简单部署（不像 Kafka 早期必须依赖 ZK）。ZK 增加集群复杂度，NameServer 部署更简单（本身就是 Java 应用）。2）性能和可用性——NameServer 的处理逻辑比 ZK 简单（不需要选举和强一致性写入），故障切换不需要 ZK Session 超时等待。3）NameServer 无状态——单个 NameServer 故障不影响集群可用性（Producer/Consumer 可以连接到其他 NameServer）。\n\n无状态设计的好处：1）多个 NameServer 可以独立部署（不需要选主，不需要同步数据）。2）横向扩展——加 NameServer 节点不需要数据迁移。3）运维简单——NameServer 重启不需要特殊流程（重启后重新从 Broker 拉取路由信息）。4）降低延迟——客户端直连 NameServer 获取路由，不需要经过 ZK 的 Leader 节点。\n\nBroker 注册流程：1）Broker 启动时向所有 NameServer 发送注册请求（包含 BrokerName、BrokerId（0=Master，>0=Slave）、所属集群名、监听地址、持有 Topic 的 Queue 信息）。2）NameServer 将注册信息保存在内存的 HashMap 中（routeInfoMap）。3）Broker 定期发送心跳（每 30 秒），更新存活状态。4）Broker 宕机后 120 秒，NameServer 被动移除该 Broker 信息（不主动探测）。\n\n潜在问题：NameServer 的故障检测是依赖 Broker 心跳的超时的被动移除，不是主动检查。这意味着客户端在 NameServer 清理故障 Broker 前可能有短暂的路由失效。但 RocksonMQ 客户端有自动重试（当连接 Broker 失败时 → 从 NameServer 更新路由 → 重试其他 Queue）。",
  ["NameServer 无状态设计的核心好处——不需要选举和同步", "NameServer 故障检测为什么慢（120 秒）——被动心跳超时移除"],
  ["RocketMQ", "NameServer", "架构", "服务发现"])

q("mq", "hard", "short_answer",
  "RocketMQ 事务消息原理",
  "RocketMQ 事务消息（Transactional Messages）的实现原理是什么？半消息（Half Message）和消息回查（Check-back）机制如何保证分布式事务的最终一致性？RocketMQ 事务消息和本地消息表的对比？",
  "RocketMQ 事务消息（TransactionMessage）解决的是：生产者本地事务和消息发送的原子性问题（要么都成功，要么都回滚）。基于两阶段提交 + 异步回查。\n\n流程：第一阶段（发送半消息 Half Message）——Producer 发送一条「半消息」到 Broker（标记为 PREPARED 状态，对消费者不可见）。Broker 成功存储半消息后回复 Producer。\n\n第二阶段（提交/回滚）——Producer 执行本地数据库事务。本地事务成功 → Producer 发送 COMMIT_MESSAGE 给 Broker（半消息转为可见，消费者可以消费）。本地事务失败 → Producer 发送 ROLLBACK_MESSAGE（Broker 删除半消息）。\n\n消息回查（Check-back）：如果 Producer 在第二阶段提交/回滚时宕机（或网络超时），Broker 处于 PREPARED 状态的半消息会触发回查。Broker 定期（默认 60 秒，可通过 transactionCheckInterval 配置）向 Producer 发送回查请求（HEAD 请求到 Producer 的回查接口）。Producer 收到回查后，检查本地事务是否成功，回复 COMMIT/ROLLBACK。Broker 根据回查结果提交或回滚半消息。\n\n事务消息的限制：1）不能与定时消息/批量消息混用。2）消息回查次数有限（默认 15 次），超过后 Broker 标记为未知并记录。3）事务消息的 Producer ID 必须有回查接口（实现 TransactionListener 的 checkLocalTransaction 方法）。4）事务消息只有 Producer 侧的事——Consumer 看到消息时已经是提交后的正常消息。如果 Consumer 消费失败重试，那是 MQ 的消息重试机制，不涉及事务。\n\nRocketMQ 事务消息 vs 本地消息表：RocketMQ 事务消息 简化了开发流程（不需要手动创建消息表、定时扫表任务）。本地消息表方案：业务数据库建消息表 → 本地事务写业务数据和消息记录（一起提交）→ 独立定时任务扫消息表发送到 MQ。两者都实现最终一致性，RocketMQ 方案对业务代码侵入更少。\n\n适用场景：订单状态变更 + 下游业务处理（订单已支付 → 发送消息通知库存系统扣减库存）、账户变更 + 发送消息到风控系统（保证账户变更已持久化后再发消息）。\n\n注意：事务消息不是强一致性（是最终一致性）。如果在消息回查期间 Producer 长时间不可用，Broker 默认 30 分钟后将消息标记为未知并 alert（不会自动提交/回滚）。数据库事务的超时时间应小于回查间隔。",
  ["半消息（Half Message）为什么对消费者不可见——PREPARED 状态", "消息回查的时序保证——本地事务的检查和回查的间隔如何设置"],
  ["RocketMQ", "事务消息", "分布式事务", "半消息", "回查"])

# ==================== Pulsar ====================

q("mq", "hard", "short_answer",
  "Pulsar 分层架构与 BookKeeper",
  "Apache Pulsar 的分层架构（Broker + BookKeeper）与 Kafka 的架构有什么本质区别？BookKeeper 的 Segment 和 Ledger 是什么？Pulsar 的分层存储对性能和运维有什么影响？",
  "Pulsar 的核心设计理念是计算与存储分离（Separation of Compute and Storage）：Broker 层处理消息路由和消费逻辑，BookKeeper 层存储消息数据。\n\n架构对比：Kafka——每个 Broker 同时负责计算路由和存储数据（数据在 Broker 的本地磁盘）。扩缩容时数据需要重新分布（分区迁移）。Pulsar——Broker 无状态（只做路由和 Cursor 管理），消息数据存储在 BookKeeper 集群中。扩缩容 Broker 不需要数据迁移（加 Broker 即可承接流量）。\n\nBookKeeper 核心概念：1）Ledger——一个只追加的日志序列（Write-Ahead Log），由多个 Entry 组成。Ledger 是 BookKeeper 的存储单元，有唯一的 ID。2）Entry——Ledger 中的一条记录（对应 Pulsar 中的一条消息）。3）Segment（分段存储）——Pulsar 将一个 Topic 分为多个 Segment。每个 Segment 在 BookKeeper 中对应一个 Ledger。Segment 大小或时间达到阈值（默认 512MB/2 小时）时自动滚动创建新 Segment。4）Bookie——BookKeeper 的存储节点，管理 Ledger 数据。多个 Bookie 组成 Ensemble。\n\n读写流程：Producer 发消息 → Broker 收到 → 将消息写入 BookKeeper（Ensemble 中 N 个 Bookie 同步写入，N=ensembleSize）。Broker 从 BookKeeper 读取消息 → 发送给 Consumer。Broker 只负责缓存（读缓存和写缓存），不持久化数据。\n\n分层存储（Tiered Storage，Pulsar 2.5+）：1）冷数据从 BookKeeper 自动卸载（Offload）到 S3/GCS/Azure Blob 等廉价对象存储。2）BookKeeper 中只保留热数据（最近 N 天/最 大 N GB）。3）消费者需要读取冷数据时，Broker 从对象存储读取（延迟更高，约 50-200ms）。4）配置：managedLedgerOffloadDriver=s3，offloadThresholdInBytes 控制卸载触发大小。\n\n性能和运维影响：优势——1）Write-Ahead 全同步写入：默认每个消息同步写入 2 个（或 3 个）Bookie，没有主从异步复制的数据丢失窗口。2）Segment 级权限控制：不同 Topic 可以设置不同的复制因子、保留策略。3）空间利用率高——BookKeeper 的 Reed-Solomon 纠删码（Erasure Coding）可以将 6 个副本减少到 3 个数据段 + 2 个校验段。\n\n运维挑战：1）BookKeeper 的 IO 模型比 Kafka 复杂（双写 Journal + Ledger，对磁盘吞吐要求高），Bookie 需要 SSD 支撑写入性能。2）多了一层存储（BookKeeper 集群），运维和故障排查更复杂。3）Segment 滚动和 Offload 需要监控（避免 segment 过多影响性能）。4）注意：Pulsar 的 Broker 无状态设计是真正的优势（扩容/故障转移不需要数据重分布），但增加了运维 BookKeeper 的复杂度。",
  ["Pulsar 的 Segment 架构——Segment 滚动策略和读写分离", "BookKeeper 的 Reed-Solomon 纠删码相比 Kafka 副本的存储效率提升"],
  ["Pulsar", "BookKeeper", "分层存储", "计算存储分离", "架构"])

# ==================== RabbitMQ ====================

q("mq", "medium", "short_answer",
  "RabbitMQ Exchange 与 Binding 详解",
  "RabbitMQ 的四种 Exchange 类型（Direct、Topic、Fanout、Headers）的区别和使用场景是什么？Binding Key 和 Routing Key 的匹配规则是什么？TTL 和 DLX（死信交换机）如何配合实现延迟队列？",
  "RabbitMQ 的核心消息模型：Producer → Exchange → Binding → Queue → Consumer。Exchange 根据 Routing Key 和 Binding 规则将消息路由到队列。\n\n四种 Exchange 类型：1）Direct——Routing Key 精确匹配 Binding Key。适用：点对点单播。2）Topic——Routing Key 通配符匹配 Binding Key（. 分隔，# 匹配多段，* 匹配一段）。适用：多维度订阅（如 news.sports.football、news.*.*）。3）Fanout——忽略 Routing Key，将消息广播到所有绑定的 Queue。适用：广播通知。4）Headers——根据消息的 Header 属性匹配（不依赖 Routing Key）。适用：复杂的多条件路由（老系统兼容场景）。\n\n使用场景：Direct → 一对一命令下发。Topic → 按日志级别（error.* 所有服务的错误日志）或按业务域订阅。Fanout → 全局配置变更通知（所有服务都需要收到配置刷新事件）。Headers → 需要基于消息属性路由但不方便用 Routing Key 的场景。\n\nTTL 和 DLX 实现延迟队列：1）DLX（Dead Letter Exchange）——队列可以绑定一个 DLX，消息被拒绝、过期或队列满时，消息被转发到 DLX，再路由到死信队列。2）TTL → DLX 延迟方案——消息设置 TTL（x-message-ttl），到期后自动进入 DLX → 延迟队列。注意问题：TTL 过期在队列头部检测（队列头部消息如果 TTL 未到期但后面的消息 TTL 先到了？不！RabbitMQ 只会检查头部消息的 TTL。如果头部有一个 TTL=30s 的消息后面是 TTL=5s 的消息，5s 的消息不能提前过期——因为头部消息还没到期，队列阻塞）。解决方法：每个 TTL 一个单独的队列（插件延迟交换机在 Broker 端实现，不需要手动管理 TTL 队列）。\n\nRabbitMQ 延迟插件：rabbitmq-delayed-message-exchange 插件创建 x-delayed-message Exchange 类型（基于一致哈希环 + 内存定时器实现延迟调度），消息延迟在 Exchange 层处理（不需要每延迟值一个队列）。\n\n注意：RabbitMQ 消息在内存中（直到被消费或持久化到磁盘）。如果大量未消费消息在 Queue 中堆积，内存占用会很高。用 TTl + DLX 延迟队列时，延迟消息在 TTL 到期前都存储在队列中，注意内存规划。",
  ["Topic Exchange 的 # 和 * 通配符匹配规则", "RabbitMQ 基于 TTL+DLX 的延迟队列为什么有头部阻塞问题"],
  ["RabbitMQ", "Exchange", "DLX", "TTL", "路由"])

q("mq", "medium", "short_answer",
  "RabbitMQ 仲裁队列与数据安全",
  "RabbitMQ 的仲裁队列（Quorum Queue，3.8+）相比镜像队列（Mirrored Queue，已弃用）有什么优势？仲裁队列的 Raft 共识是如何实现的？仲裁队列与 Stream 队列的选型建议？",
  "RabbitMQ 3.8+ 推荐使用仲裁队列（Quorum Queue）替代镜像队列（Mirrored Queue）。镜像队列在 RabbitMQ 3.12 中已移除。\n\n镜像队列的问题：1）使用 GM（Guaranteed Multicast）协议，不是标准的分布式共识算法（GM 实现未遵循 Raft/Paxos 等经过验证的算法）。2）同步粒度粗——镜像队列同步整个 Queue，不支持增量同步。3）新的 Node 加入时全量同步会影响所有节点性能。4）故障切换时的行为不明确（GM 不保证选主安全）。\n\n仲裁队列（基于 Raft）的改进：1）Raft 共识——使用标准的 Raft 算法（Leader 选举 + Log Replication + Safety）。2）Raft Log ——消息先写入 Raft 日志，大多数节点确认（Quorum = N/2 + 1）后提交。3）Leader 选举——队列的 Leader（所在节点故障时）Followers 选举新 Leader（基于 Term 和 Log）。4）数据安全——Leader 故障时，新 Leader 保证不丢已提交消息（Raft 的 Leader 完整性保证：候选者必须有最新的已提交日志）。5）元数据也写入 Raft ——队列声明、绑定等操作也通过 Raft Log 复制。\n\n仲裁队列限制：1）不能进行非幂等操作（如消息的重新排序）。2）只支持 at-least-once 语义（不能 exactly-once）。3）3 节点集群的 Quorum = 2 → 只能容忍 1 个节点故障。5 节点集群 Quorum = 3 → 容忍 2 个节点故障。\n\n仲裁队列 vs Stream 队列（RabbitMQ 3.9+ 引入的持久的只追加日志类型队列）：仲裁队列适合需要高可靠性的业务消息（订单、支付）。Stream 队列适合需要重放历史消息、大量日志、实时数据处理。Stream 的特点：1）基于磁盘的只追加日志。2）消费者可以从任意位置开始消费。3）支持超大的 Backlog（TB 级，仲裁队列被设计为有限长度队列）。\n\n选型建议：关键业务消息（需要高可靠和 Exactly-Once-ish）→ 仲裁队列。Event Sourcing 和日志型数据 → Stream 队列。简单工作队列 → Classic Queue（但推荐迁移到 Quorum，因为不推荐用经典队列做持久化——要容忍丢数据才用 Classic 瞬态队列）。",
  ["仲裁队列的 Raft 协议——Leader 选举和 Log Replication 如何工作的", "仲裁队列（有限 Backlog） vs Stream 队列（超大 Backlog）的适用场景"],
  ["RabbitMQ", "仲裁队列", "Quorum Queue", "Raft", "高可用"])

# ==================== Architecture Patterns ====================

q("mq", "hard", "short_answer",
  "MQ 在事件驱动架构中的角色",
  "事件驱动架构（EDA）中消息队列扮演什么角色？Event Sourcing 和 CQRS 与消息队列的关系是什么？Kafka 作为 Event Store 的可行性和限制？Choreography vs Orchestration 的 Saga 模式？",
  "事件驱动架构（EDA）的核心：系统组件通过发/收事件来实现通信（不是直接调接口）。MQ（特别是 Kafka）是 EDA 的核心基础设施。\n\nMQ 在 EDA 中的角色：1）事件总线（Event Bus）——服务发布事件到 Topic/Exchange，其他服务订阅并消费。2）事件存储（Event Store）——Kafka 的日志本身是不可变的事件流（Append-only Log），天然适合作为 Event Store。3）异步解耦——事件产生的服务不需要知道谁消费事件。4）流量削峰——MQ 缓冲突然的高流量。\n\nEvent Sourcing + CQRS 与 MQ：Event Sourcing 将状态变更存储为事件序列（不是存储当前状态）。CQRS 将读和写分离为不同模型。典型架构：Command 写入 → 事件持久化到 Event Store（Kafka）→ 事件发布到 MQ → 读模型订阅事件更新 Read Model。Kafka 作为 Event Store：优势不可变日志（不会被修改）、支持回溯消费、高吞吐。限制：不支持按事件 ID 查询（Kafka 是顺序消费模式，不是查询引擎），保留期有限（不支持无限保留，但可以配置很大如 7-30 天超长保留或使用分层存储）。\n\nSaga 模式（处理分布式事务的两种编排方式）：1）Choreography（编排）——每个服务完成本地事务后发事件到 MQ，下一个服务监听事件执行。不需要中心协调者，但追踪困难（事件链跨多个服务）。2）Orchestration（编舞）——引入 Saga Orchestrator 组件，Orchestrator 向各个服务发命令，然后监听回复进行事务补偿。需要中心化组件但流程更清晰、更容易管理超时和补偿。Choreography 适合简单的线性 Saga 流程，Orchestration 适合复杂的有分支和条件回滚的 Saga。\n\nMQ 在 Saga 中的关键作用：1）保证事件的可靠传递（at-least-once）和顺序（Kafka 分区的顺序保证）。2）补偿事件的发布和消费。3）Choreography 模式中 MQ 是服务间唯一的通信桥梁。\n\n常见架构模式：1）Kafka Connect + Kafka Streams——CDC（Change Data Capture）从数据库捕获变更事件 → Kafka → Streams 处理器做 ETL/聚合。2）Transactional Outbox——在数据库中建 outbox 表，业务写和 outbox 在同一个本地事务中提交。Canal/Debezium 通过 CDC 将 outbox 事件写入 Kafka。这个模式也是 Kafka Connect 配合 Debezium 的常见用法。",
  ["Choreography vs Orchestration Saga 的适用场景和复杂度对比", "Kafka 作为 Event Store 的限制——不支持按事件 ID 查询和长期持久化"],
  ["Kafka", "事件驱动", "EDA", "Saga", "CQRS"])

q("mq", "hard", "short_answer",
  "消息队列的 Schema 管理与兼容性",
  "消息队列中的 Schema（消息格式）如何管理？Schema Registry（如 Confluent Schema Registry / Apicurio）解决什么问题？Schema 兼容性类型（Backward/Forward/Full/None）如何选择？兼容性检查是在生产端还是消费端？",
  "MQ 中消息格式变更时，生产者和消费者的版本不匹配会导致反序列化失败。Schema Registry 统一管理消息格式（Schema），保证兼容性。\n\n解决的问题：1）Producer 升级后消息格式变化 → 旧版本 Consumer 无法反序列化。2）多个版本 Consumer 在同一 Group（滚动升级）→ 需要同时支持新旧格式。3）不同 Topic 的消息格式定义散落在代码中 → 没有统一的可发现和治理机制。\n\nSchema Registry（Confluent Schema Registry / Apicurio / AWS Glue Schema Registry）：1）生产者发送消息时先检查/注册 Schema（Avro/Protobuf/JSON Schema）。Broker 不管理 Schema（不增加 Broker 负担），Schema Registry 独立部署。2）Schema 的存储方式：消息体只存原始数据，Schema ID 和格式信息存在消息头或前缀中。消费者读取消息头中的 Schema ID 后从 Registry 获取 Schema 并反序列化。3）兼容性策略在 Schema Registry 中配置（通过 REST API 或配置管理）。\n\n兼容性类型：1）Backward（向后兼容，默认）——新 Schema 可以读取旧数据。允许添加可选字段、删除有默认值的字段。不能删除必需字段。适用：消费者先升级（Consumer 需要处理旧格式数据）。2）Forward（向前兼容）——旧 Schema 可以读取新数据。消费者不升级也能处理新格式（新加了字段会被 Consumer 忽略，因为序列化时旧消费者不知道新字段，需要 Producer 设置默认值）。适用：生产者先升级。3）Full——同时保证 Backward + Forward。最严格。4）None——不检查兼容性。生产/测试环境适用。\n\n兼容性检查的执行位置：在 Producer 端（写时检查）：Producer 在注册或更新 Schema 时，Schema Registry 检查新 Schema 与最新版本的兼容性，不兼容则拒绝注册。这是一种 Client-side enforcement（不是 Broker 端）。Broker 不做 Schema 检查——如果 Producer 绕开 Schema Registry 直接写入，Broker 不会拒绝。\n\n生产最佳实践：1）选择一个兼容性策略（推荐 Backward 或 Full）并在所有环境（dev/staging/prod）保持一致。2）把 Schema 作为可独立版本化的 Artifact（代码仓库中管理 .avsc/.proto 文件）。3）不要轻易用 None（会导致生产者和消费者版本不匹配时无预警失败）。4）Kafka 场景：使用 Confluent Schema Registry + Avro（推荐）或 Protobuf（新项目可选，性能更好但 Schema Registry 支持不如 Avro 成熟）。5）RocketMQ 也有自己的 Schema Registry（RIP-50）但生态不如 Confluent。\n\n注意：Schema Registry 本身是高可用组件（通常 3 节点集群），其可用性直接影响消息发送——如果 Registry 不可用，新 Schema 的注册会失败（但已有 Schema 的消息可以缓存后正常发送和接收）。",
  ["Backward vs Forward 兼容性——消费者先升级 vs 生产者先升级", "Schema Registry 的可用性影响——Registry 故障后已有 Schema 还可以工作吗"],
  ["Schema Registry", "Avro", "Protobuf", "兼容性", "治理"])

# Write properly (with safety guard)
result = json.dumps(questions, ensure_ascii=False, indent=2)
outpath = '/Users/petersun/DEV/labs/interview-app/backend/seed_data/mq.json'
try:
    with open(outpath, 'r') as f:
        existing = json.load(f)
    print(f'⚠️  目标文件已有 {len(existing)} 题，本次将写入 {len(questions)} 题（覆盖）')
    confirm = input('确认覆盖？(y/N): ')
    if confirm.lower() != 'y':
        print('已取消')
        exit()
except FileNotFoundError:
    pass

with open(outpath, 'w') as f:
    f.write(result)
print(f'Written: {len(questions)} questions to {outpath}')
