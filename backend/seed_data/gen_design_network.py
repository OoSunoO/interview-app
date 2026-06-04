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

# ==================== CDN & Content Delivery ====================

q("design_network", "medium", "short_answer",
  "CDN 整体架构设计",
  "请描述 CDN 的整体架构。CDN 由哪些核心组件构成？用户请求如何被路由到最优节点？CDN 缓存未命中时如何处理？",
  "CDN（Content Delivery Network）由边缘节点（Edge Node）、全局负载均衡器（GSLB）、源站、缓存系统和管理平台组成。用户请求经过 DNS 解析或 HTTPDNS 调度到最近边缘节点，节点缓存命中则直接返回，未命中则回源拉取内容并缓存。\n\n核心组件：\n1）边缘节点（Edge Node / PoP）——部署在各地机房的缓存服务器集群，缓存静态内容（HTML/CSS/JS/图片/视频），部分 CDN 也支持动态加速（DCDN）和边缘计算（Edge Computing）。一个 PoP 通常包含多台缓存服务器（Nginx/Traefik）+ 本地负载均衡器。2）全局负载均衡器（GSLB）——基于 DNS 或 Anycast 将用户请求调度到最优 PoP。调度策略：地理位置最近（IP 地理数据库）、网络延迟最低（实时探测）、负载最低。3）缓存系统（Cache System）——每台缓存服务器使用本地磁盘或内存缓存热点内容，常见的缓存软件包括 Nginx、Apache Traffic Server、Squid、Varnish。4）回源策略——边缘节点未命中时，向上一级缓存（中层/区域缓存）或直接向源站请求内容。多层缓存架构：边缘 → 区域/中层 → 源站，减少源站压力。\n\nCDN 缓存未命中的处理：1）Cache Miss 时边缘节点向源站或上级节点请求内容。2）Edge 回源后，将内容缓存到本地（根据 Cache-Control 和 CDN 配置决定 TTL）。3）回源时需要处理并发读爆（Thundering Herd）：多个同时未命中请求回源压垮源站，用锁机制或回源合并（Request Coalescing）解决。\n\n扩展延伸：CDN 动态加速（DCDN）——通过智能路由（实时探测最优路径）、TCP 优化（优化拥塞控制和初始窗口）、连接复用等技术加速动态 API 请求。CDN 边缘计算——在 CDN 边缘节点运行自定义代码（Cloudflare Workers/阿里云 EdgeScript），处理请求/响应修改、A/B 测试、个性化。CDN 安全——DDoS 防护（边缘过滤大流量攻击）、WAF（Web 应用防火墙）、Bot 管理。",
  ["CDN 的 GSLB 调度为什么不只用 DNS（DNS 的 TTL 问题）", "CDN 多级缓存如何设计——边缘→区域→源站的权衡"],
  ["CDN", "架构", "负载均衡", "缓存"])

q("design_network", "medium", "short_answer",
  "Anycast 路由原理与设计",
  "Anycast 路由是什么？如何用 Anycast 实现 CDN 和 DNS 的全局负载均衡？Anycast 的优缺点是什么？在实际部署中会遇到什么问题？",
  "Anycast 是一种网络寻路和路由策略：多个地理位置不同的节点共享同一个 IP 地址，互联网上的数据包通过 BGP 路由协议自动到达「最近」或「最优」的节点。\n\n工作原理：1）多个节点在同一 IP 前缀上运行 BGP，向互联网宣告相同 IP 段的路由。2）BGP 根据 AS Path 长度选择最短路径，将用户引流到最近的节点。3）不同 ISP/地区的用户可能到达不同的节点（取决于各自网络拓扑）。\n\n应用场景：1）CDN Anycast——多个 PoP 共享同一个 VIP（虚拟 IP），用户自动到达最近 PoP，屏蔽单个 PoP 故障（BGP 自动撤销故障节点的路由宣告）。2）DNS Anycast——根 DNS 服务器和顶级域 DNS 广泛使用 Anycast（13 个根逻辑服务器，每个实际有多个物理节点）。3）DDoS 防护——Anycast 网络分散流量（攻击流量被分散到多个节点，每节点处理量有限时可以启用流量清洗）。\n\nAnycast 的问题：1）BGP 路由不感知负载——AS Path 最短不代表节点带宽充足。一个节点过载但路由仍最优，流量继续涌入。解决方案：当节点负载过高时主动撤销路由宣告或将 IP 前缀断成更短前缀（吸引更少流量）。2）连接保持——TCP 连接建立后，如果 BGP 路由漂移（网络拓扑变化导致后续流量到不同节点），TCP 连接中断（HTTP 短连接问题不大，WebSocket/gRPC 长连接更敏感）。3）Anycast 不适合有状态服务（长连接/会话保持），适合无状态的请求-响应场景。\n\n扩展延伸：Anycast vs DNS 调度——Anycast 在网络层解决路由，DNS 在应用层调度。DNS 调度粒度更细（可根据用户 IP 的地理位置和运营商做精细调度），Anycast 更粗粒度（基于 BGP 路径）。最佳实践是两者结合：DNS 做粗粒度调度（分地区/运营商），每个地区的 VIP 使用 Anycast 提供高可用。",
  ["Anycast 下 TCP 连接被路由到不同节点为什么导致了中断", "Anycast 节点过载时如何优雅地减少流量——BGP 撤销宣告"],
  ["Anycast", "BGP", "CDN", "DNS", "负载均衡"])

q("design_network", "hard", "short_answer",
  "多级缓存与回源策略设计",
  "设计一套多级缓存系统（浏览器→边缘 CDN→中层 CDN→源站），各级 TTL 应如何设置？如何处理缓存击穿、缓存雪崩、缓存穿透？回源合并（Request Coalescing）如何实现？",
  "多级缓存每一级的 TTL 设置原则：1）浏览器缓存 Cache-Control 设置短期 TTL（5-15 分钟），不缓存动态内容。2）CDN 边缘节点 TTL 较长（1-24 小时），通过配置预热（Preheat）在大促前刷新。3）CDN 中层/区域缓存 TTL 较长（24 小时+），作为边缘的可靠后备。总原则：越靠近用户 TTL 越短，越靠近源站 TTL 越长。\n\n三种异常处理：1）缓存击穿（热 key 失效）——高并发的 key 过期瞬间，大量请求同时穿透到源站。解决：分布式锁（第一个请求回源后，其他等待并读取缓存）、互斥锁（Mutex，同一 key 只有一个线程回源）、永不过期 + 后台异步更新（值永不过期，定时线程更新缓存值）。2）缓存雪崩（大量 key 同时过期）——大范围缓存同时失效（如 CDN 预热过期），流量直达源站。解决：TTL 加随机偏移（避免大批 key 同时到期）、缓存预热（大促前主动预热热点 key）、服务降级（源站自动降级返回旧缓存数据或默认值）。3）缓存穿透（查不存在的 key）——请求的 key 在缓存和数据库中都不存在，每次请求都穿透。解决：布隆过滤器（如果 key 不存在于 Bloom 过滤器，直接返回空）、缓存空值（对不存在的 key 也缓存一个特殊值短时间，防止重复穿透）。\n\n回源合并（Request Coalescing / Cache Merging）：多个客户端同时请求同一个未缓存的内容，只有第一个请求回源，其余等待第一个请求的结果。实现方式：1）Nginx 的 proxy_cache_lock——首个回源请求进行 cache_fill，其他并发请求等待。2）边缘计算实现（在 CDN edge 上用共享锁）。3）DB 层的 Query Coalescing（同一个 SQL 请求合并执行）。关键是：回源过程中设置一个 in-flight 标记，后续请求挂在该标记上等待，填充完成后一次性唤醒等待队列。",
  ["缓存击穿、穿透、雪崩的区别和应对策略是什么", "TTL 随机偏移如何实现——加一个 [-30%, +30%] 的随机偏移避免雪崩"],
  ["缓存", "CDN", "多级缓存", "缓存击穿", "雪崩"])

# ==================== DNS Architecture ====================

q("design_network", "medium", "short_answer",
  "DNS 架构设计：权威、递归、转发",
  "一个高可用 DNS 系统应如何设计？权威 DNS 和递归 DNS 的架构区别是什么？如何用 Anycast 保证 DNS 的高可用？DNS 查询路径中有哪些故障点？",
  "高可用 DNS 架构分三个层次：1）权威 DNS——持有域名到 IP 的映射记录，对外提供查询服务。架构上必须多节点 + Anycast（如 Amazon Route 53 在多个 AWS Region 部署 Anycast DNS 集群）。主从架构（Hidden Master + Multiple Secondaries + Anycast）：Hidden Master 不对外提供 DNS 查询（仅用于管理），Slave 从 Master 同步 Zone 数据后通过 Anycast 对外服务。Zone Transfer 使用 TSIG 签名验证（防止未经授权的 Zone 传输）。\n\n2）递归 DNS（Recursive Resolver）——替客户端完成完整 DNS 解析过程（缓存上游结果）。公共递归 DNS：Google 8.8.8.8、Cloudflare 1.1.1.1。内部递归 DNS：企业 LDNS（本地 DNS 解析器）通常部署在数据中心内，通过 ACL 限制外部访问。架构上：多个 Pod 构成集群，前置 TCP Anycast 或 L4 负载均衡，使用 Redis/Memcached 共享 DNS 缓存。\n\n3）转发 DNS（DNS Forwarder）——将查询请求转发给上游 DNS（如公司内网 DNS 转发到企业权威 DNS）。支持条件转发（Conditional Forwarder）：根据域名转发到不同的上游 DNS（内网域名 → 内部 DNS，公网域名 → 公共 DNS）。DNS 查询路径故障点：客户端 DNS 缓存失效 → 本地 DNS 服务器宕机 → 上游链路中断 → 权威 DNS 不可用 → 根/TLD 服务器故障（罕见）。缓解：多 DNS 服务器配置（/etc/resolv.conf 配多个 nameserver）、客户端 DNS 缓存、CDN 内置备用 DNS、使用 HTTPDNS（绕过操作系统默认 DNS）。\n\n扩展延伸：Anycast DNS 部署注意——BGP 收敛时间在秒级（BGP 故障切换不是即时的，30-60s）。Anycast 跨洲部署时，BGP 路由不稳定（抖动）会导致解析延迟波动。使用 BGP Monitoring（如 RIPE RIS）实时监控路由健康。",
  ["为什么权威 DNS 需要 Anycast 而不是简单多节点", "DNS 查询路径中有哪些故障点——怎么应对"],
  ["DNS", "权威 DNS", "递归 DNS", "Anycast", "高可用"])

q("design_network", "medium", "short_answer",
  "HTTPDNS 架构设计",
  "什么是 HTTPDNS？为什么客户端 App 需要用 HTTPDNS 替代传统 UDP DNS？HTTPDNS 的架构如何设计？如何保证 HTTPDNS 的高可用和低延迟？",
  "HTTPDNS 使用 HTTP 协议替代传统的 UDP DNS 协议进行域名解析。核心思路：客户端直接向 HTTPDNS 服务端发送 HTTP 请求获取 IP 地址，而不是通过系统默认的 UDP DNS 查询路径。\n\n为什么需要 HTTPDNS：1）DNS 劫持——部分 ISP 通过中间设备篡改 DNS 响应（插入广告或重定向到非目标网站），UDP DNS 是明文易被篡改。2）DNS 污染——关键词过滤（GFW 对特定域名的 DNS 返回虚假 IP）。3）调度不精准——ISP 的 LDNS 可能地理位置远，导致 CDN 调度到非最优节点。4）解析延迟——UDP DNS 查询链路过长（递归查询需要多跳），HTTPDNS 直连响应更快。\n\nHTTPDNS 架构设计：1）客户端 SDK——嵌入 HTTPDNS 客户端 SDK（如阿里云 HTTPDNS / 腾讯云 HTTPDNS），App 启动时发起 HTTP DNS 解析请求。异步接口：不阻塞主线程（解析在后台线程完成，结果写入本地缓存）。2）HTTPDNS 服务端——前置 LVS/Nginx 做 4 层负载均衡，后接多地域部署的解析服务集群。解析服务返回：最优 VIP（根据客户端出口 IP 判断地理位置）+ 备用 IP 列表 + TTL。3）缓存层——客户端本地内存缓存 + Redis 集中缓存（App 重启后优先读取持久化缓存）。缓存命中时不做 HTTP 解析（减少请求量和延迟）。4）容灾策略——HTTPDNS 服务不可用时降级为系统默认 DNS（UDP 53），SDK 中内置健康检查探测 HTTPDNS 可用性。\n\n与 CDN 结合：HTTPDNS 服务端集成 CDN 调度逻辑，直接为客户端返回最近 CDN 节点的 VIP。比 DNS + GSLB 更精准——HTTPDNS 直接拿到客户端真实 IP（而非 LDNS 的 IP），调度更准确（绕过 LDNS 的地域失真）。\n\n安全：HTTPDNS 基于 HTTPS 传输（防止劫持），可附加签名验证（SDK 与 Server 共享密钥对响应签名）。",
  ["HTTPDNS 如何解决 DNS 劫持和调度不精准问题", "HTTPDNS 服务挂了怎么办——降级策略"],
  ["HTTPDNS", "DNS", "App", "安全", "调度"])

# ==================== Load Balancer ====================

q("design_network", "medium", "short_answer",
  "L4 vs L7 负载均衡器设计",
  "L4（四层）和 L7（七层）负载均衡器的核心区别是什么？各自适用什么场景？现代负载均衡器（如 Envoy / Nginx / HAProxy）在架构设计上有什么演进趋势？",
  "L4（四层/传输层）负载均衡基于 IP + Port 转发 TCP/UDP 流量，不解析应用层协议。L7（七层/应用层）负载均衡理解 HTTP/gRPC 等应用协议，可做基于 URL/Header/Cookie 的精细化路由。\n\nL4 负载均衡：1）工作模式——基于 Linux 内核的 IPVS（LVS）或 DPDK 技术，直接转发 IP 包（NAT 模式）/修改 MAC 地址（DR 模式）/封装 IP 包（TUN 模式）。2）性能——纯内核态或用户态 DPDK 转发，单机可达千万级并发（C10M）。不解析 HTTP 内容，CPU 开销极小。3）功能——按连接分发（五元组哈希），不感知 URL/Header/Cookie。4）典型代表——LVS、F5 BigIP（L4 模式）、AWS NLB。5）适用场景——TCP/UDP 协议入口（数据库、消息队列）、高性能场景（纯流量分发）。\n\nL7 负载均衡：1）工作模式——运行在用户态，解析 HTTP/HTTPS/gRPC 协议，TLS 终止（SSL Offload）。2）性能——需要解析请求体，CPU 和内存开销大，单机 C10K 多但 C10M 困难。3）功能——基于 URL Path（/api/v1/* → 服务 A）、Header（User-Agent 路由）、Cookie（会话保持）、速率限制、请求改写、WAF 功能。4）典型代表——Nginx、HAProxy、Envoy、Traefik、AWS ALB。5）适用场景——HTTP API 网关（微服务 + 容器化）、HTTPS 卸载、内容路由。\n\n演进趋势：1）L4+L7 融合——单代理同时处理 L4 和 L7（如 Nginx 既有 stream 模块又有 http 模块，Envoy 原生支持 TCP/UDP/HTTP）。2）Sidecar Proxy——L7 代理以 Sidecar 形式部署在 Pod 中（Istio Envoy），接管 Pod 的进出流量，实现微服务网格。3）DPDK/EBPF 加速——通过 DPDK 绕过内核协议栈提升 L4 性能（如 Facebook Katran、Cilium），eBPF/XDP 在 L4 负载均衡场景取代 LVS。4）控制面和数据面分离——数据面只做转发（Envoy），控制面负责配置下发（Istiod / K8s Controller）。",
  ["L4 和 L7 负载均衡各有什么性能特征和适用场景", "Sidecar Proxy 模式为什么在 Service Mesh 中这么重要"],
  ["负载均衡", "L4", "L7", "Envoy", "Nginx"])

q("design_network", "medium", "short_answer",
  "负载均衡算法深度对比",
  "常见的负载均衡算法有哪些？各有什么优缺点？最少连接数（Least Connections）、加权轮询（Weighted Round Robin）、一致性哈希（Consistent Hashing）分别在什么场景下最优？",
  "负载均衡算法的选型核心：请求分布均匀性 + 后端服务器差异适配 + 连接/会话保持需求。\n\n1）轮询（Round Robin）——请求依次分发到每个后端。优点：实现简单，均衡性好（后端能力相同时）。缺点：不感知后端负载（某后端正在处理慢请求时仍会分配新请求）。适合静态内容分发（CDN 缓存服务器，性能相近）。\n\n2）加权轮询（Weighted Round Robin）——给后端分配权重（权重 × 轮询）。优点：适配异构服务器（CPU 多的权重高）。问题：权重在轮询中仍然不感知实时负载。适合微服务（实例规格不同时）。\n\n3）最少连接数（Least Connections）——将请求转发给当前活跃连接最少的后端。优点：感知实时负载（正在处理慢请求的后端连接数高）。问题：跨地域场景中连接数不反映带宽（需要结合带宽）。适合长连接场景（WebSocket、gRPC 流式调用、数据库连接池）。\n\n4）IP Hash / 一致性哈希——根据客户端 IP 或 URL Hash 固定分发到某后端。优点：天然实现会话保持（同一 IP 的请求到同一后端）、缓存亲和性（假设后端有本地缓存）。问题：后端增减时大量请求重新分配到其他后端（大量缓存失效）。解决方案：一致性哈希（Consistent Hashing）——使用哈希环分配，添加/删除节点只影响环上相邻节点的部分请求。适合带本地缓存的服务（如 Memcached 集群）。\n\n5）随机（Random）——随机选一个后端。实现简单（O(1)），大样本下分布均匀。适合资源密集型计算任务（无状态短请求）。\n\n6）最短响应时间（Least Latency / P50）——代理实时统计每个后端的平均响应时间，优先转发给响应最快的后端。优点：适配后端负载差异（响应快 = 负载低）。问题：需要有数据采集窗口（冷启动阶段不准确）。适合延迟敏感场景（API Gateway 转发给业务服务）。\n\n实际生产中的混合策略：NLB/Envoy 使用 Weighted Least Connections + 慢启动（Slow Start）——新注册的后端在短时间内逐步增加权重，避免冷启动瞬间连接数暴增。",
  ["一致性哈希如何解决传统哈希的后端增减导致的大面积 rehash 问题", "最少连接数为什么比加权轮询更适合长连接场景"],
  ["负载均衡", "算法", "一致性哈希", "轮询"])

q("design_network", "hard", "short_answer",
  "会话保持与有状态转发设计",
  "无状态负载均衡和有状态会话保持（Session Persistence / Sticky Session）的矛盾如何解决？Sticky Session 的实现方式有哪些？为什么不推荐 Sticky Session？如何设计无状态架构？",
  "会话保持（Sticky Session）：将同一客户端的请求始终转发到同一后端服务器。实现方式有：1）Cookie Insert——负载均衡器在首次响应中植入特定 Cookie（如 AWS ALB 的 AWSALB），浏览器后续请求携带该 Cookie，代理据此路由。2）Source IP Hash——基于客户端 IP 做哈希，保证同一 IP 到同一后端。3）URL Rewrite——将 session 信息写入 URL 路径。\n\n不推荐 Sticky Session 的原因：1）弹性伸缩问题——扩缩容时大量 session 丢失（新 Pod 无会话数据，旧 Pod 缩掉后会话消失）。2）滚动更新困难——后端分批更新时，客户端 session 如果绑定到正在更新的老版本 Pod，体验中断。3）负载不均——某些用户 session 时间长（购物车），某些短（API 调用），导致后端负载失衡。4）故障转移问题——后端宕机时该后端的所有 session 丢失（即使有备份也需要跨节点的 session 复制）。\n\n无状态替代方案：1）JWT/Session Token——将用户状态编码到 Token 中（JWT 含用户 ID、角色、过期时间），后端验证 Token 签名即可获取状态，不依赖本地 Session Store。Token 无状态，任何后端都能处理。注意：JWT 无法主动失效（需要黑名单机制），Payload 不能太大（HTTP Header 大小限制）。2）分布式 Session Store——使用 Redis / Memcached 统一存储 Session 数据，所有后端从同一存储读取。任何后端都能处理任何请求（不依赖 Sticky Session）。安全性：Redis Session Store 应设置密钥且与后端子网隔离。3）Client-Side State——将状态数据加密后写入客户端（浏览器 Cookie 或 LocalStorage），请求时带回来。适合小数据量场景（如购物车 ID）。\n\n负载均衡器的推荐做法：使用 L4 TCP 转发 + 无状态 Token，不启用 Sticky Session。如果必须用（遗留系统），使用一致性哈希 + Redis Session Store 做容错备份。",
  ["JWT 和 Redis Session Store 各有什么优缺点", "Sticky Session 为什么在微服务架构中不推荐"],
  ["Sticky Session", "会话保持", "JWT", "无状态", "负载均衡"])

# ==================== API Gateway ====================

q("design_network", "medium", "short_answer",
  "API Gateway 功能设计",
  "API Gateway 在微服务架构中的核心功能是什么？API Gateway 和负载均衡器（Load Balancer）有什么区别？Gateway 的常见功能包括哪些？如何避免 API Gateway 成为单点瓶颈？",
  "API Gateway 是微服务架构的统一入口，负责请求路由、协议转换、安全认证、流量控制等横切关注点。它区别于负载均衡器（LB）的主要在于：LB 工作在 L4/L7 做流量分发，Gateway 在 L7 做深度协议处理和策略编排。\n\nAPI Gateway 的核心功能：1）请求路由（Routing）——根据请求路径/方法/Header/域名路由到不同后端服务。支持灰度发布（Header 中的 version/canary 参数 → 新版服务）。2）认证授权（AuthN/AuthZ）——统一处理 JWT 校验、OAuth Token 验证、API Key 校验。解耦业务服务与安全逻辑。3）速率限制（Rate Limiting）——按用户/API/客户端限流，防止滥用。4）协议转换（Protocol Translation）——将外部 REST 请求转换为内部 gRPC 调用，或 HTTP/1.1 ↔ HTTP/2。5）请求/响应转换——请求验证（Schema Validation）、响应组装（GraphQL Gateway 的 DataLoader）、Header 注入/移除。6）熔断降级（Circuit Breaker）——后端服务故障时网关快速返回降级响应（缓存/默认值/错误提示）。7）可观测性——统一日志记录、指标采集（请求数/延迟/错误率）、分布式追踪（注入 TraceId）。\n\n避免单点瓶颈：1）水平扩展——Gateway 是无状态的，前置 L4 LB 做入口负载均衡（多个 Gateway 实例）。2）异步非阻塞——使用 Netty / Reactor 异步 IO 模型（Spring Cloud Gateway / Zuul 2 / Envoy），避免 Thread-Per-Request 模型。3）按域名分组——不同业务线的 Gateway 独立部署（隔离故障域）。4）数据面与控制面分离——Gateway 数据面只做转发，配置通过控制面下发（K8s Ingress Controller / Istio），不重启 Gateway。5）缓存——Gateway 缓存静态响应（访问策略、JWT 公钥等），减少后端压力。6）健康检查——对后端服务做主动/被动健康检查，自动剔除故障节点。\n\n常见 Gateway 选型：Nginx + Lua（OpenResty）、Kong（基于 OpenResty）、Spring Cloud Gateway（Java 体系）、Envoy（云原生）、APISIX（高性能）。",
  ["API Gateway 和 Load Balancer 的根本区别是什么", "如何保证 API Gateway 自身的高可用——水平扩展 + 无状态设计"],
  ["API Gateway", "微服务", "网关", "路由"])

q("design_network", "hard", "short_answer",
  "网关级联与多级 Gateway 架构",
  "大型微服务系统中为什么需要多级 Gateway（入口 Gateway → 业务 Gateway → BFF）？BFF（Backend for Frontend）模式解决的问题是什么？多级 Gateway 的流量路径和延迟如何控制？",
  "大型系统中单层 API Gateway 不足以应对复杂的流量治理需求，需要多级拆分。\n\n三层 Gateway 架构：1）入口 Gateway（南北向流量入口）——作用：全局统一入口，处理由外到内的所有流量。功能：TLS 终止、DDoS 防护（L4）、全局速率限制（按客户级别）、WAF 规则、CDN 回源。部署：通常与 CDN 配合部署（AWS CloudFront / Cloudflare 代理入口），前置 LB 接入多机房。2）业务 Gateway（东西向/服务间调用）——作用：微服务间的统一调用入口。功能：服务发现（可与 K8s Service 集成）、服务路由（版本路由/灰度）、熔断降级（Hystrix/Resilience4j）、重试/超时控制。部署：通常以 Sidecar（Istio Envoy）或独立部署（Spring Cloud Gateway）形式存在。3）BFF（Backend for Frontend）——作用：为不同的前端（Web/App/小程序/第三方）定制 API，处理数据聚合和格式转换。功能：按前端需求组装数据（Web 需要 A+B，App 需要 B+C）、特定设备的降级策略（弱网环境返回精简响应）。\n\nBFF 解决的问题：1）通用 API 返回的数据包含所有字段（Over-fetching），移动端浪费带宽。2）前端需要多次调 API 拼数据（Under-fetching），BFF 一次聚合。3）不同的前端对 API 的可靠性要求不同（移动端弱网容忍降级）。4）前端页面更新频率高 vs 后端 API 稳定需要——BFF 在前端和后端之间做缓冲层。\n\n多级 Gateway 的延迟控制：1）每一级 Gateway 增加约 1-5ms 延迟（转发+处理），三级总增加 10-15ms 可接受。2）非关键功能在边缘处理（WAF/DDoS 在 CDN 层处理、认证在入口 Gateway 处理），减少传递到下游的请求量。3）异步调用取代同步链——BFF 中对多个下游服务的调用使用并行 + 超时（CompletableFuture / RxJava）。4）服务网格 Sidecar（Envoy）利用共享连接池和 HTTP/2 多路复用减少连接开销。",
  ["BFF 和普通 API Gateway 的核心区别在哪", "多级 Gateway 如何累积延迟——每级加多少毫秒，如何优化"],
  ["API Gateway", "BFF", "微服务", "架构", "延迟"])

# ==================== Rate Limiting ====================

q("design_network", "hard", "short_answer",
  "分布式速率限制架构设计",
  "设计一个分布式速率限制（Rate Limiting）系统。令牌桶（Token Bucket）和滑动窗口（Sliding Window）各有什么优缺点？在分布式场景下如何保证限流的准确性和低延迟？Redis 实现限流的常见方案有哪些？",
  "分布式限流要求跨多个服务实例统计和限制请求速率，核心挑战是：原子性 + 低延迟 + 准确性。\n\n常见限流算法：1）令牌桶（Token Bucket）——固定速率向桶中放 token，请求消耗 token（不足则拒绝/等待）。优点：支持突发流量（桶有容量，可积累 token）。缺点：突发时可能压垮下游（请求积压的 token 瞬间消耗）。2）漏桶（Leaky Bucket）——请求以固定速率流出，超出则丢弃。优点：削峰填谷，输出速率平滑。缺点：突发请求会被丢弃（不灵活）。3）滑动窗口（Sliding Window）——以时间窗口（如 1 秒）内请求计数限流。滑动窗口比固定窗口更精确（避免固定窗口在边界处的突发）。实现方式：用 Redis Sorted Set 记录每个请求的时间戳（ZREMRANGEBYSCORE 移除过期数据，ZCARD 统计窗口计数）。\n\nRedis 实现方案：1）INCR + TTL（最简方案）——Key = rate_limit:{userId}:{route}:{window_start_sec}，每次 +1，用 TTL 控制窗口过期。简单但固定窗口不精确（边界突发）。2）Sorted Set 滑动窗口——Key = rate_limit:{userId}:{route}，每请求 ZADD score=timestamp，ZREMRANGEBYSCORE 清理过期，ZCARD 统计。问题：每个请求都要清理过期数据，大量请求时 Redis 负担重。优化：用概率淘汰（不精确清理，后台定时清理）。3）Lua Script 原子限流——将限流逻辑（获取计数 + 判断 + 递增）原子化：local current = redis.call('INCR', key); if current == 1 then redis.call('EXPIRE', key, window_sec); end; return current。4）Redis Cluster 分片——根据 userId 或 clientIP 分片到不同 Redis 节点，避免单节点过载。\n\n分布式一致性挑战：1）时钟不同步——分布式节点的时钟偏差导致窗口偏移。解决方案：统一从 Redis 获取时间（TIME 命令），或使用逻辑时钟。2）超限误差——Redis 是 AP 系统，故障时可能丢失计数导致超限。CAP 权衡：限流通常接受少量超限（漏网之鱼）但不能拒绝合法请求。3）本地缓存 + Redis 同步——每个节点在本地做 Token Bucket，定时从 Redis 同步全局配额。降低 Redis QPS（从每请求 1 次降到每 100ms 1 次）。缺点：节点间份额不均时某节点提前耗尽配额。\n\n生产级限流系统（如 Sentinel / Kong Rate Limiting）：本地令牌桶（高性能） + Redis 作协调（周期刷新）。GCRA（通用信元速率算法）用于严格平滑输出。",
  ["Redis 实现的滑动窗口限流和令牌桶限流各自适用场景是什么", "分布式限流中怎样处理 Redis 故障——降级到本地限流还是拒绝请求"],
  ["限流", "Rate Limiting", "Redis", "分布式", "令牌桶"])

q("design_network", "medium", "short_answer",
  "全局速率限制与配额管理",
  "如何设计一个多维度速率限制系统（用户级 + API 级 + IP 级）？不同维度的配额（Quota）如何协同？超出配额时的降级策略（软限/硬限/排队）如何设计？",
  "多维度限流需要设计分层配额模型：层与层之间独立计数，任何一层耗尽都触发限流。\n\n维度设计：1）用户级（User Quota）——每个用户的全局配额（免费用户 100 req/min，付费用户 10000 req/min）。Key = rate:user:{userId}:{window}。2）API 级（API Quota）——每个 API 端点的总配额（防止某个 API 被过度调用）。Key = rate:api:{route}:{method}:{window}。3）IP 级（IP Quota）——每个来源 IP 的配额（防御异常遍历/爬虫）。Key = rate:ip:{ip}:{window}。4）集群级（Global Quota）——全集群总配额（避免单个 API 耗尽所有资源）。\n\n多层协同：请求经过三层检查通道：L1（IP 级，最快，在 Gateway 最外层）→ L2（API 级）→ L3（用户级，最慢但最精确）。任一层超限则拒绝。三层计数独立维护，但用户级超限后在缓存中标记（stale token），后续请求直接拒绝跳过 API/IP 检查。\n\n硬限/软限/排队：1）硬限（Hard Limit）——超过配额直接返回 429 Too Many Requests。响应头 X-RateLimit-Limit / X-RateLimit-Remaining 告知客户端当前配额和剩余配额。2）软限（Soft Limit / Warning）——超过软限给出警告但不拒绝响应，在 Retry-After Header 提示等待时间。应用场景：用户接近配额时提示升级。3）排队（Queue / Request Queuing）——超出配额的请求不是被拒绝而是排队等待（基于优先级队列）。应用场景：秒杀/抢购——超出系统处理能力的请求排队等待而不是直接返回失败。\n\n客户端适配：Retry-After Header 告知客户端多久后重试。HTTP 429 响应 + 重试策略（Exponential Backoff + Jitter）。WebSocket 场景超出配额时可以降级为只读模式（不拒绝连接但限制操作）。",
  ["多维度限流的三层检查顺序——先检查哪一层", "429 响应后客户端应如何处理——Retry-After 和指数退避"],
  ["限流", "配额", "速率限制", "429", "降级"])

# ==================== Service Mesh Network ====================

q("design_network", "hard", "short_answer",
  "Service Mesh 网络架构",
  "Service Mesh（如 Istio/Linkerd）的网络架构是如何设计的？Sidecar Proxy 在流量路径中扮演什么角色？Istio 的数据面（Envoy）和控制面（Istiod）是如何分工的？Sidecar 模式相比传统 SDK 模式有什么优劣？",
  "Service Mesh 将服务间通信的逻辑从业务代码中剥离出来，下沉到基础设施层（Sidecar Proxy）。\n\n架构层次：1）数据面（Data Plane）——由 Sidecar Proxy 组成（通常是 Envoy），每个服务 Pod 中注入一个 Envoy 容器，所有出入流量经过 Envoy。Envoy 负责：服务发现（从控制面获取上游端点）、负载均衡（加权轮询/最少请求/一致性哈希）、熔断（Circuit Breaking）、重试/超时、TLS 双向认证（mTLS）、速率限制。2）控制面（Control Plane）——在 Istio 中是 Istiod（集成了 Pilot、Citadel、Galley），负责：服务发现聚合（将 K8s Service 转换为 Envoy 可理解的 Cluster）、证书签发与管理（mTLS 证书自动轮换、SPIFFE 身份）、策略下发（路由规则、熔断阈值、限流规则）、遥测配置（Metrics/Tracing/Access Log 的采集目标）。\n\n流量路径：入站流量 —> Ingress Gateway —> Service A 的 Envoy —> Service B 的 Envoy —> Service B 容器。Envoy 之间启用 mTLS（双向 TLS 加密），每个连接自动轮换证书。\n\nSidecar vs SDK（如 Hystrix / Finagle / Spring Cloud）：1）侵入性——Sidecar 零代码侵入（业务容器不感知 Envoy），SDK 需要代码改造。2）升级——Sidecar 升级独立于业务（运维统一升级 Envoy），SDK 升级需要业务团队重新发布。3）多语言支持——Sidecar 对 Java/Go/Python/Node 都一致（Envoy 单一实现），SDK 模式每种语言都要维护一套。4）性能——Sidecar 增加额外网络跳（本地 localhost，延迟增加约 1-2ms），SDK 模式是进程内调用（零额外延迟）。5）调试复杂度——Sidecar 模式故障排查需要同时看业务日志 + Envoy 日志 + mTLS 证书状态。\n\n演进方向：Sidecarless（Cilium Mesh / Ambient Mesh）——用 eBPF + 节点级代理替代 Pod 级 Sidecar，减少资源开销但隔离性不如 Sidecar。",
  ["Sidecar Proxy 相比 SDK 模式的核心优势是什么（多语言、升级、零侵入）", "Ambient Mesh / Sidecarless 为什么资源开销更低——节点级共享代理 vs Pod 级独立代理"],
  ["Service Mesh", "Istio", "Envoy", "Sidecar", "微服务"])

q("design_network", "hard", "short_answer",
  "mTLS 在 Service Mesh 中的证书体系",
  "Service Mesh 中的 mTLS（双向 TLS）是如何实现的？证书签发、分发、轮换的流程是什么？SPIFFE 身份体系如何工作？mTLS 的性能开销有多大？",
  "Service Mesh 中的 mTLS 为每个服务工作负载分配 SPIFFE（Secure Production Identity Framework for Everyone）身份，基于 X.509 证书进行双向认证和通道加密。\n\n证书体系：1）SPIFFE 身份——格式为 spiffe://cluster.local/ns/{namespace}/sa/{serviceaccount}。身份与 K8s ServiceAccount 绑定（不是 Pod IP——Pod 重启瞬间，身份不变但 IP 变了）。2）Istiod 作为 CA——Istiod 内的 Citadel 组件充当集群 CA（Certificate Authority），为每个 Envoy 签发工作负载证书。证书包含：SPIFFE URI SAN、有效期限（默认 24 小时）、加密公钥。3）证书自动轮换——Envoy 通过 SDS（Secret Discovery Service）API 从 Istiod 获取和更新证书。证书到期前（剩余 80% 生命周期时）Envoy 发起轮换请求。轮换过程：Envoy 生成新密钥对 → CSR（Certificate Signing Request）发给 Istiod → Istiod 验证 Pod 的 ServiceAccount → 签发新证书 → Envoy 加载新证书（热加载，不中断现有连接）。\n\nmTLS 握手流程：Client Envoy → Server Envoy 建立连接时，双方出示证书并验证。Client 验证 Server 证书的 SPIFFE ID 是否属于预期调用目标。Server 验证 Client 证书的 SPIFFE ID 是否在白名单中。握手成功后建立 mTLS 连接（后续通信加密）。\n\n性能开销：1）首次握手——完整的 TLS 1.3 握手（1-RTT），包括证书验证。2）连接复用——mTLS 连接建立后会复用（Keep-Alive），后续请求零额外延迟。3）CPU 开销——AES-GCM 加密的 CPU 开销约为 5-10%（现代 CPU 有 AES-NI 指令集加速）。4）内存——每个 mTLS 连接维护加密状态（几 KB 内存），海量短连接场景下连接内存占用可观。5）注意：mTLS 的主要开销不在加密计算，而在连接管理的复杂度（证书验证、连接重用、双端资源管理）。\n\n证书安全：私钥仅存储在 Envoy 内存中（不落盘），通过 K8s ServiceAccount Token + JWT 认证 CSR。证书轮换是拉模式（Envoy 主动请求，不是 Istiod 推送），避免控制面压力。",
  ["mTLS 的证书轮换机制——如何在不中断连接的情况下替换证书", "mTLS 的 CPU 开销有多大——AES-NI 硬件加速的影响"],
  ["mTLS", "Service Mesh", "证书", "SPIFFE", "Istio"])

# ==================== DDoS & Security ====================

q("design_network", "hard", "short_answer",
  "DDoS 防护架构设计",
  "设计一套 DDoS 防御系统。L3/L4 和 L7 DDoS 攻击的防御策略分别是什么？流量清洗（Scrubbing）如何工作？如何区分正常流量和攻击流量？Anycast 在 DDoS 防御中扮演什么角色？",
  "DDoS 攻击在多个层面实施，防御也需要分层。\n\n1）L3/L4 DDoS 防御（网络层/传输层）：常见攻击类型——SYN Flood、UDP Flood、ICMP Flood、 amplification（NTP/DNS 反射放大）。防御手段：① 网络层 ACL——在边界路由器上使用 ACL 和 uRPF（Unicast Reverse Path Forwarding）过滤伪造源 IP。② SYN Cookie——在 L4 LB 或 ToR 交换机上启用 SYN Cookie，验证 TCP 三次握手的真实性（不完全建立连接队列，直到收到 ACK）。③ Rate Limiting——每 IP 或每端口的速率限制（在硬件交换机或 DPDK 中实现）。④ Anycast 扩散——Anycast 将攻击流量分散到多个 PoP（每个 PoP 处理一部分），在沿途节点过滤。⑤ 黑/白名单——已确认的攻击源 IP 快速 BGP 黑洞路由（RTBH，Remotely Triggered Black Hole）。\n\n2）L7 DDoS 防御（应用层）：常见攻击类型——HTTP Flood（慢速/快速）、Slowloris、Bot 攻击。防御难度最大（L7 流量看起来是正常的 HTTP 请求）。防御手段：① WAF——检测 SQL 注入、XSS、恶意 User-Agent、异常的请求模式。② Challenge——对可疑请求的 JS Challenge（JavaScript 挑战）或 CAPTCHA。③ 行为分析——正常用户的访问间隔、路径、浏览器指纹有规律（Bot 行为的节奏异常）。④ 速率限制——基于 IP/User ID/API 路径的精细化限流。\n\n流量清洗（Scrubbing Center）：1）牵引（Diversion）——将目标 IP 的流量通过 BGP 路由牵引到 Scrubbing Center（通常通过 BGP 社区属性或 FlowSpec 控制）。2）清洗（Scrubbing）——Scrubbing Center 的专用设备/软件（如 Radware / Arbor / Cloudflare）分析流量，过滤恶意包，只转发干净流量。3）回注（Return）——干净流量通过 GRE 隧道或 MPLS LSP 回注到原数据中心入口。\n\n分层协作：L3/L4 在骨干网或 CDN 边缘处理（大规模流量，最靠近攻击源），L7 在 WAF/Gateway 层处理（精确分析，延迟高）。自动化和人工结合：自动化策略处理常规攻击，严重攻击需要 SRE 介入调整策略（On-Call + SOP 剧本）。\n\nAnycast 的 DDoS 防御作用：Anycast 分散攻击流量（每个 PoP 只承受总攻击量的 1/N），N 个节点将单点压力降低 N 倍。缺点是如果攻击流量总和超过所有节点的总带宽，所有节点同时过载。Cloudflare 等 CDN 利用 Anycast 吸收大规模 DDoS（单个节点承受数百 Gbps）。",
  ["L4 SYN Flood 防御和 L7 HTTP Flood 防御的核心区别在哪", "Anycast 为什么能防御 DDoS——分散流量 vs 单点承受"],
  ["DDoS", "安全", "流量清洗", "Anycast", "WAF"])

q("design_network", "medium", "short_answer",
  "网络分段与微隔离设计",
  "什么是网络分段（Network Segmentation）和微分段（Micro-segmentation）？传统 VLAN 隔离、防火墙 Zone 和云原生微隔离（如 K8s NetworkPolicy / Service Mesh 鉴权策略）的区别和演进路线是什么？",
  "网络分段是将网络划分为多个更小的隔离区域，限制攻击面（某区域被攻破后不能横向移动）。\n\n1）传统 VLAN 分段——基于 VLAN + ACL 做网络隔离。核心问题：VLAN 数量有限（4094 个，大型数据中心不够用）；VLAN 配置复杂（每台交换机手工或通过 VTP 配置）；IP 和 VLAN 绑定不灵活（VM 迁移需要重新 VLAN 配置）。2）防火墙 Zone 模型——在数据中心的 Perimeter 部署防火墙（南北向），内部 Zone 之间也有防火墙规则。架构：互联网 → DMZ → 应用层 → 数据层。问题：防火墙成为瓶颈（东西向流量也要经过），Zone 模型粒度太粗（同一区内的服务器之间不隔离）。\n\n3）VXLAN + Overlay——VXLAN 解决了 VLAN 数量限制（16M 个 VNI），通过 Overlay 实现灵活的二层网络（VM 跨物理机迁移后 IP 不变）。控制面（VTEP 学习）有集中式（Controller）和分布式（EVPN）两种方案。EVPN（MP-BGP 通告 MAC/VTEP 映射）是主流。4）K8s NetworkPolicy——Kubernetes 原生的网络隔离机制：定义 Pod 级别的入站/出站规则（CIDR、Namespace Selector、Pod Selector）。依赖 CNI 插件实现（Calico / Cilium / Weave）。优势：与 Pod 生命周期绑定，自动适配 Pod 的扩缩容。5）微隔离（Micro-segmentation）——将隔离粒度从 IP/Port 提升到 Workload 或应用身份。在 Service Mesh 中通过 AuthorizationPolicy 定义：哪些 ServiceAccount 可以访问哪些服务。Cilium 使用 eBPF + Identity-based Policy，直接基于标签做策略（不是 IP）。\n\n演进路线：物理防火墙 Zone（机房间隔离）→ VLAN ACL（IP/Port 级隔离）→ VXLAN/Overlay（灵活二层 + EVPN 自动化）→ K8s NetworkPolicy（Pod 级隔离）→ Service Mesh AuthorizationPolicy（应用身份级隔离 + mTLS 加密）。\n\n最佳实践：分层防御——Underlay（物理 Border ACL）→ Overlay（VXLAN + EVPN）→ 容器网络（CNI NetworkPolicy）→ 应用身份（Service Mesh）。",
  ["VLAN（4094 个限制）和 VXLAN（16M VNI）的根本区别是什么", "微隔离为什么比传统的防火墙 Zone 模型更安全——横向移动防御"],
  ["网络分段", "VXLAN", "NetworkPolicy", "微隔离", "Service Mesh"])

# ==================== Multi-Region & Global Network ====================

q("design_network", "hard", "short_answer",
  "多活多 Region 网络架构",
  "设计一个跨地域多活（Multi-Region Active-Active）的网络架构。流量如何在不同 Region 之间路由？跨 Region 延迟如何控制？数据层的网络同步和冲突处理如何设计？",
  "多活架构的核心原则：用户的请求在最近的 Region 处理 + Region 之间做数据同步或分流。\n\n流量路由方案：1）DNS GSLB——每个 Region 的 VIP 通过 GSLB 分配给最近用户。故障时 GSLB 自动摘除故障 Region 的 VIP。2）Anycast——多个 Region 共享 VIP 的 BGP Anycast，用户自动到达最近 Region。故障时 BGP 撤回对应 Region 的路由。3）Global HTTP LB——GCP 的 Global Load Balancer 或 AWS Global Accelerator，通过 Anycast 到达最近边缘 PoP，再通过 Google/AWS 骨干网转发到目标 Region。\n\n跨 Region 延迟问题：1）光速限制——北京到上海的 RTT 约 25-35ms，北京到美西约 150-180ms。不可突破的光速物理极限。2）非核心数据异步同步——用户写入在本地 Region 完成，通过 MQ（Kafka/Pulsar）异步同步到其他 Region（最终一致性）。3）核心数据同步方案：A）写本地 + 异步复制（MySQL Binlog 同步、RDS 跨 Region 复制）——延迟 1-3 秒可接受。B）写两地三中心（同步复制 + Paxos/Raft）——写入延迟增加（每次写入需要跨 Region Quorum），适合金融级场景。C）读写分离 + Cache Aside——读操作在本地（最终一致），写操作走主 Region（较远但一致）。全局 Session 数据存 Redis（跨 Region 复制或不存跨 Region Session）。\n\n常见多活模式：1）两地三中心（同城双活 + 异地灾备）——同城两个数据中心做 Active-Active（同步复制，RTT < 2ms），异地灾备中心做冷备或异步复制。2）三地五中心（异地多活）——三个城市共 5 个中心做 Active-Active，采用 Paxos/Raft 组 + 副本策略。优势：任意一个城市故障不影响全局可用。代价：写入延迟高（跨 Region Quorum 需要 100ms+），架构复杂度高。3）单元化架构（Scaling Cube / Cell-based）——按照用户维度拆分（用户 ID Hash 分片），每个用户固定在一个单元（Region 内的完整服务栈）。单元间无状态流量不互通，单元内读写。单元故障时流量切换到另一单元。\n\n网络层考虑：跨 Region 互连用专线（AWS Direct Connect / 阿里云高速通道）或 VPN（IPSEC/GRE over Internet）。专线质量稳定但成本高；VPN 成本低但延迟和丢包受互联网影响。CDN 加速跨 Region 静态资源同步——将静态文件的跨 Region 同步通过 CDN 预热加速。",
  ["多活架构中跨 Region 的核心挑战——数据一致性和网络延迟", "单元化架构 vs 两地三中心——分别适用什么场景"],
  ["多活", "Multi-Region", "异地多活", "数据同步", "单元化"])

q("design_network", "medium", "short_answer",
  "SD-WAN / 企业网络架构",
  "什么是 SD-WAN？相比传统的 MPLS VPN 企业网络，SD-WAN 有什么优势和劣势？SD-WAN 如何实现链路负载均衡和自动故障切换？",
  "SD-WAN（Software-Defined Wide Area Network）将企业分支机构的网络连接集中控制面 + 混合链路（MPLS + Internet + LTE）实现智能路由和自动故障切换。\n\nSD-WAN vs MPLS VPN 对比：MPLS VPN 提供专线级 QoS 保证（SLA 99.99%），通常在运营商骨干网上流量隔离。劣势：开通周期长（新开分支需要 MPLS 专线，1-3 个月等待）；成本高（MPLS 按月租费，跨国专线极贵）；带宽扩展难（升级链路需重新申请）。SD-WAN 优势：混合链路——同时使用 MPLS、宽带 Internet、4G/5G 接入（根据应用选择最优链路）。中心化控制——Web 控制台集中管理所有分支的 VPN 连接和 QoS 策略。灵活扩展——新分支通过宽带 Internet 快速接入（几小时）。成本——大量使用 Internet 链路而非 MPLS，带宽成本降低 30-60%。\n\n链路负载均衡：1）基于应用的路由——视频会议（Zoom）走 MPLS（时延敏感），文件同步走宽带 Internet（大流量），管理流量走 4G（备用）。2）实时监控——SD-WAN CPE 持续监控每链路的延迟、丢包率、抖动。3）负载均衡算法：链路质量优先（丢包率超过阈值则标记为劣化）、应用优先级优先（关键应用分配到最稳定的链路）。\n\n故障切换：1）毫秒级切换——检测到链路故障（连续 N 个 Keepalive 包丢失），CPE 立即将流量切换到备用链路（不重新建立 TCP 连接，使用 FEC 前向纠错减少切换时的丢包）。2）A/P 或 A/A——主链路故障后，备用宽带链路或 4G LTE 接管流量。LTE 做最后的保险链路（带宽小但无处不在）。\n\n企业网络演进：传统：分支（路由器）← MPLS → 总部（防火墙 + 代理）。SD-WAN：分支（SD-WAN CPE）← Internet + MPLS + LTE → 总部/云端（SD-WAN Hub/SASE 边缘）。SASE（Secure Access Service Edge）是 SD-WAN 的下一阶段，将 SD-WAN + SWG + CASB + ZTNA 整合为统一云服务。",
  ["SD-WAN 的核心价值——混合链路和应用感知路由降低成本", "SASE = SD-WAN + Secure Web Gateway + ZTNA——为什么整合成云服务"],
  ["SD-WAN", "MPLS", "企业网络", "混合链路", "VPN"])

# ==================== WebSocket / Real-time ====================

q("design_network", "medium", "short_answer",
  "WebSocket 架构设计",
  "设计一个支持百万并发 WebSocket 连接的实时消息系统。WebSocket 长连接在负载均衡、连接管理、水平扩展方面有哪些设计要点？WebSocket 的 session 保持和断线重连如何实现？",
  "百万并发 WebSocket 系统的设计要点。\n\n1）WebSocket 负载均衡——L4 负载均衡器（TCP 转发）：WebSocket 是长连接，必须使用 L4（TCP 级别）负载保持源 IP 和端口不变。L7 代理（Nginx/HAProxy）支持 WebSocket Upgrade 头（Connection: Upgrade + Upgrade: websocket），在升级为 WebSocket 后切换到 TCP 透传模式。Sticky Session 问题：WebSocket 长连接的 session 保持（业务 session 数据不存本地，用 Redis 共享避免绑定连接到特定服务器）。\n\n2）连接管理模型——单机模型：每台服务器维护一个并发连接 Map（如 Netty 的 ChannelGroup），新增/断开时更新。连接元数据（连接 ID、用户 ID、连接的 Room/Topic 列表）存储在 Redis 中，方便跨节点查找。心跳管理：每 30s 发送 Ping 帧，60s 无 Pong 则断开连接并清理资源。\n\n3）水平扩展——Redis Pub/Sub（广播消息到所有节点）：每台服务器订阅 Redis Channel，收到消息后查找本地连接的 WebSocket 用户并推送。当消息量大时 Redis Pub/Sub 成为瓶颈（单节点上限约 100K msg/s）。解决方案：使用 Kafka/RocketMQ 做消息分发（Partition 可扩展），消息按 Room/Topic 分片，每个服务器订阅相关 Partition。\n\n4）断线重连——客户端机制：指数退避（1s、2s、4s、8s... 最大 30s）+ 随机 jitter。客户端维护消息队列（断线期间的消息存到 LocalStorage），重连成功后发送（幂等性检查去重）。服务端机制：连接断开后保留 session 数据 N 秒（默认 30s），等待客户端重连。重连成功后，从断开点恢复消息推送（需要客户端提供 lastReceivedMessageId）。\n\n5）大规模优化：连接吞吐——Netty 的 EventLoop 管理（每个 EventLoop 处理数千连接）。内存——单连接约 3-5KB（Channel 对象+写缓冲区），百万连接约 3-5GB。连接状态的定期清理——已断开但未回收的连接导致的 Ghost Connection。\n\n扩展延伸：WebSocket vs SSE（Server-Sent Events）：WebSocket 双向通信（客户端和服务端都可以推送），浏览器兼容性好。SSE 单向通信（仅服务端推送到客户端），基于 HTTP 更简单，支持自动重连（EventSource 自带），适合推送通知、实时股价等单向场景。",
  ["WebSocket 的水平扩展方式——Redis Pub/Sub vs Kafka 消息分发", "断线重连的幂等性保障和消息恢复机制"],
  ["WebSocket", "实时通信", "长连接", "水平扩展", "消息推送"])

q("design_network", "medium", "short_answer",
  "实时通信协议选型：WebSocket vs SSE vs gRPC Stream vs MQTT",
  "在选择实时通信协议时，WebSocket、SSE、gRPC Stream、MQTT 各自的适用场景、优缺点是什么？在一个消息推送系统中，如何根据业务需求选择合适的协议（或协议组合）？",
  "四种实时通信协议的定位和选型。\n\n1）WebSocket——双向全双工通信。优点：浏览器原生支持（WSS），低延迟，支持二进制和文本，协议成熟客户端库多。缺点：需要心跳保活，连接管理复杂，没有原生重连机制。适用：聊天 IM、实时协作编辑（Google Docs）、游戏同步、金融交易终端。\n\n2）SSE（Server-Sent Events）——服务端单向推送（HTTP 长连接）。优点：基于 HTTP（无需额外协议），浏览器原生 EventSource API（自动重连，不需要自己实现），轻量简单。缺点：单向（客户端不能通过同一连接发消息），浏览器连接数限制（HTTP/1.1 每个域名 6 个），不支持二进制。适用：实时通知（消息提醒）、数据流（股价/行情/进度条）、日志流推送。\n\n3）gRPC Stream（Server Streaming / Bidirectional Streaming）——基于 HTTP/2 的双向流。优点：强类型（.proto 定义消息格式），高性能（Protobuf 二进制编码），支持流式控制（Flow Control），与微服务体系天然集成。缺点：浏览器不支持原生 gRPC（需要 gRPC-Web + Envoy 代理），学习成本高（.proto 文件管理）。适用：服务端推送事件流（K8s Watch API）、微服务间实时数据同步、物联网设备数据采集。\n\n4）MQTT——轻量级发布/订阅协议。优点：极轻量（头部仅 2 字节），支持 QoS 0/1/2（最多一次/至少一次/恰好一次），支持遗嘱消息（Will Message）、保留消息（Retained Message）。缺点：需要 MQTT Broker（Mosquitto/EMQX），浏览器不支持原生 MQTT（需要 MQTT over WebSocket）。适用：物联网（IoT）传感器、移动端推送（省电省流量）、弱网环境。\n\n选型建议：浏览器端需要双向实时通信 → WebSocket（最通用）。浏览器端只需接收推送 → SSE（更简单，自动重连）。微服务间实时数据同步 → gRPC Stream。IoT 设备/移动端弱网 → MQTT。复杂场景协议组合：短连接 API 用 REST，服务间实时调用用 gRPC，浏览器推送用 WebSocket，通知类用 SSE。",
  ["SSE 和 WebSocket 的选型——为什么不需要双向通信时优先选 SSE", "MQTT 的 QoS 级别——QoS 2（恰好一次）在物联网中的代价"],
  ["WebSocket", "SSE", "gRPC Stream", "MQTT", "实时通信"])

# ==================== Network Performance & Optimization ====================

q("design_network", "medium", "short_answer",
  "TCP 网络性能优化方案",
  "在不更换硬件和带宽的前提下，如何优化 TCP 网络性能？TCP 参数调优（初始窗口、拥塞控制、Buffer 大小）对应用性能有什么影响？BBR 如何提升长肥网络（Long Fat Network）的性能？",
  "TCP 性能优化从内核参数调优 + 拥塞控制算法选择 + 应用层配合三个维度入手。\n\n1）初始窗口（Initial Window / initcwnd）——默认 initcwnd = 10（约 14KB）。Google 研究建议提高到 initcwnd = 30-40（约 45KB-60KB）。加速：减少短连接（HTTP 请求）在小窗口阶段的往返次数，首次请求就可以更快填满管道。命令：ip route change {net} initcwnd 40 initrwnd 40。\n\n2）拥塞控制算法——Linux 默认 CUBIC（基于丢包反馈）。BBR（基于带宽+延迟模型）的优势：在长肥网络（高带宽高延迟，如跨国链路）上，CUBIC 可能因丢包（填满缓冲区触发丢包）误认为拥塞，降低吞吐量。BBR 不依赖丢包信号，通过探测带宽和最小 RTT 控制发送速率。效果：BBR 在 100ms+ RTT 链路上可比 CUBIC 提升 2-10 倍吞吐。切换：sysctl net.ipv4.tcp_congestion_control=bbr。前提：内核支持 tcp_bbr 模块。\n\n3）Buffer 大小（Socket Buffer）——核心参数：net.core.rmem_max（最大接收缓冲）、net.core.wmem_max（最大发送缓冲）。推荐值：rmem_max = wmem_max = 16MB。针对 BDP（带宽 × RTT）：北京到美西（100Mbps × 0.15s = 1.875MB），Buffer 至少 > BDP，否则窗口成为吞吐瓶颈。调整：sysctl -w net.core.rmem_max=16777216，应用通过 SO_RCVBUF/SO_SNDBUF 获取。\n\n4）其他关键参数：net.ipv4.tcp_slow_start_after_idle=0（连接空闲后不重置 CWND，保持之前的学习结果）。net.ipv4.tcp_fastopen=3 开启 TFO（TCP Fast Open），在 SYN 中携带数据减少 1-RTT。net.ipv4.tcp_nodelay=1（应用层应该在 Socket 级别禁用 Nagle 算法）。\n\n5）应用层配合：连接池（避免每次请求新建连接，Apache HttpAsyncClient/Netty 连接池）。HTTP Keep-Alive（复用连接减少握手开销）。Pipeline 请求（HTTP/1.1 管道化，但受 HOL 影响；更好的方案是 HTTP/2 多路复用）。减少小包（数据聚合后发送，减少 TCP 包的协议头开销）。\n\n扩展延伸：高级方案——零拷贝（sendfile + splice 减少内核态和用户态的数据复制）、TLS 加速（TLS 1.3 + Session Resumption + 0-RTT）、IO 模型（epoll 边缘触发 vs Reactor 模型）。",
  ["TCP 初始窗口（initcwnd）增大对短连接性能的影响", "BBR 为什么在长肥网络中优于 CUBIC——不依赖丢包判断"],
  ["TCP", "性能优化", "BBR", "内核参数", "网络调优"])

q("design_network", "medium", "short_answer",
  "零信任网络架构（ZTNA）",
  "零信任网络（Zero Trust Network Architecture）的核心原则是什么？ZTNA 和传统 VPN 有什么区别？如何实现 BeyondCorp / Google 的零信任模型？",
  "零信任（Zero Trust）的核心原则：「从不信任，始终验证」。不信任网络位置（内外网一视同仁），每次请求都验证身份、设备、上下文。\n\n传统 VPN vs ZTNA：VPN——用户接入内网后获得整个网络的访问权限（平面网络）。问题：VPN 一旦认证通过，内部网络完全开放（攻击者进入后可以横向移动）。VPN 客户端配置复杂（证书/密码/二次验证）。ZTNA——最小权限（只允许访问指定应用，不是整个网络）。应用隐藏（ZTNA Gateway 只暴露给认证用户，非授权用户甚至扫描不到端口）。持续验证（不仅登录时验证，全连接过程持续验证——设备状态变化时触发重新认证）。\n\nGoogle BeyondCorp 模型：1）不再区分内网外网——所有访问都通过互联网（不依赖内网 VPN）。用户设备通过互联网直接访问 Google 应用（所有的访问路径相同）。2）信任评估——访问决策基于：用户身份（Google 账号 + 2FA）、设备状态（公司设备 vs 个人设备、OS 版本、补丁状态、是否安装 EDR）。信任评分：持续评估（非静态），分数变化时动态调整权限（被标记为不受信任的设备立即限制访问）。3）访问代理——所有流量经过 Access Proxy（Google 的 IAP / Identity-Aware Proxy）。Access Proxy 负责：验证用户身份 + 检查设备状态 + 做访问控制决策。\n\n实现 ZTNA 的组件：1）身份提供商（IdP）——Okta / Azure AD / Keycloak 做用户认证和 SSO。2）设备管理（MDM）——JAMF / Intune / Workspace ONE 管理设备合规性。3）安全网关——Cloudflare Access / Zscaler / Pomerium 做应用层访问代理。4）持续监控——UEBA（User and Entity Behavior Analytics）检测异常行为模式。\n\n企业实践：先在远程办公场景做 ZTNA（替代 VPN），然后逐步扩展到数据中心内部。ZTNA 替代 VPN 的好处：公司不再需要暴露 VPN 入口（减少攻击面）；用户不需要 VPN Client；更精细的访问控制（不需要给整个网段权限）。",
  ["ZTNA 和 VPN 的根本区别——网络接入 vs 应用接入", "BeyondCorp 的核心——不信任网络位置，只信任身份+设备状态"],
  ["零信任", "ZTNA", "BeyondCorp", "安全", "VPN"])

# ==================== Observability ====================

q("design_network", "hard", "short_answer",
  "分布式追踪网络架构",
  "分布式追踪系统（如 Jaeger/Zipkin）在网络层面的设计要点是什么？Trace 数据如何采集、传输、采样？如何保证追踪对业务链路的性能影响最小？OpenTelemetry 的 Collector 架构如何设计？",
  "分布式追踪的核心：跨服务传播 Trace Context（TraceID + SpanID），收集所有 Span 数据并关联还原完整的调用链路。\n\nTrace 数据的产生和传播：1）Context 传播——请求进入服务 A 时，生成 TraceID（全局唯一 128bit ID）和 SpanID（本次调用 ID）。服务 A 调服务 B 时，将 TraceID + ParentSpanID 通过 HTTP Header（tracestate/traceparent）或 gRPC Metadata 传递。2）Span 生成——Span 记录一个操作（HTTP 请求、DB 查询、消息发送），包含：操作名称、开始/结束时间戳、标签/属性（如 HTTP method、状态码）、Span 状态（OK/ERROR）。3）采样——Head Sampling（在链路起点决定是否采样全部 Span）简单但可能错过重要错误。Tail Sampling（在 Collector 端根据链路特征（是否出错、延迟高低）决定是否保留）灵活但成本高。推荐：100% 采样错误链路 + 按比例采样正常链路。\n\nAgent → Collector → Backend 架构：1）Agent（SDK/Instrumentation）——嵌入应用中（通过 OpenTelemetry SDK 或自动注入）。职责：自动拦截 HTTP/gRPC/DB 调用生成 Span，通过 OTLP 协议推送到 Collector。性能影响：采样前 Span 生成的开销极低（纳秒级），不阻塞业务线程。2）Collector（OpenTelemetry Collector）——接收、处理、导出 Telemetry 数据。架构：Receivers（接收 OTLP/Jaeger/Zipkin 协议）→ Processors（批处理、内存排队、属性修改、Tail Sampling）→ Exporters（导出到 Jaeger / Tempo / Datadog / CloudWatch）。高可用：Collector 无状态可水平扩展（多个 Collector 之间不共享数据）。性能：Batch Processor 将多个 Span 合并成一个请求导出，减少 IOPS。3）Backend（存储和查询）——Jaeger（Elasticsearch/Cassandra/ Badger 作为后端存储）、Grafana Tempo（对象存储 + Parquet）、AWS X-Ray（托管）。\n\n性能优化要点：1）采样率调节——正常流量采样 1-5%（高流量），错误/慢请求 100%。采样后 Drop Span，不写入存储（减少存储成本）。2）Span 链接压缩——多个 Span 共享标签压缩为 Span Links（Reference 而非复制）。3）Collector 的内存排队——Collector 使用内存 Queue 做缓冲，后端故障时数据缓冲在内存/磁盘（避免数据丢失）。4）减少采样对业务的影响：OpenTelemetry 的 SpanProcessor 异步导出（不阻塞业务线程）；采样决策从 Agent 侧转移到 Collector 侧减轻应用负载。",
  ["Head Sampling vs Tail Sampling——什么时候用哪个", "OpenTelemetry Collector 的批处理对性能的影响"],
  ["分布式追踪", "OpenTelemetry", "Jaeger", "Trace", "可观测性"])

q("design_network", "hard", "short_answer",
  "大规模网络监控与告警设计",
  "设计一套数据中心级别的网络监控系统。需要采集哪些指标？如何发现和定位网络故障（延迟抖动、丢包、带宽瓶颈）？告警规则如何设计避免告警风暴？NetFlow / sFlow / IPFIX 在网络监控中起什么作用？",
  "数据中心网络监控的完整体系：指标采集 → 数据聚合 + 异常检测 → 告警路由。\n\n核心指标：1）带宽利用率（Bits/s）——每台交换机的每个端口，区分 inbound/outbound。超过 70% 标记为黄色预警，90% 标记为红色。2）丢包率——TCP 重传率 > 1% 视为异常。交换机端口的 CRC Error / Runts / Giants 指示物理层问题。3）延迟和抖动——探测路径的 RTT 和 RTT 方差（Jitter）。可用工具：ping（ICMP 延迟，不能完全反映 TCP 延迟）、OWAMP/TWAMP（精确的双向延迟测量）、mtr（逐跳延迟可视化）。4）TCP 连接状态——SYN 超时率、Connection Refused、重传率。5）队列深度（Buffer 占用）——交换机出口队列的丢弃计数指示瓶颈点。\n\nNetFlow / sFlow / IPFIX：1）NetFlow（思科专利）——路由器/交换机对每个流的统计（五元组 + 包数 + 字节数 + 时间戳）。典型采样率 1:1000 或 1:10000。2）sFlow（行业标准）——基于数据包的采样（每个 N 个包采样 1 个），加上计数器轮询（接口统计）。相比 NetFlow，sFlow 不维护流状态（减少设备 CPU 开销）。3）IPFIX（NetFlow v10 标准化为 RFC）——NetFlow 的 IETF 标准化版本。作用：识别流量分布（哪个应用消耗最多带宽、哪个 IP 对话流量最大）、DDoS 检测异常流量模式（大量 SYN 包到同一 IP）。\n\n故障定位：1）路径探测 —— mtr 逐跳 ICMP 判断哪个 Hop 有问题。2）延迟抖动分析——BGP 路由变化（通过 BGP Monitor 检测）、链路拥塞（出端口队列丢弃）。3）NetFlow 异常检测——特定 IP 的突发流量（可能是 DDoS）、大量 TCP Reset（应用故障）。4）分布式 Ping Mesh——所有 ToR 交换机互相做 ping（全互联），定位哪个交换机/链路延迟高。\n\n告警设计避免风暴：1）依赖关系屏蔽——数据中心交换机故障导致所有相关端口down，不逐一告警，只告警交换机级、关联端口不告警。2）聚合和抑制——同一类告警 (LinkDown on AsServerA) 5 分钟内只发一次。3）静默期——已知维护窗口的告警静默。4）线性升级——问题持续 N 分钟未修复 → 升级到高级 On-Call。\n\n开源工具栈：Prometheus + node_exporter + blackbox_exporter（ICMP/TCP/HTTP 探测）+ Grafana。商用的 Datadog NPM / SolarWinds 提供自动化网络拓扑发现和依赖映射。",
  ["NetFlow 的流采样（1:1000）如何影响统计精度", "1 台交换机 48 口 down 怎么避免 48 条告警——依赖屏蔽"],
  ["网络监控", "NetFlow", "告警", "Prometheus", "故障定位"])

# ==================== Network Protocols & Evolution ====================

q("design_network", "medium", "short_answer",
  "HTTP/3 迁移策略",
  "从 HTTP/1.1 或 HTTP/2 迁移到 HTTP/3 需要考虑哪些因素？HTTP/3 的前置条件是什么？迁移过程中的兼容性策略（渐进式部署、降级）如何设计？哪些场景不适合 HTTP/3？",
  "HTTP/3 基于 QUIC（UDP），迁移不只是一行配置修改，涉及网络基础设施和应用的全面评估。\n\n前置条件：1）网络设备支持——UDP 443 端口需要在防火墙/LB/CDN 上放行。部分企业网络封锁 UDP 或对 UDP 做 QoS 降级（运营商行为）。2）客户端支持——浏览器：Chrome 90+/Firefox 90+/Safari 14+/Edge 90+。移动端：iOS 14+/Android 11+。curl 7.66+ 支持。3）服务端支持——Nginx（1.25+ 支持 QUIC/HTTP3）、Caddy（原生支持）、Cloudflare/Google/AWS 都已支持 LB 侧终止 QUIC。4）CDN 支持——Cloudflare、Fastly、Akamai 都已支持 HTTP/3。国内阿里云/腾讯云也在逐步支持。\n\n迁移策略：1）协议协商（Alt-Svc）——服务端在 HTTP/2 响应头中返回 Alt-Svc: h3=\":443\"，告知客户端服务器支持 HTTP/3。客户端下次连接时尝试 QUIC。2）渐进式部署（灰度）——先在 CDN 边缘节点或非关键数据中心启用 HTTP/3，观察 UDP 丢包率和吞吐。使用 Feature Flag 控制灰度比例。3）降级路径——如果 QUIC 连接超时或失败（UDP 被封），客户端自动降级为 TCP（HTTP/2 或 HTTP/1.1）。浏览器实现中 QUIC 连接超时（通常 300ms）后回退到 TCP。4）监控指标——HTTP/3 相比 HTTP/2：首字节时间（TTFB）降低 15-30%（0-RTT 效果）、连接建立时间减少 1-RTT、弱网下吞吐提升（独立流不互相阻塞）。\n\n不适合 HTTP/3 的场景：1）UDP 被限制的内网环境（部分企业内网防火墙限制 UDP）。2）长连接已经建立且稳定的场景（如 gRPC 在已有 HTTP/2 长连接上运行良好）。3）IoT 设备（部分设备 UDP 处理能力弱）。4）需要 DPI（深度包检测）的环境——QUIC 加密性强，DPI 设备无法识别流量内容。\n\n在服务端启用：Nginx 需要编译 quiche/boringssl 模块（或使用 Cloudflare 的 nginx-quic）。Caddy 开箱即用（从 v2.6 起默认启用了 HTTP/3）。反向代理架构中，客户端到 CDN/反向代理 使用 HTTP/3，反向代理到 后端服务 仍用 HTTP/1.1 或 HTTP/2（减少后端改动）。\n\n注意：不要期待 HTTP/3 取代 HTTP/2——两者长期共存。HTTP/3 在移动端和弱网场景优势最大。",
  ["HTTP/3 迁移中 UDP 被封锁的处理方式——Alt-Svc + 降级", "CDN 卸载 HTTP/3——客户端到 CDN 用 HTTP/3，CDN 到源站用 HTTP/2"],
  ["HTTP/3", "QUIC", "迁移", "UDP", "渐进式部署"])

# ==================== gRPC & Advanced API ====================

q("design_network", "hard", "short_answer",
  "gRPC Name Resolver 与负载均衡设计",
  "gRPC 的 Name Resolver 机制是如何工作的？gRPC 如何通过与 Name Resolver 配合实现客户端负载均衡？gRPC 在 Kubernetes 中的 DNS 负载均衡（Headless Service）有什么局限性？如何用 Envoy xDS 替代 DNS 做 gRPC 服务发现？",
  "gRPC 的负载均衡依赖 Name Resolver（将服务名解析为后端地址列表）+ Load Balancer（从列表中选择后端）。\n\nName Resolver 工作流程：1）gRPC 客户端启动时，Name Resolver（默认 DNS Resolver）解析目标 URI（dns:///service-name:8080），获取 IP 地址列表。2）Resolver 将地址列表传给 gRPC 的 LB Policy，后者为每个地址创建 Subchannel（TCP 连接）。3）Resoler 持续 Watch 地址变化（DNS TTL 到期或 DNS 轮询间隔），增量更新地址列表。\n\nKubernetes Headless Service（ClusterIP=None）：每个 Pod 的 IP 作为 DNS A/AAAA 记录返回，gRPC 客户端通过 DNS RR（Round Robin）获取所有 Pod IP。问题：1）DNS 缓存——K8s DNS TTL 默认 30s（可调整但非实时），Pod 扩缩容后 30s 内客户端不感知。2）客户端不做健康检查——gRPC 客户端拿到 Pod IP 后，即使 Pod 已故障，仍尝试连接（直到 TCP 超时）。3）不感知负载——DNS RR 返回的 IP 列表不反映 Pod 的负载情况。\n\nEnvoy xDS 替代方案：xDS（Envoy 发现服务）提供更精细的服务发现和负载均衡：1）LDS（Listener Discovery Service）/ RDS（Route Discovery Service）配置监听器和路由规则。2）CDS（Cluster Discovery Service）动态下发后端集群列表（支持权重、区域感知路由）。3）EDS（Endpoint Discovery Service）实时下发后端端点列表（Pod IP:Port），变化立即推送（不需等待 DNS TTL）。4）ADS（Aggregated Discovery Service）聚合所有 xDS 资源于一个 gRPC 流。\n\ngRPC + xDS 的优势：实时感知后端变化（Pod 扩缩容秒级感知）。客户端基于 EDS 端点做负载均衡（支持最少请求、权重、区域感知）。集成了健康检查——不健康 Pod 自动从 EDS 中移除。\n\n负载均衡策略在 gRPC 中的配置方式：Service Config 中配置 loadBalancingConfig（先选策略）：pick_first（默认，连接第一个成功地址）、round_robin（轮询每个 Subchannel）、grpclb（gRPC LB Service，外部 LB + Resolver）。建议：K8s 环境中使用 round_robin + EDS（xDS），或 round_robin + DNS（Headless Service，接受 30s 延迟）。注意：pick_first 在 K8s 中会丢失负载均衡效果。",
  ["K8s Headless Service + gRPC 为什么需要 30 秒才能感知 Pod 变化——DNS TTL", "xDS (EDS) 如何做到实时推送端点变化——gRPC Streaming Watch"],
  ["gRPC", "负载均衡", "xDS", "K8s", "服务发现"])

# ==================== Cloud Network ====================

q("design_network", "hard", "short_answer",
  "云原生网络：VPC 设计与企业混合云网络",
  "如何设计一个企业的 AWS/GCP 多账号 VPC 网络？Transit Gateway（TGW）和 VPC Peering 的区别是什么？混合云场景下 Direct Connect/VPN 的冗余设计（主备/双活）如何实现？",
  "企业级云网络设计的关键是：Account 隔离 + VPC 拓扑 + 混合云互连 + 流量控制。\n\n多账号 VPC 网络架构：1）组织结构——AWS Organization 管理多个账号：Network Account（集中管理网络资源 Transit Gateway / Firewall）、Security Account（集中 WAF / GuardDuty）、Application Accounts（业务 VPC，最多 N 个独立 VPC）。2）Hub-Spoke——Network Account 部署 Transit Gateway（Hub），所有应用 VPC（Spoke）通过 TGW Attachment 连接。优点：Hub 统一路由、集中安全检查、简化 VPC 间互通。\n\nTransit Gateway vs VPC Peering：VPC Peering——一对一连接，N 个 VPC 需要 N(N-1)/2 个 Peering（全互联 O(n²) 复杂度）。不能传递路由（需要在每个 VPC 手动添加路由表）。Transit Gateway——中心辐射拓扑，TGW 连接每个 VPC（或 VPN/Direct Connect），路由表在 TGW 集中管理。N 个 VPC 只需要 N 个 TGW Attachment。支持跨账号/跨 Region TGW Peering。实际选型：超过 3 个 VPC 就应使用 TGW。\n\n混合云（数据中心→云的连接）：1）Direct Connect（专线）——物理专线从数据中心到 AWS Direct Connect Location，通过 VGW（Virtual Private Gateway）到 VPC/TGW。现在通过 TGW 的 Direct Connect Gateway 架构：DX Location → Direct Connect Gateway → Transit Gateway → VPC。2）VPN Backup——建立 IPSEC VPN（通过 TGW VPN Attachment）作为专线的备用链路。主用专线故障时 BGP 自动切换到 VPN。3）双活设计——两个 DX Location 各一条专线（主/备或双活）。通过 BGP AS Path 操纵：主链路的 AS Path 更短（优先），故障时 BGP 切换到备链路。4）带宽和成本——专线按月租费（带宽增量收费），VPN 按流量计费。流量大时专线划算，流量小时 VPN 灵活。\n\n流量管控：1）NAT Gateway——VPC 中私有子网访问互联网的路由（绑定 EIP）。2）VPC Endpoint (Gateway / Interface) ——S3/DynamoDB 通过 Gateway Endpoint 不走互联网，保持流量在 AWS 骨干网。3）Network Firewall / Security Group / NACL——分层防御，NACL 是无状态（子网级别，默认全部允许），Security Group 有状态（实例级别，默认全部拒绝）。\n\nGCP 的类似网络概念：Shared VPC（跨项目共享 VPC，类似于 AWS 多账号 TGW）、Cloud VPN / Cloud Interconnect（专线）、VPC Peering / Network Connectivity Center（相当于 TGW 的多连接）。",
  ["VPC Peering 的 O(n²) 复杂度——何时切换到 Transit Gateway", "专线双活——BGP AS Path 控制主备切换"],
  ["VPC", "Transit Gateway", "Direct Connect", "混合云", "AWS"])

# Write properly (with safety guard)
result = json.dumps(questions, ensure_ascii=False, indent=2)
outpath = '/Users/petersun/DEV/labs/interview-app/backend/seed_data/design_network.json'
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
