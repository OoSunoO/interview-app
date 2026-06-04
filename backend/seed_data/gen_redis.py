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

# ==================== Core Architecture ====================

q("redis", "medium", "short_answer",
  "Redis 单线程模型与高性能",
  "Redis 为什么是单线程的？单线程如何支撑 10 万 + QPS？Redis 6.0 引入的多线程 IO 解决了什么问题？为什么 Redis 仍然不建议在多线程模式下执行命令？",
  "Redis 的核心处理逻辑是单线程的（一个主线程处理所有命令），但 IO 读写在 6.0+ 可以使用多线程。\n\n单线程模型的优势：1）避免了锁竞争和线程上下文切换的开销。所有命令在单线程中序列化执行，天然线程安全（不需要 Mutex/Lock）。2）基于内存操作，瓶颈在 IO 和网络带宽不在 CPU，单线程足够。3）实现简单（不需要考虑并发控制，不需要事务隔离）。\n\n为什么单线程能支撑 10 万+ QPS：1）完全基于内存——所有操作在内存中完成，纳秒级延迟。2）IO 多路复用（epoll）——Redis 使用 epoll（Linux）或 kqueue（macOS）同时监听多个 Socket fd，基于事件驱动处理。单线程可以同时处理数千个客户端连接。3）高效的数据结构——哈希表、跳表、压缩列表等定制数据结构在内存中操作极快。4）协议简单——Redis RESP 协议是文本行协议（固定分隔符，容易解析），相比 SQL 解析轻量得多。\n\nRedis 6.0 多线程 IO：1）问题——随着网络带宽提升（10Gbps+），单线程读写 Socket 成为瓶颈（IO 读写需要内核态-用户态拷贝）。2）方案——主线程仍然串行执行命令，但 IO 读写操作由多个 IO 线程并行处理。通过 io-threads 配置控制 IO 线程数（建议 2-4，N-1 个 IO 线程，1 个主线程）。3）限制——IO 线程只负责 Socket 读写和协议解析（编解码），命令执行仍然是单线程。这样既保留了单线程执行的无锁优势，又突破了网络 IO 瓶颈。\n\n为什么 Redis 不建议在多线程模式下执行命令：1）原子性问题——虽然可以给多线程加锁保证原子性，但 Redis 核心卖点之一就是单线程的简单性/可预测性。2）复杂度剧增——涉及数据结构的并发控制、内存分配器的线程安全等。3）收益有限——Redis 的瓶颈从来不在命令执行（CPU 密集型命令如 KEYS/SORT 可以单独优化），而在 IO 和内存。",
  ["Redis 单线程模型的 CPU 利用率如何？瓶颈在哪里", "Redis 6.0 多线程 IO 和命令执行的关系是什么"],
  ["Redis", "单线程", "IO 多路复用", "epoll", "架构"])

q("redis", "medium", "short_answer",
  "Redis IO 多路复用与事件驱动",
  "Redis 的事件驱动模型是如何设计的？aeEventLoop 的核心组件是什么？epoll 如何与 Redis 的事件处理相结合？",
  "Redis 自己实现了一个轻量级的事件驱动库（aeEventLoop），封装了 epoll/kqueue/select 等多路复用 API。\n\naeEventLoop 的核心组件：1）文件事件（File Event）——处理客户端连接和读写。aeCreateFileEvent 注册 fd 的事件处理器（AE_READABLE/AE_WRITABLE）。2）时间事件（Time Event）——定时任务（expire 键清理、AOF fsync、主从 ping、Cluster 心跳）。aeCreateTimeEvent 注册定时回调（毫秒精度）。3）事件循环（Event Loop）——aeMain() 循环调用 aeProcessEvents()：先调用 aeApiPoll(epoll_wait) 等待就绪 fd → 处理文件事件 → 处理时间事件。\n\nepoll 结合方式：1）Redis 使用 epoll 的边缘触发（ET, Edge-Triggered）模式。2）epoll_create 创建 epoll 实例 → epoll_ctl（EPOLL_CTL_ADD）注册 Socket fd 和监听事件 → epoll_wait 等待事件就绪。3）每次 epoll_wait 返回就绪 fd 列表后，Redis 逐个调用对应的处理器函数。4）批量读取（read）——epoll ET 模式下，Redis 循环读取 fd 数据直到 EAGAIN，充分利用每次系统调用。\n\n事件处理流程：1）acceptTcpHandler（listen fd 可读 → 接受新连接 → 创建 client 对象 → 注册读事件）。2）readQueryFromClient（client fd 可读 → 读入查询缓冲区 → 解析命令 → 调用命令处理函数）。3）命令处理函数执行 → 将响应写入输出缓冲区 → 注册写事件。4）sendReplyToClient（client fd 可写 → 将输出缓冲区数据写出）。\n\n对比 Nginx：Nginx 也是事件驱动（epoll），但与 Redis 的不同在于：Nginx 是多进程 epoll（每个 worker 进程独立 epoll），Redis 是单进程单线程 epoll（6.0+ IO 线程处理读写但不处理命令）。",
  ["epoll 的边缘触发（ET）和水平触发（LT）在 Redis 中的选择", "Redis 事件循环如何处理大量客户端同时写入"],
  ["Redis", "epoll", "事件驱动", "IO 多路复用", "架构"])

# ==================== Data Types ====================

q("redis", "easy", "short_answer",
  "Redis 五种基本数据类型及底层编码",
  "Redis 的 string、list、hash、set、zset 五种基本数据结构分别对应什么底层编码？不同编码之间如何转换？如何选择合适的数据类型？",
  "Redis 每种数据类型有多种底层编码实现，根据数据特征自动切换。\n\nString：1）int——纯整数（8 字节 long），直接存储数值。2）embstr——短字符串（≤44 字节），RedisObject 和 SDS 连续分配（一次内存分配）。3）raw——长字符串（>44 字节），RedisObject 和 SDS 分开分配（两次内存分配）。\n\nList（Redis 3.2+ 统一用 quicklist）：1）quicklist——双向链表 + 压缩列表（ziplist）的混合体。每个 quicklist node 是一个 ziplist（默认 8KB），减少链表指针开销。\n\nHash：1）ziplist——键值对少时（默认 < 512 个字段，值 < 64 字节），用压缩列表存储（连续内存空间）。2）hashtable——数据量大时转为哈希表（O(1) 查找）。\n\nSet：1）intset——所有元素是整数且数量少时（默认 < 512 个），用整数集合（有序定长数组，二分查找）。2）hashtable——其他情况，用哈希表存储（O(1) 查找，只使用 key，value 为 NULL）。\n\nZSet：1）ziplist——数据量少时（默认 < 128 个元素，值 < 64 字节），按 score 升序。2）skiplist + hashtable——数据量大时使用。跳表维护排序（O(logN) 范围查询），哈希表维护成员到 score 的映射（O(1) 查找权重）。\n\n选型原则：1）需要排序 → zset。2）唯一性检查（是否存在）→ set 或 hash。3）计数 → string（INCR/DECR）。4）时间序列 → list LPUSH（追加新数据）→ LTRIM（固定长度）或 Stream。5）对象存储 → hash（多个字段）或 string（序列化后的 JSON）。\n\n配置参数调整：hash-max-ziplist-entries、set-max-intset-entries、zset-max-ziplist-entries 等控制编码切换阈值。调大阈值可以节省内存（数据量适中的场景），但查询性能下降（ziplist 是 O(N)）。",
  ["String 的 embstr 和 raw 有什么区别——44 字节分界线", "ziplist 和 hashtable 的切换阈值默认是多少"],
  ["Redis", "数据结构", "编码", "内存优化"])

q("redis", "hard", "short_answer",
  "Redis 底层 SDS 实现",
  "SDS（Simple Dynamic String）相比 C 语言原生字符串有什么优势？SDS 如何实现 O(1) 长度获取和二进制安全？SDS 的扩容策略是什么？",
  "SDS 是 Redis 自己实现的动态字符串，替代 C 语言的 char*。在 Redis 3.2+，SDS 有 5 种类型（sdshdr5/sdshdr8/sdshdr16/sdshdr32/sdshdr64），根据字符串长度选择最小的 header 类型。\n\n相比 C 字符串的优势：1）O(1) 长度获取——SDS header 中存了 len 字段（长度），strlen() 不需要遍历。2）二进制安全（Binary Safe）——len 记录长度而不是依赖 '\0' 结尾。SDS 可以存储二进制数据（如图片、序列化对象、'\0' 字符）。C 字符串以 '\0' 判定结束，不能存包含 '\0' 的数据。3）杜绝缓冲区溢出——SDS 的 API 在拼接字符串时先检查空间是否足够，不够则自动扩容。C 字符串 strcat 不检查目标缓冲区大小（溢出覆盖相邻内存）。4）内存预分配（减少 realloc）——SDS 扩容时分配更多空间（减少未来扩容次数）。\n\n扩容策略（sdsMakeRoomFor）：1）新长度 < 1MB → 分配 2 倍空间（len + free = 2 * oldLen）。2）新长度 ≥ 1MB → 每次额外分配 1MB（len + free = oldLen + 1MB）。3）惰性空间释放——字符串缩短时不释放多余内存（用 free 字段记录多余空间），避免频繁 realloc。有 SDS API（sdsRemoveFreeSpace）可以主动释放。\n\n5 种 SDS 类型：sdshdr5（未使用）、sdshdr8（< 256B）、sdshdr16（< 64KB）、sdshdr32（< 4GB）、sdshdr64（≥ 4GB）。每种类型使用最小宽度的 unsigned int 存储 len 和 alloc（节省内存）。注意：sdshdr5 的 flags 和数据共用首字节（不存 len，长度从 char[0] 推断，限于 32 字符以下，实际 Redis 内部字符串默认用 sdshdr8）。",
  ["SDS 的二进制安全和 C 字符串的 '\0' 终止的关系", "SDS 扩容为什么小于 1MB 时翻倍、大于 1MB 时每次加 1MB"],
  ["Redis", "SDS", "字符串", "底层原理"])

q("redis", "medium", "short_answer",
  "Redis 压缩列表（ziplist）设计",
  "Redis 的 ziplist（压缩列表）的内部结构是什么？为什么 ziplist 在数据量少时能节省内存？ziplist 的连锁更新问题（Cascading Update）是什么？",
  "Ziplist 是一块连续内存（字节数组），以紧凑的方式存储多个元素。每个元素可以是一个字节数组或整数。\n\n内部结构（按字节偏移）：1）zlbytes（4 字节）——整个 ziplist 占用的字节数。2）zltail（4 字节）——末尾元素相对 ziplist 起始地址的偏移量（用于从尾部反向遍历 POP）。3）zllen（2 字节）——元素数量（< 65535 时准确值，≥ 65535 时需要遍历统计）。4）entry X——每个元素包含：prevlen（前一个元素的长度编码，用于反向遍历）、encoding（编码类型和当前元素长度）、content（实际数据）。5）zlend（1 字节，0xFF）——结束标记。\n\n为什么节省内存：1）所有数据在连续内存（一次 malloc，空间局部性好，CPU 缓存命中率高）。2）每个 entry 不存完整指针（prevlen 和 encoding 使用变长编码，小数据用 1 字节，大数据用 5 字节）。3）整数直接编码（存储整数时不用指针指向外部对象）。相比 hashtable（每个 key/value 分别 malloc + 额外指针开销），ziplist 节省 60-80% 的内存。\n\n连锁更新问题：1）prevlen 使用变长编码：前一个元素长度 < 254 字节时，prevlen 占 1 字节；≥ 254 时占 5 字节。2）问题场景——连续多个元素长度在 250-253 字节之间。新的元素插入头部，导致第一个 entry 的 prevlen 从 1 字节变成 5 字节（因为新元素 > 253），第一个 entry 膨胀 4 字节 → 第二个 entry 的 prevlen 也膨胀 → 链式反应。3）后果——ziplist 逐字节更新（memmove）造成 O(N²) 时间复杂度和多次内存重分配。4）实际影响——极端情况下有性能问题，但正常使用中连锁更新不常见（需要恰好多个元素长度在 250-253 之间）。Redis 7.0 引入 listpack 替代 ziplist（listpack 的 entry 不存储前一个元素的长度，彻底解决了连锁更新）。",
  ["ziplist 的 prevlen 变长编码如何导致连锁更新问题", "listpack 如何解决 ziplist 的连锁更新——不存 prevlen"],
  ["Redis", "ziplist", "压缩列表", "连锁更新"])

q("redis", "hard", "short_answer",
  "Redis 跳表（skiplist）原理",
  "Redis 为什么用跳表（skiplist）而不是平衡树（如红黑树）实现有序集合？跳表的插入、删除、范围查询的复杂度是多少？跳表如何保持性能平衡？",
  "Redis 的 zset 使用跳表（skiplist）+ 哈希表（dict）的组合：跳表负责按 score 排序和范围查询，哈希表负责 O(1) 查找成员到 score 的映射。\n\n为什么用跳表而不是平衡树：1）范围查询更简单——跳表是按序排列的链表，范围查询（ZRANGEBYSCORE）只需找到起点后沿 forward 指针遍历。红黑树的范围查询需要中序遍历（比跳表复杂）。2）实现更简单——插入/删除不需要复杂的旋转和染色操作（红黑树的左旋/右旋/重染色）。跳表只需要调整指针。3）内存占用可调——通过调整跳表的层数（p 因子和 maxLevel），可以在内存和查询性能之间权衡。4）平均复杂度与红黑树相同——O(logN) 的概率保证（而不是像红黑树的严格保证）。但在工程中实际性能接近。\n\n跳表结构：1）每个节点（zskiplistNode）包含：sds ele（成员值）、double score（分数）、backward 指针（后退指针）、level[] 数组（每层一个 forward 前进指针 + span 跨度）。2）zskiplist 头节点：header（头节点，不存数据，有 64 层）、tail（尾节点指针）、length（元素总数）、level（当前最大层数）。\n\n操作复杂度：1）插入——从最高层开始找插入位置，逐层下降，记录每层的前驱节点。平均 O(logN)，最坏 O(N)（但概率极低）。2）删除——类似插入。O(logN)。3）按 score 范围查询——找到起点后沿 forward 指针遍历。O(logN + M)（M 为返回元素数）。4）按排名（rank）查询——O(logN)，利用每层的 span 字段计算排名。\n\n性能平衡（更新层数概率）：Redis 跳表使用幂律分布（power law）决定层数：每次上升到下一层的概率为 1/4（p=0.25），最大层数为 64。p=0.25 的权衡：相比标准跳表的 p=0.5（更平衡的层数分布），Redis 使用 p=0.25 以牺牲少量查询性能换取更低的内存开销（层数少一半，指针占用少）。参考论文：William Pugh, “Skip Lists: A Probabilistic Alternative to Balanced Trees” (1990)。",
  ["跳表 vs 红黑树——范围查询和实现复杂度对比", "Redis 跳表的 p=0.25 和标准 p=0.5 的区别——内存 vs 速度"],
  ["Redis", "跳表", "skiplist", "zset", "数据结构"])

# ==================== Replication & Persistence ====================

q("redis", "hard", "short_answer",
  "Redis 主从复制原理：PSYNC2",
  "Redis 主从复制的工作流程是什么？PSYNC2（Redis 4.0+）相比 PSYNC1 有什么改进？部分重同步（Partial Resync）是如何实现的？repl_backlog 和 runid 的作用是什么？",
  "Redis 主从复制分为全量重同步（Full Resync）和部分重同步（Partial Resync）。\n\n全量重同步流程：1）从节点发送 PSYNC ? -1（第一次连接，不知道主节点的 runid 和 offset）。2）主节点返回 FULLRESYNC {runid} {offset}，触发全量同步。3）主节点执行 BGSAVE 生成 RDB 快照。4）主节点将 RDB 文件发送给从节点。5）从节点清空当前数据，加载 RDB。6）主节点将增量命令（在 BGSAVE 期间产生的写入）发送给从节点（通过 repl_backlog 缓冲区）。\n\n部分重同步（PSYNC2，Redis 4.0+）：1）主节点维护 repl_backlog 缓冲区（环形缓冲区，默认 1MB，通过 repl-backlog-size 配置）。2）从节点断线重连后，发送 PSYNC {last_runid} {last_offset}。3）主节点检查：runid 匹配（说明连的是同一台主节点）&& offset 在 repl_backlog 范围内（断开期间的数据还在缓冲区中）→ 执行部分重同步（只发送增量数据，不需要全量 RDB）。4）如果 offset 不在 repl_backlog 范围内（断开太久，数据已被覆盖）→ 触发全量重同步。\n\nPSYNC2（Redis 4.0+）相比 PSYNC1 的改进：PSYNC1 中，主节点重启后 runid 改变（从节点无法部分重同步，每次主重启都需要全量同步）。PSYNC2 引入 replication ID（主节点标识）和 replication ID2（上一个主节点标识，用于主从切换后从节点连接新主）。主从切换后的部分重同步：A（旧主）→ B（新主），C（旧从），切换后 C 连接 B 时，C 的 master_replid = A 的 replid，B 的 replid2 = A 的 replid，所以 C 和 B 共享 replid 历史 → 可以进行部分重同步。\n\n复制缓冲区设置：repl-backlog-size 设为 BDP（带宽 × RTT）的 2 倍或其他值。例如每秒写入 1MB，预期最大复制断连 30 秒 → backlog 大小 ≈ 30MB + 安全余量。监控 master_repl_offset 和 slave_repl_offset 的差距，如果差距大于 repl-backlog-size，则需要增加 backlog。",
  ["PSYNC2 如何实现主从切换后的部分重同步——replication ID2 的作用", "repl_backlog 太小导致频繁全量重同步——如何计算合适的大小"],
  ["Redis", "主从复制", "PSYNC2", "RDB", "高可用"])

q("redis", "hard", "short_answer",
  "Redis AOF 重写与 fsync 策略",
  "Redis AOF 持久化的完整流程是什么？AOF 重写（BGREWRITEAOF）如何在不阻塞主线程的前提下完成？appendfsync always/everysec/no 三种策略的区别和风险是什么？",
  "AOF（Append Only File）持久化记录每次写操作的命令，重启时通过回放 AOF 重建数据。\n\nAOF 写入流程：1）当写命令执行完，Redis 将命令追加到 server.aof_buf（AOF 缓冲区，内存）。2）事件循环结束前，根据 appendfsync 策略将 aof_buf 刷入文件系统的页缓存（Page Cache），然后调用 fsync 强制刷盘。3）appendfsync always——每个命令都 fsync（最安全，但写入吞吐极低，约 200-300 ops/s）。4）appendfsync everysec（默认）——每秒 fsync 一次（最多丢 1 秒的数据，推荐）。5）appendfsync no——由操作系统决定什么时候刷盘（最多丢数十秒数据）。\n\nAOF 重写（BGREWRITEAOF）：随着写入增加，AOF 文件不断增长。重写原理：fork 子进程将当前内存中的数据转换为 Redis 命令（如 SET key value），生成新的 AOF 文件（最小化的命令集合），替代旧 AOF。过程：1）触发条件——手动（BGREWRITEAOF）或自动（配置 auto-aof-rewrite-percentage/auto-aof-rewrite-min-size）。2）fork 子进程——子进程拥有父进程的数据快照（fork 的 COW 特性）。3）子进程将数据库中的每个 key-value 转为写命令，写入临时文件。4）重写缓冲区——在重写期间，父进程继续处理写操作，同时将写命令写入 AOF 重写缓冲区（aof_rewrite_buf_blocks）。5）子进程完成重写后，发送信号通知父进程。父进程将重写缓冲区中的增量数据追加到新 AOF 文件。6）原子替换：rename 临时文件为 AOF 文件名。7）注意：AOF 重写时 fork 子进程，fork 时如果内存很大（如 10GB），fork 耗时可能上百毫秒（fork 复制页表）。\n\nAOF 追加阻塞（AOF Blocked fsync）：everysec 策略下，如果上次 fsync 未完成（磁盘写入慢），Redis 主线程会阻塞等待 fsync 完成（最多等待 2 秒）。这是 Redis 延迟尖刺的常见原因。监控 aof_delayed_fsync 指标观察 AOF 阻塞情况。\n\nRDB vs AOF 混合持久化（Redis 4.0+）：aof-use-rdb-preamble yes → AOF 文件开头是 RDB 格式的快照（快速加载），后面追加 AOF 增量数据。结合了 RDB 的加载速度和 AOF 的丢失少量数据优势。",
  ["AOF 的三种 fsync 策略在安全性和性能之间的权衡", "AOF 重写为什么需要子进程——COW 机制如何保证数据一致性"],
  ["Redis", "AOF", "持久化", "fsync", "BGREWRITEAOF"])

# ==================== Cluster & High Availability ====================

q("redis", "hard", "short_answer",
  "Redis Cluster 通信协议与 Gossip",
  "Redis Cluster 中节点之间如何通信？Gossip 协议是如何工作的？Cluster 节点之间交换了哪些信息？CLUSTER MEET 的消息传播机制是什么？",
  "Redis Cluster 节点之间通过 TCP 总线通信（端口 = 业务端口 + 10000），使用 Cluster Bus 协议（二进制协议）。\n\nGossip 消息类型：1）MEET——新节点加入集群，通过 CLUSTER MEET 发送。2）PING——周期性发送（默认每秒 10 次），随机挑选 5 个节点 + 上次 PONG 最久远的节点。3）PONG——回复 PING，携带本节点信息。4）FAIL——节点检测到某节点疑似下线（PFAIL），向集群广播 FAIL 消息（确认下线后）。\n\n消息内容（ClusterMsgDataGossip）：每个 Gossip 消息包含若干个 gossip 结构（通常 2-3 个），每个结构包含：1）节点 ID（40 字符的十六进制 runid）。2）IP:Port（发送方认为该节点的 IP 和端口）。3）flags（节点的角色：主/从、是否下线、是否 PFAIL/FAIL）。4）ping_sent/pong_recv（最近一次 PING 发送时间和 PONG 接收时间）。\n\n交换信息：1）节点本身的信息（id、IP:Port、epoch、配置纪元）。2）每个 slot 的分布（16000+ 个 slot 的归属）。3）各节点的状态（RUNNING/PFAIL/FAIL）。4）Cluster epoch（配置版本，用于冲突处理——最新 epoch 的路由信息获胜）。\n\n消息传播机制：1）Gossip 的传播速度——每个节点每秒向 5-10 个其他节点发送 Gossip 消息。一个节点加入集群后，消息在数秒内传播到所有节点。2）Gossip 的收敛性——经过 O(logN) 轮传播后，整个集群的所有节点都收到该信息。3）带宽控制——集群节点数增加时，每个节点 PING 的节点增加（随机挑选 N 个中的 5 个，加上最旧的 PONG）。集群节点数越多，每个节点的 Gossip 带宽占用越高。官方建议 Cluster 节点数不宜超过 1000。\n\nCluster Bus 的安全性：Redis 6.0+ Cluster Bus 默认启用 TLS 加密（cluster-preferred-endpoint-type 和 tls-cluster 配置）。Cluster Bus 的协议头包含 CRC64 校验，防止消息损坏。\n\n注意：PING 间隔不是固定的——为了自适应网络条件，Redis 根据节点间延迟动态调整 PING 间隔（cluster_ping_interval）。带宽有限时自动增大间隔。",
  ["Gossip 消息的收敛速度与集群规模的关系——O(logN) 轮传播", "Cluster Bus 端口（16379）和业务端口（6379）的隔离设计"],
  ["Redis", "Cluster", "Gossip", "协议", "分布式"])

q("redis", "hard", "short_answer",
  "Redis Cluster 故障检测与自动故障转移",
  "Redis Cluster 如何检测节点故障？PFAIL 和 FAIL 状态是如何转换的？自动故障转移（Failover）的完整流程是什么？集群脑裂如何防止？",
  "Redis Cluster 的故障检测是分布式的（无中心化仲裁节点），使用 Gossip 传播状态。\n\n故障检测流程：1）PFAIL（Possible Fail，疑似下线）——节点 A 向节点 B 发 PING，如果 N 秒（cluster-node-timeout）没有收到 PONG，A 将 B 标记为 PFAIL。2）PFAIL 通过 Gossip 传播——A 将 B 标记为 PFAIL 的信息通过 Gossip 消息传播给其他节点。3）FAIL（确认下线）——如果集群中超过半数的主节点（N/2 + 1）将 B 标记为 PFAIL，则 B 的状态晋升为 FAIL。4）判定确认后，第一个达到半数标记的节点向集群广播 FAIL 消息。\n\n自动故障转移（Failover）：1）条件——B 标记为 FAIL，且 B 有从节点。2）从节点选举——从节点检查自己是否有资格（数据延迟不超过最大容忍值）。有资格的从节点向集群中其他主节点发起投票（类似 Raft 的选举）。3）投票机制——每个主节点在一个配置纪元（Config Epoch）内只能投一票。从节点获得超过半数主节点投票后升主。4）完成——选举获胜的从节点执行 SLAVEOF NO ONE，将自己标记为主节点。发布 PONG 消息通知其他节点。5）整个切换过程对客户端是透明的（除了 slot 重映射的瞬间）。\n\n防止脑裂（Split Brain）：1）cluster-node-timeout——如果主节点与集群多数节点失联超过此时间（默认 15 秒），被标记为 FAIL。2）在故障转移前，原主节点如果恢复连接，从节点已经升主。原主节点发现自己的 epoch 低于新主，降级为从节点。3）数据保护——Redis Cluster 是 AP 系统（优先可用性，最终一致性）。网络分区期间，分区的 minority 侧主节点停止接收写入（cluster-require-full-coverage 默认 yes 时，slot 未完全覆盖的节点拒绝写入）。4）实际配置建议——生产环境 cluster-require-full-coverage no（避免少数节点故障导致整个集群不可写），结合客户端侧的跨节点重试。\n\n延迟敏感性：cluster-node-timeout 影响故障切换速度（越小越快，但误判越多）。监控 cluster_state 是否为 ok、cluster_slots_ok 是否完整。",
  ["Redis Cluster 的 PFAIL → FAIL 转换需要多少节点确认——超过半数", "脑裂预防——cluster-node-timeout 和 cluster-require-full-coverage"],
  ["Redis", "Cluster", "故障转移", "PFAIL", "脑裂"])

q("redis", "medium", "short_answer",
  "Redis 数据分片策略（Slot 迁移）",
  "Redis Cluster 使用 16384 个 Hash Slot 进行数据分片。为什么是 16384 而不是 65536 或其他数量？Slot 迁移过程中客户端如何感知拓扑变化？MIGRATE 命令如何工作？",
  "Redis Cluster 使用一致性哈希的一种变体——固定 Slot 映射（CRC16(key) % 16384）。\n\n为什么是 16384 个 Slot：1）消息体积——Cluster 节点间 Gossip 消息需要携带 Slot 分配信息。每个节点用 16384 bit 的 bitmap（2KB）表示自己负责的 slot 范围（bit = 1 表示负责该 slot）。如果使用 65536 个 slot，bitmap 大小为 8KB（2 倍，不算大但 Gossip 消息中每个节点都要带）。2）CRC16 的有效输出是 14 位（16384），CRC16 算法设计为 16 位的，用满 16 位（65536）不一定更均匀。3）集群规模——Redis 官方建议 Cluster 不超过 1000 节点，16384 个 slot 平均每个节点 16+ 个 slot（1000 节点时），足以保证数据均匀分布。4）更少的 slot 意味着迁移粒度更粗但消息更小。单节点 slot 数越少，rehash 迁移次数越少（节点增减时）。\n\nSlot 迁移流程：1）CLUSTER SETSLOT {slot} MIGRATING {source_node_id}——标记 slot 在源节点上为迁移出状态。2）CLUSTER SETSLOT {slot} IMPORTING {target_node_id}——标记 slot 在目标节点上为导入状态。3）源节点遍历该 slot 下的所有 key，对每个 key 执行：MIGRATE {target_host} {target_port} {key} 0 5000。4）MIGRATE 命令原子完成：DUMP（序列化 key + value + TTL）→ DEL（删除本地 key）→ RESTORE（在目标节点写入）。5）迁移完所有 key 后，广播 CLUSTER SETSLOT {slot} NODE {target_node_id}。所有节点更新 slot 分配信息。\n\n迁移期间的客户端行为：1）源节点收到该 slot 的请求时，检查 key 是否已迁移（在 migrating 状态）。未迁移的 key 正常处理。2）已迁移的 key → 返回 MOVED {slot} {target_ip:port}（ASK 重定向）。3）客户端收到 MOVED 后更新本地 slot 缓存，重定向到新节点。4）ASK（临时重定向）——迁移过程中，客户端请求 key 可能刚被迁移，目标节点返回 ASK 要求客户端先去源节点确认（一次性的）。5）重要：SLOT 迁移期间，两个节点同时处理该 slot 的请求（源节点处理 ke y 仍在本地的请求，目标节点处理已迁移 key 的请求）。\n\n批量迁移工具：redis-cli --cluster reshard（交互式槽迁移）、redis-shake（跨集群数据迁移工具，支持过滤和转换）。",
  ["CRC16(key) % 16384——为什么是 16384 而不是 65536", "MIGRATE 命令的原子性和迁移中断处理"],
  ["Redis", "Cluster", "Slot", "分片", "迁移"])

# ==================== Advanced Features ====================

q("redis", "easy", "short_answer",
  "RESP2 vs RESP3 协议",
  "Redis RESP（REdis Serialization Protocol）2 和 3 的区别是什么？RESP3 解决了什么问题？支持 RESP3 的客户端库有哪些？",
  "RESP（Redis Serialization Protocol）是 Redis 客户端-服务端之间的通信协议。RESP2 是 Redis 1.2+ 使用的协议，RESP3 是 Redis 6.0+ 引入的新协议。\n\nRESP2 的设计特点：1）五种数据类型——Simple String（+OK\r\n）、Error（-ERR\r\n）、Integer（:1\r\n）、Bulk String（$5\r\nhello\r\n）、Array（*2\r\n...）。2）缺点——客户端无法区分不同的数据类型（如 Bulk String 和 Array 都是 $ 开头，需要应用层区分）。Nil 和 Null Array 容易混淆（$-1 是 Nil，*-1 是 Null Array）。3）不支持推模式——客户端只能通过轮询或阻塞命令获取数据变化。\n\nRESP3 的改进：1）新增数据类型——Map（% 标识，键值对结构）、Set（~ 标识）、Double（, 标识）、Big Number（( 标识）、Null（_ 标识）、Boolean（# 标识）、Verbatim String（= 标识，带格式信息的字符串）。2）Push 类型（> 标识）——服务端可以主动向客户端推送数据（实现了 Pub/Sub 的 Push 模式，不再需要客户端轮询）。3）流式响应（Streaming）——服务端可以发送 Streaming 类型的部分累积响应（如 CLIENT TRACKING 的失效消息）。4）客户端缓存（Client-side Caching）——RESP3 支持服务端通知客户端缓存失效（Tracking Mode：客户端缓存 key-value，key 被修改时服务端 Push 失效通知），减少服务端查询和网络传输。\n\n升级影响：1）Redis 6.0+ 同时支持 RESP2 和 RESP3（HELLO 2 / HELLO 3 切换协议版本）。2）客户端连接时默认用 RESP2（兼容旧客户端），显式发送 HELLO 3 切换到 RESP3。3）新客户端推荐使用 RESP3（更好的类型安全和服务端 Push）。\n\n支持 RESP3 的客户端：Redis Stack 的 redis-py（>= 4.3.0）、Lettuce（Java，>= 6.0）、node-redis（>= 4.0）、Jedis（>= 4.0）、Go-Redis（>= 9.0）。",
  ["RESP3 的 Push 类型——解决了阻塞命令（BLPOP）的什么问题", "RESP3 的 Client-side Caching——服务端 Push 失效通知减少查询"],
  ["Redis", "RESP", "协议", "RESP3", "客户端"])

q("redis", "medium", "short_answer",
  "Redis 客户端缓存（Tracking / Server-assisted）",
  "Redis 6.0 的客户端缓存（Client-side Caching）机制是什么？Tracking 模式（Server-assisted client-side caching）如何工作？与 RESP3 的 Push 类型有什么关系？INVALIDATION 消息如何传播？",
  "客户端缓存将热点数据缓存在客户端内存中，减少到 Redis 的网络请求。Tracking 是服务端辅助的客户端缓存：客户端声明需要跟踪哪些 key 的变化，服务端在 key 被修改时 Push 失效通知。\n\n两种 Tracking 模式：1）默认模式（Tracking on）——客户端缓存 key-value，发送命令时，服务端记录该客户端读取的 key。key 被修改/删除时，服务端 Push INVALIDATION 消息通知该客户端缓存失效。每个服务端节点独立跟踪状态（内存开销：每个 key 的指针和客户端 ID）。2）广播模式（BCAST）——客户端声明需要跟踪指定 prefix 的所有 key（如 object:*），不再需要服务端逐 key 跟踪。服务端在 prefix 范围内的 key 变更时广播失效通知。优点：服务端内存开销低（不维护逐 key 映射）。缺点：广播可能通知不需要的 key。\n\nINVALIDATION 消息传播：1）服务端通过 RESP3 Push 类型（> 标识）发送 invalidation 消息。2）消息格式：invalidation（消息类型）+ key 列表（被修改的 key）。3）频率控制——一个命令可以同时修改多个 key（如 DEL 或 Pipeline），那么在该命令完成后，合并所有 invalidation 为一个 Push 消息发送。4）连接断开后的处理——客户端断线时，服务端清理该客户端的跟踪信息。客户端重连后缓存的 key 可能已经过期，需要重新缓存。\n\n收益：1）减少网络往返——热点 key 的查询完全在本地内存完成（0 RTT）。2）减少服务端负载——服务端 CPU 占用降低（处理读命令是 CPU 密集操作，尤其当 qps 很高时）。3）局限——只适用于读多写少的热点 key。key 频繁更新时，客户端频繁收到 invalidation，缓存命中率低。\n\n注意：Tracking 需要在稳定的长连接（RESP3）上实现。客户端断线后缓存失效。对于不适合纯 Tracking 的场景，可以结合 local cache（如 CaffeineCache）+ Redis Pub/Sub 失效通知。",
  ["Client-side Caching 的默认模式和广播模式的选择依据", "Tracking 对写密集场景为什么效果不好——频繁 invalidation"],
  ["Redis", "客户端缓存", "Tracking", "RESP3", "性能"])

# ==================== Deployment & Operations ====================

q("redis", "medium", "short_answer",
  "Redis 在 Kubernetes 中的部署方案",
  "Redis 在 Kubernetes 上部署的最佳实践有哪些？StatefulSet vs Deployment 的选择依据是什么？Redis Operator（如 KubeDB / Spotahome / ZTE）如何实现自动故障转移？Redis 在容器化环境中的性能注意事项有哪些？",
  "Redis 在 K8s 部署的核心挑战：有状态（持久化数据） + 网络标识稳定（Cluster 节点间固定 hostname/IP）+ 性能（容器网络和磁盘 IO）。\n\nStatefulSet 选择：必须用 StatefulSet（不用 Deployment）。原因：1）稳定的网络标识（ordinal index：redis-0.redis-headless.svc，Redis Cluster 节点之间通过固定的 hostname 通信）。2）有序的启停（优雅的滚动升级——从 N 到 0 依次重建）。3）每个 Pod 绑定独立的 PVC（持久化数据）。\n\nRedis Operator 工作方式：1）Spotahome Redis Operator——通过 CRD（RedisFailover CR）定义。Operator 创建 Sentinel + Redis 的 StatefulSet。Sentinel 监视主 Redis，主故障时 Sentinel 执行故障转移，Operator 将新的主 Redis 地址更新到 ConfigMap 或 Service Endpoint。2）KubeDB——通过 Redis CR 定义集群。支持 Standalone、Sentinel 高可用、Cluster 三种模式。提供备份恢复（BackupConfiguration CRD）。3）ZTE Redis Cluster Operator——专门管理 Redis Cluster。根据 CRD 创建指定分片数的 Cluster 集群。管理 Slot 迁移和扩缩容（添加分片 → Slot 重分配 → Pod 加节点）。\n\n性能注意事项：1）CPU 隔离——Redis 是 CPU 密集型（尤其是 Pipeline 和 Batching 场景）。建议预留 CPU（resources.requests.cpu = resources.limits.cpu），避免 CPU Throttle（CFS 配额限制导致 Redis 延迟波动）。2）网络——K8s 的 kube-proxy（iptables/IPVS）对 Redis 这样的长连接大量场景有额外开销。CNI 插件选择（Calico / Cilium eBPF 直通性能更好）。Redis Cluster 的 Cluster Bus 跨节点通信延迟。3）磁盘 AOF/持久化——SSD 是必须的（GP3 或更好的 EBS）。AOF fsync 依赖底层存储的写入延迟（EBS 的 IOPS 限制可能导致 fsync 阻塞）。4）内存——limit memory 容器限制可能导致 OOM Kill（Redis 内存超过 limit 时不会优雅降级，直接被 kernel OOM Kill）。建议预留 headroom（maxmemory 设为 limit 的 70-80%）。5）大页透明——K8s 节点通常默认启用 Transparent Huge Pages（THP），导致 Redis 延迟尖峰（fork 时 copy-on-write 按页粒度复制，THP 每页 2MB vs 4KB）。需要在节点关停（echo never > /sys/kernel/mm/transparent_hugepage/enabled）。\n\n部署拓扑：Redis 作为 Sidecar（App 和 Redis 在同一 Pod）——开发测试环境适用，生产不推荐（增加 Pod 内存和资源需求，Pod 重启 Redis 数据丢失）。独立 StatefulSet——生产标准模式。Sentinel 和 Cluster 模式需要用 Operator 管理自动故障转移。",
  ["StatefulSet 的 ordinal index 对 Redis Cluster 的重要性——拓扑感知", "透明大页（THP）为什么会导致 Redis 延迟尖峰——内存页粒度增大"],
  ["Redis", "Kubernetes", "Operator", "StatefulSet", "运维"])

q("redis", "medium", "short_answer",
  "Redis 慢查询与延迟监控",
  "如何排查 Redis 的延迟问题？SLOWLOG 命令的使用和配置。什么情况下 Redis 会出现延迟尖峰（Latency Spike）？如何使用 Redis 的 Latency Monitoring 功能？",
  "Redis 延迟问题排查的系统和工具。\n\n1）SLOWLOG：Redis 记录超过指定时间阈值（slowlog-log-slower-than，默认 10000 微秒=10ms）的命令。常用命令：SLOWLOG GET（查看最近慢查询）、SLOWLOG LEN（慢查询总数）、SLOWLOG RESET（清空）。每个慢查询记录包含：时间戳、执行耗时（微秒）、命令及参数、客户端 IP:Port。注意：SLOWLOG 在内存中（默认最多 128 条，slowlog-max-len 配置），不影响性能。大 key 操作（如 DEL 大 hash、KEYS *）是常见慢查询原因。\n\n2）延迟尖峰常见原因：① fork 延迟——BGSAVE / BGREWRITEAOF 时 fork 子进程。大实例（> 10GB）fork 耗时 10-100ms+，这段时间主线程阻塞。② AOF fsync 阻塞——appendfsync everysec 时，fsync 耗时过长（磁盘 IO 竞争），Redis 等待最多 2 秒。监控 aof_delayed_fsync。③ THP（透明大页）——fork 后 COW 写放大（每页 2MB vs 4KB 普通页）。④ 内存分配器（jemalloc）竞争——多线程竞争内存分配锁（Redis 6.0+ 多线程 IO 的 jemalloc 竞争）。⑤ 交换（Swap）——Redis 内存被操作系统换出时，每次访问触发缺页中断（page fault），延迟飙升数秒。监控 vmstat 的 si/so 列判断是否在使用 swap。\n\n3）Latency Monitoring 框架（Redis 2.8.6+）：通过 LATENCY 命令诊断延迟来源。子命令：LATENCY LATEST（最近延迟事件）、LATENCY HISTORY（指定事件的延迟历史）、LATENCY GRAPH（ASCII 柱状图）、LATENCY DOCTOR（诊断报告，推荐的操作）。\n\n4）第三方监控：Redis Exporter（Prometheus 导出器）+ Grafana（官方 Redis 面板）。关注指标：instantaneous_ops_per_sec、connected_clients、used_memory、rdb_last_bgsave_time_sec、aof_delayed_fsync。阿里巴巴的 RedisLabs 提供 DBA 工具：Redis 的 active defragmentation（主动碎片整理）和 lazy-free（UNLINK 异步释放）。\n\n5）常见优化：使用 UNLINK 替代 DEL（异步删除大 key）。使用 SCAN / SSCAN / HSCAN / ZSCAN 替代 KEYS / SMEMBERS（分批遍历避免阻塞）。减少 Pipeline 中的命令数量（拆分大 Pipeline）。合理设置 maxmemory（留 20-30% 内存余量，避免 OOM 和 swap）。",
  ["SLOWLOG 和 LATENCY MONITOR 的区别——SLOWLOG 记录阈值超限的命令，LATENCY 记录系统事件", "fork 子进程的延迟和内存大小有什么关系——COW 页表复制"],
  ["Redis", "SLOWLOG", "延迟", "监控", "性能"])

q("redis", "medium", "short_answer",
  "Redis 备份与灾难恢复",
  "RDB 和 AOF 的备份策略如何设计？如何在不影响 Redis 性能的前提下做定期备份？主从架构中备份应该在哪做（主节点还是从节点）？AOF 文件损坏如何恢复？",
  "Redis 的备份和恢复策略。\n\n1）备份方式：RDB 快照（全量备份，文件小，适合冷备）vs AOF（增量备份，数据完整，适合恢复）。推荐两者结合：生产启用 AOF（appendfsync everysec，最多丢 1 秒） + 每天做一次 RDB 全量备份（用于启动快速恢复和归档）。\n\n2）备份执行：不要在主节点做 BGSAVE（fork 子进程增加内存开销和延迟）。在从节点做：SLAVE 上定期执行 BGSAVE，生成的 RDB 文件从从节点拷贝到备份存储（S3 / NAS 等）。在主从架构中，建议配置 2 个以上从节点，一个用于业务只读分流，一个专门用作备份（通过 slave-priority/redis.conf 中的配置）。备份频率：根据数据重要性和更新频率，核心业务 RDB 每小时/每天。\n\n3）AOF 文件损坏恢复：Redis 重启时如果发现 AOF 文件尾部损坏（如宕机时文件未完整写入），会拒绝加载。修复工具：redis-check-aof --fix aof-file。修复逻辑：扫描 AOF 文件，截断最后一个不完整的事务（从最后一个完整的事务截断），丢弃不完整的数据。修复后的 AOF 文件最多丢失最后几秒的数据（取决于 appendfsync 策略）。\n\n4）跨地域备份：将 RDB 文件上传到云存储（AWS S3、阿里云 OSS）或其他数据中心（异地容灾）。步骤：从节点 BGSAVE → scp/s3 cp/AWS CLI → 上传到异地存储。恢复时：下载最新的 RDB → 放到 Redis 的数据目录 → 启动 Redis（关闭 AOF 或预先清空 AOF，让 Redis 从 RDB 加载数据后开始写新 AOF）。\n\n5）Sentinel 或 Cluster 的备份特殊性：Sentinel 模式下需要备份主节点（或一个从节点的数据）——Sentinel 只做监控和切换，不存数据。Cluster 模式下，每个主节点及其从节点各自备份自己的 slot 分片数据。恢复时如果 Cluster 拓扑变化，需要重新规划 slot 分配或全部重新均衡。\n\n6）恢复验证：定期执行恢复演练（从备份的 RDB 启动一个新的 Redis 实例，验证数据完整性）。定期检查 RDB/AOF 文件大小是否正常（突然变小或变大可能是损坏）。",
  ["备份为什么在从节点而不是主节点做——不影响主节点性能", "AOF 文件损坏如何恢复——redis-check-aof 截断不完整事务"],
  ["Redis", "备份", "RDB", "AOF", "灾难恢复"])

# ==================== Application Patterns ====================

q("redis", "medium", "short_answer",
  "Redis 实现分布式限流",
  "如何用 Redis 实现高性能分布式限流？令牌桶（Token Bucket）和滑动窗口（Sliding Window）的 Redis 实现方案分别是什么？Lua 脚本在限流中的角色是什么？",
  "Redis 是分布式限流的常用基础，核心是利用 Redis 的单线程原子性和 Lua 脚本保证计数一致性。\n\n1）固定窗口计数（INCR + TTL）：Key 按时间窗口维度 + 用户/API（如 rate:api:v1:202606041400）。每次请求 INCR key → 判断是否超过阈值 → EXPIRE key TTL。最简单，但边界突发问题：前窗口末尾 + 后窗口开头短时间内容量翻倍。\n\n2）滑动窗口（Sorted Set）：每个请求的 timestamp 作为 score 存入 ZSet。ZREMRANGEBYSCORE key -inf (now - window) 清除过期数据 → ZCARD key 统计窗口内计数。问题：每个请求都要操作 ZSet，内存和 CPU 开销大。优化：概率采样（不精确清理）+ 后台定时清理。\n\n3）令牌桶（Token Bucket，推荐用 Lua）：每个令牌桶的状态在 Redis 中存为 {tokens, last_refill_time}。每次请求时，Lua 脚本计算应补充的令牌数(now - last_refill_time) * rate，然后减去消耗的令牌。Lua 保证原子性——客户端之间不需要加锁。\n\n示例 Lua 脚本（令牌桶）：\nlocal key = KEYS[1]\nlocal rate = tonumber(ARGV[1]) -- 每秒补充的令牌数\nlocal burst = tonumber(ARGV[2]) -- 桶容量\nlocal cost = tonumber(ARGV[3]) -- 这次请求消耗多少令牌\nlocal now = tonumber(ARGV[4]) -- 当前时间戳（秒）\nlocal tokens = redis.call('GET', key)\nlocal last_refill = redis.call('GET', key..':time')\nif tokens == false then\n    tokens = burst\n    last_refill = now\nend\ntokens = math.min(burst, tonumber(tokens) + (now - tonumber(last_refill)) * rate)\nif tokens >= cost then\n    redis.call('SET', key, tokens - cost)\n    redis.call('SET', key..':time', now)\n    return 1 -- 放行\nelse\n    return 0 -- 拒绝\nend\n\n4）分布式限流架构：单 Redis 中心计数器（简单但有单点风险）——限流精度高但 Redis 挂了影响业务。本地令牌桶 + Redis 周期性同步（类似 Guava RateLimiter 的分布式版本）——每个应用节点维护本地桶，周期向 Redis 申请配额。Redis 挂了时各节点继续用本地桶（降级）。\n\n5）其他 Redis 限流命令：INCR + 过期组合、CL.THROTTLE（Redis 4.0+ 的 Rate Limiting 模块，基于 Generic Cell Rate Algorithm / GCRA）。CL.THROTTLE key capacity interval quota。\n\n6）注意：高并发场景（万级 QPS+）限流的 Redis 的 CPU 负载。当单个 redis 承载所有限流请求时，QPS 达到数万后成为瓶颈。解决方案：本地缓存 + 周期同步、命令分片或使用 P99 延迟做自适应限流。",
  ["令牌桶 Lua 脚本为什么是原子的——Redis 的单线程 + EVAL", "分布式限流的 CAP 权衡——Redis 挂了时本地降级还是拒绝"],
  ["Redis", "限流", "令牌桶", "Lua", "分布式"])

q("redis", "medium", "short_answer",
  "Redis 实现分布式 ID 生成器",
  "如何使用 Redis 生成全局唯一的分布式 ID（递增序列）？Redis 的 INCR 命令实现 ID 生成器的性能瓶颈和替代方案是什么？雪花算法（Snowflake）和 Redis 自增 ID 的对比？",
  "Redis 的 INCR 命令可以直接实现全局递增 ID，但受限于 Redis 单线程模型（每次 INCR 是一次网络 RTT）和 Redis 的单点问题。\n\nRedis INCR 方案：1）简单 INCR key——每次请求 INCR id:global，返回递增整型。性能上限约 5-10 万 QPS（单个 Redis 实例的极限）。2）批量获取（Pipeline / INCRBY）——一次获取一段连续 ID，应用端缓存 ID 段后本地分配。INCRBY id:global 1000 获取 [current, current+999] 段，应用端从段内分配，用尽后再次取。大幅降低 Redis 请求量。3）分段划分——不同业务线用不同前缀（INCR order:id、INCR user:id）。\n\nRedis 方案 vs 雪花算法（Snowflake ID）：Snowflake 由 1 bit 符号位 + 41 bit 时间戳 + 10 bit 机器 ID + 12 bit 序列号组成（共 64 bit）。优点：完全本地生成（不依赖外部系统）、趋势递增（时间戳高位）、高性能。缺点：强依赖服务器时钟（时钟回拨会导致 ID 冲突/重复）。Redis 方案：严格递增、依赖 Redis（需要高可用 Redis）、可调整（可自定义 ID 位数和格式）。\n\n选择建议：ID 需要严格有序递增 → Redis INCR（批量获取优化性能）。ID 只要求全局唯一和趋势递增 → Snowflake（本地生成，不依赖外部）。分布式 ID 的要求：全局唯一 + 高性能 + 趋势递增（B+Tree 索引友好） + 安全性（不暴露业务量，所以不能用连续自增 ID）。实际选型：Leaf（美团分布式 ID 生成器）的 segment 模式（批量从 DB/Redis 获取 ID 段）优于纯 Redis 或纯 Snowflake。\n\n注意：不要直接用 Redis INCR 生成的连续 ID 作为订单 ID 或用户 ID（容易暴露业务量，竞争对手可以通过 ID 变化了解销量）。更好的做法：前缀 + 时间戳 + 随机数，或 Leaf 的 segment 模式 + 替换算法。",
  ["INCRBY 批量获取 ID 段减少 Redis 请求——性能优化", "Snowflake 的时钟回拨问题——Redis INCR 不依赖时钟"],
  ["Redis", "分布式 ID", "INCR", "Snowflake", "架构"])

q("redis", "medium", "short_answer",
  "Redis 作为 Session Store 设计",
  "为什么常用 Redis 作为 Session 存储？相比内存 Session 和 DB Session，Redis Session Store 的设计要点是什么？Session 的序列化、过期、安全如何设计？",
  "Session Store 选型的核心要求：快速读写 + 自动过期 + 高可用 + 共享（多服务器共享 Session）。\n\nRedis 作为 Session Store 的优势：1）读写速度——内存操作（纳秒级），比数据库快 100-1000 倍。2）TTL 自动过期——EXPIRE 命令或 SETEX 设置 Session 过期时间。Redis 自动清理过期 key（惰性删除 + 定期扫描），不需应用实现清理。3）高可用——Redis Sentinel / Cluster 保证 Session 存储的可用性。Session 丢失 = 用户被迫重新登录。4）数据结构灵活——Hash 存 Session 的多个字段（用户 ID、角色、过期时间、最后活跃时间）。\n\nSession 序列化：1）Value 类型——通常存为 JSON 字符串（可读性好，跨语言兼容）或 Hash 字段。2）不建议存复杂的 Java/Python 对象（序列化版本兼容问题、类加载问题）。3）Session ID 的生成——UUID / SecureRandom（不能是简单递增，防止 Session 劫持）。Session ID 的过期时间绑定到 Redis key 的 TTL。\n\n过期策略：1）TTL 设置——用户登录后设 Session TTL = 30 分钟。每次请求刷新 TTL（读取 Session 时刷新 EXPIRE），用户持续活动 Session 不过期。2）滑期过期 vs 固定过期——滑动过期（用户每次操作后延长 TTL），固定过期（用户登录后固定 8 小时后过期，不管活跃与否）。3）过期后的行为——Redis 删除过期 key，客户端收到 null 响应后执行重定向到登录页。\n\n安全设计：1）Session ID 更新——登录后更新 Session ID（防止 Session Fixation 攻击）。权限变更（升级/降级）后重新生成 Session ID。2）二级缓存更新——Session 中的权限信息变更后，需要主动更新 Redis（删除旧的 Session key 或变更值）。不能依赖 TTL 自愈。3）加密——敏感 Session 数据（角色、令牌）可加密存储（AES-256）。Redis 本身支持 TLS（tls-port 配置）但是值加密要在应用层做。4）跨域——Session Cookie 的 Domain、SameSite、Secure、HttpOnly 属性正确配置。\n\n架构注意：Redis Session Store 需要所有后端应用连接到同一 Redis（或 Redis Cluster）实现 Session 共享。此时 Redis 成为单点依赖——Redis 故障导致所有用户 Session 不可用，所有用户必须重新登录（即使应用还在运行）。解决方案：多级 Session 存储（本地 Caffeine 缓存 + Redis，Redis 故障时本地缓存继续服务）+ Redis Sentinel 高可用。不要用 JWT 作为 Session 替代——JWT 不能主动失效，Session 可以。可以用 JWT 做认证令牌 + Redis Session 做更细粒度的权限控制。",
  ["Redis Session 和 JWT Token 的选择——需要服务端主动失效时选 Session", "Session Fixation 攻击和预防——登录后更新 Session ID"],
  ["Redis", "Session", "安全", "过期", "架构"])

q("redis", "medium", "short_answer",
  "Redis 内存淘汰策略详解",
  "Redis 的 maxmemory 设置和内存淘汰策略（Eviction Policy）有哪些？LRU、LFU、TTL 淘汰策略的原理分别是什么？如何选择适合业务场景的淘汰策略？",
  "maxmemory 设置 Redis 的最大内存上限。超过上限后，根据 maxmemory-policy 配置决定如何淘汰数据。\n\n淘汰策略（8 种）：1）noeviction——不做淘汰（默认），写入返回 OOM 错误。2）allkeys-lru——所有 key 中淘汰最近最少使用的（LRU 近似）。3）volatile-lru——仅对设置过 TTL 的 key 进行 LRU 淘汰。4）allkeys-random——随机淘汰任何 key。5）volatile-random——仅随机淘汰设了 TTL 的 key。6）volatile-ttl——淘汰设了 TTL 且剩余 TTL 最短的 key。7）allkeys-lfu（Redis 4.0+）——所有 key 中淘汰最不常用的（LFU）。8）volatile-lfu（Redis 4.0+）——仅对设了 TTL 的 key 进行 LFU 淘汰。\n\nLRU vs LFU 的区别：1）LRU（最近最少使用）——淘汰最近没有使用的 key。问题：偶发的大批量新 key 读取把热点 key 挤出缓存（扫描/遍历场景）。2）LFU（最不常用）——淘汰访问频率最低的 key。根据历史访问频率判断热度，不受偶发读取影响。L FU 使用 Morris Counter（概率计数器）——用一个字节统计访问次数，有衰减周期（counter-period）定期降低计数。\n\n选择建议：1）缓存场景（作为 MySQL 的前置缓存）→ allkeys-lru（最近访问的 key 最可能再次访问）。2）有 TTL 的 Session 或 Token 缓存 → volatile-ttl 或 volatile-lru。3）防止缓存污染（扫描/爬虫大量读不同 key）→ allkeys-lfu（LFU 更好抵抗扫描）。4）随机分发的 CDN 类缓存 → allkeys-random。5）重要数据不可淘汰（如临时令牌）→ noeviction + 容量规划。\n\n注意：1）Redis 的 LRU 是近似 LRU（在样本池中淘汰，默认 5 个，通过 maxmemory-samples 调整）。不是真 LRU（不会遍历所有 key 找真正的最近最少使用，因为 O(N) 太慢）。样本数越大淘汰越精确，但 CPU 消耗越高。2）LFU 的衰减策略：如果一个 key 曾经热过但后来不再访问，LFU 需要定期衰减（否则陈旧的热点 key 始终不会淘汰）。通过 lfu-decay-time 配置衰减周期。3）maxmemory 应该设置为实例内存的 70-80%（留出内存给 Redis 自身开销和 COW）。监控 evicted_keys 指标，值持续增长说明淘汰频繁，应扩内存或优化数据量。",
  ["LRU vs LFU——扫描场景对 LRU 的冲击和 LFU 的免疫力", "近似 LRU 的采样样本数（maxmemory-samples）对淘汰精度的影响"],
  ["Redis", "内存淘汰", "LRU", "LFU", "maxmemory"])

q("redis", "medium", "short_answer",
  "Redis 发布订阅（Pub/Sub）高级模式",
  "Redis Pub/Sub 的工作原理和性能限制是什么？Pub/Sub 和 Stream 在消息推送场景中的区别？Redis Pub/Sub 在什么场景下会丢失消息？",
  "Redis Pub/Sub 是一个简单的消息广播系统（Fire and Forget）。\n\n工作原理：1）SUBSCRIBE channel——客户端订阅一个或多个频道。Redis 维护每个频道的订阅者列表。2）PUBLISH channel message——向频道广播消息，所有订阅者收到消息。3）PSUBSCRIBE pattern——使用通配符模式匹配订阅（如 PSUBSCRIBE news:*）。\n\n性能限制和丢失场景：1）Fire and Forget——Publisher 发布消息时，Redis 不做消息持久化（不写入磁盘，不在内存中保留）。如果订阅者在消息发布时不在线（断线 / 正在慢消费），消息直接丢失（不缓存）。2）缓冲区溢出——每个订阅者连接有一个固定大小的输出缓冲区（client-output-buffer-limit pubsub 默认 32MB 硬限制 + 8MB 软限制）。如果订阅者消费慢导致缓冲区填满，Redis 断开订阅者连接（导致消息丢失）。3）可靠传递——Pub/Sub 不保证消息送达（没有 ack 机制，没有重试），不像消息队列（Kafka / RocketMQ）提供 at-least-once / exactly-once 语义。\n\nPub/Sub vs Stream 对比：1）Stream 是持久化的（Append-only log，数据存到内存/RDB/AOF），Pub/Sub 是瞬态的（不持久化）。2）Stream 支持消费者组（Consumer Group）——消息分发给组内不同消费者，Pub/Sub 是广播给所有订阅者。3）Stream 支持 ACK——消费者处理完成后显式 ACK，消息被标记为已处理。Pub/Sub 没有 ACK 机制。4）Stream 支持历史回溯——新加入的消费者可以消费历史消息（从头或指定 ID 开始）。Pub/Sub 只能收到订阅后的消息。\n\n适用场景取舍：Pub/Sub 适用场景——实时通知（用户状态变更通知）、分布式缓存失效广播（所有节点收到 key 过期通知后清除本地缓存）、监控告警（发送警戒消息给所有订阅的管理员面板）。Stream 适用场景——需要持久化和可靠传递的消息队列（订单事件、异步任务、审计日志）。\n\n注意：Redis Pub/Sub 的可靠性和吞吐远不如专用消息中间件。单机 Redis Pub/Sub 的吞吐上限约 100K msg/s（单线程写内存广播，取决于消息大小和订阅者数量）。大量订阅者时，Redis 需要为每个连接发送同一消息（写放大），CPU 消耗随订阅者数线性增长。",
  ["Pub/Sub 为什么不适合做可靠消息队列——无持久化、无 ACK、缓冲区溢出断线", "Stream 的消费者组和 Pub/Sub 的广播模式各自的适用场景"],
  ["Redis", "Pub/Sub", "Stream", "消息", "对比"])

# ==================== Ecosystem ====================

q("redis", "hard", "short_answer",
  "Redis 模块系统与 RediSearch",
  "Redis 模块（Modules）系统是如何设计的？RediSearch 搜索引擎的原理是什么？RedisJSON / RedisTimeSeries / RedisGraph 等模块的使用场景？",
  "Redis 模块系统（Redis 4.0+）允许用 C/C++ 扩展 Redis 功能，实现自定义数据结构和命令，并且保持和原生 Redis 一样的性能（在同一个进程中运行，访问相同的内存空间）。\n\n模块架构：1）初始化——模块的 RedisModule_Init 注册命令和数据类型（RDB 持久化支持）。2）命令处理——模块定义的回调函数在 Redis 主线程中执行（和原生命令一样单线程安全）。3）内存管理——模块使用 RedisModule_Alloc（通过 jemalloc 分配），内存计入 used_memory（受 maxmemory 控制）。4）数据持久化——模块通过 RedisModule_SetDataType 定义数据在 RDB/AOF 中的序列化/反序列化函数。\n\nRediSearch：内置于 Redis Stack 的全文搜索引擎。核心特性：1）倒排索引（Inverted Index）——对文档建立词→文档映射，支持前缀匹配/模糊匹配。2）中文分词——通过 rmmtokenize 支持中文分词（基于 jieba/Friso 等分词器）。3）聚合和排序——FT.SEARCH 支持 Aggregation Pipeline（GROUPBY、REDUCE 等聚合函数）。4）GEO 过滤——在搜索结果中按地理位置过滤（如找附近 5km 内的商家）。\n\nRedisJSON（Redis 4.0+）：1）原生 JSON 数据类型——用 JSONPath 语法直接操作文档的嵌套字段。2）性能——读/写一个嵌套字段不需要全序列化 JSON。3）使用场景——会话 Session（存储复杂嵌套对象）、应用配置（分层 JSON 配置）。\n\nRedisTimeSeries：1）时序数据——压缩存储（双差值编码/Double Delta），自动保留和聚合。2）压缩比——时序点/秒，压缩后每点约 1 字节（通过压缩算法，原始数据每点约 8-16 字节）。3）适用——监控指标收集、IoT 传感器数据。\n\nRedisGraph（已归档为只读维护）：1）图数据库模块——使用 Cypher 查询语言的 Property Graph 模型。底层使用 GraphBLAS（稀疏矩阵）实现图操作。2）弱于 Neo4j——在大型图查询（千万级节点+）的性能和功能上不如 Neo4j。\n\n注意：Redis Stack（将所有官方模块打包）可以在 Docker 中通过 redis/redis-stack-server 镜像一键部署。Redis 模块的内存开销较大（RediSearch 的索引和数据并存在内存中），生产使用前需要评估内存增长。",
  ["RediSearch 的全文索引和 MySQL LIKE 查询的性能差距有多大", "Redis 模块为什么能和原生 Redis 同样高性能——同进程同内存空间运行"],
  ["Redis", "模块", "RediSearch", "RedisJSON", "Redis Stack"])

q("redis", "hard", "short_answer",
  "Redis 缓存与数据库一致性方案",
  "Redis 作为数据库前置缓存时，缓存和数据库之间的数据一致性如何保证？Cache-Aside、Write-Through、Write-Behind 三种模式的优劣是什么？先删缓存后更新 DB vs 先更新 DB 后删缓存哪个合适？",
  "缓存与数据库的一致性是分布式系统中的经典难题，尤其在并发写场景下。\n\n缓存更新模式：1）Cache-Aside（旁路缓存）——应用读：先查缓存，未命中则查 DB 然后写入缓存。应用写：先更新 DB，然后删除（或更新）缓存。最常用的模式。2）Write-Through（穿透写）——应用只和缓存交互，缓存负责写 DB。保证一致性但延迟增加（每次写都穿透到 DB）。3）Write-Behind（异步写）——应用只写缓存，缓存异步写 DB。性能最好（写缓存立即返回），但一致性最弱（缓存故障可能丢数据）。\n\n经典问题：先删缓存后更新 DB vs 先更新 DB 后删缓存：\n\n先删缓存再更新 DB（问题场景）：线程 A 删除缓存 X（成功）→ 线程 B 读缓存 X 未命中 → B 从 DB 读旧数据 → B 将旧数据写入缓存 → A 更新 DB。结果：缓存一直是旧数据（脏数据）。概率不低。\n\n先更新 DB 再删缓存（更推荐）：线程 A 更新 DB → 删除缓存。并发问题：线程 B 读缓存 X 未命中 → B 从 DB 读（读到 A 更新前的老数据）→ A 更新 DB 并删除缓存 → B 将老数据写入缓存。问题前提：B 读 DB 完成在 A 写 DB 之前（且 A 写 DB 完成后删除缓存晚于 B 读 DB 完成时）。概率比前一种低（因为更新 DB 通常比读 DB 慢）。\n\n一致性强化的方法：1）延迟双删——先删缓存 → 更新 DB → 延迟几百 ms 再删一次缓存。延迟时间 = 主从同步延迟 + 几百 ms 余量。牺牲性能（多一次缓存删除和等待）换取低概率的不一致。2）基于 binlog 的异步删除——通过 Canal（阿里巴巴的 MySQL binlog 订阅工具）监听 MySQL binlog 变更，异步清除对应的缓存。解耦业务代码与缓存逻辑，保证最终一致性。优点是业务代码不需要显式操作缓存。\n\n3）强一致性的选择：缓存与数据库的最终一致性就是现实选择。强一致性需要分布式事务（2PC/TCC/XA），代价极高，不推荐。大多数业务场景接受最终一致性（秒级内的不一致）。关键数据（余额/库存）不用缓存或使用分布式锁保证互斥。\n\n注意：更新缓存而不是删除缓存的问题是更新的写并发：两个线程同时更新同一数据，后更新的值可能被先更新的值覆盖（写后写冲突）。所以推荐更新时删除缓存（而不是更新缓存），下次读时重新装载。",
  ["先更新 DB 再删缓存为什么比先删缓存再更新 DB 问题少——写 DB 比读 DB 慢", "延迟双删和 Canal 异步同步的各自适用场景"],
  ["Redis", "缓存", "一致性", "Cache-Aside", "分布式"])

# Write properly (with safety guard)
result = json.dumps(questions, ensure_ascii=False, indent=2)
outpath = '/Users/petersun/DEV/labs/interview-app/backend/seed_data/redis.json'
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
