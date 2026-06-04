#!/usr/bin/env python3
"""Expand redis.json from 51 to ~100 questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('redis', 'hard', 'short_answer', 'Redis 主从复制原理与拓扑演进',
      '详细分析 Redis 主从复制的实现。PSYNC2（部分同步）的工作原理——复制偏移量 + 复制积压缓冲区。全量重同步的流程 - RDB 生成 + 传输 + 加载。Redis 复制的拓扑结构——链式复制（中间层降低主库压力）。复制在 Sentinel 和 Cluster 中的差异。',
      'Redis 主从复制：\n\n1. **PSYNC2（部分同步）**：\n   - **主库**：维护复制偏移量（repl_backlog）\n   - **从库**：发送 replconf ACK 上报偏移量\n   - 断线重连 → 从库发 PSYNC {runid} {offset}\n   - 检查：主库 backlog 中是否包含 offset\n   - 包含 → 部分同步（只发缺失数据）\n   - 不包含 → 全量同步（RDB）\n\n2. **全量同步**：\n   - 从库发送 SYNC/PSYNC\n   - 主库 fork 子进程生成 RDB（不阻塞）\n   - 传输 RDB 到从库\n   - 从库清空加载 RDB\n   - 主库补发 RDB 期间的增量数据\n\n3. **链式复制**：\n   - 从库挂载到其他从库\n   - 减少主库的复制压力\n   - 拓扑：主 → 从1 → 从2\n\n4. **Sentinel vs Cluster**：\n   - Sentinel：主从模式 + 自动故障切换\n   - Cluster：分片 + 主从 + Gossip 复制\n\n5. **优化**：\n   - repl-backlog-size：足够大避免全量同步\n   - repl-disable-tcp-nodelay：合并小包\n   - slave-read-only：只读从库',
      ['PSYNC2 通过复制偏移量实现断线部分同步', '链式复制减少主库的复制压力'], ['redis', 'replication']),

    q('redis', 'hard', 'short_answer', 'Redis Cluster Gossip 协议深度分析',
      '深入分析 Redis Cluster 的 Gossip 通信。Gossip 消息类型：PING/PONG/MEET/FAIL。Gossip 的集群状态传播——节点间交换槽位信息和故障状态。Gossip 协议收敛时间和网络开销。节点数量的 Gossip 缩放性。CLUSTER SLOTS 的缓存和更新。',
      'Redis Cluster Gossip：\n\n1. **Gossip 消息**：\n   - **PING**：探活 + 交换状态（随机选择节点）\n   - **PONG**：响应 PING（携带自己的状态）\n   - **MEET**：加入集群\n   - **FAIL**：报告节点故障\n\n2. **状态传播**：\n   - 每个节点维护 clusterState（所有节点的信息）\n   - PING 携带：本节点已知的其他节点状态\n   - 接收方：更新已知节点信息\n   - **收敛性**：O(log N) 轮次后全集群感知\n\n3. **Gossip 频率**：\n   - 默认每秒随机 ping 5 个节点\n   - 每 100ms 检查是否需要手动 PING（延迟阈值）\n   - 网络开销：O(N) 节点越多越高\n\n4. **节点限制**：\n   - 推荐 1000 节点以下\n   - 超过 1000：Gossip 消息增长，CPU 占用上升\n   - **优化**：大集群分多个 Cluster\n\n5. **CLUSTER SLOTS**：\n   - 每个节点缓存槽位映射\n   - MOVED/ASK 重定向时更新\n   - gossip pong 带槽位信息',
      ['Gossip + 槽位映射 = Redis Cluster 的一致性基础', '1000 节点以下的 Gossip 开销可控'], ['redis', 'cluster', 'gossip']),

    q('redis', 'medium', 'short_answer', 'Redis 内存碎片与内存管理',
      '分析 Redis 的内存碎片问题。内存碎片产生的原因——jemalloc 的分配策略和 key/value 的频繁变更。INFO memory 的 mem_fragmentation_ratio 解读。内存碎片的整理策略。内存使用量的预估方法。内存优化的最佳实践。',
      'Redis 内存碎片：\n\n1. **碎片率**：\n   - mem_fragmentation_ratio = used_memory_rss / used_memory\n   - > 1.5 表示严重碎片\n   - < 1.0 表示有 swap（危险）\n\n2. **碎片原因**：\n   - jemalloc 分配器（固定大小类 8/16/32/...）\n   - key/value 大小频繁变更\n   - 大量过期 key 删除后空洞\n   - 不同大小对象混合分配\n\n3. **碎片整理**：\n   - `MEMORY PURGE`：手动触发（非阻塞）\n   - `ACTIVE DEFRAG`：自动碎片整理（4.0+）\n   - 配置：activedefrag yes\n   - defrag-threshold 控制触发条件\n\n4. **容量预估**：\n   - key 开销：~50 bytes/entry（dict 结构）\n   - value 额外开销序列化结构\n   - 经验：实际内存 = 数据大小 × 1.5-2\n\n5. **优化实践**：\n   - 使用 Hash 结构压缩小对象\n   - 设置合理 maxmemory\n   - 定期 MEMORY PURGE\n   - 预热时启用 activedefrag',
      ['碎片率 > 1.5 = 严重碎片，< 1.0 = 内存不足可能交换', 'ACTIVE DEFRAG 自动整理（4.0+）'], ['redis', 'memory', 'fragmentation']),

    q('redis', 'hard', 'short_answer', 'Redis 线程模型与 IO 多路复用',
      '深入分析 Redis 的线程模型演进。单线程事件循环（Reactor 模式）——aeEventLoop 的实现。IO 多路复用封装（select/epoll/kqueue/evport）。Redis 6 的多线程 IO（IO 线程处理网络读写，主线程执行命令）。多线程 IO 的配置和适用场景。',
      'Redis 线程模型：\n\n1. **单线程 Reactor**：\n   - aeEventLoop 事件循环\n   - 文件事件（Socket 读写） + 时间事件（定时任务）\n   - 单线程顺序执行命令\n   - **优势**：无锁、可预测、简单\n\n2. **IO 多路复用**：\n   - ae_select/ae_epoll/ae_kqueue/ae_evport\n   - epoll（Linux）：水平触发 + 事件驱动\n   - kqueue（Mac）：类似 epoll\n   - 封装统一 API：aeApiPoll\n\n3. **Redis 6 多线程 IO**：\n   - 主线程继续单线程执行命令\n   - IO 线程处理 Socket 读写（read/write）\n   - 配置：io-threads（默认 4）\n   - 流程：主线程接收连接 → 分发到 IO 线程读取 → 主线程执行 → IO 线程写回\n\n4. **适用场景**：\n   - 单线程：99% 场景足够（瓶颈通常在网络/内存）\n   - 多线程 IO：大流量场景（10w+ qps）\n\n5. **限制**：\n   - 多线程只提升网络吞吐\n   - CPU 密集型命令（KEYS/SORT）可能阻塞其他命令',
      ['单线程执行命令 + 多线程 IO 读写 = Redis 6 的混合模型', '99% 场景单线程 IO 就够'], ['redis', 'threading', 'io-multiplexing']),

    q('redis', 'medium', 'short_answer', 'Redis 的 LFU 淘汰策略与访问频率衰减',
      '深入分析 Redis 的 LFU（Least Frequently Used）淘汰策略。LFU 的计数器实现——Morris 计数器（对数概率递增）。访问频率的衰减机制。LFU 的参数调优：lfu-log-factor 和 lfu-decay-time。LFU vs LRU 的命中率对比。',
      'Redis LFU：\n\n1. **计数器 Morris Counter**：\n   - 16-bit 计数器（不是 32-bit）\n   - 指数概率递增（高频访问增长慢，低频增长快）\n   - 公式：p = 1/(counter * lfu-log-factor + 1)\n\n2. **衰减机制**：\n   - lfu-decay-time（分钟为单位）\n   - N 分钟无访问 → 计数器减 N\n   - 避免历史高频访问永久占据缓存\n\n3. **参数调优**：\n   - lfu-log-factor（默认 10）：越大高频访问计数增长越慢\n   - lfu-decay-time（默认 1）：每分钟衰减\n\n4. **LFU vs LRU**：\n   - LRU：只考虑访问时间（最近没用过淘汰）\n   - LFU：考虑访问频率（经常用的保留）\n   - LFU 在周期性访问模式中更好\n   - LFU 内存开销稍大（16-bit counter）\n\n5. **配置**：\n   - maxmemory-policy allkeys-lfu / volatile-lfu\n   - 需要先设置 maxmemory',
      ['LFU 用 Morris 计数器实现 ≈ 16-bit 的近似精确计数', '衰减机制防止历史高频访问占据缓存永久'], ['redis', 'eviction', 'lfu']),

    q('redis', 'medium', 'short_answer', 'Redis 的 RESP3 协议与客户端交互',
      '介绍 Redis RESP3 协议（Redis 6+）相比 RESP2 的改进。RESP3 的数据类型——Map/Set/Push/Stream/Bool/Null。Push 类型的服务器推送——Pub/Sub 和 Client Tracking 的推送。RESP3 对客户端库的影响。协议兼容性。',
      'Redis RESP3：\n\n1. **RESP2 vs RESP3**：\n   - RESP2：简单字符串、错误、整数、批量字符串、数组\n   - RESP3：增加 Map/Set/Stream/Push/Bool/Null/Array\n   - RESP3 减少客户端逻辑（服务器直接返回原生类型）\n\n2. **新类型**：\n   - **Map**：key-value 映射（替代 RESP2 的 flat array）\n   - **Set**：集合\n   - **Push**：服务器推送（Pub/Sub 消息、Client Tracking）\n   - **Stream**：批量字符串流\n   - **Bool**：布尔值\n   - **Null**：空值\n\n3. **Push 机制**：\n   - 服务器可以主动 Push 数据\n   - Pub/Sub 消息不再需要轮询\n   - Client Tracking（缓存失效通知）\n   - RESP2 不能区分 Push 和命令响应\n\n4. **客户端影响**：\n   - 客户端实现更简单（不需要猜测响应格式）\n   - 向后兼容 RESP2\n   - 客户端通过 HELLO 3 切换 RESP3\n\n5. **实际应用**：\n   - Redis CLI 6+ 默认 RESP3\n   - 主流客户端（Jedis/Lettuce）支持\n   - 应用透明（客户端库封装）',
      ['RESP3 新增 Map/Set/Push/Stream 等原生类型', '服务器 Push 替代客户端轮询（Pub/Sub + Client Tracking）'], ['redis', 'protocol']),

    q('redis', 'hard', 'short_answer', 'Redis 的 key 过期与 lazy-free 机制',
      '深入 Redis key 过期机制。过期 key 的删除策略：定时删除 + 惰性删除 + 定时扫表。expires 字典的存储。UNLINK 替代 DEL——lazy-free 的异步删除。lazy-free 在 Flush/大 key 删除中的效果。lazy-free 的内存回收和 CPU 权衡。',
      'Redis 过期机制：\n\n1. **定时删除**：\n   - 每 100ms 运行一次 activeExpireCycle\n   - 每个 DB 随机抽样 20 个过期 key\n   - 删除所有过期的 key\n   - 如果超过 25% 过期 → 继续扫描\n\n2. **惰性删除**：\n   - 访问 key 时检查是否过期\n   - 过期 → 删除 → 返回 nil\n   - 保证不会返回过期数据\n\n3. **expires 字典**：\n   - dict 的一个特殊哈希表（expires）\n   - 存储 key → expire time 的映射\n   - 与主 dict 独立的过期字典\n\n4. **lazy-free（UNLINK）**：\n   - DEL：同步删除（阻塞主线程）\n   - UNLINK：异步删除（后台线程回收内存）\n   - 大 key（list/set/zset 百万级）删除时主线程不阻塞\n\n5. **配置**：\n   - lazyfree-lazy-eviction=yes（淘汰时异步）\n   - lazyfree-lazy-expire=yes（过期删除异步）\n   - lazyfree-lazy-server-del=yes\n   - slave-lazy-flush=yes（从库清空异步）\n   - 异步删除延迟回收但主线程更流畅',
      ['过期 = 定时扫描 + 惰性删除 + 定时扫表三重保障', 'lazy-free 用后台线程异步删除大 key（避免阻塞）'], ['redis', 'expiry', 'lazy-free']),

    q('redis', 'medium', 'short_answer', 'Redis 缓存穿透、击穿、雪崩方案',
      '全面分析缓存三大问题及解决方案。缓存穿透——布隆过滤器 + 空值缓存。缓存击穿——互斥锁 + 逻辑过期。缓存雪崩——随机过期时间 + 多级缓存。三者之间的关联和区别。Redis 端的优化措施。',
      '缓存三大问题：\n\n1. **缓存穿透**：\n   - 查询不存在的数据（绕过缓存直击 DB）\n   - 方案：布隆过滤器预过滤、空值短时间缓存、参数校验\n\n2. **缓存击穿**：\n   - 热点 key 过期 + 高并发同时查询\n   - 方案：\n     - **互斥锁**：第一个线程查 DB + 重建缓存，其他等待\n     - **逻辑过期**：缓存永不过期 + 后台异步更新\n   - 代码：SETNX 实现分布式锁\n\n3. **缓存雪崩**：\n   - 大量 key 同时过期 / Redis 宕机\n   - 方案：\n     - 过期时间加随机值（+ 300-600s 随机）\n     - 多级缓存（本地 + 分布式）\n     - Redis 高可用（Sentinel/Cluster）\n     - 限流降级\n\n4. **区别**：\n   - 穿透：数据不存在\n   - 击穿：热点 key 挂了\n   - 雪崩：大量 key 同时挂\n\n5. **Redis 侧**：\n   - maxmemory 合理设置\n   - 淘汰策略选择\n   - 持久化 + 高可用',
      ['穿透 = 不存在数据，击穿 = 热点 key 过期，雪崩 = 大量 key 同时过期', '布隆过滤器 + 互斥锁 + 随机过期时间 = 完整方案'], ['redis', 'caching', 'pattern']),

    q('redis', 'hard', 'short_answer', 'Redis 的 Stream 消费组与消息确认',
      '深入分析 Redis Stream 消费组的机制。消费组的 XREADGROUP——pending 消息和消费者跟踪。消息确认（XACK）和 pending 队列。消息的三种状态：从未投递/已投递待确认/已确认。XPENDING 命令的诊断和死信处理。Stream 的 CAP 权衡。',
      'Redis Stream 消费组：\n\n1. **消费组结构**：\n   - 一个 Stream 可以有多个消费组\n   - 每个消费组有多个消费者\n   - 每个消费组有 last_delivered_id\n   - 消费者有 pending list（已投递未确认的消息）\n\n2. **XREADGROUP**：\n   - `>` 参数：只返回未投递的消息\n   - `0` 参数：返回 pending 消息\n   - 自动创建消费者（首次读取时）\n\n3. **消息状态**：\n   - **从未投递**：在 Stream 中，未被任何消费者读取\n   - **已投递待确认**：给消费者投递了但未 ACK\n   - **已确认**：XACK 确认\n\n4. **XPENDING**：\n   - 查看待确认消息的数量和详情\n   - 诊断消费者崩溃（消息永远待确认）\n   - **死信**：XCLAIM 将消息转移给其他消费者\n\n5. **CAP 权衡**：\n   - Stream 是 AP（可用 + 分区容忍）\n   - 故障时消息可能重复投递\n   - **XACK 幂等**',
      ['消费组 + pending 列表 + XACK 实现可靠消费', 'XPENDING 诊断 + XCLAIM 处理死信'], ['redis', 'stream', 'consumer-group']),

    q('redis', 'medium', 'short_answer', 'Redis 分布式锁 Redlock 正确性分析',
      '详细分析 Redlock 分布式锁算法。Redlock 的步骤——获取当前时间 → N 个实例依次加锁 → 检查是否多数成功。Redlock 面临的问题——时钟漂移、GC 停顿、网络延迟。Redlock 的争议（Martin Kleppmann vs Antirez）。Redlock 与 etcd/ZK 锁的对比。',
      'Redlock 分析：\n\n1. **Redlock 算法**：\n   - 5 个独立 Redis 实例（不一定是 Cluster）\n   - 步骤：\n     - 获取当前时间（T1）\n     - 依次向所有实例 SET key random_value NX PX ttl\n     - 计算总耗时\n     - 成功获取多数（>=3）且耗时 < ttl → 加锁成功\n\n2. **问题**：\n   - **时钟漂移**：服务器时间回拨 → 过期时间不准\n   - **GC 停顿**：持有锁的线程 GC 停顿 → 锁过期 → 另一个线程拿到锁\n   - **网络延迟**：超时时间估算困难\n\n3. **争议**：\n   - Martin：Redlock 不是可靠锁（系统模型假设不严谨）\n   - Antirez：实际场景下够用\n   - 核心分歧：是否需要 fencing token\n\n4. **与 etcd/ZK 对比**：\n   - etcd/ZK：线性一致、fencing token 机制\n   - Redis：AP 系统（数据一致性不是强保证）\n   - etcd/ZK 锁更安全但性能较差\n\n5. **建议**：\n   - 不需要强一致性 → Redlock 够用\n   - 需要强一致性 → etcd/ZK\n   - 单节点 SET NX + 大多数场景已够',
      ['Redlock 争议核心：时钟漂移 + GC 停顿导致锁安全性不足', 'etcd/ZK 提供 fencing token 保证锁的线性一致性'], ['redis', 'distributed-lock', 'redlock']),

    q('redis', 'hard', 'short_answer', 'Redis 的 RDB 持久化实现与子进程 fork',
      '深入分析 Redis RDB 持久化的底层实现。fork 子进程的 COW（Copy-on-Write）机制——为什么子进程不影响主进程写入。RDB 文件格式（Redis-specific encoding/dump.rdb 结构）。RDB 的压缩和校验。fork 进程的耗时和内存开销。',
      'Redis RDB：\n\n1. **fork + COW**：\n   - fork() 创建子进程（共享父进程内存）\n   - COW：任一进程写数据时 → 复制页面再修改\n   - 子进程写 RDB 时使用父进程的页面快照\n   - 主进程正常服务\n\n2. **fork 性能影响**：\n   - 内存越大 fork 越慢（页表复制）\n   - 24GB 内存实例 → fork 可能需要 1-2s\n   - 期间主进程阻塞\n\n3. **RDB 文件格式**：\n   - Magic + Version + 数据库内容 + Checksum\n   - 序列化：Redis 内部编码（不是 JSON）\n   - 压缩：压缩字符串\n\n4. **COW 内存**：\n   - 子进程使用父进程的物理内存\n   - 只有修改的页面被复制\n   - 写繁忙 → COW 可能复制大量页面\n\n5. **配置**：\n   - save 900 1（900 秒内 1 次变更）\n   - stop-writes-on-bgsave-error yes\n   - rdbcompression yes\n   - rdbchecksum yes',
      ['fork + COW 让 RDB 持久化不影响主进程写入', '大内存实例 fork 耗时 ~1ms/GB 内存'], ['redis', 'rdb', 'persistence']),

    q('redis', 'medium', 'short_answer', 'Redis 的 AOF 重写实现机制',
      '详细分析 Redis AOF 重写的实现。AOF 重写的触发——手动 BGREWRITEAOF 或自动 trigger。重写子进程的管道机制——父子进程间的增量命令缓存。AOF 重写与 RDB 的双重持久化策略。AOF 重写中的 COW 内存开销。',
      'Redis AOF 重写：\n\n1. **触发方式**：\n   - 手动：BGREWRITEAOF 命令\n   - 自动：auto-aof-rewrite-percentage + auto-aof-rewrite-min-size\n   - 策略：AOF 文件增长超过 100%（默认）且 > 64MB\n\n2. **重写流程**：\n   - 主进程 fork 子进程\n   - 子进程遍历内存 → 生成最小命令集\n   - 父进程继续服务 → 增量命令写入 AOF 重写缓冲区\n   - 子进程完成后 → 父进程追加缓冲区到新 AOF\n   - 原子替换新 AOF\n\n3. **AOF 重写缓冲区**：\n   - 子进程创建后：父进程的写入同时发到旧 AOF + 重写缓冲区\n   - 重写完成后父进程收尾\n\n4. **混合持久化**：\n   - aof-use-rdb-preamble yes（4.0+）\n   - AOF 文件开头 = RDB 格式（快照）\n   - RDB 部分后 = AOF 格式（增量）\n   - 加载更快 + 文件更小\n\n5. **最佳实践**：\n   - 同时开启 RDB + AOF（数据安全最高）\n   - 只有 AOF 也可（恢复更完整）\n   - 重写期间注意内存和 CPU',
      ['AOF 重写子进程 + 缓冲区保证不丢失增量', '混合持久化（RDB 前置 + AOF 增量）= 加载快 + 数据安全'], ['redis', 'aof', 'persistence']),

    q('redis', 'medium', 'short_answer', 'Redis 管道与事务对比',
      '对比 Redis 的 Pipeline（管道）和 Transaction（事务）。Pipeline 的批量发送/接收机制（减少网络 RTT）。事务的 MULTI/EXEC/DISCARD 和 WATCH 乐观锁。Pipe 的流式批量 vs 事务的原子性。Pipe + 事务的组合使用。',
      'Redis 管道 vs 事务：\n\n1. **Pipeline（管道）**：\n   - 客户端批量发送命令（不等待响应）\n   - 最后一次性读取所有响应\n   - 减少网络 RTT\n   - **没有原子性**：命令可能部分执行\n\n2. **Transaction（事务）**：\n   - MULTI 开始 → EXEC 执行\n   - EXEC 前命令 QUEUED（不立即执行）\n   - EXEC 后原子提交（全部成功或全部失败）\n   - **隔离性**：EXEC 时阻塞执行\n\n3. **WATCH 乐观锁**：\n   - WATCH key → 监视 key 变化\n   - MULTI → EXEC → 检查 WATCH 的 key\n   - 如果被修改 → EXEC 返回 nil（事务取消）\n   - 类似 CAS（Compare-and-Swap）\n\n4. **Pipe + 事务**：\n   - Pipline 中发送 MULTI/EXEC\n   - 批量发送 + 原子执行\n   - 最常用组合\n\n5. **性能对比**：\n   - Pipeline：吞吐提升 5-10x\n   - 事务：吞吐略有下降（QUEUED + EXEC）\n   - Pipeline 在大批量操作中效果显著',
      ['Pipeline 减少 RTT（吞吐），Transaction 保证原子性（正确性）', 'WATCH + MULTI = 乐观锁 CAS 模式'], ['redis', 'pipeline', 'transaction']),

    q('redis', 'hard', 'short_answer', 'Redis Cluster 的 Hash Slot 重分配',
      '深入分析 Redis Cluster 的槽位重分配机制。reshard 流程——源节点导出 → 目标节点导入。Migrating 和 Importing 状态。ASK 重定向和 MOVED 重定向的区别。槽位迁移中客户端的正确处理。在线重分配时对性能的影响。',
      'Redis Cluster 重分片：\n\n1. **reshard 流程**：\n   - CLUSTER SETSLOT {slot} MIGRATING {src_node}\n   - CLUSTER SETSLOT {slot} IMPORTING {dst_node}\n   - 源节点逐个迁移 key（MIGRATE 命令）\n   - 迁移完成后 SETSLOT NODE {dst_node}\n   - 通过 Gossip 更新所有节点\n\n2. **ASK 重定向**：\n   - 槽位处于 MIGRATING 状态\n   - 客户端请求源节点\n   - 源节点返回 ASK {dst_ip}:{port}（临时重定向）\n   - 客户端先发 ASKING → 再发命令到目标\n\n3. **MOVED 重定向**：\n   - 槽位永久移动（节点槽位表已更新）\n   - 客户端需要更新槽位缓存\n   - 永久重定向\n\n4. **客户端处理**：\n   - MOVED：更新本地槽位映射\n   - ASK：ASKING + 请求目标节点\n   - Jedis/Lettuce 自动处理\n\n5. **性能影响**：\n   - 迁移期间源节点增加读取开销\n   - 大 key 迁移耗时（阻塞 MIGRATE）\n   - 建议低峰期执行',
      ['MIGRATING（转移中）→ ASK 临时重定向', 'MOVED 永久重定向（客户端更新槽位映射）'], ['redis', 'cluster', 'resharding']),

    q('redis', 'medium', 'short_answer', 'Redis 的 SCAN 与游标迭代器',
      '分析 Redis SCAN 命令的游标迭代实现。SCAN 的跳跃（scheme）——基于 Hash Slot 的高位递增。FULL 和 COUNT 参数控制迭代精度。SCAN 的近似全量（保证不遗漏但可能重复）。SCAN vs KEYS 在大数据量下的性能差异。',
      'Redis SCAN：\n\n1. **游标实现**：\n   - SCAN cursor [MATCH pattern] [COUNT count]\n   - 服务器返回新游标（0 = 完成）+ 一批 key\n   - 基于哈希表的遍历\n\n2. **高位递增**：\n   - 不是从 0 递增（避免 rehash 冲突）\n   - 二进制反序（reverse bits）\n   - rehash 后不会遗漏也不会重复\n   - 保证每个 hash slot 被遍历\n\n3. **COUNT vs FULL**：\n   - COUNT：提示要返回的 key 数（不是精确值）\n   - 默认 10（小批量适合）\n   - TYPE：按类型过滤\n\n4. **SCAN vs KEYS**：\n   - KEYS：阻塞所有其他命令（百万 key 时阻塞数秒）\n   - SCAN：游标分批返回（每次短暂阻塞）\n   - **线上绝对不要用 KEYS**\n\n5. **变体**：\n   - SSCAN：Set 的元素迭代\n   - HSCAN：Hash 的 field 迭代\n   - ZSCAN：ZSet 的元素迭代\n   - 同样游标机制',
      ['SCAN 的高位递增保证 rehash 后不遗漏不漏计', '线上用 SCAN 替代 KEYS（不阻塞主线程）'], ['redis', 'scan']),

    q('redis', 'hard', 'short_answer', 'Redis 的 HyperLogLog 算法原理',
      '深入分析 Redis HyperLogLog 的实现。HLL 的伯努利实验原理——通过最大前导 0 估算基数。LogLog 到 HyperLogLog 的优化——调和平均减少误差。Redis 的 HLL 编码——稀疏（Dense）和紧凑（Sparse）转换。HLL 的误差率和内存占用。',
      'HyperLogLog 原理：\n\n1. **算法原理**：\n   - 哈希函数将元素映射为二进制串\n   - 统计最大前导 0 个数（ρ）\n   - 基数估算 ≈ 2^ρ\n\n2. **LogLog → HyperLogLog**：\n   - LogLog：取多个哈希值的 ρ 的算术平均\n   - HyperLogLog：调和平均（降低异常值影响）\n   - 误差率：~1.04/√m（m=16384 → ~0.81%）\n\n3. **Redis 实现**：\n   - 16384 个寄存器（6-bit = 12KB）\n   - 每个寄存器存储最大前导 0 个数\n   - 总内存 = 16384 × 6 / 8 = 12KB\n\n4. **编码**：\n   - **稀疏编码**：元素少时用（2KB）\n   - **紧凑编码**：元素多时用（12KB）\n   - 自动转换（sparseness 阈值）\n\n5. **合并**：\n   - PFMERGE：多个 HLL 合并（取每个寄存器最大值）\n   - 可分布式聚合',
      ['HyperLogLog ≈ 12KB 内存估算任意数量级的基数', '误差率 ~0.81%（远超精确计数的内存效率）'], ['redis', 'hyperloglog']),

    q('redis', 'medium', 'short_answer', 'Redis 布隆过滤器模块',
      '讨论 RedisBloom 模块的布隆过滤器实现。布隆过滤器的哈希函数和位数组。BF.ADD/BF.MADD/BF.EXISTS/BF.MEXISTS 命令。布隆过滤器的误判率（false positive rate）——位数组大小和哈希函数数的关系。布隆过滤器在缓存穿透防护中的应用。',
      'Redis 布隆过滤器：\n\n1. **原理**：\n   - m 位数组 + k 个哈希函数\n   - 添加：k 个哈希 → 对应位设 1\n   - 查询：k 个哈希 → 所有位为 1 → 可能存在\n   - 特性：不存在一定准确，存在可能误判\n\n2. **参数设计**：\n   - 位数组大小 m = -n * ln(p) / (ln(2))^2\n   - 哈希函数数 k = m/n * ln(2)\n   - p = 期望误判率\n   - 示例：n=1M, p=1% → m=10M bits(1.2MB), k=7\n\n3. **RedisBloom 命令**：\n   - BF.RESERVE key error_rate capacity（初始化）\n   - BF.ADD / BF.MADD（批量添加）\n   - BF.EXISTS / BF.MEXISTS（批量查询）\n   - 自动按需扩容\n\n4. **应用**：\n   - **缓存穿透防护**：查询前检查是否存在\n   - **爬虫去重**：URL 去重\n   - **推荐去重**：已推荐内容过滤\n\n5. **局限**：\n   - 不能删除元素\n   - 位数组越大误判率越低（内存权衡）\n   - 不适合精确去重场景',
      ['布隆过滤器：不存在一定准，存在可能误判', '参数 m,k 根据数据量和期望误判率计算'], ['redis', 'bloom-filter', 'redibloom']),

    q('redis', 'medium', 'short_answer', 'Redis 的编码与对象结构',
      '深入分析 Redis 的底层编码结构。String 的三种编码：int/embstr/raw。Hash 的 ziplist → 哈希表 转换。List 的 quicklist 结构（ziplist 链表）。Set 的 intset → 哈希表 转换。ZSet 的 ziplist → skiplist 转换。配置阈值和转换条件。',
      'Redis 编码：\n\n1. **String**：\n   - **int**：整数（≤ 2^63-1）\n   - **embstr**：短字符串（≤ 44 bytes）\n   - **raw**：长字符串\n   - embstr 和 raw 差别：embstr 一次分配（redisObject + sdshdr 连续）\n\n2. **Hash**：\n   - **ziplist**：field 数 < 512 且 value < 64 bytes\n   - **哈希表**：超过阈值\n\n3. **List**：\n   - **quicklist**：ziplist 的链表\n   - 每个 ziplist 默认 8KB\n   - 压缩：compress 深度\n\n4. **Set**：\n   - **intset**：所有元素是整数且数 < 512\n   - **哈希表**：超过阈值\n\n5. **ZSet**：\n   - **ziplist**：元素数 < 128 且 value < 64 bytes\n   - **skiplist**：超过阈值\n\n6. **配置**：\n   - hash-max-ziplist-entries / hash-max-ziplist-value\n   - set-max-intset-entries\n   - zset-max-ziplist-entries / zset-max-ziplist-value',
      ['Redis 自动选择最优编码（小 = ziplist/intset，大 = 哈希表/skiplist）', '编码在值变化时自动转换（只升不降）'], ['redis', 'encoding']),

    q('redis', 'hard', 'short_answer', 'Redis 的 SkipList 与 ZSet 实现',
      '深入分析 Redis ZSet 的跳表（SkipList）实现。跳表的层级结构——多级索引的概率生成。ZSet 的双结构——哈希表（快速查找） + 跳表（有序范围查询）。跳表的插入/删除/更新复杂度。跳表 vs 平衡树的对比。',
      'Redis ZSet：\n\n1. **双结构**：\n   - **哈希表**：元素 → score 的映射（O(1) 查找）\n   - **跳表**：score 排序的索引（O(log N) 范围查询）\n   - 两者协同\n\n2. **跳表层级**：\n   - 每个节点随机生成层数（幂律分布，level=1 概率 0.5）\n   - 典型最大层数 32（Redis 代码限制 32）\n   - 每层 B+1 个指针\n\n3. **操作复杂度**：\n   - ZADD：O(log N)（更新时同时更新哈希表和跳表）\n   - ZRANGE：O(log N + M)（M = 结果数）\n   - ZSCORE：O(1)（直接从哈希表取）\n\n4. **跳表 vs 平衡树**：\n   - 跳表：实现简单、范围查询方便、内存占用中等\n   - 平衡树（RB-Tree）：更复杂、范围查询需中序遍历\n   - Redis 选择的理由：实现简单、足够高效\n\n5. **ziplist → skiplist**：\n   - 元素数 < 128 且 score 串 < 64 bytes → ziplist\n   - 超过 → skiplist + hashtable',
      ['ZSet = 哈希表（O(1) ZSCORE）+ 跳表（O(log N) ZRANGE）', '跳表比平衡树实现简单，性能接近'], ['redis', 'zset', 'skiplist']),

    q('redis', 'medium', 'short_answer', 'Redis 预警与慢查询分析',
      '讨论 Redis 的监控和诊断工具。SLOWLOG 慢查询的捕获和分析。MONITOR 命令的线上使用风险。Redis-cli 的 --stat/--latency/--bigkeys 诊断。Redis 的 INFO 命令关键指标解读。Redison 等第三方监控工具的集成。',
      'Redis 诊断：\n\n1. **SLOWLOG**：\n   - 记录执行时间超过 slowlog-log-slower-than（默认 10ms）的命令\n   - SLOWLOG GET：查看慢查询\n   - 常用：SLOWLOG GET 100\n\n2. **MONITOR**：\n   - 实时打印所有命令\n   - 风险：高流量下输出巨大、降低 Redis 性能\n   - 线上不推荐使用（只在低峰期）\n\n3. **redis-cli 工具**：\n   - `--stat`：实时统计（ops、内存、命中率）\n   - `--latency`：延迟测试\n   - `--bigkeys`：扫描大 key\n   - `--hotkeys`：扫描热点 key\n\n4. **INFO 关键指标**：\n   - instantaneous_ops_per_sec：QPS\n   - hit ratio：keyspace_hits / (keyspace_hits + keyspace_misses)\n   - connected_clients：连接数\n   - used_memory_rss：实际 RSS 内存\n\n5. **第三方工具**：\n   - Redis-Prometheus Exporter\n   - Redison（Grafana 面板）\n   - CacheCloud（携程：Redis 管理平台）',
      ['SLOWLOG GET 查慢查询，redis-cli --bigkeys 查大 key', 'MONITOR 线上慎用（高流量降性能）'], ['redis', 'monitoring', 'slowlog']),

    q('redis', 'hard', 'short_answer', 'Redis Lua 脚本的原子性与执行模型',
      '深入分析 Redis Lua 脚本的执行模型。EVAL 命令——脚本上传 + SHA1 缓存 + EVALSHA。脚本复制——从库执行还是主库传播效果？Redis 7 的 Function（代替 EVAL 的脚本管理）。脚本执行时的全局锁。Lua 脚本的最佳实践和限制。',
      'Redis Lua：\n\n1. **EVAL/EVALSHA**：\n   - EVAL script numkeys key1 val1\n   - 服务器缓存脚本的 SHA1 摘要\n   - EVALSHA sha1 numkeys...（减少带宽）\n   - SCRIPT LOAD + EVALSHA 两步\n\n2. **原子性**：\n   - Lua 脚本执行中阻塞其他命令（全局锁）\n   - 脚本执行期间其他客户端等待\n   - **不要写长时间运行的脚本**（阻塞所有）\n\n3. **复制**：\n   - 默认：复制脚本效果（EVAL 传到从库执行）\n   - 随机命令（SPOP/TIME/RANDOMKEY）在复制中可能不一致\n   - Redis 使用 SET_REPL 复制效果（不是源命令）\n\n4. **Redis 7 Function**：\n   - FUNCTION LOAD：注册函数（不传命令）\n   - FCALL：调用函数\n   - 函数持久化在 RDB/AOF\n   - 优势：统一管理、自动同步到从库\n\n5. **限制**：\n   - 脚本执行时间默认 5s（lua-time-limit）\n   - 超时后只 log warning 不自动停止\n   - 不允许访问系统状态（文件、网络）',
      ['Lua 脚本原子执行（全局锁），不要写长脚本', 'Redis 7 Function 替代 EVAL（持久化 + 自动同步）'], ['redis', 'lua', 'scripting']),

    q('redis', 'medium', 'short_answer', 'Redis Sentinel 的 Raft 风格故障转移',
      '深入分析 Redis Sentinel 的故障转移机制。Sentinel 的 Raft 风格选举——quorum 和 majority。主观下线（S_DOWN）和客观下线（O_DOWN）。Leader Sentinel 的故障转移流程。Split-brain（脑裂）的防护。',
      'Sentinel 故障转移：\n\n1. **心跳探活**：\n   - sentinel 每秒 PING 所有节点\n   - 超过 down-after-milliseconds 未响应 → S_DOWN\n\n2. **O_DOWN 判断**：\n   - sentinel_a 发现 S_DOWN → 询问其他 sentinel\n   - 获得 quorum 个 sentinel 同意 → O_DOWN\n   - quorum 通常 = sentinel 数/2 + 1\n\n3. **Leader 选举**：\n   - Sentinel 发现 O_DOWN → 发起 Leader 选举\n   - 其他 Sentinel 投票\n   - 获得多数票 → 成为 Leader\n\n4. **故障转移**：\n   - Leader Sentinel 执行：\n   - 选一个新主库（slave 优先级高、复制偏移量大）\n   - SLAVEOF no one\n   - 其他从库指向新主库\n   - 配置重写\n\n5. **脑裂防护**：\n   - **min-slaves-to-write**：写入需要最少从库数\n   - **min-slaves-max-lag**：从库最大复制延迟\n   - 主库孤立时拒绝写入（防止脑裂数据不一致）',
      ['Sentinel 用类 Raft 协议选举执行故障转移', 'min-slaves-to-write 防止脑裂写入'], ['redis', 'sentinel']),

    q('redis', 'medium', 'short_answer', 'Redis 7.0 Redis Function 与 ACL 增强',
      '介绍 Redis 7.0 的主要新特性。Redis Functions（替代 EVAL 的脚本管理）——持久化、复制、权限控制。ACL 的增强——key 权限（read/write 的 key pattern）和 command 分类管理。Redis 7.0 的发布与订阅、Stream 改进。性能改进和内存优化。',
      'Redis 7.0：\n\n1. **Redis Functions**：\n   - FUNCTION LOAD：注册脚本为函数\n   - FCALL：按函数名调用（不是按 SHA）\n   - 函数保存在 RDB/AOF（重启不丢）\n   - 自动同步到副本\n\n2. **ACL 增强**：\n   - key 权限：`ACL SETUSER alice ~app1:*`（只允许访问 app1: 开头的 key）\n   - command 分类：只允许读命令（`+@read`）\n   - selector 语法：`(<command>|<category>)`\n\n3. **Stream 改进**：\n   - XGROUP CREATECONSUMER：自动创建消费者\n   - XAUTOCLAIM：自动认领 pending 消息\n\n4. **性能改进**：\n   - 避免一些不必要的 key 过期扫描\n   - 内存使用减少（改进的 ziplist 等）\n\n5. **集群改进**：\n   - 集群节点上线更快的状态同步\n   - 更好的集群槽迁移用户体验',
      ['Redis Functions 将脚本持久化存储（重启不丢）', 'Redis 7 ACL 支持 key pattern 级别的权限控制'], ['redis', 'redis7']),

    q('redis', 'medium', 'short_answer', 'Redis 与 MySQL 一致性保障方案',
      '讨论 Redis 缓存与 MySQL 数据库的一致性方案。Cache-Aside 模式的读/写流程。先写 DB 后删除缓存（推荐方案）的缓存一致性。延迟双删策略（先删缓存 → 写 DB → 延迟再删）。Binlog 监听（Canal）的异步 Cache 同步。最终一致性 vs 强一致性的选择。',
      'Redis + MySQL 一致性：\n\n1. **Cache-Aside（常用）**：\n   - 读：先查缓存 → 未命中→ 查 DB → 写缓存\n   - 写：先写 DB → 删除缓存\n   - **问题**：写 DB 和删除缓存不是原子操作\n\n2. **先删缓存再写 DB**：\n   - 并发问题：A 删缓存 → B 读缓存未命中→ 读 DB → A 写 DB\n   - B 读到旧数据写入缓存（缓存永远脏）\n\n3. **延迟双删**：\n   - 删缓存 → 写 DB → 延迟（~500ms）→ 再删缓存\n   - 延迟时间 > 读 DB + 写缓存 的时间\n   - 减少脏数据的窗口\n\n4. **Binlog 监听（Canal）**：\n   - 监听 MySQL Binlog → 解析变更 → 同步到 Redis\n   - 解耦应用和缓存更新\n   - 缺点：引入 Canal 运维复杂度\n\n5. **选择**：\n   - 弱一致性场景：Cache-Aside（先写 DB 再删缓存）\n   - 要求高一致性：延迟双删 + Binlog 兜底\n   - 强一致性：不依赖缓存（走 DB + read-through）',
      ['先写 DB 再删缓存是 Cache-Aside 推荐方案', '延迟双删 + Binlog 兜底保证最终一致性'], ['redis', 'mysql', 'consistency']),

    q('redis', 'hard', 'short_answer', 'Redis 的事务隔离性与 Lua 对比',
      '深入分析 Redis 事务的隔离级别。MULTI/EXEC 在 Redis 单线程模型下的隔离效果。Lua 脚本的原子性隔离。Redis 不支持回滚（rollback）的设计哲学。对比 ACID 特性在 Redis 事务中的满足情况。WATCH 的多 key 原子性检查。',
      'Redis 事务隔离：\n\n1. **MULTI/EXEC 隔离**：\n   - 单个 EXEC 执行时阻塞所有其他命令\n   - EXEC 内的命令顺序执行\n   - 其他连接的命令在 EXEC 执行完成后才执行\n   - 隔离级别 ≈ 可序列化\n\n2. **Lua 隔离**：\n   - 脚本执行期间同样阻塞\n   - 但脚本内的多条命令可以包含逻辑\n   - Lua 隔离性 = 事务隔离性（单线程 + 阻塞）\n\n3. **原子性**：\n   - EXEC：命令全部执行或 Queue 阶段出错则不执行\n   - Queue 成功但执行出错（如类型错误）→ 不回滚\n   - Redis 设计哲学：不回滚（错误是因为开发者犯错）\n\n4. **ACID**：\n   - A（原子性）：部分满足（语法错误不执行，运行时错误不回滚）\n   - C（一致性）：满足（执行中阻塞保证一致性）\n   - I（隔离性）：满足（串行执行）\n   - D（持久性）：取决于 AOF/RDB 配置\n\n5. **WATCH 限制**：\n   - 不能监控多个 key 的原子变更（watch a,b transaction 可能失败）\n   - watch 的 key 变化时整个事务取消',
      ['Redis 事务可序列化隔离（单线程串行执行）', '运行时出错不回滚（设计哲学：错误是开发者的问题）'], ['redis', 'transaction', 'isolation']),

    q('redis', 'medium', 'short_answer', 'Redis 在排行榜场景的 ZSet 应用',
      '讨论 Redis ZSet 在排行榜中的深度应用。实时排行榜的 ZADD/ZINCRBY。排名的 ZRANK/ZREVRANK。TopN 的 ZREVRANGE。区间排名（如 3-5 名）的 ZREVRANGE。同分排名的问题——时间优先的 ZSet 排序技巧。',
      'ZSet 排行榜：\n\n1. **基础操作**：\n   - ZINCRBY leaderboard user1 10：加 10 分\n   - ZREVRANK leaderboard user1：查看排名\n   - ZREVRANGE leaderboard 0 9 WITHSCORES：Top10\n\n2. **同分处理**：\n   - ZSet 同分时按字典序（lexicographical order）\n   - 期望：先到先得（时间优先）\n   - **技巧**：score = 分数 + 1 - timestamp / 1e10\n   - 或：分数 + (MAX_TIMESTAMP - timestamp) / 1e10\n\n3. **分页**：\n   - ZREVRANGE leaderboard 0 9（第一页）\n   - ZREVRANGE leaderboard 10 19（第二页）\n\n4. **聚合**：\n   - 天榜：每天新 ZSet（leaderboard:20260604）\n   - 周榜：ZUNIONSTORE 合并天榜\n   - ZUNIONSTORE week:1 7 leaderboard:20260604 ... AGGREGATE SUM\n\n5. **大规模优化**：\n   - 百万级数据：ZSet 占用内存 O(N)\n   - 只保留 Top 1000（ZREMRANGEBYRANK）\n   - 非 Top 数据存 DB',
      ['ZSet 同分按字典序（用 score 编码实现时间优先）', '天榜独立 + ZUNIONSTORE 周榜 = 高效聚合'], ['redis', 'zset', 'leaderboard']),

    q('redis', 'medium', 'short_answer', 'Redis 位图与用户行为分析',
      '讨论 Redis 位图（BitMap）在用户行为分析中的应用。SETBIT/GETBIT 的位操作。BITCOUNT 的统计实现。BITOP 的多位图运算（AND/OR/XOR/NOT）。位图在日活跃用户（DAU）、签到功能中的存储效率。位图 vs HyperLogLog 的精确度对比。',
      'Redis 位图：\n\n1. **位图原理**：\n   - String 的位操作\n   - SETBIT key offset 0/1（设置某一位）\n   - GETBIT key offset（获取某一位）\n   - 底层：SDS + 位数组\n\n2. **统计**：\n   - BITCOUNT key：统计 1 的个数\n   - BITPOS key 1：查找第一个 1\n\n3. **多图运算**：\n   - BITOP AND dest key1 key2：交集\n   - BITOP OR dest key1 key2：并集\n   - BITOP XOR dest key1 key2：异或\n\n4. **DAU 场景**：\n   - 每天一个 bit key（dau:20260604）\n   - 用户 ID 作为 offset\n   - BITCOUNT dau:20260604 = DAU\n   - BITOP OR dau:week1 dau:20260604 dau:20260605 ... = 周活跃\n   - 内存：1 亿用户 ≈ 12MB/天\n\n5. **BitMap vs HLL**：\n   - 位图：精确计数、占用内存 O(N)\n   - HLL：近似计数（~0.81% 误差）、固定 12KB\n   - 选型：精确 → 位图、大基数 → HLL',
      ['位图存储用户状态（签到/DAU）按位存储、按位统计', 'BITOP 实现多日聚合运算'], ['redis', 'bitmap', 'analytics']),

    q('redis', 'medium', 'short_answer', 'Redis 实现分布式限流方案',
      '讨论基于 Redis 的分布式限流实现。计数器模式——INCR + EXPIRE。滑动窗口——有序集合（ZSet）的时间窗口。令牌桶（Token Bucket）——Redis Hash 存储令牌。漏斗（Leaky Bucket）——固定速率漏出。Redis 限流的原子性问题（Lua 脚本）。',
      'Redis 限流：\n\n1. **计数器模式**：\n   - INCR key + EXPIRE key 60\n   - 值超过阈值 → 限流\n   - 问题：临界值突刺（边界重置瞬间超量）\n\n2. **滑动窗口**：\n   - ZADD key timestamp value\n   - ZREMRANGEBYSCORE key timestamp - window\n   - ZCARD key < threshold\n   - 更精确（解决临界值问题）\n\n3. **令牌桶**：\n   - Lua 脚本实现：\n   - 上次补充时间 → 计算应补充的令牌\n   - 消耗令牌 → 更新\n   - 支持突发流量\n\n4. **原子性**：\n   - 限流必须原子（竞争条件导致超限）\n   - Lua 脚本保证原子性\n   - 推荐：Redis Lua 实现限流\n\n5. **应用场景**：\n   - 接口限流（每用户/每 IP）\n   - 分布式限流（全局 QPS 控制）\n   - 令牌桶适合 API 限流（允许突发）',
      ['滑动窗口比计数器更精确（避免边界突刺）', 'Lua 脚本保证限流判断和执行的原子性'], ['redis', 'rate-limiting', 'distributed']),

    q('redis', 'hard', 'short_answer', 'Redis 的异步删除与 lazy-free 演进',
      '深入分析 Redis 4.0+ lazy-free 的演进。异步删除的 UNLINK 和 FLUSHDB ASYNC。异步删除的线程池（bio 线程）实现。lazy-free 对 flush/swapdb 的优化。异步删除的内存回收速度。配置和监控 lazy-free。',
      'Redis lazy-free：\n\n1. **UNLINK vs DEL**：\n   - DEL：主线程回收内存（阻塞）\n   - UNLINK：断开 key 的链接 → 后台 bio 线程回收\n   - unlink 瞬间返回（O(1)）\n\n2. **FLUSHDB ASYNC**：\n   - FLUSHDB ASYNC：清空所有 key 异步\n   - 大数据库清空瞬间完成（不阻塞）\n\n3. **bio 线程**：\n   - bio_close_file：关闭文件（AOF/RDB）\n   - bio_aof_fsync：AOF fsync\n   - bio_lazy_free：异步释放内存\n   - 三个后台线程\n\n4. **配置**：\n   - lazyfree-lazy-eviction=yes\n   - lazyfree-lazy-expire=yes\n   - lazyfree-lazy-server-del=yes\n   - replica-lazy-flush=yes\n\n5. **监控**：\n   - INFO memory 中的 lazy_free_pending_objects\n   - 大于 0 表示有异步删除进行中\n   - 大量 pending → 内存回收慢',
      ['UNLINK = 主线程解引用 + bio 线程回收内存', 'lazy-free 配置全面（eviction/expire/flush）'], ['redis', 'lazy-free']),

    q('redis', 'medium', 'short_answer', 'Redis 连接池与连接管理',
      '讨论 Redis 连接池的配置和管理。连接池的核心参数：maxTotal/maxIdle/minIdle。Jedis/Lettuce 连接池配置。连接池耗尽的影响和诊断。连接泄露的检测。Redis 的 maxclients 限制。连接管理最佳实践。',
      'Redis 连接池：\n\n1. **池参数**：\n   - **maxTotal**：最大连接数（根据 QPS 和延迟）\n   - **maxIdle**：最大空闲数\n   - **minIdle**：最小空闲数（预热）\n   - **maxWaitMillis**：获取连接超时\n\n2. **Jedis vs Lettuce**：\n   - Jedis：阻塞式、需要连接池\n   - Lettuce：异步 Netty、连接复用\n   - Lettuce 连接效率更高（单连接多请求）\n\n3. **连接池耗尽**：\n   - 效果：获取连接等待 → 超时异常\n   - 原因：慢查询 blocking、连接泄露、突发流量\n   - 诊断：连接池监控\n\n4. **maxclients**：\n   - Redis 服务端最大连接数（默认 10000）\n   - 超过 → 拒绝连接\n   - 每个连接 ~10KB 内存\n\n5. **最佳实践**：\n   - 用连接池（不要每次创建新连接）\n   - 配置超时时间（避免无限等待）\n   - 监控连接池指标\n   - 连接预热（minIdle > 0）',
      ['Lettuce 异步连接比 Jedis 阻塞连接更高效', 'maxclients + 连接池耗尽监控 = Redis 运维基础'], ['redis', 'connection-pool']),

    q('redis', 'hard', 'short_answer', 'Redis 的性能基准与极限压测',
      '讨论 Redis 的性能基准测试方法和极限。redis-benchmark 的使用和参数。单实例的 QPS 极限（~10w ops/s）。Pipeline 下的吞吐（~100w ops/s）。影响 Redis 性能的关键因素：网络延迟、内存带宽、值大小。memtier_benchmark 的对比测试。',
      'Redis 性能基准：\n\n1. **redis-benchmark**：\n   - `redis-benchmark -h host -p port -c 50 -n 10000 -q`\n   - 选项：-c（并发数）、-n（请求数）、-d（值大小）\n   - -P（Pipeline 数）、-t（只测某些命令）\n\n2. **单实例极限**：\n   - 简单 GET/SET：~10w qps\n   - Pipeline（10 一批）：~100w qps\n   - 瓶颈通常是网络或内存带宽\n\n3. **影响因素**：\n   - **网络延迟**：1ms 延迟 → 10w qps（单线程需要时间）\n   - **值大小**：10KB vs 100 bytes → 吞吐差异 10x\n   - **内存带宽**：大值场景内存带宽成为瓶颈\n\n4. **memtier_benchmark**：\n   - 比 redis-benchmark 更现代的压测工具\n   - 支持 JSON 输出、多线程、百分比统计\n   - 更适合综合测试\n\n5. **生产压测**：\n   - 压测环境与生产配置一致\n   - 监控：Redis 延迟（p99）和系统 CPU 使用\n   - 定位瓶颈：网络/内存/CPU/磁盘（RDB/AOF）',
      ['单实例 ~10w qps（无 Pipeline），Pipeline ~100w qps', '瓶颈通常是网络或内存带宽（不是 CPU）'], ['redis', 'benchmark', 'performance']),

    q('redis', 'medium', 'short_answer', 'Redis 多数据库与命名空间设计',
      '讨论 Redis 的 database（select 0-15）和命名规范。Redis 16 个 db 的用途和限制。Redis Cluster 不支持多 db（只有一个 db 0）。key 的命名空间设计——冒号分隔的分层命名（user:123:profile）。key 长度的最佳实践。',
      'Redis 命名空间：\n\n1. **database 选择**：\n   - SELECT 0-15（共 16 个 db）\n   - 用途：隔离不同业务\n   - 局限：不适用于 Cluster（只有 db 0）\n   - 不隔离权限（ACL 粒度到 db）\n\n2. **key 命名规范**：\n   - `project:module:entity:id:field`\n   - 示例：`app:user:123:profile`、`app:order:456:status`\n   - SCAN/KEYS 可以用 pattern 扫描\n   - 自动按前缀分组\n\n3. **key 长度**：\n   - key 越短越好（内存占用）\n   - 太短失去可读性\n   - 建议：20-50 字符\n\n4. **Hashed key**：\n   - Hash Tag：`{user:123}:profile`\n   - Cluster 模式下用 hash tag 让相关 key 在同一个 slot\n   - 括号中的部分作为 hash 输入\n\n5. **最佳实践**：\n   - Cluster 环境：只用一个 db 0\n   - 命名统一规范\n   - Hash Tag 让批量操作更高效\n   - 避免超长 key',
      ['Cluster 模式下只有 db 0（所有 key 在同一个命名空间）', 'Hash Tag { } 关联 key 到同一 slot'], ['redis', 'naming']),
]

def main():
    path = os.path.join(os.path.dirname(__file__), 'redis.json')
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
    print(f'Total redis questions: {len(data)}')

if __name__ == '__main__':
    main()
