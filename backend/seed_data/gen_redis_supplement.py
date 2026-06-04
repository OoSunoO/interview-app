#!/usr/bin/env python3
"""Supplement redis.json from 83 to 100+ questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    # 1 — Redis 7.4/7.6 new features
    q('redis', 'medium', 'short_answer',
      'Redis 7.4/7.6 新特性详解',
      'Redis 7.4 和 7.6 版本引入了哪些主要新特性？这些版本在性能、安全性和可观测性方面有什么重要改进？',
      'Redis 7.4 和 7.6 延续了 Redis 向数据基础设施平台演进的趋势，重点加强了性能、安全和运维友好性。\n\n'
      'Redis 7.4 主要特性：\n'
      '1）加强的 ACL 功能——支持更灵活的键空间权限模式，在命令级别设置更细粒度的访问控制。\n'
      '2）性能优化——改进了内存分配策略减少内存碎片，优化主从复制增量同步效率。\n'
      '3）可观测性增强——新增更详细的延迟监控指标，支持按命令类别统计延迟分布。\n'
      '4）模块 API 扩展——为模块开发者提供更多钩子和回调接口。\n\n'
      'Redis 7.6 主要特性：\n'
      '1）集群管理增强——改进了 Cluster 节点发现和配置传播机制，减少节点变更时的集群抖动。\n'
      '2）持久化优化——优化了 AOF 重写过程中的内存使用，大实例的 AOF 重写更加高效。\n'
      '3）新命令扩展——扩展了现有数据结构的命令集，减少客户端逻辑复杂度。\n'
      '4）安全加固——增强 TLS 连接支持，改进 ACL 日志审计功能。\n\n'
      '两个版本都着重降低大规模部署的运维复杂度，体现 Redis 从缓存工具向通用数据基础设施的演进方向。',
      ['Redis 7.4 在 ACL 和可观测性方面的改进', 'Redis 7.6 对集群管理和持久化的优化'],
      ['Redis', '新特性', '版本演进', '7.6']),

    # 2 — RedisJSON module
    q('redis', 'medium', 'short_answer',
      'RedisJSON 模块与 JSON 数据类型',
      'RedisJSON 模块是什么？它如何支持 JSON 数据类型的存储和查询？与直接存储 JSON 字符串相比有什么优势？',
      'RedisJSON 模块（Redis 4.0+）为 Redis 添加原生 JSON 数据类型支持。\n\n'
      '核心功能：\n'
      '1）JSON.SET key $ json_string——存储 JSON 文档，内部使用树形结构存储每个 JSON 元素。\n'
      '2）JSON.GET key $path——使用 JSONPath 语法查询嵌套字段，例如 $.store.book[0].title。\n'
      '3）JSON.ARRAPPEND、JSON.NUMINCRBY——原子地操作数组和数值，无需读-改-写整个文档。\n'
      '4）JSON.DEL key path——删除指定路径的字段。\n\n'
      'JSONPath 查询：1）点表示法 $.user.name 和递归搜索 $..author 查找所有 author 字段。'
      '2）支持通配符 $.store.book[*].title 匹配数组所有元素。'
      '3）支持过滤表达式 $.store.book[?(@.price<10)] 条件筛选。\n\n'
      '性能优势：1）部分更新——只重写变更的 JSON 节点，而不是整个序列化和反序列化。'
      '2）内存效率——树形结构避免重复存储字段名（相比多个 String key）。'
      '3）类型保留——直接读取 JSON 内部的数字和布尔类型，不需要从字符串解析。\n\n'
      '对比直接存储 JSON 字符串：JSON.SET 可以修改文档的某个字段而不影响其他字段（类似 MongoDB 的 $set），'
      '而字符串方案必须读-改-写整个 JSON，在频繁部分更新场景下 RedisJSON 性能优势明显。',
      ['JSONPath 语法在 RedisJSON 中的使用方式', '部分更新相比全量替换的性能优势'],
      ['Redis', 'RedisJSON', 'JSON', '模块']),

    # 3 — RedisSearch module
    q('redis', 'hard', 'short_answer',
      'RedisSearch 索引构建与全文搜索',
      'RedisSearch 模块如何实现全文搜索和二级索引？索引结构、聚合查询和性能特点是什么？',
      'RedisSearch 为 Redis 提供二级索引、全文搜索和聚合分析能力，数据存储在 Hash 或 JSON 中自动索引。\n\n'
      '索引创建：\n'
      '1）FT.CREATE idx ON HASH PREFIX 1 doc: SCHEMA title TEXT WEIGHT 5.0 body TEXT url TAG。\n'
      '2）支持在 Hash 或 JSON 数据类型上自动索引（写入数据时自动更新索引）。\n'
      '3）字段类型——TEXT（全文索引）、TAG（精确匹配标签）、NUMERIC（范围查询）、GEO（地理位置）。\n\n'
      '索引结构：1）使用倒排索引——每个词条映射到包含该词的文档 ID 列表。'
      '2）评分算法——使用 TF-IDF 和 BM25 算法计算相关性分数。'
      '3）中文分词——需额外配置中文分词插件（如 Friso），通过 RedisModule 方式加载。\n\n'
      '查询能力：1）FT.SEARCH——支持 AND/OR/NOT 布尔查询、模糊匹配、前缀匹配和短语查询。'
      '2）FT.AGGREGATE——类似 SQL GROUP BY 的聚合管道：GROUP BY 分组、REDUCE 聚合函数（COUNT/SUM/AVG/MIN/MAX）、'
      'SORT BY 排序、APPLY 表达式计算。3）GEO 过滤——搜索结果按地理位置过滤。'
      '4）自动补全——FT.SUGADD 和 FT.SUGGET 实现搜索建议。\n\n'
      '性能特点：1）索引构建在主线程执行，大量文档批量索引可能阻塞 Redis。生产环境建议从 RDB 恢复后重建索引。'
      '2）查询延迟——索引查询时间复杂度为 O(logN+M)（N 文档总数，M 结果集大小）。'
      '3）内存开销——索引本身占用额外内存，通常为原始数据的 0.5-2 倍。',
      ['RedisSearch 的倒排索引结构与文本评分算法', 'FT.AGGREGATE 聚合管道的使用场景'],
      ['Redis', 'RediSearch', '全文搜索', '索引']),

    # 4 — RedisTimeSeries module
    q('redis', 'medium', 'short_answer',
      'RedisTimeSeries 时间序列模块详解',
      'RedisTimeSeries 模块如何设计时间序列数据的存储和查询？压缩、降采样和保留策略是怎样的？',
      'RedisTimeSeries 是 Redis 的时间序列数据类型模块，专为监控指标、IoT 传感器和金融时序数据设计。\n\n'
      '核心设计：1）TS.CREATE key——创建时间序列，可配置 RETENTION（保留时长，毫秒）、'
      'LABELS（标签键值对用于分类查询）。2）TS.ADD key timestamp value——添加数据点，支持自动生成时间戳。'
      '3）TS.MADD——批量添加多个数据点。4）内部使用压缩的 Radix Tree 和双块链表存储。\n\n'
      '查询能力：1）TS.RANGE key fromTs toTs——范围查询，返回时间戳和值对。'
      '2）TS.MRANGE——按标签匹配同时查询多个序列（如所有 metric_name=cpu 的序列）。'
      '3）TS.GET——获取最新数据点。4）TS.MGET——批量获取多个序列的最新值。\n\n'
      '降采样与聚合：1）查询时指定 bucketDuration（时间窗口），自动在窗口内聚合。'
      '例如 TS.RANGE cpu:util 0 - AGGREGATION AVG 300000 表示每 5 分钟聚合求平均。'
      '2）支持的聚合函数——AVG、MIN、MAX、SUM、COUNT、FIRST、LAST、STD.P、STD.S、RANGE。\n\n'
      '压缩与存储：1）每个数据点压缩后约占 16 字节（时间戳 8 字节 + 双精度值 8 字节）。'
      '2）RETENTION 参数控制数据保留时长，超期数据自动删除（类似 TTL 机制）。'
      '3）DUPLICATE_POLICY——处理重复时间戳的策略：BLOCK（拒绝）、FIRST、LAST、MIN、MAX、SUM。\n\n'
      '适用场景：服务器监控指标、IoT 传感器数据流、金融时序数据（股价/汇率）、应用性能追踪。',
      ['RedisTimeSeries 的降采样和聚合查询功能', '标签系统在多维时间序列查询中的作用'],
      ['Redis', 'TimeSeries', '时序', '监控']),

    # 5 — Redis with Nginx/Tengine
    q('redis', 'medium', 'short_answer',
      'Redis 与 Nginx/Tengine 缓存集成策略',
      '如何将 Redis 与 Nginx/Tengine 结合使用作为缓存层？有哪些代理缓存策略和配置模式？',
      'Nginx/Tengine 与 Redis 的结合主要用于构建高性能分布式缓存层，减少后端应用服务器压力。\n\n'
      '集成方式：\n'
      '1）HttpRedisModule——Nginx 第三方模块，直接从 Redis 读取数据返回给客户端，适用于简单 KV 场景。\n'
      '2）Redis2NginxModule——Nginx 配置中直接编写 Redis 命令，Nginx 作为 Redis 代理。\n'
      '3）OpenResty/ngx_lua——最灵活的方式，Lua 脚本控制 Redis 访问逻辑。Lua 代码嵌入 Nginx 配置。\n'
      '4）Tengine——阿里系 Nginx 分支，内置 Redis 支持模块，配置更简洁。\n\n'
      '缓存策略：1）Cache-Aside 模式——请求到达 Nginx，Lua 脚本查询 Redis key 是否存在，存在直接返回，'
      '不存在则回源到后端服务器，将响应写入 Redis 并设置 TTL。2）两级缓存——Nginx 本地共享内存 '
      '（lua_shared_dict）作为 L1 缓存（毫秒级），Redis 作为 L2 缓存。L1 未命中再查询 Redis，'
      '减少网络开销。3）分级缓存——热点数据在 Nginx 本地缓存，温数据在 Redis，冷数据在后端。\n\n'
      'Tengine 增强特性：1）支持一致性哈希负载均衡到 Redis 集群。2）内置健康检查和故障转移。'
      '3）与 Sentinel 集成自动切换主节点。\n\n'
      '实践建议：1）Nginx 和 Redis 部署在同一内网（延迟小于 1ms）。'
      '2）使用连接池减少 Redis 连接创建开销（lua_socket_pool_size）。'
      '3）合理设置各层缓存的 TTL 实现数据最终一致性。'
      '4）监控缓存命中率指导 TTL 和容量规划。',
      ['OpenResty/Lua 方式集成 Nginx 和 Redis', '两级缓存在减少 Redis 压力方面的优势'],
      ['Redis', 'Nginx', 'Tengine', '缓存']),

    # 6 — Redis ACL deep dive
    q('redis', 'hard', 'short_answer',
      'Redis ACL 深度配置与权限管理',
      'Redis 6.0 引入的 ACL 系统如何实现细粒度权限控制？用户管理、命令分类和键空间权限如何配置？',
      'Redis ACL 提供了基于用户、命令和 key 模式的三维权限控制体系。\n\n'
      '用户管理：1）ACL SETUSER username on >password——创建用户并设置密码。'
      '2）ACL SETUSER username off——禁用用户。3）ACL DELUSER username——删除用户。'
      '4）ACL LIST——查看所有用户权限。5）ACL GETUSER username——查看指定用户详细信息。\n\n'
      '命令权限控制：1）+command（允许）和 -command（禁止）单个命令。例如 +SET -FLUSHALL。'
      '2）命令类别——+@read（所有读命令）、+@write（所有写命令）、+@admin（管理命令）、'
      '+@dangerous（危险命令如 FLUSHALL/KEYS/CONFIG/DEBUG）。3）+@all 允许所有命令。'
      '4）ACL CAT——列出所有命令类别及包含的命令。\n\n'
      '键空间权限：1）~pattern——限制用户可操作的 key 模式。~cached:* 表示只能操作 cached: 前缀的 key。'
      '2）~* 表示所有 key。3）支持多个模式 ~cached:* ~session:*。'
      '4）Redis 7.0+ 的 Selector 语法——( +GET ~app:* ) ( +SET ~cache:* ) 根据不同命令类型应用不同 key 模式。\n\n'
      '发布订阅通道限制：1）&pattern——限制可订阅的 Pub/Sub 通道。&chat:* 限制只能订阅 chat: 频道。'
      '2）&* 允许所有通道。\n\n'
      'ACL 持久化：1）aclfile /path/to/users.acl——在 redis.conf 中指定 ACL 文件路径。'
      '2）ACL SAVE——将当前配置保存到 ACL 文件。3）ACL LOAD——重新加载 ACL 文件。\n\n'
      '最佳实践：1）删除 default 用户或为其设置强密码。2）每个应用使用独立用户。'
      '3）只读应用仅授予 +@read 权限。4）定期审查 ACL LOG 发现异常访问。5）使用 ACL 文件集中管理。',
      ['ACL 的三维权限模型——用户、命令和 Key 模式', 'ACL 持久化方式和 Selector 高级语法'],
      ['Redis', 'ACL', '权限', '用户管理']),

    # 7 — Redis on Flash
    q('redis', 'medium', 'short_answer',
      'Redis on Flash 分层存储技术',
      'Redis on Flash 是什么？它如何利用持久内存和 SSD 实现成本优化？适用场景和性能特征是什么？',
      'Redis on Flash（RoF）是 Redis Enterprise 提供的分层存储技术，热数据在 DRAM 中，冷数据在 Flash/SSD 中。\n\n'
      '架构原理：\n'
      '1）DRAM 作为缓存层存储热数据，Flash（SSD/NVMe）作为主存储层存储全量数据。\n'
      '2）自动数据迁移——频繁访问的数据自动提升到 DRAM，长期不访问的数据下沉到 Flash。\n'
      '3）对客户端透明——所有数据结构（包括复杂类型 Hash/ZSet/List）都支持 Flash 存储。\n'
      '4）LRU 和 LFU 策略决定数据的冷热层级。\n\n'
      '性能特征：1）读性能——DRAM 命中延迟小于 1ms，Flash 读取延迟 100-500us（NVMe SSD）'
      '到 1-2ms（SATA SSD）。2）写性能——写入先进入 DRAM 缓冲区，按策略刷入 Flash。'
      '吞吐量约为全内存 Redis 的 60-80%。3）容量成本——Flash 每 GB 成本约为 DRAM 的 1/5 到 1/10，'
      '预算不变下可支持 5-10 倍数据量。\n\n'
      '适用场景：1）访问冷热分布明显——大量不活跃用户会话占用空间但很少访问。'
      '2）成本敏感的大容量缓存——需要缓存海量数据但预算有限。'
      '3）合规审计——需要在线查询历史数据但访问频率低。\n\n'
      '局限性：1）需要 Redis Enterprise 商业许可证。2）复杂数据结构的 Flash 访问延迟比 String 高。'
      '3）Flash 写入寿命限制——NVMe 通常 1-3 DWPD（每日全盘写入次数），需监控。'
      '4）某些 Cluster 高级功能在 RoF 中不支持。',
      ['Redis on Flash 的冷热数据自动分层机制', 'Flash 存储相比纯内存的成本和性能权衡'],
      ['Redis', 'Flash', 'SSD', '分层存储']),

    # 8 — Redis Cluster scaling
    q('redis', 'hard', 'short_answer',
      'Redis Cluster 弹性扩缩容实践',
      'Redis Cluster 如何进行弹性扩缩容？添加和移除节点的具体步骤、数据迁移流程和注意事项是什么？',
      'Redis Cluster 的扩缩容涉及数据重分片、连接迁移和集群拓扑更新三个关键环节。\n\n'
      '扩容流程：\n'
      '1）启动新节点并加入集群——CLUSTER MEET new_node_ip new_node_port。新节点加入后初始不持有任何 slot。\n'
      '2）计算迁移计划——redis-cli --cluster reshard src_host:src_port，工具自动计算每个节点应获得的 slot 数量。\n'
      '3）迁移 slot——逐个迁移 slot 中的 key：源节点 CLUSTER SETSLOT slot MIGRATING dest_id，'
      '目标节点 CLUSTER SETSLOT slot IMPORTING src_id，然后 MIGRATE 逐个搬运 key。\n'
      '4）确认迁移——CLUSTER SETSLOT slot NODE dest_id，集群通过 Gossip 广播拓扑变更。\n\n'
      '缩容流程：1）将被移除节点的 slot 迁移到其他节点（通过 reshard 完成）。'
      '2）CLUSTER FORGET node_id——从集群中删除节点。所有其他节点需执行此命令。'
      '3）注意 60 秒超时——如果超时后被遗忘的节点可能通过 Gossip 重新加入。'
      '4）从节点处理——先让其他从节点接管复制，或直接移除。\n\n'
      '迁移影响：1）迁移中 key 的读写——源节点返回 ASK 重定向，客户端 SDK 需实现 ASK 重定向逻辑。'
      '2）MIGRATE 命令同步阻塞——大 key 迁移期间阻塞源节点。建议拆分大 key。'
      '3）网络开销——迁移占用带宽，监控节点间网络流量。\n\n'
      '最佳实践：1）避免业务高峰期操作。2）先添加从节点作为冗余保障。'
      '3）cluster-migration-barrier 控制最小从节点数量。4）分批次迁移，控制迁移速度。'
      '5）迁移前检查大 key 和热点 key 分布。',
      ['Redis Cluster 扩缩容中的 ASK 重定向机制', 'Slot 迁移过程中对业务读写的影响'],
      ['Redis', 'Cluster', '扩缩容', 'Slot迁移']),

    # 9 — Redis proxy comparison
    q('redis', 'medium', 'short_answer',
      'Redis 代理方案对比分析',
      'Twemproxy、Envoy Redis Filter、Redis Enterprise Proxy 等代理方案各有什么特点？如何根据场景选择？',
      'Redis 代理层解决客户端连接管理、数据路由、故障转移和负载均衡问题。主要方案对比如下：\n\n'
      'Twemproxy（nutcracker）：1）C 语言实现，轻量高性能。2）分片方式——一致性哈希（ketama）或取模（modula）。'
      '3）优点——低延迟（无额外数据解析），自动重连失败节点。'
      '4）缺点——不支持 Redis Cluster 协议（静态分片）和无缝故障转移，'
      '不支持 SCAN/KEYS 等遍历命令。\n\n'
      'Envoy Redis Filter：1）Envoy 作为 Sidecar 或边缘代理拦截 Redis 请求。'
      '2）支持基于 key 前缀的静态路由，不同前缀路由到不同 Redis 后端。'
      '3）利用 Envoy 健康检查机制自动剔除故障节点。'
      '4）与 Envoy 网格生态集成，统一网络管理和可观测性。'
      '5）配置较复杂，功能覆盖不如专用 Redis 代理。\n\n'
      'Redis Enterprise Proxy：1）内置在 Redis Enterprise 中，对客户端完全透明。'
      '2）支持所有 Redis Cluster 命令（包括 MULTI/EXEC 和 Lua 脚本）。'
      '3）自动处理故障转移和节点变更，客户端无感知。4）商业产品，需企业版许可证。\n\n'
      'Redis Sentinel Proxy：1）封装 Sentinel 发现逻辑，客户端无需感知主从切换。'
      '2）支持读写分离——读请求路由到从节点。3）轻量易部署。\n\n'
      '选型建议：简单分片选 Twemproxy（运维成本低），云原生架构选 Envoy（统一流量管理），'
      '企业生产选 Redis Enterprise Proxy（全功能支持），主从切换场景选 Sentinel Proxy。',
      ['Twemproxy 的一致性哈希分片方式', 'Envoy Redis Filter 在云原生场景中的优势'],
      ['Redis', '代理', 'Twemproxy', 'Envoy']),

    # 10 — Redis Pub/Sub vs Stream deep
    q('redis', 'hard', 'short_answer',
      'Redis Pub/Sub 与 Stream 深度对比',
      'Redis Pub/Sub 和 Stream 两种消息模式在广播、可靠性、持久化和适用场景方面有什么本质区别？',
      'Pub/Sub 和 Stream 虽然都支持消息传递，但设计哲学和可靠性保障完全不同。\n\n'
      'Pub/Sub 特点：\n'
      '1）Fire-and-Forget——消息不持久化，没有订阅者在线的消息直接丢失。\n'
      '2）广播模式——一条消息发送给所有订阅者，不支持消费组内负载均衡。\n'
      '3）无状态——发布者不关心谁在消费。\n'
      '4）低延迟——无持久化开销，端到端延迟微秒级。\n'
      '5）模式订阅——PSUBSCRIBE 支持通配符匹配频道。\n'
      '6）Redis 7.0+ Sharded Pub/Sub 支持集群广播。\n\n'
      'Stream 特点：1）消息持久化——写入 RDB/AOF，重启不丢失。2）消费组——XGROUP CREATE 创建消费组，'
      '组内消费者负载均衡（类似 Kafka 分区）。3）消息确认——XACK 确认消费，XPENDING 查看未确认消息。'
      '4）消息回溯——从任意时间点消费（$ 从最新开始，ID 从指定位置开始）。'
      '5）容量管理——XTRIM 和 MAXLEN 控制消息数量上限。6）阻塞读取——XREAD BLOCK 支持长时间等待。\n\n'
      '可靠性对比：1）消息丢失——Pub/Sub 在订阅者离线、网络闪断或客户端缓冲区溢出时丢消息；'
      'Stream 消息持久化在 Redis 中，消费者通过 XACK 确认消费。2）消费确认——Pub/Sub 发送即确认，'
      'Redis 不关心客户端是否收到；Stream 客户端必须 XACK，否则消息留在 PEL（Pending Entry List）中。'
      '3）消息回溯——Pub/Sub 不能回溯只能消费当前及之后的消息；Stream 可从任意 ID 回溯消费。\n\n'
      '选型建议：Pub/Sub 适用于实时通知、在线状态广播和对偶尔丢消息不敏感的场景。'
      'Stream 适用于需要可靠消费、消息回溯和消费组负载均衡的场景（任务队列、事件驱动架构）。',
      ['Pub/Sub 的 Fire-and-Forget 模型与 Stream 的持久化模型对比', 'Stream 消费组和 PEL 如何保证消息不丢'],
      ['Redis', 'Pub/Sub', 'Stream', '消息队列']),

    # 11 — Redis keyspace notifications
    q('redis', 'medium', 'short_answer',
      'Redis Keyspace 通知机制详解',
      'Redis Keyspace Notification 的事件类型有哪些？如何配置？生产环境中的使用场景和注意事项是什么？',
      'Redis Keyspace Notification 允许客户端通过 Pub/Sub 订阅 key 空间变化事件。\n\n'
      '事件类型：1）keyspace 事件——格式 __keyspace@db__:key，消息内容为事件名称（set/del/expire）。'
      '通知哪个 key 发生了变化。2）keyevent 事件——格式 __keyevent@db__:event，消息内容为发生变化的 key。'
      '通知发生了哪种操作。\n\n'
      '配置参数（notify-keyspace-events）：\n'
      'K（keyspace 事件）、E（keyevent 事件）、g（通用命令 DEL/EXPIRE/RENAME）、'
      '$(字符串)、l（列表）、s（集合）、h（哈希）、z（有序集合）。\n'
      'x（过期事件）、e（淘汰事件 maxmemory 驱逐）、A（g$lshzxe 的别名）。\n'
      '常见配置：KEA（所有事件）或 Ex（仅 keyevent 过期事件）。\n\n'
      '使用场景：1）缓存失效——监听 __keyevent@0__:expired 驱逐过期缓存，触发重新计算。'
      '2）数据同步——监听特定前缀 key 变更事件，实时同步到搜索引擎或数据仓库。'
      '3）延迟队列——利用 key 的 TTL 加上过期通知实现延迟消息。key 过期时触发对应业务逻辑。'
      '4）Session 管理——监听 session key 过期和删除事件，清理关联资源。\n\n'
      '注意事项：1）性能影响——大量 key 频繁变更时通知消息可能堆积。'
      '配置 client-output-buffer-limit pubsub 防止订阅者过慢导致内存暴涨。'
      '2）集群模式——事件通知只在事件发生的节点上发布，客户端需要 SUBSCRIBE 到所有主节点。'
      '3）可靠性——基于 Pub/Sub 实现，订阅者不在线会丢失通知。不适用于关键业务事件追踪。',
      ['Keyspace 事件和 Keyevent 事件的区别', '过期通知在延迟队列场景中的应用'],
      ['Redis', 'Keyspace', '通知', '事件']),

    # 12 — Redis backup/restore
    q('redis', 'medium', 'short_answer',
      'Redis 备份与恢复最佳实践',
      'Redis 的 RDB 和 AOF 备份策略如何制定？灾难恢复的完整流程和最佳实践是什么？',
      'Redis 备份和恢复需要结合 RDB 快照和 AOF 日志制定完整策略。\n\n'
      'RDB 全量备份：\n'
      '1）在从节点执行 BGSAVE 生成 RDB，避免 fork 对主节点性能影响。\n'
      '2）备份频率——关键业务每小时，一般业务每天。\n'
      '3）定期上传到 S3/OSS/NAS 等对象存储。\n'
      '4）备份保留——近 7 天每小时、近 30 天每天、近 12 月每月。\n\n'
      'AOF 增量备份：1）AOF 文件记录所有写操作，可作为实时备份。'
      '2）建议在从节点启用 AOF（主节点关闭 AOF 减少 fsync 开销）。'
      '3）定期备份 AOF 文件，确保备份存储与 Redis 实例分离。\n\n'
      '恢复流程：1）确定恢复目标——恢复到指定时间点（PITR）还是最新数据。'
      '2）停止 Redis 实例确保一致性。3）将备份 RDB 文件拷贝到工作目录，文件名匹配配置。'
      '4）PITR 场景——使用 AOF 回放到目标时间点。redis-check-aof --fix 修复截断的 AOF。'
      '5）Redis 7.0+ AOF 文件放在 appendonlydir 目录。6）RDB+AOF 混合恢复——Redis 启动时优先加载 AOF（更完整），'
      'AOF 不存在则加载 RDB。\n\n'
      '验证与演练：1）使用 redis-check-rdb 验证 RDB 文件完整性。'
      '2）使用 redis-check-aof 验证 AOF 文件。3）定期做恢复演练确保备份可用。'
      '4）备份文件加密存储，异地备份到不同区域的对象存储。',
      ['RDB 和 AOF 备份各自的最佳频率', '灾难恢复中 PITR 的 AOF 回放流程'],
      ['Redis', '备份', '恢复', 'RDB']),

    # 13 — Redis performance tuning
    q('redis', 'hard', 'short_answer',
      'Redis 性能调优与内核参数配置',
      'Redis 生产环境的操作系统级调优有哪些关键参数？THP、vm.overcommit、网络参数如何配置？',
      'Redis 性能调优涉及操作系统参数、内存配置和 Redis 内部参数的全面优化。\n\n'
      '内存相关：1）vm.overcommit_memory = 1——允许内存超分，确保 BGSAVE/BGREWRITEAOF fork 子进程时'
      '不会因内存不足失败。2）vm.swappiness = 1——尽量不使用交换分区，避免 Redis 进程被内核换出。'
      '3）预留 20-30% 内存给操作系统和 fork 子进程（maxmemory 设为物理内存的 70%）。\n\n'
      'THP（Transparent Huge Pages）：1）问题——Linux 默认启用透明大页（2MB），Redis fork 时写时复制'
      '即使修改 1 字节也需要复制整个 2MB 页面，造成大量额外内存和 CPU 开销。'
      '2）禁用——echo never > /sys/kernel/mm/transparent_hugepage/enabled。'
      '3）验证——cat 该文件输出 [never] 表示已禁用。'
      '4）持久化——在 /etc/rc.local 或 systemd 服务中添加禁用命令。\n\n'
      '网络参数：1）net.core.somaxconn = 65535——增大 TCP 监听队列，防止高并发时连接被拒绝。'
      '2）net.ipv4.tcp_max_syn_backlog = 65535——增大 SYN 半连接队列。'
      '3）net.ipv4.tcp_tw_reuse = 1——启用 TIME_WAIT 快速回收，防止端口耗尽。'
      '4）net.core.rmem_max 和 wmem_max 增大 Socket 缓冲区（建议 32MB+）。\n\n'
      'CPU 与 NUMA：1）Redis 绑定固定 CPU 核心和内存节点——numactl --cpunodebind=0 --membind=0 redis-server。'
      '2）避免 Redis 进程在不同 NUMA 节点间迁移导致延迟增加。3）taskset 绑定 CPU 核心避免上下文切换。\n\n'
      '内存碎片管理：1）activedefrag yes——启用自动碎片整理。2）配置 active-defrag-threshold-lower 10'
      '（碎片率超过 10% 开始整理）。3）jemalloc 内存分配器默认比 glibc malloc 碎片更低。',
      ['THP 透明大页对 Redis fork 子进程的影响', 'vm.overcommit_memory 和 NUMA 绑定的配置'],
      ['Redis', '调优', 'THP', '内核参数']),

    # 14 — Redis client-side caching
    q('redis', 'medium', 'short_answer',
      'Redis 客户端缓存与 Tracking 机制',
      'Redis 6.0 的服务端辅助客户端缓存（Tracking）如何工作？RESP3 中的实现机制和适用场景是什么？',
      'Redis 6.0+ 的 Tracking 机制允许客户端缓存热点数据，服务端在数据变更时推送失效通知。\n\n'
      '普通模式（默认）：1）CLIENT TRACKING ON——启用后服务端记录该客户端读取的 key。'
      '2）客户端缓存 key-value 到本地内存。3）当 key 被修改或删除时，服务端通过 RESP3 Push 消息'
      '主动发送 INVALIDATION 通知。4）服务端使用 Invalidation Table 维护跟踪状态（每个 key 指向读取过它的客户端 ID）。'
      '5）服务端内存开销——跟踪数量多时可能占用大量内存。\n\n'
      '广播模式（BCAST）：1）CLIENT TRACKING ON BCAST PREFIX prefix——客户端声明关注指定前缀的所有 key。'
      '2）服务端按前缀广播失效通知，不需要逐 key 跟踪。3）减少服务端内存开销（不维护逐 key 映射表），'
      '但失效通知数量增多（任何匹配前缀的变更都会通知）。\n\n'
      'OPTIN 模式：1）客户端需要显式标记需要跟踪的 key（CLIENT CACHING YES 命令，然后发送读命令）。'
      '2）适用于客户端精确控制哪些 key 入缓存的场景。\n\n'
      'RESP3 实现：1）失效通知通过 RESP3 的 Push 类型消息发送。'
      '2）客户端通过 HELLO 3 切换到 RESP3 协议。3）老版本 RESP2 客户端需升级。\n\n'
      '多连接管理：1）CLIENT TRACKING ON REDIRECT client_id——将失效通知汇总到一个连接处理。'
      '2）应用内所有连接共享缓存失效状态。\n\n'
      '性能收益：1）热点 key 读取零网络延迟（客户端内存直接返回）。'
      '2）Redis 服务端负载降低（重复读请求被客户端缓存拦截）。'
      '3）网络带宽显著降低。',
      ['Tracking 普通模式和广播模式的内存开销对比', 'RESP3 Push 消息在缓存失效通知中的作用'],
      ['Redis', '客户端缓存', 'Tracking', 'RESP3']),

    # 15 — Redis Functions
    q('redis', 'medium', 'short_answer',
      'Redis Functions 详解与 Lua 脚本对比',
      'Redis 7.0 引入的 Functions 与 Lua 脚本（EVAL）有什么区别？在可管理性和部署方面有什么优势？',
      'Redis Functions 是 Lua 脚本的进化版本，解决了 EVAL/EVALSHA 在生产环境中的管理难题。\n\n'
      '核心概念：1）Function 库——一组相关 Lua 函数的集合，通过 FUNCTION LOAD 注册到 Redis。'
      '每个 Library 有独立命名空间。2）FCALL——按函数名调用（不需要计算 SHA 散列）。'
      '3）持久化——Functions 保存在 RDB 和 AOF 中，重启自动恢复，不需要重新注册。'
      '4）自动同步——主节点注册的 Functions 自动复制到从节点和副本。\n\n'
      '与 EVAL 对比：1）EVAL 的问题——脚本内容不持久化重启丢失；不支持版本管理；'
      '重复注册浪费带宽；脚本内容不在 Redis 中集中管理。'
      '2）Functions 的优势——集中注册和查看（FUNCTION LIST）；支持版本号和描述；'
      '自动持久化和复制；引擎向后兼容。3）运行时性能一致——两者都基于 Lua 5.1 引擎。\n\n'
      '使用方式：1）注册——FUNCTION LOAD "#!lua name=mylib\nredis.register_function(\"myfunc\", '
      'function(keys, args) return redis.call(\"GET\", keys[1]) end)"。'
      '2）调用——FCALL myfunc 1 mykey。3）列出——FUNCTION LIST。4）删除——FUNCTION DELETE libname。\n\n'
      '迁移建议：1）将 EVAL 脚本封装为 FUNCTION LOAD 的独立函数。'
      '2）客户端从 EVALSHA shahash 改为 FCALL functionName。'
      '3）利用 FUNCTION LIST 统一管理所有脚本版本。'
      '4）在 CI/CD 流程中将 FUNCTION LOAD 作为部署步骤之一。\n\n'
      '引擎拓展：Redis 7.4+ 开始探索 JavaScript 引擎支持，未来 Functions 可能支持多语言。',
      ['Functions 相比 EVAL 在持久化和可管理性上的改进', '从 EVAL/EVALSHA 迁移到 FCALL 的步骤'],
      ['Redis', 'Functions', 'Lua', '脚本']),

    # 16 — Redis data sharding strategies
    q('redis', 'medium', 'short_answer',
      'Redis 数据分片策略对比',
      'Redis 有哪些数据分片策略？Hash Tag、一致性哈希、预分片的原理和适用场景分别是什么？',
      'Redis 数据分片通过将数据分布到多个节点突破单机内存限制，不同策略各有适用场景。\n\n'
      'Hash Tag 机制：\n'
      '1）原理——Redis Cluster 使用 CRC16(key) % 16384 计算 slot。key 中包含 {} 时只计算花括号内的字符串。'
      '例如 user:{123}:profile 和 user:{123}:orders 的 slot 相同。\n'
      '2）作用——保证关联 key 分布在同一节点，支持事务（MULTI/EXEC）和 Lua 脚本操作关联数据。\n'
      '3）风险——过度使用 Hash Tag 会导致数据倾斜。避免将大量 key 映射到少数 slot。\n\n'
      '一致性哈希：1）原理——哈希值空间组织成环（0-2^32-1），节点映射到环上，'
      'key 顺时针找到最近的节点。2）优点——添加或删除节点只影响相邻节点的数据，'
      '重新映射比例约为 N/(N+1)。3）在 Redis 中的应用——Twemproxy 使用 ketama 一致性哈希。'
      'Redis Cluster 不使用一致性哈希而采用固定 Slot 映射。\n\n'
      '预分片（Presharding）：1）原理——数据量小时就分配大量虚拟分片（如 1024 个），'
      '每个分片映射到少量物理节点。数据增长时物理节点增加，分片重新分配。'
      '2）优势——避免后期大规模数据迁移。分片数固定，扩容只需迁移部分分片。'
      '3）Redis 实现——Cluster 的 16384 个 slot 本身就是预分片。3 节点时所有 16384 slot 已预先分配。\n\n'
      '总结：Hash Tag 解决关联数据路由；一致性哈希最小化扩缩容时的数据迁移量；'
      '预分片用固定分片数避免大规模重新分布。生产环境中常组合使用，根据一致性、可用性和运维成本权衡。',
      ['Hash Tag 的 {} 语法和可能的数据倾斜风险', '一致性哈希和固定 Slot 映射的区别'],
      ['Redis', '分片', 'Hash Tag', '一致性哈希']),

    # 17 — Redis persistence tuning
    q('redis', 'hard', 'short_answer',
      'Redis 持久化调优与工作负载适配',
      '不同工作负载下如何选择 RDB、AOF 或混合持久化？持久化策略对性能和数据安全的影响是什么？',
      'Redis 持久化需要在性能和数据安全之间权衡，不同工作负载适合不同策略。\n\n'
      'RDB 调优：\n'
      '1）触发频率——save 900 1（15 分钟至少 1 次写）、save 300 10、save 60 10000。'
      '频率过高导致频繁 fork 增加内存和延迟，频率过低增加数据丢失风险。\n'
      '2）fork 优化——大实例（>10GB）fork 耗时数秒。设 vm.overcommit_memory=1 预分配内存，'
      '禁用 THP 减少 COW 额外拷贝。\n'
      '3）rdbcompression yes——LZF 压缩节省磁盘但消耗 CPU。\n\n'
      'AOF 调优：1）fsync 策略——always（最安全但 <200 ops/s）、everysec（推荐，最多丢 1 秒）、'
      'no（系统控制，丢失量不可预测）。2）重写配置——auto-aof-rewrite-percentage 100（超过上次 100% 触发）'
      '和 auto-aof-rewrite-min-size 64mb。大写入量场景下调百分比增加重写频率。'
      '3）监控 AOF 文件大小防止磁盘写满。手动 bgrewriteaof 压缩。\n\n'
      '混合持久化（Redis 4.0+）：1）aof-use-rdb-preamble yes——AOF 文件头部包含 RDB 快照，'
      '尾部追加增量 AOF。2）重启加载速度接近纯 RDB（直接加载头部 RDB），数据安全性接近 AOF。'
      '3）磁盘占用介于纯 RDB 和纯 AOF 之间。\n\n'
      '工作负载建议：1）纯缓存场景——关闭持久化，仅靠主从复制保障高可用。'
      '2）数据重要但可接受秒级丢失——AOF everysec + RDB 定期快照。'
      '3）最高数据安全——AOF always + RDB + 主从复制。'
      '4）大实例快速重启——混合持久化 + AOF everysec。',
      ['不同 fsync 策略的吞吐量和数据丢失风险', 'RDB+AOF 混合持久化的重启加载速度优势'],
      ['Redis', '持久化', 'RDB', 'AOF']),

    # 18 — Redis security best practices
    q('redis', 'medium', 'short_answer',
      'Redis 安全最佳实践',
      'Redis 生产环境的安全加固措施有哪些？chroot 隔离、网络层安全、rename-command 如何配置？',
      'Redis 安全需要从网络、认证、命令和系统层四个维度全面加固。\n\n'
      '网络层：1）绑定内网——bind 127.0.0.1 192.168.x.x，不暴露到公网。'
      '2）防火墙——iptables 限制只有应用服务器能访问 Redis 端口。'
      '3）TLS 加密——Redis 6.0+ 支持 tls-port、tls-cert-file、tls-key-file 配置。'
      'tls-auth-clients yes 启用双向 TLS 认证。4）VPN/专线——跨网络部署使用加密通道。\n\n'
      '身份认证：1）requirepass——设置强密码，建议 32 位以上随机字符串。'
      '2）masterauth——主从复制时从节点连接主节点的密码，必须与 requirepass 一致。'
      '3）ACL 用户——为不同应用创建独立用户，限制命令和 key 访问范围。\n\n'
      '命令安全：1）rename-command——将危险命令重命名或禁用：'
      'rename-command FLUSHALL ""、rename-command CONFIG ""、rename-command KEYS ""、'
      'rename-command SHUTDOWN ""、rename-command DEBUG ""。'
      '2）ACL 命令阻止——-@dangerous 阻止所有危险命令。\n\n'
      '系统层隔离：1）chroot/容器化——使用 Docker 或 systemd ProtectSystem 限制文件系统访问。'
      '2）最小权限用户——创建专有 redis 用户运行 Redis，仅拥有数据目录权限。'
      '3）AppArmor/SELinux——配置强制访问控制策略。Ubuntu 用 aa-status，CentOS 用 getenforce。'
      '4）数据加密——RDB 和 AOF 文件在磁盘上加密存储。\n\n'
      '监控与审计：1）定期审查 ACL LOG 发现异常访问。2）使用 slowlog 监控慢命令。'
      '3）监控安全相关事件（认证失败、配置变更）。4）确保 Redis 版本及时更新安全补丁。',
      ['rename-command 禁用危险命令的配置方法', 'chroot 隔离和 TLS 加密的配置要点'],
      ['Redis', '安全', 'chroot', 'TLS']),

    # 19 — Redis and Spring Cache
    q('redis', 'medium', 'short_answer',
      'Redis 与 Spring Cache 集成实践',
      'Spring Boot 中如何使用 @Cacheable 集成 Redis？序列化配置、TTL 设置和缓存管理的最佳实践是什么？',
      'Spring Boot 通过 Spring Cache 抽象与 Redis 集成，提供声明式缓存管理。\n\n'
      '基础配置：1）添加依赖——spring-boot-starter-data-redis 和 spring-boot-starter-cache。'
      '2）启用缓存——@EnableCaching 标注在配置类上。3）Redis 连接——spring.redis.host、port、password。'
      '4）连接池——spring.redis.lettuce.pool.max-active（Lettuce 客户端默认连接池）。\n\n'
      '@Cacheable 注解：1）@Cacheable(value = "users", key = "#id")——缓存方法返回值。'
      '2）condition——@Cacheable(condition = "#id > 1000") 满足条件才缓存。'
      '3）unless——@Cacheable(unless = "#result == null") 结果为空不缓存。'
      '4）sync = true——本地锁防止缓存击穿，一个请求回源查询其他请求等待。\n\n'
      '其他注解：1）@CacheEvict(cacheNames = "users", key = "#id")——删除指定缓存。'
      '2）@CacheEvict(allEntries = true)——清除缓存所有条目。'
      '3）@CachePut——每次都执行方法并更新缓存。4）@Caching——组合多个缓存注解。\n\n'
      '序列化配置：1）默认 JDK 序列化——对象需实现 Serializable，但可读性差、体积大。'
      '2）Jackson JSON——配置 GenericJackson2JsonRedisSerializer，存储可读 JSON 文本。'
      '3）Key 序列化——推荐 StringRedisSerializer 避免乱码。'
      '4）Value 序列化——推荐 Jackson2JsonRedisSerializer 配合 ObjectMapper 处理日期和类型信息。\n\n'
      'TTL 配置：1）全局配置——spring.cache.redis.time-to-live=600000（10 分钟）。'
      '2）按缓存名——自定义 RedisCacheConfiguration 逐个设置。'
      '3）动态 TTL——实现 RedisCacheManagerBuilderCustomizer 根据不同 cacheName 返回不同配置。\n\n'
      '最佳实践：1）不同业务缓存使用不同 cacheNames。2）合理设置 TTL 避免数据不一致。'
      '3）使用 sync=true 防止缓存击穿。4）监控缓存命中率指导容量规划。',
      ['@Cacheable 注解的 condition 和 unless 属性用法', 'Spring Cache 中 Jackson JSON 序列化的配置方式'],
      ['Redis', 'Spring', 'Cache', '@Cacheable']),
]

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(DATA_DIR, 'redis.json')
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
print(f'Total redis questions: {len(data)}')
