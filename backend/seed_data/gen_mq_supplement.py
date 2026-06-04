#!/usr/bin/env python3
"""Supplement mq.json from 89 to 100+ questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('mq', 'hard', 'short_answer',
      'Kafka Connect 架构深度解析：Source/Sink 与 SMT',
      'Kafka Connect 的 Source Connector 和 Sink Connector 分别如何工作？REST API 提供了哪些集群管理能力？Single Message Transform（SMT）的执行机制是什么？Connect 的错误处理与 Dead Letter Queue 如何配置和使用？',
      'Kafka Connect 是一个可扩展的数据流工具，用于在 Kafka 和外部系统之间可靠传输数据。\n\nSource Connector：从外部系统读取数据并写入 Kafka Topic。核心组件：1）Connector 类——负责创建和配置 Task 实例，根据配置决定 Task 数量和分区策略。2）Task 类——实际执行数据拉取和写入逻辑，通过 poll() 方法返回 SourceRecord 列表。3）每个 SourceRecord 包含 Topic、分区、Key、Value、时间戳等信息。4）Source Task 支持 Exactly-Once 语义（通过 Kafka 事务，2.5+ 版本）。\n\nSink Connector：从 Kafka Topic 读取数据并写入外部系统。核心组件：1）Connector 类——负责配置验证和 Task 分配。2）Task 类——通过 put() 方法接收 SinkRecord 列表，批量写入外部系统。3）支持 Exactly-Once 投递。4）flush() 回调确保数据持久化。\n\nREST API（8083 端口）：GET /connectors——列出所有 Connector。POST /connectors——创建 Connector。PUT /connectors/{name}/config——更新配置触发重平衡。GET /connectors/{name}/status——查看状态和错误信息。POST /connectors/{name}/restart——重启失败 Connector。\n\nSMT（Single Message Transform）：轻量级数据转换机制，在 Connector 内部对单条消息进行处理。常见 SMT 包括：InsertField（添加字段）、ReplaceField（重命名字段）、MaskField（遮盖敏感字段）、TimestampConverter（时间戳格式转换）、RegexRouter（Topic 重命名）。SMT 执行顺序由 transforms 配置链的前后顺序决定。\n\n错误处理配置：errors.tolerance=all（忽略错误继续处理）/none（遇到错误停止）。errors.deadletterqueue.topic.name——指定死信队列 Topic。errors.deadletterqueue.context.headers.enable=true——在死信消息中添加错误上下文 Headers。errors.retry.timeout——重试超时时间。',
      ['SMT 在 Connector 中的执行顺序由 transforms 配置链的前后顺序决定', 'Dead Letter Queue 配置需要同时设置 errors.tolerance 和 DLQ Topic 名称'],
      ['Kafka', 'Connect', 'Source', 'Sink']),

    q('mq', 'hard', 'short_answer',
      'Kafka Schema Registry 序列化格式与兼容性规则',
      'Schema Registry 支持哪些序列化格式（Avro/Protobuf/JSON Schema）？各兼容性规则（BACKWARD/FORWARD/FULL/NONE）的具体含义是什么？Schema 版本号如何管理？跨集群的 Schema Registry 迁移如何实现？',
      'Schema Registry 是 Kafka 生态的元数据层，负责管理消息 Schema 的注册、版本和兼容性校验。\n\n支持的序列化格式：1）Avro——最成熟，通过 Schema Registry Avro Serializer 将 Schema ID 嵌入消息头（前 4 字节为 Magic Byte + 4 字节 Schema ID + 后续数据和 Avro 二进制编码）。2）Protobuf——通过 Protobuf Serializer 支持，消息头格式兼容 Avro 格式。3）JSON Schema——通过 JSON Schema Serializer 支持，数据为 JSON 格式（相对占用空间最大）。\n\n兼容性规则：1）BACKWARD（默认）——新 Schema 可以读取旧 Schema 写入的消息。规则：新 Schema 只能添加可选字段或删除字段，不能更改或删除已有必选字段。2）FORWARD——旧 Schema 可以读取新 Schema 写入的消息。规则：新 Schema 只能添加新字段（所有原有字段保持不变），旧 Consumer 可以忽略新字段。3）FULL——同时满足 BACKWARD 和 FORWARD（双向兼容）。4）NONE——关闭兼容性检查（任何 Schema 变更都允许）。5）BACKWARD_TRANSITIVE/FORWARD_TRANSITIVE/FULL_TRANSITIVE——检查新 Schema 与所有历史版本的兼容性（不仅是上一个版本）。\n\nSchema 版本管理：每次注册 Schema 时检查与历史版本的兼容性。兼容则分配新版本号（从 1 开始递增）。不兼容则拒绝注册（除非配置 auto.register.schemas=true 覆盖）。Producer 自动注册 Schema，Consumer 根据 Schema ID 从 Registry 获取 Schema。\n\nSchema Registry REST API：1）POST /subjects/{subject}/versions——注册新 Schema 版本。2）GET /subjects/{subject}/versions——列出所有版本。3）GET /subjects/{subject}/versions/{version}——获取特定版本的 Schema。4）GET /schemas/ids/{id}——通过全局 Schema ID 获取 Schema。5）POST /subjects/{subject}——检查 Schema 是否存在并返回 ID。6）兼容性验证端点——POST /compatibility/subjects/{subject}/versions 验证新 Schema 的兼容性。\n\nSchema Registry 集群部署：Schema Registry 是无状态服务（前端 REST 层），后端依赖 Kafka 的 _schemas Topic 存储所有 Schema 数据。集群通过多个 Schema Registry 实例提供高可用，所有实例共享同一个 Kafka 集群和 _schemas Topic。消费者侧通过 Schema ID 缓存优化性能（避免频繁查询 Registry）。配置建议：kafkastore.topic.replication.factor——_schemas Topic 的复制因子建议设置为 3。\n\n跨集群迁移方案：1）Schema Registry Export/Import 工具——导出所有 Schema 到 JSON 文件，再导入到目标集群。2）Confluent Replicator——实时从源集群复制 Schema。3）自定义方案——通过 REST API 遍历 Schema Topic 消息，重建所有 Schema 版本。',
      ['BACKWARD 兼容性保证新 Consumer 可以读取旧 Producer 写入的数据', 'Schema ID 嵌入消息头的前几个字节实现 Producer/Consumer 的 Schema 自动匹配'],
      ['Kafka', 'Schema Registry', 'Avro', '兼容性']),

    q('mq', 'medium', 'short_answer',
      'RabbitMQ Federation 跨集群消息转发与 WAN 拓扑',
      'RabbitMQ Federation 插件的核心原理是什么？Upstream 和 Downstream 如何配置？Federation 在 WAN 环境下有哪些常见问题和优化策略？Federation 与 Shovel 的核心区别是什么？',
      'RabbitMQ Federation 是一个插件（rabbitmq_federation），用于在多个 RabbitMQ 集群或 Broker 之间异步转发消息和元数据。\n\n核心原理：Federation 通过 AMQP 0-9-1 协议（或 AMQP 1.0）在 Upstream（源集群）和 Downstream（目标集群）之间建立消费连接。Downstream 的 Federation Link 作为 AMQP Consumer 连接到 Upstream 的 Exchange 或 Queue，消费消息并重新发布到本地的 Exchange 或 Queue。\n\nUpstream 配置：定义上游连接参数（URI、心跳间隔、重连策略）。支持定义 Upstream Set（多个 Upstream 组成一组，实现多活或灾备）。\n\nFederation 类型：1）Exchange Federation——将 Upstream Exchange 的消息转发到 Downstream Exchange（绑定规则可过滤）。2）Queue Federation——将 Upstream Queue 的消息转发到 Downstream Queue（数据在主队列中不会消失）。\n\nWAN 优化策略：1）调整 heartbeat 超时（更长的心跳间隔，如 60 秒）。2）启用 TCP Keepalive（net.ipv4.tcp_keepalive_time=60）。3）配置 max_hops 防止环路（默认 1）。4）使用 Separate Connection 管理 Federation Link（减少主连接中断影响）。5）压缩传输（通过 AMQP 1.0 或 TLS 减少带宽）。\n\n与 Shovel 的区别：Federation 是一对多的关系（一个 Upstream Exchange 可以 Federation 到多个 Downstream），适合 Fanout 广播场景。Shovel 是点对点的窄带转发，适合精准的消息迁移或跨集群的单向同步。Federation 支持 Exchange 级别的自动拓扑同步（Binding 规则）。Shovel 更底层，仅转发消息本体。',
      ['Federation 的 Downstream 充当 AMQP Consumer 消费 Upstream 消息再重新发布', 'WAN 环境需要调整 heartbeat、TCP keepalive 和网络超时参数'],
      ['RabbitMQ', 'Federation', '跨集群', 'WAN']),

    q('mq', 'medium', 'short_answer',
      'Pulsar IO 框架：Source/Sink 连接器与 NAR 打包机制',
      'Pulsar IO 的 Source 和 Sink 框架如何工作？Pulsar 内置了哪些常用的连接器？NAR 打包机制是什么？如何开发自定义 Pulsar IO 连接器？',
      'Pulsar IO 是 Apache Pulsar 内置的数据集成框架，提供 Source（数据入 Pulsar）和 Sink（数据出 Pulsar）两种连接器类型。\n\nSource 架构：Source 连接器从外部系统读取数据并写入 Pulsar Topic。核心接口为 Source<T>，关键方法：open(Map<String,Object> config)——初始化连接配置。readNext()——阻塞读取下一条记录（返回 Record<T>）。Record 包含 Value、Key、Topic、Schema 等信息。Pulsar 管理 Source 的生命周期和并行度（parallelism 参数）。\n\nSink 架构：Sink 连接器从 Pulsar Topic 消费数据并写入外部系统。核心接口为 Sink<T>，关键方法：open(Map<String,Object> config)——初始化连接器。write(Record<T> record)——处理单条消息。flush()——批量刷新（可选实现）。Pulsar 保证 Sink 的 At-Least-Once 语义。\n\n内置连接器（Pulsar 2.11+）：1）Kafka——Source 和 Sink（兼容 Kafka 集群）。2）CDC Source（Debezium）——MySQL、MongoDB、PostgreSQL 等数据库变更捕获。3）ElasticSearch Sink——写入 ES 索引。4）JDBC Sink——写入关系型数据库。5）HBase Sink、MongoDB Sink。6）AWS S3/SQS/SNS/Kinesis/DynamoDB 连接器。\n\nNAR 打包机制：NAR（NiFi Archive）是 Pulsar IO 连接器的标准打包格式。NAR 文件是 ZIP 格式，包含：1）连接器代码的 JAR。2）依赖 JAR（所有传递依赖）。3）META-INF/services/ 目录下的 SPI 配置（声明 Source/Sink 实现类）。4）pulsar-io.yml 配置文件（描述连接器名称、类型、Source/Sink 类名、配置项）。NAR 避免了类加载冲突（每个 NAR 使用独立的 ClassLoader）。\n\n自定义连接器开发步骤：1）实现 Source<T> 或 Sink<T> 接口。2）配置 META-INF/services 和 pulsar-io.yml。3）使用 mvn package -P nar 打包为 NAR 文件。4）通过 pulsar-admin connectors create 命令上传到 Pulsar 集群。5）通过 Pulsar Functions Worker 执行。',
      ['NAR 文件通过独立 ClassLoader 避免依赖冲突', 'Pulsar 内置的 Debezium Source 可以直接捕获 MySQL 和 PostgreSQL 变更事件'],
      ['Pulsar', 'IO', 'Source', 'Sink']),

    q('mq', 'hard', 'short_answer',
      '消息队列 Kubernetes 部署：Strimzi 与 Operator 模式',
      '在 Kubernetes 上部署消息队列的常用方案有哪些？Strimzi（Kafka Operator）如何管理 Kafka 集群？RabbitMQ Operator 和 Pulsar Helm Chart 的部署架构各有什么特点？有状态应用在 K8s 上的存储和网络注意事项有哪些？',
      'Kubernetes 上部署消息队列，主流方案包括每个 MQ 对应的 Operator/Helm Chart：\n\nStrimzi（Kafka Operator）：Strimzi 使用 Custom Resource Definitions（CRD）扩展 Kubernetes API，管理 Kafka 集群的完整生命周期。核心 CRD 包括：1）Kafka——定义 Kafka + ZooKeeper 集群规格（版本、存储、副本数、资源限制）。2）KafkaTopic——管理 Topic 的创建和分区配置。3）KafkaUser——管理用户认证（TLS/SCRAM-SHA-512）和 ACL 权限。4）KafkaConnect/KafkaConnector——管理 Kafka Connect 集群和任务。5）KafkaRebalance——触发 Cruise Control 的分区重平衡。Strimzi Cluster Operator 自动处理：集群滚动升级、Broker 故障恢复、持久卷的 PVC 重建和数据迁移、监听器配置（NodePort/LoadBalancer/Ingress）、监控集成（Prometheus 指标暴露）。\n\nRabbitMQ Operator（VMware/Broadcom 维护）：核心 CRD：1）RabbitmqCluster——定义 RabbitMQ 集群规格（副本数、内存/磁盘限制、TLS 配置）。2）RabbitmqExchange/RabbitmqQueue/RabbitmqBinding/RabbitmqPolicy——通过 CRD 管理 AMQP 对象（无需手动 rabbitmqctl）。Operator 自动处理：集群自动形成（基于 Erlang Cookie Secret）、持久卷管理、Prometheus Exporter 集成、故障 Pod 自动重建。\n\nPulsar Helm Chart（StreamNative/Official）：使用 Helm 部署完整的 Pulsar 集群，包括：BookKeeper 集群（bookie StatefulSet）、Broker 集群（Deployment）、ZooKeeper 集群（StatefulSet）、Proxy 层（Deployment）、Pulsar Functions Worker。关键配置：每个组件的存储（BookKeeper 使用 journal/ledger 双盘分离）、BookKeeper 节点自动恢复（Auto Recovery Daemon）、计算与存储分离带来的独立扩缩容能力。\n\n有状态应用 K8s 注意事项：1）存储——使用 StatefulSet（稳定网络标识和顺序启动），PVC 模板必须指定 StorageClass（推荐 SSD 类如 gp3）。2）网络——Headless Service 保证稳定的 DNS 名称。3）资源隔离——使用 Pod Anti-Affinity 分散到不同节点。4）备份——Velero 定期备份 PVC。5）监控——Prometheus Operator + ServiceMonitor 自动发现服务。\n\n存储性能优化：1）Kafka 在 K8s 上推荐使用本地 SSD 或高性能云盘（如 AWS gp3 或 i3 实例的本地 NVMe）。2）BookKeeper 的 journal 和 ledger 使用不同磁盘（journal 使用更高 IOPS 的磁盘）。3）使用 K8s Topology Spread Constraints 将 BookKeeper bookie 分布到不同可用区。4）监控 PersistentVolume 的 IOPS 和延迟，确保不会成为瓶颈。\n\n资源规划建议：Kafka Broker 分配 8-16GB 堆外内存（页缓存），CPU 预留 2-4 核。BookKeeper 的 bookie 需要 16GB+ 内存用于读缓存。RabbitMQ 节点内存上限设置为总内存的 40%（剩余给 Erlang 虚拟机）。Pulsar Broker 的无状态特性使其更适配 K8s 弹性扩缩容场景。',
      ['Strimzi 使用 CRD 将 Kafka 集群管理抽象为 Kubernetes 原生的资源定义', 'BookKeeper 在 K8s 上需要 journal 和 ledger 的磁盘分离配置'],
      ['Kubernetes', 'Strimzi', 'Operator', 'Kafka']),

    q('mq', 'hard', 'short_answer',
      'MQ 消息顺序保证：分区键设计与全局有序方案',
      'Kafka 如何保证分区内的消息顺序？分区键（Partition Key）的设计原则是什么？Kafka 默认分区器的策略有哪些？全局顺序消息有哪些实现方案和代价？RocketMQ 和 RabbitMQ 的顺序消息机制与 Kafka 有何不同？',
      'Kafka 消息顺序保证：Kafka 保证单个分区内消息的顺序（消息按写入顺序追加到 Log 尾部，Consumer 按 offset 顺序读取）。跨分区不保证顺序。Producer 端保证：在单个 Producer Session 内，同一分区的消息按发送顺序写入。如果启用幂等性，还保证重试不会导致乱序。\n\n分区键（Partition Key）设计原则：1）需要保序的消息使用相同 Key（如 order_id 让同一订单的所有消息进入同一分区）。2）Key 的分布决定分区的负载均衡（Key 过于集中导致数据倾斜）。3）Key 为空时使用轮询分配（无顺序保证）。4）复合 Key 设计——使用高位作为分区键，低位作为业务标识。\n\nKafka 分区器策略：1）DefaultPartitioner——Key 不为空时对分区数取哈希（murmur2 哈希），Key 为空时轮询。2）UniformStickyPartitioner（Kafka 2.4+ 默认）——Key 为空时批量粘性分配到同一分区（提高批次效率）。3）RoundRobinPartitioner——每个消息轮询分配。4）自定义 Partitioner——实现 Partitioner 接口，支持基于业务逻辑的路由。\n\n全局有序方案：1）单分区 Topic——所有消息写入一个分区，确保全局有序（牺牲吞吐量，适合小流量场景）。2）分区排序 + 全局合并——每个分区内有序，消费者端使用 Priority Queue 合并流。3）基于时间戳的全局排序——Broker 端按时间戳排序（Kafka 不原生支持）。\n\nRocketMQ：默认不保证顺序，但提供 MessageQueueSelector 接口。生产者实现 select 方法（如 SelectMessageQueueByHash），将相同业务 Key 的消息发送到同一 MessageQueue。消费者使用 MessageListenerOrderly（加锁消费），确保同一 Queue 的消息顺序消费。\n\nRabbitMQ：本身不保证消费顺序（多个 Consumer 竞争消费）。如果需要顺序，只能使用单 Consumer + single-active-consumer 模式，但影响吞吐量。',
      ['相同 Key 的消息进入同一分区是 Kafka 保序的核心设计', '全局有序必须以牺牲吞吐量为代价——单分区方案上限受限于单个 Broker'],
      ['MQ', '顺序保证', '分区键', 'Partitioner']),

    q('mq', 'medium', 'short_answer',
      'MQ 重试策略设计：指数退避与重试主题模式',
      '消息消费失败时如何处理重试？指数退避（Exponential Backoff）的重试间隔如何设计？最大重试次数和死信策略如何配置？如何通过重试主题（Retry Topic）实现异步重试？重试风暴如何避免？',
      '消息消费失败的重试处理分同步重试和异步重试两种模式：\n\n同步重试：Consumer 捕获异常后在消费逻辑内直接 sleep 重试。问题：阻塞 Consumer 线程导致分区消费暂停，影响整体吞吐量。适用于瞬态错误（如网络抖动），但不适合长时间重试。\n\n指数退避重试间隔设计：每次重试间隔呈指数增长，避免重试风暴。经典公式：delay = initial_delay * (backoff_multiplier ^ attempt)。常用配置：1）initial_delay=1s（首次重试延迟 1 秒）。2）max_delay=60s（最大间隔不超过 60 秒）。3）backoff_multiplier=2（每次翻倍）。4）加入随机抖动（jitter）防止多个实例同时重试。\n\n重试主题模式（Kafka/通用）：1）为业务 Topic（如 orders）创建对应的重试 Topic（orders_retry）和死信 Topic（orders_dlt）。2）Consumer 消费失败后，将消息发送到重试 Topic（附加重试次数 Header 和下次投递时间）。3）延迟消费——Consumer 读取到重试消息时，检查下次投递时间，未到则暂停消费或 Seek 到其他分区。\n\nRabbitMQ 重试方案：1）延迟重试——消息消费失败后发布到延迟队列（使用 rabbitmq_delayed_message_exchange 插件），TTL 到期后回到原队列。2）Retry + Dead Letter——消息写回原 Exchange 并设置 x-delay Header。3）最大重试次数后，通过 DLX（Dead Letter Exchange）进入死信队列。\n\nRocketMQ 重试机制：1）Consumer 默认支持 16 级重试延迟（1s、5s、10s、30s、1m、2m、3m、4m、5m、6m、7m、8m、9m、10m、20m、30m、1h、2h）。2）重试消息存储在 %RETRY%{consumerGroup} Topic。3）超过最大重试次数后进入 %DLQ%{consumerGroup} 死信队列。\n\n避免重试风暴：1）限流——Broker 端限制重试消息的投递速率。2）Circuit Breaker——连续失败时短暂关闭消费，等待系统恢复。3）重试消息去重——相同的失败消息避免重复重试。4）最大重试次数硬限制（通常 16 次或 24 次）。',
      ['指数退避配合随机抖动（jitter）是避免重试风暴的关键设计', 'RabbitMQ 结合 x-delay 消息和 DLX 实现异步延迟重试'],
      ['MQ', '重试', '指数退避', '死信']),

    q('mq', 'hard', 'short_answer',
      'Kafka 日志压缩机制：Log Cleaner 与 Tombstone 详解',
      'Kafka 日志压缩的目的是什么？Log Cleaner 的后台线程如何工作？Tombstone 记录的作用是什么？delete 和 compact 两种清理策略如何配合使用？日志压缩的使用场景有哪些？如何监控和优化压缩性能？',
      'Kafka 日志压缩（Log Compaction）是一种保留 Key 最新值而非保留所有历史消息的日志清理策略。不同于 delete 策略（按时间/大小删除），compact 为每个 Key 只保留最新的消息（更早的同 Key 消息被清理）。\n\nLog Cleaner 后台线程：Broker 启动一组后台线程（通过 log.cleaner.threads 配置，默认 1 个），专门执行日志压缩。工作流程：1）选择待压缩的 Log Segment——Cleaner 周期性扫描分区 Log，选择 dirty ratio（脏数据比例）超过 log.cleaner.min.cleanable.ratio（默认 0.5）的 Segment。2）构建 Key 哈希索引——Cleaner 遍历 Log 尾部的最新 Segment（干净区域）建立 Key->Offset 的哈希表。3）清理旧 Segment——遍历待压缩的 Segment，对每条消息检查 Key 是否在哈希表中：如果 Key 在哈希表中且 offset 小于哈希表中的 offset（说明有更新的版本），则丢弃该消息；否则保留。4）生成新的 Segment——将保留的消息写入新的 Segment 文件，替换原来的 Segment。\n\nTombstone 记录：值为 null 的消息（key=某值，value=null）作为 Tombstone 标记。Tombstone 告诉 Log Cleaner：这个 Key 的数据已被删除。配置 log.cleaner.delete.retention.ms（默认 24 小时）控制 Tombstone 保留时间，之后才会被真正清理。删除流程：写一条 Tombstone -> 消费者读取后知道 Key 已被删除 -> 超过 delete.retention.ms 后 Cleaner 移除该 Key 的消息和 Tombstone。\n\ndelete vs compact 配合：可以同时设置 cleanup.policy=compact,delete。先按 compact 策略保留 Key 最新值，再按 delete 策略的保留时间/大小删除过期 Segment。配置示例：cleanup.policy=[compact,delete]、retention.ms=7 天、delete.retention.ms=1 天。\n\n使用场景：1）Kafka Streams 状态存储的 changelog Topic（key-value 状态恢复）。2）用户画像/配置变更 Topic（只关心最新值）。3）查找表同步（数据库变更事件流）。4）Schema Registry 的 _schemas Topic（存储所有 Schema 版本）。\n\n性能监控指标：max-dirty-percent（脏数据比例，超过 50% 建议增加 Cleaner 线程）。cleaner-recidivism-rate（Cleaner 重新清理率，高说明压缩策略不合理）。优化：增加 log.cleaner.threads（磁盘 IO 够用的情况下）。调整 log.cleaner.io.max.bytes.per.second（限制 Cleaner IO 带宽）。',
      ['Tombstone 消息在 delete.retention.ms 之后才会被 Log Cleaner 真正移除', 'compact 策略适合 key-value 更新频繁且只需保留最新值的场景'],
      ['Kafka', '日志压缩', 'Log Compaction', 'Tombstone']),

    q('mq', 'medium', 'short_answer',
      'MQ Prometheus 监控：核心指标与告警规则设计',
      'Kafka、RabbitMQ、RocketMQ 和 Pulsar 各自需要监控哪些核心指标？Prometheus JMX Exporter 和各 MQ 的原生 Exporter 如何配置？Grafana 上有哪些推荐的 Dashboard？关键告警规则如何设计？',
      '各 MQ 对应的 Prometheus Exporter 和核心指标：\n\nKafka（JMX Exporter + Kafka Exporter）：1）Broker 指标——kafka.server:type=BrokerTopicMetrics——BytesInPerSec、BytesOutPerSec、MessagesInPerSec。2）分区指标——kafka.server:type=ReplicaManager——UnderReplicatedPartitions（关键告警指标）、UnderMinIsrPartitionCount、OfflineReplicasCount。3）消费者指标——kafka.consumer:type=consumer-fetch-manager-metrics——RecordsLagMax（最大消费延迟）、RecordsLag。4）磁盘指标——kafka.log:type=Log——Size、NumberOfSegments。\n\nRabbitMQ（rabbitmq-prometheus Exporter，内置 3.8+）：1）队列指标——rabbitmq_queue_messages_ready（待消费消息数）、rabbitmq_queue_messages_unacked（未确认消息数）、rabbitmq_queue_process_memory。2）节点指标——rabbitmq_node_mem_used（内存使用）、rabbitmq_node_disk_free（磁盘空间）、rabbitmq_node_fd_used（文件描述符使用）。3）连接指标——rabbitmq_connections_open。\n\nRocketMQ（RocketMQ Exporter）：1）Broker 指标——Tps、Qps、CpuUsage、MemoryUsage。2）消费指标——ConsumerLag（消费积压）、ConsumeTps。3）存储指标——DiskUsage、CommitLogDiff。\n\nPulsar（内置 Prometheus Metrics，HTTP 端口 8080/metrics）：1）BookKeeper 指标——bookie_storage_entries_count、bookie_journal_journal_queue_size。2）Broker 指标——pulsar_broker_topics_count、pulsar_broger_subscriptions_count。3）消息指标——pulsar_rate_in/pulsar_rate_out、pulsar_storage_size。4）延迟指标——pulsar_consumer_backlog。\n\nGrafana Dashboard：Kafka——Dashboard ID 7589（Prometheus 版）或 12225（Kafka Exporter）。RabbitMQ——Dashboard ID 10991（官方推荐）。\n\n关键告警规则：1）UnderReplicatedPartitions > 0 持续超过 5 分钟——副本同步异常，P1 告警。2）OfflineLogDirectoryCount > 0——磁盘故障，P0 告警。3）ConsumerGroup_Lag > 阈值（根据业务容忍度）——消费积压，P2 告警。4）Kafka 磁盘使用率 > 85%——存储预警。5）RabbitMQ 内存使用率 > 80%（触发 Flow Control 前）——内存告警。6）RabbitMQ 磁盘剩余 < 20%——磁盘告警。',
      ['UnderReplicatedPartitions > 0 持续超过 5 分钟是 Kafka 集群健康的核心告警', 'RabbitMQ 内存超过 80% 将触发 Flow Control 机制影响生产消费'],
      ['MQ', 'Prometheus', '监控', 'Grafana']),

    q('mq', 'medium', 'short_answer',
      'MQ 基准测试方法与工具：吞吐量与延迟测量',
      'MQ 基准测试的主要目的是什么？常用的测试工具（Apache JMeter、Kafka 自带压测工具、OpenMessaging Benchmark）如何使用？吞吐量（Throughput）和延迟（Latency）如何衡量？测试时常见的坑有哪些？',
      'MQ 基准测试的核心目的是评估系统在特定负载下的吞吐量、延迟和资源消耗，为容量规划和选型提供数据支持。\n\nKafka 自带工具：1）kafka-producer-perf-test.sh——测试生产者性能。参数：--topic（Topic 名称）、--num-records（消息总数）、--record-size（消息体大小如 1024 字节）、--throughput（目标吞吐量上限，-1 不限）、--producer-props（生产者配置如 acks=all、compression.type=snappy）。输出：发送总条数、总 MB、吞吐量 MB/s、平均延迟 ms、最大延迟 ms、分位延迟（50th/95th/99th/99.9th）。2）kafka-consumer-perf-test.sh——测试消费者性能。\n\nApache JMeter：通过 JMeter 插件（如 JMeter Kafka Plugin 或 RabbitMQ Sampler）执行 MQ 测试。配置步骤：1）创建 Thread Group 模拟并发用户。2）添加 Kafka Producer Sampler（配置 Broker 地址、Topic、消息 Key/Value、acks）。3）添加监听器（聚合报告、延迟分布图、TPS 折线图）。4）分布式执行（JMeter Master-Slave 模式产生更大压力）。\n\nOpenMessaging Benchmark（Linux Foundation 项目）：支持 Kafka、Pulsar、RocketMQ、RabbitMQ 的统一基准测试框架。特性：1）声明式配置（定义 Topic 数、分区数、Producer/Consumer 数等）。2）自动收集延迟分位值（P50/P99/P999）和吞吐量。3）生成标准化报告（HTML 格式）。4）支持多阶段测试。\n\n测试指标分析：1）吞吐量——消息数/秒（msg/s）或 MB/秒。2）延迟——平均延迟、P99、P999（99.9% 的消息延迟在此值以下）。3）P99/P999 与平均值的比值越大说明延迟抖动越严重。4）拐点分析——找到吞吐量增长但延迟突然上升的点（系统瓶颈点）。\n\n常见坑：1）同机测试——Producer 和 Broker 在同一台机器会互相干扰。2）预热缺失——JVM 需要预热（建议先发送 10 万条消息热身）。3）单次测试——至少跑 3 次取平均值。4）客户端和服务端资源隔离不足。5）消息体大小不真实——生产环境的平均消息大小应作为基准。',
      ['Kafka 自带的 kafka-producer-perf-test.sh 是最直接的生产者性能测试工具', 'P99 和 P999 延迟比平均延迟更能反映系统的稳定性问题'],
      ['MQ', '基准测试', 'JMeter', '吞吐量']),

    q('mq', 'medium', 'short_answer',
      'RabbitMQ Shovel 插件配置与动态管理',
      'RabbitMQ Shovel 插件的作用是什么？静态 Shovel 和动态 Shovel 有什么区别？Shovel 的配置项包括哪些？Shovel 在消息迁移中的典型应用场景是什么？Shovel 与 Federation 的适用场景有何不同？',
      'RabbitMQ Shovel 是一个插件（rabbitmq_shovel + rabbitmq_shovel_management），用于在 RabbitMQ 集群或 Broker 之间可靠地传输消息。Shovel 以 AMQP Consumer 角色从源队列拉取消息，再以 AMQP Producer 角色将消息发布到目标 Exchange 或 Queue。\n\n静态 Shovel vs 动态 Shovel：1）静态 Shovel——在 rabbitmq.config 或 advanced.config 文件中定义，启动时加载。配置格式为 Erlang Term（.config 文件中的 rabbitmq_shovel 部分）。缺点：修改配置需要重启 RabbitMQ 节点。2）动态 Shovel——通过 rabbitmqctl 命令行或 Management UI 创建和管理，运行时生效。命令示例：rabbitmqctl set_parameter shovel my_shovel {"src-protocol": "amqp091", "src-uri": "amqp://source-host:5672", "src-queue": "source-queue", "dest-protocol": "amqp091", "dest-uri": "amqp://dest-host:5672", "dest-queue": "dest-queue"}——支持 Management HTTP API（PUT /parameters/shovel/{vhost}/{name}）进行创建和更新。\n\n关键配置项：src-uri/src-protocol/src-queue/src-exchange（源端配置）。dest-uri/dest-protocol/dest-queue/dest-exchange（目标端配置）。reconnect-delay（重连延迟，默认 5 秒）。ack-mode（确认模式：no-ack/on-confirm/on-publish，推荐 on-confirm）。add-forward-headers（是否添加 Shovel 转发头信息）。prefetch-count（预取数量，影响吞吐量）。\n\n典型应用场景：1）集群迁移——零停机将消息从旧集群迁移到新集群。2）跨数据中心复制——在企业内网跨机房传输消息。3）消息路由——将特定队列的消息转发到另一个集群的目标 Exchange。4）协议桥接——AMQP 0-9-1 到 AMQP 1.0 的协议转换（src-protocol 和 dest-protocol 可不同）。\n\nShovel 监控和管理：1）rabbitmqctl eval 命令可以列出所有运行中的 Shovel 状态（源队列、目标队列、消息速率）。2）Management UI 的 Admin -> Shovel Management 页面可视化查看 Shovel 状态。3）关键监控指标：Shovel 连接状态（running/terminated）、消息确认速率、重连次数。4）Shovel 状态 GET API——GET /api/parameters/shovel/{vhost}/{name} 获取 Shovel 配置和状态。5）Shovel 错误处理：源队列或目标队列不可用时 Shovel 会自动重连（根据 reconnect-delay 配置）。如果持续失败，Shovel 状态变为 terminated 但不影响 RabbitMQ 节点运行。\n\nShovel vs Federation：Shovel 是点对点传输（精准控制单条消息的去向）。Federation 是广播模式（一个 Upstream Exchange 分发到多个 Downstream）。Shovel 支持协议桥接（0-9-1 和 1.0 互转）。Federation 更适合 Exchange 级别拓扑同步的场景。Shovel 配置更精细但维护成本更高。\n\nShovel 限制与注意事项：1）Shovel 是单线程模型（一个 Shovel 实例顺序处理消息），高吞吐场景需要多个 Shovel 实例并行。2）Shovel 不保证端到端的 Exactly-Once 投递（但 ack-mode=on-confirm 保证 At-Least-Once）。3）Shovel 连接需要网络双通（源端到目标端网络可达）。4）大量 Shovel 实例会增加管理复杂度，建议使用 Federation 替代广播场景。',
      ['动态 Shovel 通过 rabbitmqctl set_parameter 运行时创建，无需重启节点', 'Shovel 的 ack-mode=on-confirm 保证消息不丢失'],
      ['RabbitMQ', 'Shovel', '插件', '消息转发']),

    q('mq', 'medium', 'short_answer',
      '消息队列路由机制：Topic Exchange 与路由键绑定规则',
      'RabbitMQ 的 Topic Exchange 如何进行消息路由？routing key 和 binding key 的匹配规则是什么（包括通配符 * 和 #）？Kafka 和 RocketMQ 的路由机制与 RabbitMQ 有何不同？如何设计高效的路由键模式？',
      'RabbitMQ Topic Exchange 是消息路由的核心组件，根据 routing key 的匹配规则将消息分发到一个或多个绑定的队列。\n\n基本概念：1）routing key——消息附带的标签，由点号分隔的单词列表组成（如 order.created.cn_shanghai）。2）binding key——队列绑定到 Exchange 时指定的过滤模式，支持通配符。\n\n通配符规则：1）*（星号）——精确匹配一个单词。示例：binding key order.*.cn_shanghai 匹配 order.created.cn_shanghai 和 order.paid.cn_shanghai，但不匹配 order.created.cn_shanghai.user。2）#（井号）——匹配零个或多个单词。示例：order.# 匹配 order、order.created、order.created.cn_shanghai 任意层级。3）不带通配符的 binding key 等同于 Direct Exchange（完全匹配 routing key）。\n\n路由匹配算法：Exchange 对每个消息计算 routing key，遍历所有绑定规则，找到匹配的队列集合。匹配成功的消息被复制到所有匹配的队列（Fanout 风格分发）。性能注意事项：通配符 # 的匹配范围广但搜索效率低（大量 # 规则影响 Exchange 路由性能）。建议将 # 放在 binding key 的开头或结尾而非中间。\n\nKafka 路由机制：Kafka 没有 Exchange 和 Binding 概念。Producer 通过 Partitioner 将消息路由到指定分区（基于 Key 哈希或自定义策略）。Consumer 通过订阅 Topic 消费所有分区。Kafka 的过滤在 Consumer 端而非 Broker 端。\n\nRocketMQ 路由机制：1）Tag 过滤——Producer 发送消息时指定 Tag，Consumer 订阅时指定 Tag 表达式（如 tag1 || tag2）。Broker 端过滤（减少网络传输量）。2）SQL92 过滤——基于消息属性（Headers）的 SQL 表达式过滤（如 a > 5 AND b IS NOT NULL），Broker 端执行。3）MessageQueue 选择——通过 MessageQueueSelector 路由到特定 Queue。\n\n高效路由键模式设计原则：1）层级不要过深（建议 3-5 个层级）。2）从通用到具体排列（如 event.region.datacenter）。3）避免在 binding key 中使用多个 #（性能差）。4）利用通配符实现灵活的订阅模式。',
      ['RabbitMQ 的 # 通配符匹配零到多个单词，* 匹配恰好一个单词', 'RocketMQ 支持 Broker 端 Tag 过滤减少网络传输量'],
      ['MQ', '路由', 'Topic Exchange', '绑定']),

    q('mq', 'hard', 'short_answer',
      'Kafka 精确一次语义深究：事务性生产者与幂等性',
      'Kafka 幂等生产者（Idempotent Producer）的原理是什么？事务性生产者的工作流程包括哪些步骤？Transaction Coordinator 和 Transaction Log 如何运作？EOS（Exactly-Once Semantics）在消费端如何实现？Kafka EOS 的局限性和注意事项有哪些？',
      'Kafka 精确一次语义（EOS）通过幂等生产者和事务性生产者两层机制实现。\n\n幂等生产者（Idempotent Producer，Kafka 0.11+）：1）Producer 设置 enable.idempotence=true。2）每个 Producer Session 分配唯一的 Producer ID（PID）。3）每个消息带一个序列号（从 0 开始递增）。4）Broker 端检测序列号——如果收到相同序列号的消息，说明是重复发送，直接返回成功（去重）。5）如果序列号不连续（跳号），Broker 检测到数据丢失，返回 OutOfOrderSequenceException。\n\n事务性生产者：1）初始化事务——Producer 调用 initTransactions()，向 Transaction Coordinator（TC）注册。2）TC——每个 Topic 的 __transaction_state 分区对应一个 TC（类似 Group Coordinator）。3）开始事务——调用 beginTransaction()，在内存中标记事务开始。4）发送消息——正常发送消息到目标 Topic。5）发送 Offset Commit——将消费偏移量作为事务的一部分提交到 __consumer_offsets。6）提交事务——调用 commitTransaction()，TC 将 PREPARE_COMMIT 写入 Transaction Log（3 阶段提交：PREPARE -> COMMIT -> 完成）。7）中止——调用 abortTransaction()，写入 PREPARE_ABORT，Broker 端丢弃该事务的消息。\n\nTransaction Coordinator 和 Transaction Log：每个 Broker 可以负责部分 __transaction_state 分区的 TC（通过 transaction.state.log.replication.factor 配置副本数）。Transaction Log 记录每个事务的当前状态（EMPTY/ONGOING/PREPARE_COMMIT/COMPLETED/PREPARE_ABORT）。TC 使用类似 ZooKeeper 的 Leader/Follower 复制保证 Transaction Log 的高可用。TC 故障时，新的 TC 从 Transaction Log 恢复所有 pending 事务状态。\n\n消费端 EOS：1）使用 isolation.level=read_committed（Consumer 只读取已提交事务的消息）。2）消费端偏移量提交作为事务的一部分（原子写-读-提交）。3）Kafka Streams 的 exactly-once 保证：从源 Topic 读取 -> 状态存储更新 -> 写到输出 Topic 全部在一个事务中完成。\n\n局限性和注意事项：1）事务影响性能——事务协调开销增加延迟（约 1-2ms）。2）每个 Producer Session 的 PID 状态在内存中，重启后丢失（跨 Session 可能重复）。3）事务超时（transaction.timeout.ms，默认 60 秒）——超时自动中止事务。4）Pending 事务阻塞消费——如果事务提交延迟，未提交的消息不可见（read_committed Consumer 会阻塞）。5）Kafka EOS 保证的是不丢不重，但跨系统的一致性需要外部幂等性配合（如数据库的唯一索引）。',
      ['幂等生产者通过 PID + 序列号实现单 Session 单分区内的 Exactly-Once', 'read_committed 隔离级别确保 Consumer 只读取已提交事务的消息'],
      ['Kafka', 'Exactly-Once', '事务', '幂等']),
]

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(DATA_DIR, 'mq.json')
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

existing = {q['title'] for q in data}
added = 0
for qq in NEW:
    if qq['title'] not in existing:
        data.append(qq)
        added += 1

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f'Added {added} questions')
print(f'Total mq questions: {len(data)}')
