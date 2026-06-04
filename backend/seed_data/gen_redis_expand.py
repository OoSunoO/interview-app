#!/usr/bin/env python3
"""Expand redis.json with 27 additional questions (23→50)."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    # ---- 核心数据结构深入 ----
    q('redis', 'hard', '问答', 'Redis Stream 数据结构详解',
      '详细说明 Redis Stream 的内部实现和用法。Stream 作为可持久化的消息队列，如何实现消息的追加写入、消费者组（Consumer Group）的负载均衡、ACK 机制和 PEL（Pending Entries List）管理。对比 Stream 与 Pub/Sub 和 List 的适用场景。',
      'Redis Stream：\n\n1. **核心结构**：\n   - 每个 Stream 是一个具有唯一 ID 的消息链表\n   - 消息 ID 格式：`<millisecondsTime>-<sequenceNumber>`（自动生成或自定义）\n   - 每条消息可以包含多个 field-value 对（类似 Hash）\n\n2. **消费者组机制**：\n   - 通过 XGROUP 创建消费者组，指定起始消费位置\n   - 组内消费者通过 XREADGROUP 读取消息\n   - 每条消息只投递给组内的一个消费者（类似 Kafka 的分区）\n   - **PEL（Pending Entries List）**：已发送但未确认的消息列表\n   - 通过 XACK 从 PEL 中移除已确认消息\n\n3. **可靠性保证**：\n   - **XCLAIM**：其他消费者认领超时的 pending 消息\n   - **XPENDING**：查看 PEL 中的消息详情\n   - **XINFO**：检查 Stream 和消费者组的状态\n\n4. **对比**：\n   - Pub/Sub：即发即忘，不支持持久化，适合实时广播\n   - List（BRPOPLPUSH）：支持可靠消息但缺乏消费者组\n   - Stream：持久化 + 消费者组 + ACK 机制，功能最完整\n\n5. **适用场景**：\n   - 消息队列（任务分发、事件驱动）\n   - 活动流（用户时间线、操作日志）\n   - 跨服务数据同步',
      ['Stream ID 格式为 <毫秒时间戳>-<序号>，支持时间范围查询', '消费者组 + PEL 实现了消息的负载均衡和可靠消费', 'XCLAIM 可处理消费者故障导致的 PEL 消息堆积'], ['redis', 'stream']),

    q('redis', 'hard', '问答', 'Redis Bitmap 与 HyperLogLog 原理',
      '深入分析 Redis 的 Bitmap（位图）和 HyperLogLog（基数统计）的底层实现。Bitmap 如何利用位操作实现高效的大规模去重和统计？HyperLogLog 的误差控制（标准误差 0.81%）是如何通过概率算法保证的？各自的实际应用场景。',
      'Bitmap 与 HyperLogLog：\n\n1. **Bitmap**：\n   - 本质是 String 类型的位操作\n   - 8 字节 = 2^32 位（512MB 可表示 42 亿个位）\n   - **操作**：SETBIT、GETBIT、BITCOUNT、BITOP（AND/OR/XOR/NOT）、BITFIELD\n   - **应用**：\n     - 日活用户统计：user_id 作为 offset，登录设为 1\n     - 签到系统：day_of_year 作为 offset\n     - 布隆过滤器替代：适合已知数据集的情况\n\n2. **HyperLogLog**：\n   - 占用 12KB 固定内存，无论数据量多大\n   - **原理**：基于伯努利试验——估计最长前导零串\n   - 多个桶 + 偏差修正 → 标准误差 ≈ 0.81%\n   - **操作**：PFADD（添加）、PFCOUNT（基数估算）、PFMERGE（合并）\n   - **应用**：\n     - UV 统计（千万级用户只需 12KB）\n     - 独立 IP 计数\n     - 搜索词去重\n\n3. **对比**：\n   - Bitmap：精确、灵活，但内存随 user_id 上限增长\n   - HyperLogLog：内存固定但有误差、无法获取元素内容\n   - 组合使用：粗粒度用 HLL，需要精确时回退到 Bitmap',
      ['Bitmap 用位操作实现精确统计，内存随数据上限线性增长', 'HyperLogLog 12KB 固定内存，0.81% 误差，适合海量基数统计', 'HyperLogLog 只能统计基数不能获取元素具体值'], ['redis', 'bitmap', 'hyperloglog']),

    q('redis', 'hard', '问答', 'Redis GEO（地理位置）数据结构',
      '解释 Redis GEO 数据结构的底层实现原理和常用命令。GEO 如何基于 Sorted Set + Geohash 编码实现地理位置的存储和范围查询？GEORADIUS 和 GEOSEARCH 的空间搜索算法。设计一个基于 Redis GEO 的附近的人/店铺系统。',
      'Redis GEO：\n\n1. **底层实现**：\n   - 基于 Sorted Set（ZSET）实现\n   - 经纬度 → Geohash 编码（52 位整数）→ 作为 score 存入 ZSET\n   - Geohash 特性：前缀匹配越长的两个位置距离越近\n\n2. **常用命令**：\n   - **GEOADD**：添加地理位置（key, longitude, latitude, member）\n   - **GEOPOS**：获取成员经纬度\n   - **GEODIST**：计算两点距离（单位 m/km/mi/ft）\n   - **GEORADIUS/GEOSEARCH**：基于圆心+半径的范围查询\n   - **GEOSEARCHSTORE**：结果存储到新 key\n\n3. **搜索算法**：\n   - GEORADIUS：以给定经纬度为圆心，计算覆盖该圆的最小 Geohash 矩形\n   - 在该矩形内执行 ZRANGEBYSCORE 搜索\n   - 对边界点进行精确距离过滤\n   - 距离 = R * acos(sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2)*cos(lon1-lon2))\n\n4. **附近的人设计**：\n   - Key = city:beijing:users，member = user_id，score = geohash\n   - GEOADD 用户位置 → GEORADIUS 查询附近 N km 的用户\n   - 定时刷新（如每 5 分钟）\n   - **优化**：分城市存储，避免全局集合过大\n   - **局限**：单机 Redis 无法分布式存储大量 GEO 数据',
      ['GEO 基于 Sorted Set + Geohash 编码', 'GEORADIUS 先按 Geohash 矩形粗筛再精确距离过滤', '分城市/区域存储可优化大规模 GEO 查询性能'], ['redis', 'geo']),

    # ---- 高级特性 ----
    q('redis', 'hard', '问答', 'Redis Lua 脚本与原子操作',
      '详细说明 Redis Lua 脚本在原子操作中的应用。EVAL/EVALSHA 命令的工作流程、脚本缓存机制、以及 Lua 脚本在 Redis 中的沙箱限制。如何利用 Lua 脚本实现自定义原子操作（如分布式锁续期、限流令牌桶）？对比 Lua 脚本与 Redis Transactions（MULTI/EXEC）的异同。',
      'Redis Lua 脚本：\n\n1. **执行机制**：\n   - EVAL：直接执行 Lua 脚本，可带参数\n   - EVALSHA：执行已缓存脚本的 SHA1 摘要（减少带宽）\n   - **SCRIPT LOAD**：手动缓存脚本\n   - **原子性**：脚本执行期间阻塞所有其他命令（单线程优势）\n\n2. **沙箱限制**：\n   - 不能访问外部系统（无文件 IO、网络 IO）\n   - 不能使用全局变量（使用 Lua 的 KEYS 和 ARGV）\n   - 只有有限的库：base、string、table、math、cjson、cmsgpack\n   - 超时限制：lua-time-limit（默认 5 秒）→ 超时后发送 SCRIPT KILL\n\n3. **应用实例**：\n   - **分布式锁续期**：检查锁是否仍持有 → 是则续期 → 原子完成\n   - **令牌桶限流**：检查令牌 → 消耗令牌 → 更新剩余 → 原子完成\n   - **库存扣减**：检查库存 > 0 → 扣减 → 返回结果\n\n4. **Lua vs Transactions**：\n   - MULTI/EXEC：命令批量执行、不保证条件原子性（WATCH 是乐观锁）\n   - Lua 脚本：真正的原子执行、条件逻辑\n   - Lua 更适合需要条件判断的复杂操作\n   - 简单批量操作用 MULTI/EXEC 足够',
      ['Lua 脚本在 Redis 中是原子执行的（单线程）', '沙箱限制 Lua 不能访问外部系统或使用全局变量', 'Lua 脚本适合复杂条件逻辑，MULTI/EXEC 适合简单批量操作'], ['redis', 'lua']),

    q('redis', 'medium', '问答', 'Redis ACL 与安全配置',
      '讨论 Redis 6+ 的 ACL（访问控制列表）系统。如何创建用户、分配权限、限制可访问的命令和 key？ACL 的两种配置方式。SSL/TLS（Redis 6.2+）加密传输的配置。安全加固的最佳实践（端口、认证、命令禁用）。',
      'Redis ACL 与安全：\n\n1. **ACL 核心概念**：\n   - **用户**：default + 自定义用户\n   - **权限规则**：+command（允许）/ -command（禁止）、@category（命令类别）\n   - **Key 权限**：~pattern（可访问的 key 模式）\n   - **通道**：&pattern（Pub/Sub 通道限制）\n\n2. **配置方式**：\n   - **命令行**：ACL SETUSER alice on >password ~cached:* +get +set\n   - **配置文件**：在 redis.conf 中使用 user 指令\n   - **ACL 文件**：使用 aclfile 参数指定独立的 ACL 配置文件\n   - **ACL SAVE**：将当前规则保存到文件\n\n3. **示例**：\n   - 只读用户：`ACL SETUSER readonly on >pass ~* +@read -@dangerous`\n   - 缓存管理用户：`ACL SETUSER cacheadmin on >pass ~cache:* +get +set +del`\n\n4. **安全加固**：\n   - 绑定 localhost 或内网 IP（bind 127.0.0.1）\n   - 设置 requirepass（主密码）\n   - 重命名/禁用危险命令：rename-command FLUSHALL ""\n   - 启用保护模式（protected-mode yes）\n   - TLS/SSL：tls-port + tls-cert-file + tls-key-file\n   - 不在生产环境使用 --protected-mode no',
      ['ACL 支持命令、key、通道三级权限控制', '重命名危险命令（FLUSHALL、KEYS、CONFIG）是基本加固', 'ACL 和 TLS 是 Redis 6 的两大安全特性'], ['redis', 'acl', 'security']),

    q('redis', 'medium', '问答', 'Redis 管道（Pipeline）与批量操作优化',
      '解释 Redis Pipeline 的原理和最佳使用方式。Pipeline 如何减少网络往返（RTT）来提升吞吐量？Pipeline 与 MULTI/EXEC 的区别？Pipeline 的应用场景、注意事项（内存占用、TCP 粘包）、以及批量操作（MSET/HMSET/SADD）的选择策略。',
      'Redis Pipeline：\n\n1. **原理**：\n   - 多条命令打包 → 一次网络发送 → Redis 依次执行 → 一次结果返回\n   - 减少 N 次 RTT 到 1 次 RTT\n   - 客户端缓冲命令，在 flush 时发送\n\n2. **Pipeline vs MULTI/EXEC**：\n   - Pipeline：批量传输优化——多条命令各自执行，不保证原子性\n   - MULTI/EXEC：事务——命令入队后一次性原子执行\n   - Pipeline + MULTI/EXEC 组合：原子批量操作\n\n3. **批量命令选择**：\n   - **原生命令**（MSET、HMSET、SADD、LPUSH）：最优化方式\n   - **Pipeline**：原生命令不够用时（如不同类型操作混合）\n   - **Lua 脚本**：需要条件逻辑的批量操作\n\n4. **注意事项**：\n   - Pipeline 过大 → 内存占用高（客户端和服务器端都缓冲）\n   - 建议：每批 50-200 条命令\n   - TCP 粘包不是问题（Redis RESP 协议有分隔符）\n   - Pipeline 中的命令可能部分失败（无回滚）\n\n5. **性能提升**：\n   - 本地网络：Pipeline 100 条命令 ≈ 5-10x 吞吐提升\n   - 远程网络：Pipeline 100 条命令 ≈ 10-50x 吞吐提升\n   - 异步 Pipeline（非阻塞 IO）可进一步提升',
      ['Pipeline 减少网络 RTT 但无原子性保证', 'Pipeline 批次大小建议 50-200 条命令', 'Pipeline + MULTI/EXEC 组合 = 原子批量操作'], ['redis', 'pipeline']),

    q('redis', 'hard', '问答', 'Redis 内存碎片处理与内存优化',
      '讨论 Redis 内存碎片产生的根本原因（jemalloc 分配器 + 键值对频繁增删）。如何监控内存碎片率（mem_fragmentation_ratio）？何时需要手动碎片整理？Redis 4.0+ 的自动内存碎片整理（ACTIVE DEFRAG）原理。内存优化策略：共享对象池、小数据结构的编码优化。',
      'Redis 内存碎片：\n\n1. **碎片成因**：\n   - jemalloc 内存分配器按固定大小（8/16/32/64…）分配\n   - 键值对频繁新增/修改/删除 → 内存释放不连续\n   - 不同数据结构的生命周期不同\n\n2. **监控指标**：\n   - **mem_fragmentation_ratio** = used_memory_rss / used_memory\n   - < 1：内存不足（使用 swap）→ 危险\n   - 1-1.5：正常\n   - > 1.5：碎片过多，需要整理\n   - INFO memory 命令查看\n\n3. **碎片整理**：\n   - **ACTIVE DEFRAG（Redis 4.0+）**：\n     - 后台线程扫描内存 → 将碎片中的对象移动到连续区域\n     - activedefrag yes（配置开启）\n     - active-defrag-ignore-bytes：碎片超过 100MB 开始整理\n     - active-defrag-threshold-lower：碎片率超过 10% 开始整理\n     - active-defrag-cycle-min：CPU 时间占比（最低 5%）\n\n4. **内存优化**：\n   - **共享对象池**：0-9999 的整数共享内存（hash-max-ziplist-value）\n   - **小数据编码**：ziplist、intset、quicklist 等紧凑编码\n   - **Maxmemory**：设置合理上限 + 淘汰策略\n   - **避免大 key**：拆分大数据结构\n\n5. **最佳实践**：\n   - 碎片整理有性能开销（CPU + 短暂阻塞）\n   - 低峰期执行手动整理\n   - 预估数据量 + 预留 30-50% 额外内存',
      ['mem_fragmentation_ratio > 1.5 说明碎片过多', 'Active Defrag 在后台整理碎片但消耗 CPU', '使用紧凑编码（ziplist/intset）可减少内存碎片'], ['redis', 'memory', 'defragmentation']),

    q('redis', 'hard', '问答', 'Redis 数据持久化的 AOF 与 RDB 混合模式',
      '深入分析 Redis 的混合持久化模式（RDB + AOF）。混合持久化（Redis 4.0+）如何结合 RDB 和 AOF 的优点？aof-use-rdb-preamble 开启后，AOF 文件以 RDB 格式保存全量数据 + 增量操作日志。设计一个 Redis 数据恢复方案：不同模式的 RTO（恢复时间目标）和 PIO（数据丢失容忍度）。',
      '混合持久化：\n\n1. **RDB（快照）**：\n   - 全量数据 dump 到磁盘\n   - 优点：文件小、恢复快\n   - 缺点：丢失两次快照间的数据\n   - 触发：save 指令、bgsave、配置的自动保存条件\n\n2. **AOF（追加日志）**：\n   - 每条写操作追加到文件\n   - 优点：数据丢失少（取决于 fsync 策略）\n   - 缺点：文件大、恢复慢\n   - 策略：always（每条）> everysec（每秒）> no（系统刷）\n\n3. **混合模式（Redis 4.0+）**：\n   - aof-use-rdb-preamble yes\n   - AOF 文件前半段：RDB 格式的全量快照\n   - AOF 文件后半段：Redis 协议格式的增量操作\n   - 优点：结合 RDB 的快速恢复 + AOF 的低数据丢失\n\n4. **恢复方案**：\n   - RDB only：丢失大、恢复快，适合缓存\n   - AOF only（everysec）：最多丢 1 秒数据，恢复稍慢，适合多数场景\n   - 混合模式：丢失少 + 恢复快，适合大部分生产场景\n   - AOF（always）：零丢失，性能代价高，适合金融场景\n\n5. **最佳实践**：\n   - 生产推荐：混合持久化 + AOF everysec\n   - 定期手动 bgsave 做备份\n   - 跨机房备份：RDB 文件异地同步',
      ['混合模式 = RDB 全量 + AOF 增量，兼顾恢复速度和数据安全', 'AOF everysec 是最均衡的 fsync 策略', '混合模式是 Redis 4.0+ 生产环境的首选'], ['redis', 'persistence']),

    q('redis', 'hard', '问答', 'Redis Sentinel 的 Raft 变体与故障转移',
      '深入分析 Redis Sentinel 的分布式共识机制。Sentinel 基于 Raft 的变体（Gossip + Quorum）实现主节点故障检测和自动故障转移。Quorum 的作用是什么？majority 和 quorum 的区别？主观下线（SDOWN）和客观下线（ODOWN）的判定流程以及脑裂防护。',
      'Redis Sentinel：\n\n1. **故障检测**：\n   - **SDOWN（主观下线）**：单个 Sentinel 检测到 master 在 down-after-milliseconds 内无响应\n   - **ODOWN（客观下线）**：多个 Sentinel 都认为 master 已下线，达到 quorum 数量\n\n2. **Quorum vs Majority**：\n   - **Quorum**：ODOWN 判定所需的最小确认数（可配置）\n   - **Majority**：leader 选举所需的大多数（N/2 + 1）\n   - 例：5 个 Sentinel，quorum=2 → 2 个确认 ODOWN 即可触发切换，但 leader 选举需要 3 个\n\n3. **故障转移流程**：\n   - 判定 ODOWN → 选举 leader Sentinel（Raft 风格的选举）\n   - Leader Sentinel 从 replica 中选新 master（优先级 → 最新复制偏移量 → runid）\n   - 让其他 replica 复制新 master\n   - 更新原 master 的配置（强制降级）\n\n4. **脑裂防护**：\n   - **min-replicas-to-write**：master 至少与 N 个 replica 连接才接受写\n   - **min-replicas-max-lag**： replica 的延迟上限\n   - 网络分区时，master 无法同步大多数 replica → 停止接受写入\n\n5. **与 Redis Cluster 对比**：\n   - Sentinel：主从 + 自动故障转移，总有一个 master\n   - Cluster：多分片 + 自动分片 + 自动故障转移\n   - Sentinel 适合中小规模高可用，Cluster 适合大规模',
      ['SDOWN = 单个 Sentinel 判定，ODOWN = quorum 个 Sentinel 达成一致', 'Quorum 不等于 Majority——Quorum 是 ODOWN 阈值，Majority 是选举要求', 'min-replicas-to-write 和 max-lag 是脑裂防护的关键配置'], ['redis', 'sentinel', 'high-availability']),

    q('redis', 'hard', '问答', 'Redis Cluster 的 gossip 通信与故障检测',
      '详细分析 Redis Cluster 的 Gossip 通信协议。节点之间如何通过 MEET/PING/PONG 消息交换状态信息？Gossip 消息的格式和频率（cluster-node-timeout 的作用）。节点故障的检测流程：PFALL（疑似故障）→ FAIL 确认。消息传播的带宽优化。',
      'Redis Cluster Gossip：\n\n1. **Gossip 消息类型**：\n   - **MEET**：邀请加入集群\n   - **PING**：定期随机选择节点发送心跳\n   - **PONG**：回复 PING + 携带本地状态\n   - **FAIL**：广播节点故障消息\n\n2. **消息内容**：\n   - 发送者的信息（epoch、状态、slot 映射）\n   - 随机 N 个其他节点的状态（当前纪元、状态标志）\n   - 消息体 ≈ 每个节点 30-50 bytes\n\n3. **检测与传播**：\n   - 节点 A 在 cluster-node-timeout 内未收到 B 的 PONG\n   - A 标记 B 为 PFAIL（possible failure）\n   - A 在 Gossip 消息中传播 B 的 PFAIL\n   - 大多数持有 B 的 slot 的 master 确认 PFAIL → 升级为 FAIL\n   - FAIL 消息 Gossip 全网传播\n\n4. **带宽优化**：\n   - PING 间隔 ≈ 1 秒（但可选多个节点）\n   - cluster-node-timeout 越大，PING 频率越低\n   - 消息体包含所有节点信息的子集（随机抽样）\n   - 大规模集群 > 1000 节点时需调优\n\n5. **实践建议**：\n   - cluster-node-timeout 默认 15s → 可根据网络状况调整\n   - 节点数 < 100 时 Gossip 带宽可控\n   - 大规模集群考虑 Gossip 分区',
      ['Gossip 协议通过 PING/PONG 交换节点状态，PFALL→FAIL 两阶段确认', 'Gossip 消息携带随机节点子集的信息，控制带宽消耗', 'cluster-node-timeout 影响故障检测速度'], ['redis', 'cluster', 'gossip']),

    q('redis', 'medium', '问答', 'Redis 分布式锁的 Redlock 算法争议',
      '讨论 Redlock（Redis 分布式锁）算法的设计和争议。Redlock 在多个独立 Redis 节点上获取锁的步骤。Martin Kleppmann 对 Redlock 的批评（GC pause 导致锁失效、无法保证 fencing token）。Redis 作者 antirez 的回应。实际生产环境中分布式锁的正确实现方式。',
      'Redlock 争议：\n\n1. **Redlock 算法**：\n   - 获取当前时间戳 T1\n   - 依次向 N 个（通常 5 个）独立 Redis 节点申请锁（短超时）\n   - 多数派（N/2 + 1）成功获取锁且总耗时 < 锁 TTL → 锁成功\n   - 释放：向所有节点发送 DEL\n\n2. **Martin Kleppmann 的批评（2016）**：\n   - **GC pause 问题**：持有锁的节点发生 GC pause → 锁过期 → 其他进程获取锁 → 原 GC 恢复 → 两个"锁持有者"\n   - **缺少 Fencing Token**：Redlock 的锁没有单调递增的 token，无法区分新旧锁持有者\n   - **时间假设**：依赖时钟同步（不安全的假设）\n\n3. **antirez 的反驳**：\n   - GC pause 是所有分布式锁的共同问题，不只是 Redlock\n   - Fencing token 可以在 Redis 端用 INCR 实现\n   - 时钟跳跃可以通过 NTP 配置降低概率\n\n4. **生产建议**：\n   - 大多数场景用单 Redis 主节点 + 锁 TTL + 续期 + 随机值（安全而简单）\n   - 需要 Redlock 的场景：跨数据中心、极高安全要求\n   - 重要：使用 fencing token 保护资源\n   - 更推荐：ZooKeeper 或 etcd 实现强一致锁\n\n5. **最佳实践**：\n   - 设置合理锁 TTL（Lease Time）\n   - 实现 Watchdog 自动续期\n   - 解锁时用 Lua 脚本检查 value 是否为自己的锁\n   - 真正需要严格互斥的场景考虑 ZooKeeper',
      ['Redlock 需要通过 fencing token 防止 GC pause 导致的锁失效', '单 Redis 锁 + 续期（Watchdog）对大多数场景足够安全', 'ZooKeeper/etcd 提供更强的一致性保证'], ['redis', 'distributed-lock', 'redlock']),

    # ---- 应用模式 ----
    q('redis', 'medium', '问答', 'Redis 实现排行榜与计数器的设计',
      '如何利用 Redis Sorted Set 实现实时排行榜？讨论 Score 相同时的排序规则（Lexicographical 排序）。设计一个支持"同分按时间排序"的排行榜技巧（Score = 分数 + 时间戳编码）。Redis 的 INCR 命令在实现计数器时的原子性和持久性问题。',
      'Redis 排行榜设计：\n\n1. **基础排行榜**：\n   - ZADD key score member 添加或更新\n   - ZRANK/ZREVRANK 获取排名\n   - ZRANGE/ZREVRANGE 获取 Top N\n   - ZINCRBY 原子更新分数\n\n2. **同分排序**：\n   - Sorted Set 在 score 相同时按 member 字典序排列\n   - 技巧1：score = 实际分数 + (1 - 时间戳/MAX_TIMESTAMP)\n     - 分数相同 → 时间戳较早的靠前\n   - 技巧2：score 用高精度浮点，整数部分 = 分数，小数部分 = 时间权重\n   - 简化版：score = 实际分数 * 100000000 + (MAX_TS - 当前时间戳)\n\n3. **计数器模式**：\n   - **实时计数**：INCR key（原子 +1）\n   - **批量计数**：每天一个 key，INCRBY 批量增加\n   - **多维度计数**：用 Hash：HINCRBY user:100:stats views 1\n   - **计数持久性**：INCR 的 AOF 日志确保不丢失\n\n4. **性能优化**：\n   - ZREVRANGE key 0 99 获取 Top 100（O(log(N) + M)）\n   - 缓存热门排行榜（如每 5 秒刷新一次）\n   - 百万级数据 ZSET 性能仍然很好\n\n5. **实战案例**：\n   - 游戏排名：score = 等级 * 10000 + 经验值\n   - 文章热度：score = 点赞数 * 100 + 评论数',
      ['Sorted Set 排行榜在 score 相同时按 member 字典序排序', '同分按时间排序通过 score 编码（分数 + 时间戳映射）实现', 'ZREVRANGE 获取 Top N 时间复杂度 O(log(N) + M)'], ['redis', 'leaderboard']),

    q('redis', 'medium', '问答', 'Redis 实现实时在线用户统计',
      '设计一个基于 Redis 的实时在线用户（DAU/WAU/MAU）统计系统。使用 HyperLogLog 进行基数估算、Bitmap 进行精确日活统计、Sorted Set 跟踪用户最后活跃时间。讨论亿级 UV 场景下的 Redis 内存优化策略。',
      '在线用户统计：\n\n1. **DAU 统计方案**：\n   - **Bitmap**：user_id 为 offset，当天登录对应位设为 1\n     - BITCOUNT key 计算当日 UV\n     - BITOP AND 计算连续登录用户\n   - **HyperLogLog**：PFADD dau:2024-01-01 user_123\n     - 每个 key 固定 12KB\n     - 误差 0.81%，内存极小\n\n2. **WAU/MAU 统计**：\n   - **PFMERGE**：合并多天 HLL 计算周活/月活\n   - 误区：HLL 合并有精度损失，但 0.81% 是可接受的\n   - **精确方案**：Bitmap + BITOP OR（但内存逐月增长）\n\n3. **实时在线**：\n   - **ZSET**：ZADD online:users timestamp user_id\n   - **ZREMRANGEBYSCORE**：删除超过 5 分钟未活跃的用户\n   - **ZCARD**：统计当前在线人数\n   - **ZRANGEBYSCORE**：列出在线用户\n\n4. **亿级 UV 优化**：\n   - 用户 ID 从大整数（数据库 ID）改为自增 ID 节省 Bitmap 空间\n   - 分层统计：分钟级 HLL → 小时级 HLL → 天级 HLL\n   - 冷热分离：最近 7 天热数据在 Redis，更早的归档到 HBase/ClickHouse\n   - 采样统计：对极高流量场景，只统计 10% 流量再推算\n\n5. **代码示例**：\n   ```\n   每日 UV：PFADD dau:2024-01-01 $user_id\n   每周 UV：PFMERGE wau:2024-01-01 dau:2024-01-0{1..7}\n   实时在线：ZADD online $timestamp $user_id\n   ```',
      ['HyperLogLog 12KB 固定内存适合天级 UV 统计', 'Bitmap 实现精确统计更灵活（BITOP 计算留存）', '实时在线用 ZSET + 定期清理过期用户'], ['redis', 'user-statistics']),

    q('redis', 'medium', '问答', 'Redis 实现分布式限流的令牌桶与漏桶',
      '使用 Redis 实现分布式限流算法：令牌桶（Token Bucket）、漏桶（Leaky Bucket）和滑动窗口（Sliding Window）。各算法的 Lua 脚本实现。对比 INCR + EXPIRE 的简单窗口限流的精度问题。如何选择合适的限流算法？',
      'Redis 限流方案：\n\n1. **简单计数器（固定窗口）**：\n   - INCR key → 首次 SETEX key 1 TTL\n   - 缺点：窗口边界处可能双倍流量\n   - 适用：要求不高的简单限流\n\n2. **滑动窗口（Sorted Set）**：\n   - ZREMRANGEBYSCORE key now - period\n   - ZCARD key < limit → ZADD key now request_id\n   - 精确但内存开销大\n\n3. **令牌桶（Lua 实现）**：\n   - 每个 key 存储：上次更新时间 + 当前令牌数\n   - 每次请求：计算时间差 → 补充令牌 → 消费令牌\n   - 支持突发流量（积累令牌）\n   - Lua 脚本保证原子性\n\n4. **漏桶（Lua 实现）**：\n   - 固定速率流出（如每秒 10 个）\n   - 请求量超过桶容量 → 拒绝\n   - 适合平滑流量（保护下游）\n   - 不支持突发\n\n5. **算法选择**：\n   - 允许突发 → 令牌桶\n   - 严格平滑 → 漏桶\n   - 简单可用 → 滑动窗口（Sorted Set 实现较精确）\n   - 最常用：令牌桶（灵活性最好）',
      ['令牌桶支持突发，漏桶强制平滑，滑动窗口精度最高', 'Lua 脚本保证限流检查 + 令牌消耗的原子性', '简单计数器有窗口边界加倍问题，滑动窗口用 Sorted Set 解决'], ['redis', 'rate-limiting']),

    q('redis', 'medium', '问答', 'Redis 实现布隆过滤器与缓存穿透防护',
      '讨论 Redis 布隆过滤器（Bloom Filter）的原理和在缓存穿透防护中的应用。Redis 模块 RediSearch 对 Bloom Filter 的支持。如何使用 Bitmap 手动实现简单的布隆过滤器？布隆过滤器的误判率与位数组大小和哈希函数数量的关系。布谷鸟过滤器（Cuckoo Filter）的改进。',
      'Redis 布隆过滤器：\n\n1. **原理**：\n   - 用 k 个哈希函数将元素映射到 m 位的位数组中\n   - 判断存在：检查 k 个位是否全为 1\n   - 特性：不存在一定正确（无假阴性），存在可能误判（假阳性）\n   - 不能删除元素\n\n2. **Redis 实现方式**：\n   - **RediSearch 模块**：BF.ADD / BF.EXISTS / BF.INFO\n   - **Bitmap 手动实现**：SETBIT / GETBIT + 多个哈希函数\n   - **手动实现局限**：需要考虑扩容（超过预期容量后误判率上升）\n\n3. **参数设计**：\n   - 位数组大小 m = -(n * ln p) / (ln 2)^2（n=预期数量，p=误判率）\n   - 哈希函数数量 k = (m/n) * ln 2\n   - 例：100 万元素、1% 误判率 → m ≈ 11.5 MB，k ≈ 7\n\n4. **缓存穿透防护**：\n   - 查询 key 先检查 Bloom Filter\n   - 不存在 → 直接返回"不存在"（不查 DB）\n   - 可能存在 → 查 DB + 更新缓存\n   - 注意：Bloom Filter 不能删除，数据删除时需要重建\n\n5. **Cuckoo Filter**：\n   - 支持删除操作\n   - 空间效率更高（每个元素约 7 bits）\n   - Redis 中通过模块实现\n   - 适合需要删除元素的场景',
      ['布隆过滤器无假阴性（说没有就一定没有），有假阳性', '参数公式：m = -n*ln(p)/(ln2)^2，k = (m/n)*ln2', '布隆过滤器不适合需要删除元素的场景（改用布谷鸟过滤器）'], ['redis', 'bloom-filter']),

    q('redis', 'medium', '问答', 'Redis 实现消息通知系统的设计',
      '使用 Redis 设计一个支持多端同步的消息通知系统。设计目标：用户收到新消息通知（未读数）、消息列表的分页拉取、已读/未读状态管理。讨论使用 Hash 存储通知内容、List 存储用户通知列表、以及使用 Pub/Sub 实现实时推送的组合方案。',
      'Redis 消息通知系统：\n\n1. **数据模型**：\n   - **通知内容**：Hash（HMSET notify:{id} type title content time url）\n   - **用户通知列表**：List（LPUSH user:{uid}:notifications notify:{id}）\n   - **未读计数**：String（INCR user:{uid}:unread）\n   - **已读状态**：Set（SADD user:{uid}:read:2024-01 notify:{id}）\n\n2. **未读计数**：\n   - INCR user:{uid}:unread（有新通知）\n   - DECR user:{uid}:unread（阅读通知）\n   - GET user:{uid}:unread（获取未读数）\n   - 使用 Lua 脚本原子操作\n\n3. **分页拉取**：\n   - LRANGE user:{uid}:notifications 0 19（获取最新 20 条）\n   - 用 List 做时间线（最新的在左边）\n   - 已读状态在客户端或服务端标注\n\n4. **实时推送**：\n   - PUBLISH user:{uid}:notifications notify_data\n   - WebSocket 订阅该频道\n   - 用户在线时通过 Pub/Sub 实时推送\n   - 不在线时下次登录拉取未读数\n\n5. **持久化考虑**：\n   - 通知数据也落 DB 做持久化\n   - Redis 做热缓存 + 未读计数\n   - 定期清理已读通知 List（LTRIM）\n   - 历史通知从 DB 读取',
      ['Hash 存通知内容、List 存通知列表、String 存未读计数', 'LPUSH + LTRIM 实现有限长度的通知时间线', 'Pub/Sub 实现实时推送，Redis 缓存 + DB 落盘保证不丢'], ['redis', 'notification']),

    q('redis', 'medium', '问答', 'Redis 实现购物车系统的设计',
      '使用 Redis Hash 设计购物车系统。分析购物车的核心操作（添加商品、修改数量、删除商品、查询购物车、合并登录前后购物车）的 Redis 命令实现。讨论购物车数据的过期策略（未登录购物车的 TTL）和持久化方案。',
      'Redis 购物车设计：\n\n1. **数据结构**：\n   - **Hash**：`cart:{user_id}` 字段 = sku_id，值 = quantity\n   - HSET cart:123 sku_1001 2\n   - HGETALL cart:123（获取全部商品）\n   - HDEL cart:123 sku_1001（删除商品）\n   - HLEN cart:123（统计商品种类数）\n\n2. **操作模式**：\n   - **添加**：HSET cart:{uid} {sku_id} quantity（有则覆盖，无则新增）\n   - **修改数量**：HINCRBY cart:{uid} {sku_id} 1（+1）/-1（-1）\n   - **删除**：HDEL cart:{uid} {sku_id}\n   - **清空**：DEL cart:{uid}\n   - **批量查**：HGETALL cart:{uid} + 根据 sku_id 查商品详情（MGET）\n\n3. **登录合并**：\n   - 未登录：key = cart:temp:{temp_token}（7 天过期）\n   - 登录时：HGETALL cart:temp:{token} → 遍历合并到 cart:{uid}\n   - 合并策略：取最大数（登录前 2 + 登录后 1 → 2）\n   - 合并后删除临时 cart\n\n4. **过期策略**：\n   - 未登录购物车：EXPIRE cart:temp:{token} 604800（7 天）\n   - 已登录购物车：不主动过期（与用户账号绑定）\n   - 长时间未操作的已登录购物车 → 定期清理\n\n5. **持久化**：\n   - Redis 做主存储（写多读少，Hash 高效）\n   - 辅助 DB 存储购物车快照（恢复用）\n   - 利用 Redis AOF 持久化保证不丢',
      ['Hash 结构天然适合购物车（field = 商品 ID，value = 数量）', '未登录购物车设 7 天 TTL，登录时合并到用户购物车', 'HINCRBY 原子增减数量，减少读取后修改的竞争'], ['redis', 'shopping-cart']),

    q('redis', 'medium', '问答', 'Redis 实现社交关系图谱（关注/粉丝）',
      '使用 Redis Set 设计社交关系系统。用户关注（Following）和粉丝（Follower）的存储模型。关注的常见操作：关注、取关、互关判断、共同关注、关注列表分页。讨论使用 Sorted Set 存储关注时间的方案及 Feed 流的生成。',
      'Redis 社交关系：\n\n1. **数据模型**：\n   - **关注**：SADD following:{uid} target_uid\n   - **粉丝**：SADD follower:{uid} source_uid\n   - **互关**：SINTER following:{a} follower:{a}（交集）\n   - **共同关注**：SINTER following:{a} following:{b}\n\n2. **操作实现**：\n   - **关注**：SADD following:{uid} target + SADD follower:{target} uid\n   - **取关**：SREM following:{uid} target + SREM follower:{target} uid\n   - **互关判断**：SISMEMBER following:{a} b AND SISMEMBER following:{b} a\n   - **关注列表**：SMEMBERS / SSCAN（大集合用游标）\n   - **是否关注**：SISMEMBER following:{uid} target\n\n3. **带时间的关注（Sorted Set）**：\n   - ZADD following:{uid} timestamp target_uid\n   - ZREVRANGE following:{uid} 0 19（最新关注）\n   - ZREVRANK 获取关注顺序排位\n\n4. **Feed 流（Timeline）**：\n   - 发 Feed → ZADD feed:{uid} timestamp feed_id\n   - 粉丝拉取 → 遍历关注列表 → ZREVRANGE 各自 feed → 合并排序\n   - **推模式**：发 Feed 时推送给所有粉丝的收件箱（ZADD inbox:{fan}）\n   - **拉模式**：粉丝上线后拉取关注者的 Feed（粉丝多的博主用拉模式）\n\n5. **分页优化**：\n   - 大 V 粉丝量极大 → 粉丝列表用 Sorted Set 按关注时间存储\n   - SSCAN 代替 SMEMBERS（避免全量返回）\n   - 分页查询：ZRANGE following:{uid} (start) (count)',
      ['Set 存储关注/粉丝关系，Sorted Set 存储带时间戳的关系', 'SINTER 实现共同关注和互关判断', 'Feed 流采用推拉结合模式（大 V 拉、普通人推）'], ['redis', 'social-network']),

    q('redis', 'hard', '问答', 'Redis 在微服务架构中的服务发现与配置中心',
      '如何使用 Redis 实现微服务的服务发现和配置中心？服务注册：Hash 存储服务实例的元数据（IP、端口、健康状态）。健康检查：利用 TTL 和 Key 过期自动剔除故障实例。配置管理：使用 Pub/Sub 实现配置变更的实时推送。讨论与 Consul/Nacos 的对比。',
      'Redis 服务发现：\n\n1. **服务注册**：\n   - 每个服务实例：HMSET service:{name}:{instance_id} host port meta\n   - 注册列表：SADD services {name}:{instance_id}\n   - 发现服务：SMEMBERS services → HGETALL 获取元数据\n   - 示例：HMSET service:user-api:192.168.1.1 host 192.168.1.1 port 8080\n\n2. **健康检查**：\n   - 服务启动时 SETEX health:{name}:{instance} 10 alive\n   - 定时续期（每 5 秒 SETEX -> TTL 10 秒）\n   - 过期 → 自动剔除（监听 Keyspace Notification）\n   - 替代方案：ZADD heartbeat 时间戳 + 定时扫描\n\n3. **配置中心**：\n   - 配置存储：HMSET config:{app}:{env} key1 value1 key2 value2\n   - 动态通知：PUBLISH config:changed {app}:{env}\n   - 客户端订阅 → 收到通知 → 重新加载配置\n   - 配置版本化：使用 Sorted Set 存储配置历史\n\n4. **对比成熟方案**：\n   - 优势：简单、低延迟（毫秒级）、不引入新组件\n   - 劣势：无版本管理、命名空间弱、无需熔断等功能\n   - 适合：中小规模微服务（<50 个服务）\n   - 大规模推荐：Consul（服务发现）/ Nacos（配置中心）\n\n5. **生产建议**：\n   - 仅作为轻量级补充方案\n   - 配置变更必须经过审核流程（不是在 Redis 里直接改）\n   - 配置最好有本地文件兜底',
      ['Redis 可用作轻量级服务发现（Hash 存元数据 + TTL 做健康检查）', 'Pub/Sub 实现配置变更实时推送', '适合中小规模，大规模推荐 Consul/Nacos'], ['redis', 'service-discovery']),

    q('redis', 'hard', '问答', 'Redis 作为实时特征存储（Feature Store）',
      '讨论 Redis 在 ML 特征存储（Feature Store）中的应用。设计一个基于 Redis 的实时特征存储，支持特征的在线获取和高频更新。特征数据的存储结构设计（Hash vs String）、特征时效性管理（TTL）、批量特征获取（MGET/HMGET）。与离线特征（Hive/Parquet）的同步方案。',
      'Redis Feature Store：\n\n1. **特征数据模型**：\n   - **用户特征**：HMSET feature:user:{uid} age 30 city beijing ltv 12500.0\n   - **物品特征**：HMSET feature:item:{id} category electronics price 2999\n   - **上下文特征**：SET feature:context:time_of_day morning\n   - **批量获取**：HMGET feature:user:{uid} age city ltv\n\n2. **时效性管理**：\n   - **TTL**：设定特征的有效期（不同特征不同 TTL）\n   - **版本控制**：ZADD feature:user:{uid}:version timestamp version\n   - **过期通知**：Keyspace Notification 触发特征更新\n\n3. **高性能设计**：\n   - Pipeline 批量获取（模型推理时一次获取数十个特征）\n   - Hash 对同一实体的多特征操作高效\n   - 连接池避免频繁建连\n   - **特征预热**：启动时加载热点特征\n\n4. **与离线特征同步**：\n   - 离线训练：Hive/Spark → Parquet → 特征数据集\n   - 在线推理：Redis → HMGET 实时获取\n   - **同步流程**：离线 Batch 计算特征 → 批量写入 Redis\n   - **增量更新**：实时流（Kafka）→ Flink → Redis\n\n5. **容灾**：\n   - 本地缓存（Caffeine）兜底\n   - Redis 故障时使用离线特征估计\n   - 特征默认值配置',
      ['Hash 存实体多维特征、String 存上下文特征', 'TTL 管理特征时效性、本地缓存做兜底', '离线 Batch 计算 + 在线实时更新 = 完整的 Feature Store'], ['redis', 'feature-store', 'ml']),

    q('redis', 'medium', '问答', 'Redis 实现高频计数与实时仪表盘',
      '使用 Redis 设计一个实时业务仪表盘（Dashboard）系统。从多个数据源收集事件（PV/UV、订单量、收入）、使用 Hash 或 Sorted Set 进行多维聚合、用 Pub/Sub 推送到前端。讨论计数器性能优化（事件缓冲 + 批量写入）、多时间窗口的聚合策略。',
      'Redis 实时仪表盘：\n\n1. **事件收集**：\n   - 简单计数：INCR stats:{metric}:{date}:{hour}\n   - 多维统计：HINCRBY stats:pageview:2024-01-01 page:/home count\n   - 分桶统计：ZINCRBY stats:revenue:2024-01-01 category:electronics 2999\n\n2. **时间窗口聚合**：\n   - **分钟级**：INCR stats:orders:2024-01-01:14:05\n   - **小时级**：定时对分钟级求和后写入 =INCRBY stats:orders:2024-01-01:14\n   - **天级**：定时对小时级求和\n   - **滚动窗口（最近 N 分钟）**：Sorted Set + ZREMRANGEBYSCORE\n\n3. **推送前端**：\n   - PUBLISH dashboard:orders {"value": 123, "time": "..."}\n   - WebSocket Server 订阅 → 推送到浏览器\n   - 前端定时拉取（防止 WebSocket 断开）\n\n4. **性能优化**：\n   - 缓冲 + 批量写入：事件先攒到本地队列（100 条或 100ms）→ Pipeline 写入\n   - 高频 key 做聚合：多个 PV 合并为 1 次 INCRBY\n   - 分 key 避免热点：stats:pageview:2024-01-01:14:05:shard_{0-9}\n\n5. **持久化与备份**：\n   - 实时数据在 Redis\n   - 定期（每分钟）快照到 DB 做历史趋势\n   - 仪表盘只展示最近 48 小时的实时数据',
      ['分段聚合（分钟→小时→天）降低写入频率', '事件缓冲 + Pipeline 批量写入提升吞吐', 'Pub/Sub 推送到前端实现实时更新'], ['redis', 'dashboard']),

    q('redis', 'hard', '问答', 'Redis 在 AI/ML 推理中的应用',
      '讨论 Redis 在 AI/ML 推理系统中的应用场景。使用 Redis 作为 LLM 的 KV-Cache 分布式缓存、模型推理结果的缓存（语义缓存 Semantic Caching）、特征存储（Feature Store）、以及模型版本管理和 A/B 测试的路由。设计一个 LLM 语义缓存方案。',
      'Redis AI/ML 应用：\n\n1. **KV-Cache 分布式共享**：\n   - 多推理节点共享 KV-Cache（减少重复计算）\n   - key = prompt_prefix_hash，value = KV tensor\n   - 挑战：tensor 数据量大、序列化开销\n   - 适用：共享前缀的长 prompt 场景\n\n2. **语义缓存（Semantic Caching）**：\n   - 输入嵌入 → 向量相似度搜索 → 命中则返回缓存结果\n   - **Redis Stack**：支持向量搜索（FT.SEARCH + VSS）\n   - 缓存结构：HASH（嵌入向量 + 原始输入 + 输出 + 元数据）\n   - **策略**：\n     - 相似度阈值（如 cosine > 0.95）→ 命中\n     - TTL 控制缓存有效期\n     - 缓存穿透保护（并发请求只一个查 LLM）\n\n3. **模型版本与路由**：\n   - ZSET model:versions model_name version score\n   - Redis 实时切换模型版本（A/B 测试）\n   - 按用户分段路由（HASH 存 user:model_mapping）\n\n4. **Feature Store（特征存储）**：\n   - 实时特征：Hash 存用户/物品特征\n   - 批量获取：HMGET 用于模型推理时的特征拼接\n\n5. **性能关键**：\n   - 语义缓存命中率可达到 30-60%（取决于场景）\n   - LLM 输出缓存延迟降低 50-80%\n   - Token 成本节省 30-50%',
      ['语义缓存通过向量相似度实现 LLM 输出复用', 'KV-Cache 共享减少长 prompt 重复计算', '模型版本路由实现 A/B 测试的实时切换'], ['redis', 'ai', 'semantic-cache']),

    q('redis', 'medium', '问答', 'Redis 的 Keyspace Notification 与事件驱动',
      '解释 Redis Keyspace Notification（键空间通知）的机制和配置。如何通过订阅 Redis 的 Pub/Sub 通知来监听 key 的过期、修改、删除事件？Keyspace 与 Keyevent 两种通知格式的区别。事件驱动架构中的典型应用：缓存重建、延迟任务、数据同步。',
      'Keyspace Notification：\n\n1. **机制**：\n   - Redis 在 key 发生变更时发布 Pub/Sub 消息\n   - 通知格式：\n     - **Keyspace**：`__keyspace@0__:mykey` → 事件类型\n     - **Keyevent**：`__keyevent@0__:del` → 发生事件的 key\n   - 配置：notify-keyspace-events KEA（所有事件）\n\n2. **配置参数**：\n   - K：keyspace 事件\n   - E：keyevent 事件\n   - g：通用命令（DEL、EXPIRE、RENAME）\n   - $：字符串命令\n   - l：列表命令\n   - x：过期事件\n   - e：淘汰事件\n   - A：g$lshzxe 的别名（"所有"）\n\n3. **典型应用**：\n   - **缓存重建**：key 过期 → 收到通知 → 从 DB 重新加载 → SET 新 key\n   - **延迟任务**：SET task:{id} payload EX 300 → 过期 → 执行任务\n   - **数据同步**：key 变更 → 通知同步到其他存储\n   - **会话管理**：session 过期 → 清理用户状态\n\n4. **局限与风险**：\n   - Pub/Sub "即发即忘"：如果客户端未连接 → 通知丢失\n   - 大量 key 过期 → 通知风暴\n   - 建议：使用 Redis Stream 替代（支持持久化）\n   - 集群模式：通知只在事件发生的节点发布\n\n5. **最佳实践**：\n   - 仅监听必要的事件类型（不要用 A）\n   - 结合 Redis Stream 实现可靠消费\n   - 处理逻辑必须幂等',
      ['Keyspace Notification 通过 Pub/Sub 发布 key 变更事件', '通知可能丢失（Pub/Sub 即发即忘），关键场景用 Stream', '避免监听过多事件类型（防止通知风暴）'], ['redis', 'keyspace-notification']),

    q('redis', 'hard', '问答', 'Redis 主从复制的全量与增量同步协议',
      '深入分析 Redis 主从复制的实现原理。全量同步（RDB 文件传输 + buffer 增量）和增量同步（PSYNC2）的完整流程。replication backlog 的作用和大小配置。Redis 7.0 的 Replication ID 变化对 PSYNC2 的影响。无盘复制（Diskless Replication）的机制和适用场景。',
      'Redis 主从复制：\n\n1. **全量同步**：\n   - 从节点发送 PSYNC ? -1（不知道主节点 runid）\n   - 主节点执行 BGSAVE 生成 RDB\n   - 传输 RDB 给从节点（磁盘或 socket 直接传输）\n   - 复制缓冲区（client-output-buffer-limit）中的增量命令\n   - 从节点加载 RDB + 执行增量命令 → 追上主节点\n\n2. **增量同步（PSYNC2）**：\n   - 从节点保存主节点的 replication ID 和 offset\n   - 重连时发送 PSYNC {repl_id} {offset}\n   - 主节点检查 offset 是否在 backlog 范围内\n   - 在范围内 → 只发送 backlog 中的增量命令\n   - 不在范围内 → 触发全量同步\n\n3. **Replication Backlog**：\n   - 固定大小的环形缓冲区（repl-backlog-size，默认 1MB）\n   - 存储最近的写命令\n   - 大小决定增量同步的容忍时长\n   - 公式：repl-backlog-size = 重连最大间隔时间 × 峰值写入量\n\n4. **Replication ID（Redis 7.0）**：\n   - 主节点每次选举后生成新的 replication ID\n   - 旧 ID 保留为 secondary_repl_id（支持断线重连）\n   - 从节点可同时缓存新旧 ID → 提高增量同步成功率\n\n5. **Diskless Replication**：\n   - RDB 不落盘，直接通过 socket 发给从节点\n   - 适用：磁盘慢但网络快的环境（如云服务器）\n   - 配置：repl-diskless-sync yes',
      ['全量同步：BGSAVE + RDB 传输 + backlog 增量', '增量同步（PSYNC2）：repl_id + offset 在 backlog 范围内即可', 'repl-backlog-size 决定断开多久后仍能增量同步'], ['redis', 'replication']),

    q('redis', 'medium', '问答', 'Redis 缓存策略更新模式：Cache-Aside / Read-Through / Write-Through',
      '讨论常见的缓存更新模式在 Redis 中的实现。Cache-Aside（旁路缓存）：应用同时维护缓存和数据库。Read-Through / Write-Through（读写穿透）：缓存与数据库的同步由缓存层完成。Write-Behind（异步写回）的优劣。各自在什么场景下使用？',
      '缓存更新模式：\n\n1. **Cache-Aside（旁路缓存）**：\n   - **读取**：先查缓存 → 不命中查 DB → 结果写入缓存\n   - **写入**：更新 DB → 删除/更新缓存\n   - 最常用模式，应用有完全控制权\n   - 问题：更新 DB 后到删除缓存前有短暂不一致\n\n2. **Read-Through**：\n   - 缓存层（如 Redis 配合代理）自动从 DB 加载数据\n   - 应用只与缓存交互\n   - 简化应用代码，实现复杂\n   - Redis 本身不原生支持（需要中间件）\n\n3. **Write-Through**：\n   - 写入缓存 → 缓存同步写入 DB\n   - 保证缓存与 DB 强一致\n   - 写入延迟增加（要等 DB 写入完成）\n\n4. **Write-Behind（异步写回）**：\n   - 写入缓存后立即返回\n   - 异步批量写入 DB\n   - 吞吐量大但崩溃时可能丢数据\n   - 适合：写入量大的日志/计数场景\n\n5. **策略选择**：\n   - **Cache-Aside**：通用推荐，适合大多数场景\n   - **Read-Through**：查询为主、需要简化应用\n   - **Write-Through**：强一致性要求\n   - **Write-Behind**：高写入吞吐、可容忍少量丢失',
      ['Cache-Aside 是应用最广泛的缓存模式', 'Read/Write-Through 将同步逻辑封装在缓存层', 'Write-Behind 以丢数据风险换取写入吞吐'], ['redis', 'caching-patterns']),

    q('redis', 'medium', '问答', 'Redis 大 Key 问题：检测与治理',
      '讨论 Redis 大 Key（Big Key）的问题。多大的 Key 算大？大 Key 的危害（阻塞命令、网络延迟、内存倾斜）。检测大 Key 的方法（redis-cli --bigkeys、DEBUG OBJECT、MEMORY USAGE、RDB 分析）。治理方案：拆分、压缩、冷热分离。',
      '大 Key 问题：\n\n1. **定义**：\n   - String > 10KB\n   - List/Set/Sorted Set > 5000 个元素\n   - Hash > 5000 个字段\n   - 单个 key 内存 > 几 MB\n\n2. **危害**：\n   - **阻塞**：大 key 的操作（DEL、HGETALL、SMEMBERS）阻塞 Redis 单线程数秒\n   - **网络**：大 key 的查询结果占用大量网络带宽\n   - **内存倾斜**：集群模式下大 key 所在分片内存爆满\n   - **持久化**：大 key 导致 BGSAVE/AOF rewrite 变慢\n   - **复制延迟**：大 key 传输增加主从延迟\n\n3. **查询方法**：\n   - **redis-cli --bigkeys**：扫描所有 key，按类型统计最大的\n   - **DEBUG OBJECT key**：查看 key 的序列化长度\n   - **MEMORY USAGE key**：查看 key 的内存占用（更精确）\n   - **RDB 分析**：使用 redis-rdb-tools 离线分析\n   - **MONITOR**（低概率采样）\n\n4. **治理方案**：\n   - **拆分大 Hash**：按字段哈希拆分到多个 key\n   - **分页**：List 不需要保留全部历史，LTRIM 裁剪\n   - **压缩**：大 String 用压缩算法（Snappy/Gzip）存储\n   - **冷热分离**：热数据在 Redis、冷数据在 DB/对象存储\n   - **异步删除**：UNLINK 替代 DEL（后台线程回收）',
      ['大 key 阻塞 Redis 单线程，影响所有操作', 'redis-cli --bigkeys 是最简单的检测工具', 'UNLINK 异步删除替代 DEL 避免阻塞'], ['redis', 'big-key']),

    q('redis', 'medium', '问答', 'Redis 热点 Key 问题：检测与治理',
      '讨论 Redis 热点 Key（Hot Key）的成因和治理方案。热点 Key 如何导致 Redis 单节点性能瓶颈？（单个 key 每秒被访问数十万次。）检测方法（Redis 的 hotkeys 参数、客户端侧统计、代理层统计）。治理手段：本地缓存、副本读取、Key 分片、读写分离。',
      '热点 Key 问题：\n\n1. **危害**：\n   - 单个 Redis 节点 CPU 达到 100%\n   - 请求大量超时（请求排队的等待时间长）\n   - 集群模式下单分片成为瓶颈\n\n2. **检测**：\n   - **redis-cli --hotkeys**：利用 redis 的 object freq 参数\n   - **客户端统计**：在客户端记录 key 访问频率\n   - **代理（Proxy）**：Twitter Twemproxy / Codis 层面统计\n   - **INFO commandstats**：查看命令级热点\n\n3. **治理方案**：\n   - **本地缓存**（L1 Cache）：客户端用 Caffeine/Guava Cache 缓存热点数据\n     - 大幅减少 Redis 请求量\n     - 需处理本地缓存一致性问题\n   - **Key 分片**：hotkey → hotkey:0 ~ hotkey:9\n     - 读请求分散到 10 个 key\n     - 写入时写所有分片\n   - **副本读取**：Redis 从节点分担读负载\n     - 主节点写、从节点读\n     - 最终一致性（复制延迟）\n   - **读写分离**：写主库、读从库\n\n4. **其他手段**：\n   - **限流降级**：对热点 key 的访问限流\n   - **热点预测**：提前识别可能的热点（如秒杀商品）\n   - **CDN**：静态热点数据前置到 CDN\n\n5. **最佳实践**：\n   - L1 本地缓存是解决热点 key 最有效的方法\n   - 写量极大的热点 key 考虑 Key 分片\n   - 本地缓存必须有一致性失效机制',
      ['热点 key 导致 Redis 单节点 CPU 瓶颈（请求排队）', '本地缓存（L1）是最有效的热点治理方案', 'key 分片通过散列到多个 key 分散读负载'], ['redis', 'hot-key']),

    q('redis', 'medium', '问答', 'Redis 7.0 新特性与演进趋势',
      '总结 Redis 7.0（2023）和 Redis 7.2 的主要新特性。Function 脚本（替代 Lua EVAL）、ACL v2 改进、Sharded Pub/Sub（集群下的 Pub/Sub 扩展性）、Auto-failover 改进、以及 Redis Stack 的演进。讨论 Redis 未来的发展方向和竞争格局。',
      'Redis 7.0+ 新特性：\n\n1. **Redis Functions**：\n   - 类似 Lua 脚本但可管理（持久化、可命名、版本控制）\n   - FCALL 替代 EVAL，Function 库集中存储\n   - 比 EVAL 更适合生产环境管理\n\n2. **ACL v2（Selectors）**：\n   - 多规则选择器（ACL SETUSER alice (~cached:* +get) (~analytics:* +@read)）\n   - 细粒度命令日志（ACL LOG 记录越权操作）\n\n3. **Sharded Pub/Sub**：\n   - 传统 Pub/Sub 在集群模式下会广播到所有节点\n   - Sharded Pub/Sub：消息只发送到相关分片\n   - 解决集群 Pub/Sub 的扩展性问题\n\n4. **其他重要改进**：\n   - **Redis 7.2**：新的内存管理机制、改进的哨兵、更好的集群自动故障转移\n   - **Auto-failover**：Redis 集群自动故障转移更加智能\n   - **RESP3 协议增强**：支持推送（Push）类型\n\n5. **Redis Stack**：\n   - 整合：RediSearch、RedisJSON、RedisTimeSeries、RedisGraph、RedisBloom\n   - 提供文档、图、时序等能力\n   - 竞争：DragonFly（多线程 Redis 兼容）、KeyDB、Valkey\n\n6. **趋势**：\n   - 从缓存走向多维数据平台\n   - 开源许可变更（SSPL）→ Valkey 等 fork\n   - 云原生：Redis on K8s（Operator）、Tiered Storage',
      ['Redis Functions 比 Lua EVAL 更适合生产环境管理', 'Sharded Pub/Sub 解决集群模式的扩展性问题', 'Redis Stack 整合多模块走向数据平台'], ['redis', 'redis7']),
]

def main():
    path = os.path.join(os.path.dirname(__file__), 'redis.json')
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
    print(f'Total redis questions: {len(data)}')

if __name__ == '__main__':
    main()
