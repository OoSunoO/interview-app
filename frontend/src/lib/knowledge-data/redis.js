export const knowledge = {
  "Redis 核心": {
    category: "redis",
    domain: "redis",
    source: "Redis 官方文档",
    content: `## Redis 核心

> 来源：Redis 官方文档

### 数据结构
| 类型 | 底层实现 | 适用场景 |
|------|---------|---------|
| String | SDS（动态字符串） | 缓存、计数器 |
| Hash | dict + ziplist | 对象存储 |
| List | quicklist | 消息队列 |
| Set | intset + dict | 标签、去重 |
| ZSet | skiplist + dict | 排行榜 |
| HyperLogLog | 概率数据结构 | UV 统计 |
| Bitmap | 位数组 | 签到、布隆 |

### 持久化
- **RDB**：全量快照（fork 子进程，文件紧凑，可能丢数据）
- **AOF**：追加写日志（fsync 策略：always/everysec/no）
- **混合持久化**（Redis 4.0+）：RDB 全量 + AOF 增量

### 高可用
- **主从复制**：一主多从，异步复制
- **Sentinel**：自动故障转移（监控 + 通知 + 选举）
- **Cluster**：分片（16384 slot），去中心化

### 淘汰策略
- \*noeviction\*：不淘汰，写返回错误
- \*allkeys-lru\*：最近最少使用
- \*allkeys-lfu\*：最不经常使用
- \*volatile-lru\*：仅对设置 TTL 的 key

### 缓存模式
- **Cache-Aside**：读穿透（先查缓存，miss 查 DB 再回写）
- **Read-Through**：缓存层自动回源
- **Write-Through**：写 DB 同步写缓存
- **Write-Behind**：异步写 DB（高性能，有丢数据风险）`,
  },
  "Redis 实战": {
    category: "redis",
    domain: "redis",
    source: "综合整理",
    content: `## Redis 实战

> 来源：综合整理

### 缓存穿透 / 击穿 / 雪崩
| 问题 | 现象 | 解决方案 |
|------|------|---------|
| 穿透 | 查不存在的数据，跳过缓存 | Bloom Filter、空值缓存 |
| 击穿 | 热点 key 过期 | 互斥锁、逻辑过期 |
| 雪崩 | 大量 key 同时过期 | 随机过期时间、高可用 |

### 分布式锁
\`\`\`
SET key uuid NX EX 30  -- 加锁
EVAL "if redis.call('get',KEYS[1])==ARGV[1] then redis.call('del',KEYS[1]) end" 1 key uuid  -- 解锁（Lua 保证原子性）
\`\`\`
Redisson 封装了看门狗（Watchdog）自动续期。

### 性能优化
- Pipeline：批量命令减少 RTT
- 批量操作：\`mget\`/\`mset\` 替代多次 \`get\`/ \`set\`
- 大 Key：拆分（Hash 分桶），避免阻塞
- 慢查询：\`SLOWLOG GET 100\` 分析
- 连接池：合理配置 maxTotal/maxIdle`,
  },
};
