export const knowledge = {
  消息队列基础: {
    category: "mq",
    domain: "mq",
    source: "综合整理",
    content: `## 消息队列基础

> 来源：综合整理

### 核心模型
- **Producer**：消息生产者
- **Broker**：消息代理（服务端）
- **Consumer**：消息消费者
- **Topic**：逻辑分类（pub/sub 模型）
- **Partition**：物理分片（Kafka、Pulsar）

### 消费模式
- **点对点（P2P）**：一条消息被一个消费者消费（Queue）
- **发布订阅（Pub/Sub）**：一条消息被多个消费者消费（Topic）

### 消息可靠性
| 层面 | 保证机制 |
|------|---------|
| 生产端 | ACK（all/1/0）、重试、幂等 |
| 存储端 | 持久化、多副本 |
| 消费端 | 手动 ACK、重试队列 |

### 顺序消息
- Kafka：同一 Partition 内有序
- RocketMQ：队列级别有序
- RabbitMQ：单队列有序
- 全局有序需单一分区（牺牲吞吐）`,
  },
  消息队列对比: {
    category: "mq",
    domain: "mq",
    source: "综合整理",
    content: `## 消息队列对比

> 来源：综合整理

### 主流 MQ 对比

| 特性 | Kafka | RocketMQ | RabbitMQ | Pulsar |
|------|-------|----------|----------|--------|
| 吞吐 | 极高 | 高 | 中 | 极高 |
| 延迟 | ms 级 | ms 级 | μs 级 | ms 级 |
| 顺序 | Partition 内 | Queue 内 | 单队列 | Partition 内 |
| 持久化 | 磁盘顺序写 | 磁盘 | 内存+磁盘 | 分层存储 |
| 协议 | 自定义 | 自定义 | AMQP | 自定义 |
| 运维 | ZK 依赖 | Namesrv | Erlang | BookKeeper |

### 选型建议
- **大数据/日志**：Kafka（流式处理生态）
- **业务消息/事务**：RocketMQ（事务消息、延迟消息）
- **轻量/低延迟**：RabbitMQ（金融交易）
- **云原生**：Pulsar（计算存储分离）

### 常见问题
- **消息重复**：幂等设计、去重表
- **消息丢失**：生产者 + broker + 消费者端三重确认
- **消息堆积**：扩容消费者/分区、限流降级`,
  },
};
