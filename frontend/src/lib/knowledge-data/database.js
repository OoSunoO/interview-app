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
- **B+Tree 索引**：非叶子节点只存键，扇出大、树矮（千万数据 3-4 层），范围查询高效。
- **聚簇索引**：InnoDB 数据文件即索引，叶子节点存完整行数据。
- **覆盖索引**：索引包含查询所需所有字段，无需回表。
- **联合索引最左前缀匹配**：从最左列开始匹配，遇到范围查询停止。

### 事务
ACID 特性：原子性（undo log）、一致性、隔离性（MVCC + 锁）、持久性（redo log）。

### MVCC
多版本并发控制，通过隐藏字段和 undo log 实现。REPEATABLE-READ 通过间隙锁（Next-Key Lock）防止幻读。`,
    source: null,
    domain: "database",
  },
  事务: {
    category: "database",
    content: `##MySQL 事务要点

### ACID 特性
- **原子性**：事务不可分割，通过 undo log 实现回滚。
- **一致性**：事务前后数据满足所有约束。
- **隔离性**：并发事务互不干扰。
- **持久性**：通过 redo log 保证崩溃恢复。

### 四种隔离级别
| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|-----------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 不会 | 可能 | 可能 |
| REPEATABLE READ（默认） | 不会 | 不会 | 不会 |
| SERIALIZABLE | 不会 | 不会 | 不会 |

### 日志
- **redo log**：物理日志，保证持久性（WAL）。
- **undo log**：逻辑日志，保证原子性和 MVCC。
- **binlog**：二进制日志，用于主从复制和数据恢复。`,
    source: null,
    domain: "database",
  },
  缓存: {
    category: "system_design",
    content: `## 缓存（Caching）

### 缓存的作用
- **降低延迟**：内存读取（纳秒级）远快于数据库（毫秒级）。
- **降低负载**：避免重复计算/查询。
- **缓解峰值**：抵抗瞬时高流量。

### 缓存分层
| 层级 | 说明 | 示例 |
|------|------|------|
| L1（本地缓存） | 应用进程内缓存 | Caffeine、Guava Cache |
| L2（分布式缓存） | 独立缓存服务 | Redis、Memcached |
| 客户端缓存 | 浏览器/CDN | HTTP Cache、CDN |

### 缓存模式
| 模式 | 策略 |
|------|------|
| Cache Aside（旁路缓存） | 读先查缓存，未命中查 DB 再写缓存；写先更新 DB 再删缓存 |
| Read Through | 缓存代理 DB 查询 |
| Write Through | 写操作同时更新缓存和 DB |
| Write Behind | 先更新缓存，异步批量写 DB |

### 缓存问题
| 问题 | 现象 | 解决方案 |
|------|------|---------|
| 缓存穿透 | 查不存在的数据，跳过缓存打 DB | 布隆过滤器、缓存空值 |
| 缓存击穿 | 热点 key 过期，大量请求打 DB | 互斥锁、永不过期+异步刷新 |
| 缓存雪崩 | 大量 key 同时过期或缓存宕机 | 随机过期时间、多级缓存、限流降级 |`,
    source: "JavaGuide",
    domain: "system_design_main",
  },
};
