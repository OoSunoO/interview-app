export const knowledge = {
  MySQL: {
    category: "database",
    content: `##MySQL 核心要点

### MyISAM vs InnoDB
| 特性 | MyISAM | InnoDB |
|------|--------|--------|
| 行级锁 | 不支持（只有表锁） | 支持 |
| 事务 | 不支持 | 支持 ACID（默认 REPEATABLE-READ） |
| 外键 | 不支持 | 支持 |
| 崩溃恢复 | 不支持 | 支持（redo log） |
| MVCC | 不支持 | 支持 |

### 索引
- **B+Tree 索引**：InnoDB 和 MyISAM 都使用 B+Tree。非叶子节点只存键，扇出大、树矮（千万数据 3-4 层），范围查询高效。
- **聚簇索引**：InnoDB 的数据文件即索引（主键索引），叶子节点存完整行数据。
- **覆盖索引**：索引包含查询所需所有字段，无需回表。
- **联合索引最左前缀匹配**：从最左列开始匹配，遇到范围查询（>, <）停止。

### 事务
ACID 特性：原子性（undo log）、一致性、隔离性（MVCC + 锁）、持久性（redo log）。

### MVCC
多版本并发控制，通过隐藏字段（DB_TRX_ID、DB_ROLL_PTR）和 undo log 实现。REPEATABLE-READ 通过间隙锁（Next-Key Lock）防止幻读。
`,
    source: null,
  },
  Redis: {
    category: "database",
    content: `##Redis 核心要点

### 为什么快？
1. 纯内存操作（纳秒级 vs 磁盘毫秒级）
2. 单线程事件循环 + I/O 多路复用（避免上下文切换和锁竞争）
3. 优化的内部数据结构（根据数据大小动态选择编码：ziplist、quicklist、skiplist 等）
4. 简洁的 RESP 协议

### 5 种基础数据类型
String（二进制安全）、List（双向链表）、Set（无序唯一）、Hash（字段映射）、Zset（有序集合，基于跳表）。

### 特殊类型
HyperLogLog（基数统计，固定12KB，误差0.81%）、Bitmap（位图）、Geospatial（地理位置）。

### 持久化
- **RDB**：定时快照，文件紧凑，恢复快，但可能丢失数据。
- **AOF**：追加写命令，可每秒/每次写同步，数据可靠性高，文件大。

### Redis 6.0 多线程
- 仅网络 IO 读写使用多线程（解决 IO 瓶颈），命令执行仍是单线程。
- 配置：io-threads（默认禁用）。

### 过期删除策略
惰性删除（访问时检查） + 定期删除（每秒 hz 次，随机抽查 20 个 key）。

### 应用场景
缓存、分布式锁（Redisson）、限流（Redis + Lua）、消息队列（Stream）、排行版（Zset）、UV 统计（HyperLogLog）。
`,
    source: null,
  },
  事务: {
    category: "database",
    content: `##MySQL 事务要点

### ACID 特性
- **原子性**（Atomicity）：事务不可分割，全部成功或全部回滚。通过 undo log 实现回滚。
- **一致性**（Consistency）：事务前后数据满足所有约束。
- **隔离性**（Isolation）：并发事务之间互不干扰。通过 MVCC 和锁机制实现。
- **持久性**（Durability）：事务提交后对数据的修改永久保存。通过 redo log 保证崩溃恢复。

### 四种隔离级别
| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|-----------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 不会 | 可能 | 可能 |
| REPEATABLE READ（InnoDB 默认） | 不会 | 不会 | 不会（Next-Key Lock 防幻读） |
| SERIALIZABLE | 不会 | 不会 | 不会 |

### MVCC 实现
通过隐藏字段 DB_TRX_ID（最后修改事务ID）和 DB_ROLL_PTR（回滚指针），结合 undo log 实现多版本并发控制。REPEATABLE-READ 通过间隙锁（Next-Key Lock = 行锁 + 间隙锁）防止幻读。

### 日志
- **redo log**：物理日志，保证事务持久性（WAL 机制）。
- **undo log**：逻辑日志，保证事务原子性和 MVCC。
- **binlog**：二进制日志，用于主从复制和数据恢复。
`,
    source: null,
  },
  缓存: {
    category: "system_design",
    content: `## 缓存（Caching）

> 来源：JavaGuide

### 缓存的作用
- **降低延迟**：从内存读取（纳秒级）远快于数据库（毫秒级）。
- **降低负载**：避免重复计算/查询。
- **缓解峰值**：抵抗瞬时高流量（缓存雪崩/击穿防护）。

### 缓存分层
| 层级 | 说明 | 示例 |
|------|------|------|
| L1（本地缓存） | 应用进程内缓存 | Caffeine、Guava Cache、Ehcache |
| L2（分布式缓存） | 独立缓存服务 | Redis、Memcached |
| 客户端缓存 | 浏览器/CDN 缓存 | HTTP Cache、CDN |

### 缓存模式
| 模式 | 策略 | 适用 |
|------|------|------|
| **Cache Aside（旁路缓存）** | 读时先查缓存，未命中查 DB 再写缓存；写时先更新 DB 再删除缓存 | 最常用 |
| **Read Through** | 缓存代理 DB 查询 | 数据一致性要求高 |
| **Write Through** | 写操作同时更新缓存和 DB | 双写保证 |
| **Write Behind** | 先更新缓存，异步批量写 DB | 高写入吞吐 |
| **Refresh Ahead** | 缓存过期前自动刷新 | 热点数据 |

### 缓存问题
| 问题 | 现象 | 解决方案 |
|------|------|---------|
| **缓存穿透** | 查询不存在的数据，跳过缓存直接打 DB | 布隆过滤器、缓存空值 |
| **缓存击穿** | 热点 key 过期，大量请求同时打 DB | 互斥锁、永不过期+异步刷新 |
| **缓存雪崩** | 大量 key 同时过期或缓存宕机 | 随机过期时间、多级缓存、限流降级 |
`,
    source: "JavaGuide",
  },
  Redis_基础: {
    category: "redis",
    content: `## Redis 核心要点

### 数据结构
| 类型 | 底层实现 | 用途 |
|------|----------|------|
| String | SDS（动态字符串） | 缓存、计数器、分布式锁 |
| Hash | dict（哈希表）+ ziplist | 对象存储 |
| List | quicklist | 消息队列、最新列表 |
| Set | intset + hashtable | 标签、去重 |
| Sorted Set | skiplist + dict | 排行榜、延时队列 |
| Bitmap | 位数组 | 签到统计 |
| HyperLogLog | 概率数据结构 | UV 统计 |
| GEO | geohash + zset | 地理位置 |

### 持久化
| | RDB | AOF |
|--|-----|-----|
| 方式 | 快照（全量） | 追加写命令 |
| 性能 | 高（子进程写） | 较低（实时写） |
| 数据安全 | 可能丢最近一次快照后的数据 | 可配 always/everysec/no |
| 恢复速度 | 快 | 慢 |
| 推荐 | 结合使用：RDB 做快照 + AOF 做增量 |

### 高可用
- **主从复制**：全量同步（RDB）+ 增量同步（命令传播）
- **哨兵（Sentinel）**：监控、选主、通知
- **集群（Cluster）**：16384 个槽位，分片存储，无中心化

### 缓存策略
- **过期策略**：定期删除 + 惰性删除
- **淘汰策略**：volatile-lru, allkeys-lru, volatile-ttl, volatile-random, allkeys-random, noeviction
- **缓存穿透**：查不存在的数据绕过缓存 → 布隆过滤器
- **缓存击穿**：热点 key 过期 → 互斥锁 / 逻辑过期
- **缓存雪崩**：大量 key 同时过期 → 过期时间加随机值 / 降级限流
`,
    source: null,
  },
};
