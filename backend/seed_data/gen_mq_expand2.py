#!/usr/bin/env python3
"""Expand mq.json from 39 to ~50 questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('mq', 'medium', '问答', 'Kafka Topic 设计：分区数、副本因子与保留策略',
      '讨论 Kafka Topic 的核心设计参数。分区数如何影响吞吐量和消费者并发？副本因子（Replication Factor）与 ISR 的关系。日志保留策略（retention.ms/bytes/compact）的选择。如何根据业务场景规划 Topic 的配置？',
      'Topic 设计参数：\n\n1. **分区数**：\n   - 影响最大消费者并发（消费者数 ≤ 分区数）\n   - 影响 broker 的 leader 均衡和文件句柄\n   - 公式：分区数 ≥ 期望吞吐量 / 单分区吞吐量\n   - 建议：流量低的可先设 3-6，后续可扩容\n\n2. **副本因子**：\n   - 2：可容忍 1 个 broker 故障\n   - 3：生产推荐（容忍 1 个，同时做维护）\n   - ISR（In-Sync Replica）：同步副本集合\n   - min.insync.replicas + acks=all 保证写入一致性\n\n3. **保留策略**：\n   - **delete**（按时间/大小删除）：retention.ms（默认 7 天）、retention.bytes\n   - **compact**（按 key 保留最新值）：cleanup.policy=compact\n   - **delete+compact**：先 compact 再按时间删除\n\n4. **其他参数**：\n   - max.message.bytes：单消息大小限制\n   - file.delete.delay.ms：删除延迟',
      ['分区数 = 吞吐 / 单分区吞吐，同时限制最大消费者数', '副本因子 3 + min.insync.replicas=2 + acks=all 是黄金组合', 'retention.ms（delete）与 cleanup.policy=compact 可组合使用'], ['kafka', 'topic-design']),

    q('mq', 'medium', '问答', 'RocketMQ 消息过滤机制',
      '介绍 RocketMQ 的消息过滤方式。Tag 过滤和 SQL 表达式过滤（SQL92）的区别和实现原理。Message Filter 在 Broker 端和 Consumer 端的过滤策略。如何设计高效的过滤方案来减少不必要的网络传输？',
      'RocketMQ 消息过滤：\n\n1. **Tag 过滤**：\n   - Consumer 订阅时指定 Tag（如 TagA || TagB）\n   - Broker 端比较消息 Tag 和订阅 Tag\n   - 简单、高效、适合少量分类\n   - 局限：不支持复杂逻辑、不能动态变更\n\n2. **SQL 表达式过滤**：\n   - 基于消息属性（Properties）的 SQL92 表达式\n   - 语法：TAGS IS NOT NULL AND TAGS IN (\'TagA\',\'TagB\') AND age > 18\n   - Broker 端解析表达式匹配\n   - **实现**：每条消息的属性被过滤器评估\n\n3. **过滤位置**：\n   - **Broker 端过滤**：在 Broker 端完成过滤 → 只返回匹配消息\n   - **Consumer 端过滤**：所有消息推给 Consumer，在客户端过滤\n   - 推荐 Broker 端过滤（减少网络传输）\n\n4. **设计建议**：\n   - 简单分类用 Tag（性能更好）\n   - 复杂条件用 SQL92 过滤\n   - 创建多个 Topic 代替过于复杂的过滤条件',
      ['Tag 过滤简单高效适合少量分类，SQL92 过滤支持复杂条件', 'Broker 端过滤减少网络传输比 Consumer 端过滤更优', '多个 Topic + Tag 组合是最灵活的设计方式'], ['rocketmq', 'message-filtering']),

    q('mq', 'medium', '问答', '消息队列中的批量操作与压缩策略',
      '讨论消息队列中的批量生产、批量消费和消息压缩策略。Kafka 的批次发送（batch.size/linger.ms）和压缩（gzip/snappy/lz4/zstd）。批量消费的权衡：提高吞吐量 vs 增加延迟和内存开销。如何选择压缩算法？',
      '批量和压缩策略：\n\n1. **批量生产**：\n   - **Kafka**：batch.size + linger.ms 控制批次大小和等待时间\n   - **RocketMQ**：批量发送接口（同一 Topic 的多个消息合并发送）\n   - **RabbitMQ**：批量确认（basic.nack/basic.ack 批量确认）\n   - 权衡：批次越大吞吐越好，但延迟越高\n\n2. **批量消费**：\n   - max.poll.records（Kafka）：单次拉取的最大消息数\n   - 批量处理后批量提交 offset\n   - **优势**：减少 IO 次数、批量 DB 写入效率高\n   - **风险**：处理一批的时间过长 → rebalance 超时、offset 提交延迟\n\n3. **压缩算法**：\n   - **gzip**：压缩率高但 CPU 开销大\n   - **snappy/lz4**：压缩率中等、速度快（推荐）\n   - **zstd**：压缩率最高、速度可接受（Kafka 2.1+）\n   - 选择：网络瓶颈选 zstd、CPU 瓶颈选 lz4\n\n4. **Kafka 端到端压缩**：\n   - Producer 端压缩 → Broker 端保持压缩 → Consumer 端解压\n   - Broker 端可以重新压缩（producer 和 broker 压缩算法不一致时）',
      ['batch.size + linger.ms 平衡吞吐和延迟', 'lz4/zstd 是 Kafka 压缩的最佳选择', '批量消费时注意处理超时和 offset 提交时机'], ['mq', 'batching', 'compression']),

    q('mq', 'medium', '问答', 'RocketMQ 主从同步与高可用架构',
      '说明 RocketMQ 的主从（Master-Slave）同步机制和 DLedger（Raft）高可用方案。对比异步复制和同步复制的数据安全性和性能差异。DLedger 在 Broker 组内的自动选主和故障转移流程。主从模式下读写分离的设计。',
      'RocketMQ 高可用：\n\n1. **传统主从（Master-Slave）**：\n   - Master 处理写请求，Slave 从 Master 同步\n   - **同步复制**：消息写入 Master 和至少一个 Slave 才返回\n   - **异步复制**：消息写入 Master 立即返回，Slave 异步拉取\n   - 故障切换：需要人工或 NameServer 感知\n\n2. **DLedger（Raft）**：\n   - 基于 Raft 协议自动选主\n   - 3 节点组容忍 1 节点故障\n   - 写请求需要多数派确认（leader + follower）\n   - 故障自动切换：leader 不可用 → 其他节点选举新 leader\n\n3. **读写分离**：\n   - 读请求可以分发到 Slave 节点\n   - 适合读多写少的场景\n   - 注意：Slave 数据可能有延迟\n   - 配置：brokerRole=ASYNC_MASTER 或 SYNC_MASTER\n\n4. **对比**：\n   - 传统模式：配置简单、灵活部署\n   - DLedger：自动故障转移、强一致\n   - 推荐：生产环境使用 DLedger',
      ['同步复制保证零丢失但降低吞吐，异步复制有丢失窗口但性能好', 'DLedger 基于 Raft 实现自动选主和故障转移', '读写分离需要容忍 Slave 的数据延迟'], ['rocketmq', 'high-availability']),

    q('mq', 'hard', '问答', '消息队列的事务消息实现对比',
      '比较 Kafka 和 RocketMQ 的事务消息实现。RocketMQ 的半消息（Half Message）机制和事务回查（Transaction Checkback）。Kafka 的事务 API（InitTransactions/CommitTransaction）与事务协调器。两种方案的设计哲学差异和适用场景。',
      '事务消息对比：\n\n1. **RocketMQ 事务消息**：\n   - 发送半消息（Half Message）→ 执行本地事务 → COMMIT/ROLLBACK\n   - **半消息**：对消费者不可见，暂存到 RMQ_SYS_TRANS_HALF_TOPIC\n   - **回查机制**：Broker 反查 Producer 确定最终状态\n   - 回查间隔：默认 60 秒，最多 15 次\n\n2. **Kafka 事务 API**：\n   - InitTransactions（初始化）→ BeginTransaction → 发消息 + commit offset → Commit\n   - **事务协调器**：Transaction Coordinator 管理事务状态\n   - **隔离级别**：read_committed 消费者只看到已提交消息\n   - **控制消息**：在 log 中添加 COMMIT/ABORT 标记\n\n3. **设计哲学差异**：\n   - RocketMQ：让 Producer 最终确认事务结果（回查）\n   - Kafka：基于日志协议的事务日志（类似数据库 WAL）\n\n4. **适用场景**：\n   - RocketMQ 事务消息：业务解耦（订单→支付→库存）\n   - Kafka EOS：流处理精确一次（Kafka Streams Exactly-Once）\n   - 两者都需要幂等消费端配合',
      ['RocketMQ 事务消息用半消息 + 回查机制，Kafka 用事务协调器 + 日志标记', 'RocketMQ 适合业务事务，Kafka EOS 适合流处理', '两者都需要消费端幂等'], ['mq', 'transactional-message']),

    q('mq', 'medium', '问答', '消息队列与微服务集成的 Saga 模式',
      '讨论 MQ 在微服务 Saga 事务模式中的应用。Choreography-based Saga（编排式）基于 MQ 事件驱动的实现。Order-Service → Payment-Service → Inventory-Service 的完整 Saga 流程。补偿事务（Compensating Transaction）的设计和 MQ 重试机制。',
      'MQ + Saga：\n\n1. **Choreography Saga 流程**：\n   - Order 创建订单 → 发 OrderCreated 事件到 MQ\n   - Payment 消费 OrderCreated → 扣款 → 发 PaymentCompleted 事件\n   - Inventory 消费 PaymentCompleted → 扣库存 → 发 InventoryUpdated 事件\n   - 全部完成 → Saga 成功\n\n2. **补偿流程**：\n   - Inventory 扣库存失败 → 发 InventoryFailed 事件\n   - Payment 消费 InventoryFailed → 退款 → 发 PaymentRefunded 事件\n   - Order 消费 PaymentRefunded → 取消订单\n\n3. **MQ 在 Saga 中的关键作用**：\n   - 事件驱动解耦：每个服务只关注自己相关的事件\n   - 异步：Saga 不阻塞主流程\n   - 重试：通过 MQ 重试消费处理临时故障\n   - 持久化：事件不丢失\n\n4. **设计要点**：\n   - 每个服务必须有幂等处理（Saga 可能重试事件）\n   - 死信队列捕获失败事件供人工处理\n   - 补偿操作必须是幂等的\n   - 监控 Saga 执行状态（每个事件的处理结果）',
      ['MQ 事件驱动天然支持 Choreography Saga', '补偿事务通过反向事件实现错误恢复', '幂等设计和死信监控是 Saga 落地的关键'], ['mq', 'saga']),

    q('mq', 'hard', '问答', '消息队列中的消息压缩：端到端设计',
      '讨论 MQ 端到端的消息压缩方案。消息体压缩（gzip/snappy/zstd）、元数据压缩、批量压缩。Kafka 的端到端压缩——Producer 压缩 → Broker 保持 → Consumer 解压。压缩与加密的协作顺序。如何选择压缩算法和级别？',
      '消息压缩设计：\n\n1. **压缩层次**：\n   - **消息体压缩**：单个消息的 payload 压缩\n   - **批次压缩**：一批消息整体压缩（Kafka 原生支持）\n   - **元数据压缩**：header/tags 等元数据\n\n2. **Kafka 压缩流程**：\n   - Producer 端：compression.type 指定算法\n   - 多个消息合并为批次 → 批次整体压缩\n   - Broker 端：如果 producer 和 broker 压缩算法一致 → 保持压缩\n   - 如果不一致 → Broker 解压后重新压缩\n   - Consumer 端：自动解压\n\n3. **压缩与加密顺序**：\n   - 先加密再压缩？→ 密文几乎不可压缩\n   - 先压缩再加密？→ 最佳（压缩率高，再加密）\n   - 推荐：压缩 → 加密\n\n4. **算法选择**：\n   - **gzip**（-1到-9）：压缩率 3-5x，速度慢\n   - **snappy**：压缩率 2-3x，速度快（低 CPU）\n   - **lz4**：压缩率 2-3x，速度最快\n   - **zstd**（1-22）：压缩率 3-8x，速度适中\n   - 推荐：追求速度用 lz4，追求压缩率用 zstd-3',
      ['Kafka 端到端压缩：Producer 压缩 → Broker 保持 → Consumer 解压', '先压缩再加密（加密后的数据几乎不可压缩）', 'lz4 最快、zstd 压缩率最高、gzip 最通用'], ['mq', 'compression']),

    q('mq', 'medium', '问答', 'RabbitMQ 的插件系统与生态',
      '介绍 RabbitMQ 的插件系统。内置插件（management、shovel、federation）和社区插件。如何开发自定义 RabbitMQ 插件——Erlang 插件的基本结构。常用插件：Shovel（消息迁移）、Federation（跨集群）、Delayed Message（延迟消息）、Event Exchange（事件路由）。',
      'RabbitMQ 插件：\n\n1. **启用插件**：\n   - `rabbitmq-plugins enable <plugin-name>`\n   - 插件目录：$RABBITMQ_HOME/plugins/\n   - 启用后需要重启部分插件\n\n2. **常用插件**：\n   - **rabbitmq_management**：Web 管理界面 + HTTP API\n   - **rabbitmq_shovel**：消息从一个队列迁移到另一个队列/集群\n   - **rabbitmq_federation**：跨集群消息转发\n   - **rabbitmq_delayed_message_exchange**：延迟消息（3.12+ 推荐原生）\n   - **rabbitmq_event_exchange**：RabbitMQ 内部事件路由到 Exchange\n   - **rabbitmq_consistent_hash_exchange**：一致性哈希路由\n   - **rabbitmq_prometheus**：Prometheus 指标暴露\n\n3. **自定义插件开发**：\n   - Erlang 应用结构（.app + .erl 文件）\n   - 实现 rabbit_exchange_type / rabbit_queue_type 行为\n   - 通过 Erlang 的 supervisor 管理生命周期\n\n4. **插件使用指南**：\n   - 生产环境建议启用 management + prometheus\n   - 跨地域部署启用 federation\n   - 热迁移场景用 shovel',
      ['rabbitmq_management + prometheus 是生产必启插件', 'federation 适合跨地域、shovel 适合热迁移', 'delayed_message_exchange 插件实现延迟消息'], ['rabbitmq', 'plugins']),

    q('mq', 'medium', '问答', 'MQ 集成测试策略：从模拟到真实',
      '讨论消息队列的集成测试方案。测试层级：单元测试（Mock MQ）、集成测试（内嵌 MQ）、端到端测试（真实 MQ）。Kafka 的 Testcontainers 和 KafkaTestUtils、RocketMQ 的测试框架、RabbitMQ 的本地模拟。如何构建 MQ 的 CI 测试环境？',
      'MQ 集成测试：\n\n1. **测试层级**：\n   - **单元测试**：Mock MQ 客户端（MockProducer/MockConsumer）\n   - **集成测试**：嵌入式 MQ（@EmbeddedKafka、Testcontainers）\n   - **E2E 测试**：连接真实 MQ 实例\n\n2. **Kafka 测试方案**：\n   - **@EmbeddedKafka（Spring）**：嵌入 Kafka 到单元测试\n   - **Testcontainers**：Docker 容器启动 Kafka\n   - **MockProducer/MockConsumer**：纯 Mock，适合 Kafka Streams\n\n3. **RocketMQ 测试**：\n   - RocketMQ Test 模块：Embedded nameserver + broker\n   - Testcontainers：RocketMQ 容器\n\n4. **RabbitMQ 测试**：\n   - Testcontainers：RabbitMQ 容器\n   - Local RabbitMQ Server：GitHub Actions 内建 RabbitMQ 服务\n\n5. **CI 最佳实践**：\n   - Testcontainers 在 CI 中自动管理容器生命周期\n   - 为不同 MQ 版本维护测试矩阵\n   - 测试消息发送 + 消费 + 重试 + 死信的全流程\n   - 故障注入测试（MQ 服务重启、网络断开）',
      ['Mock MQ（单元级）→ Embedded MQ（集成级）→ Real MQ（E2E级）', 'Testcontainers 是 MQ CI 测试的标准方案', '测试全流程：发送 → 消费 → 重试 → 死信 → 故障恢复'], ['mq', 'testing']),
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
