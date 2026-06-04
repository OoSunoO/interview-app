#!/usr/bin/env python3
"""Expand design_network.json from 50 to ~100 questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('design_network', 'hard', 'short_answer', 'TCP 拥塞控制算法全览',
      '全面对比 TCP 各拥塞控制算法的设计哲学和适用场景。Tahoe/Reno/NewReno 基于丢包的 AIMD。CUBIC 的高 BDP 优化。BBR 的基于模型方法。Westwood 的无线路由优化。各算法在数据中心、公网、无线网络中的表现。',
      '拥塞控制算法对比：\n\n1. **Tahoe/Reno**（经典）：\n   - Tahoe：慢启动 → 拥塞避免 → 丢包 → 回到慢启动（cwnd=1）\n   - Reno：丢包 → 快速恢复（cwnd/2），非重传超时才回到 1\n   - 局限：每个 RTT 只能探测一个丢包\n\n2. **NewReno**：\n   - 改进快速恢复阶段\n   - 部分 ACK 不退出恢复（继续重传剩余丢失包）\n   - 一个 RTT 内可以恢复多个丢包\n\n3. **CUBIC**（Linux 默认）：\n   - 凹函数增长（不再是线性）\n   - 不依赖 RTT（公平性好）\n   - 高 BDP 网络下吞吐优于 BIC\n\n4. **BBR**：\n   - 基于带宽和延迟建模，不依赖丢包\n   - 对弱网和长肥网络友好\n   - 与 CUBIC 共存时 fairness 有争议\n\n5. **Westwood/Westwood+**：\n   - 通过 ACK 速率估计可用带宽\n   - 无线网络丢包不降速（区分拥塞丢包和无线丢包）',
      ['Tahoe→Reno→NewReno→CUBIC→BBR 是主流演进路径', 'CUBIC 是 Linux 默认，BBR 在弱网场景更优'], ['tcp', 'congestion-control', 'cubic', 'bbr']),

    q('design_network', 'medium', 'short_answer', 'DNS 解析全过程与优化策略',
      '描述一次完整的 DNS 解析流程。递归解析和迭代解析的区别。DNS 缓存层级（浏览器 → OS → Local DNS → 根/顶级/权威）。DNS 优化策略：预解析、prefetch、HTTP DNS、DoH/DoT。DNS 故障排查工具和方法。',
      'DNS 解析：\n\n1. **完整流程**（以 chrome 为例）：\n   - 浏览器缓存 → OS 缓存（/etc/hosts）→ Local DNS（ISP/114.114.114.114）\n   - Local DNS 递归查询：根 DNS → .com TLD → 权威 DNS → 返回 IP\n\n2. **递归 vs 迭代**：\n   - 递归：DNS Client 问 Local DNS，Local DNS 问到底再回\n   - 迭代：DNS Server 告诉 Client「下一个 Server 地址」\n\n3. **优化策略**：\n   - **dns-prefetch**：`<link rel="dns-prefetch" href="//example.com">`\n   - **preconnect**：DNS + TCP + TLS 提前建立\n   - **HTTP DNS**：用 HTTP 代替 DNS 协议（阿里云 HTTP DNS）\n   - **DoH/DoT**：加密 DNS 查询（防劫持）\n\n4. **排障工具**：\n   - dig +trace：查看完整递归路径\n   - nslookup：简单查询\n   - host：快速 IP 解析\n   - tcpdump port 53：抓 DNS 包',
      ['DNS 递归查询和迭代查询的核心区别在谁负责到底', 'dns-prefetch 和 preconnect 可显著优化首屏延迟'], ['dns', 'optimization']),

    q('design_network', 'hard', 'short_answer', 'gRPC 的 HTTP/2 传输与性能优化',
      '深入分析 gRPC 基于 HTTP/2 的传输机制。HTTP/2 Stream 和 Frame 在 gRPC 中的映射。gRPC 四种通信模式（Unary/Server Streaming/Client Streaming/Bidirectional Streaming）。ProtoBuf 序列化对性能的影响。gRPC 的 Keepalive、Flow Control、连接池配置。',
      'gRPC 传输详解：\n\n1. **HTTP/2 映射**：\n   - 每个 gRPC 调用对应一个 HTTP/2 Stream\n   - 请求：HEADERS frame（method=POST, path=/package.Service/Method）\n   - 消息：DATA frame（ProtoBuf 编码）\n   - 结束：HEADERS frame（status=200）\n\n2. **四种模式**：\n   - **Unary**：单请求 + 单响应（最简单的 RPC）\n   - **Server Streaming**：单请求 + 多响应帧\n   - **Client Streaming**：多请求帧 + 单响应\n   - **Bidirectional**：两边独立发流数据（不一定是 ping-pong）\n\n3. **性能优化**：\n   - ProtoBuf 编码比 JSON 小 3-10x，快 10-100x\n   - 连接池复用 HTTP/2 连接（一个连接多 Stream 并发）\n   - **Keepalive**：HTTP/2 PING frame 检测连接健康\n   - **Flow Control**：HTTP/2 流控（初始 window size 64KB，可调整）\n\n4. **高级配置**：\n   - **MaxMessageSize**：默认 4MB\n   - **MaxConcurrentStreams**：单连接最大并发流\n   - **InitialWindowSize**：初始流控窗口\n   - **WriteBufferSize**：写缓冲区',
      ['gRPC 每个 RPC 调用 = HTTP/2 的一个 Stream', 'ProtoBuf 编码是关键性能优势'], ['grpc', 'http2']),

    q('design_network', 'medium', 'short_answer', 'WebSocket 与 WebTransport 对比',
      '对比 WebSocket 和 WebTransport（基于 QUIC）的实时通信方案。WebSocket 的 HTTP 升级握手和 Frame 格式。WebTransport 基于 QUIC 的 Stream 和 Datagram API。WebTransport 在游戏、直播中的优势。服务端推送方案的演进。',
      'WebSocket vs WebTransport：\n\n1. **WebSocket**：\n   - HTTP Upgrade 握手（101 Switching Protocols）\n   - 基于 TCP（队头阻塞问题）\n   - Frame 类型：Text/Binary/Ping/Pong/Close\n   - 浏览器 API：WebSocket 对象\n\n2. **WebTransport**：\n   - 基于 QUIC（无队头阻塞）\n   - **Stream API**：可靠有序（类似 TCP）\n   - **Datagram API**：不可靠无序（类似 UDP）\n   - 0-RTT 连接建立\n   - 连接迁移（切换网络不断连）\n\n3. **关键差异**：\n   - **队头阻塞**：WebSocket 有（TCP），WebTransport 无（QUIC）\n   - **多路复用**：WebSocket 需要多连接，WebTransport 一个连接多 Stream\n   - **不可靠传输**：WebSocket 不支持，WebTransport 支持\n   - **连接迁移**：WebTransport 原生支持\n\n4. **适用场景**：\n   - WebSocket：消息推送、即时通讯、协作编辑\n   - WebTransport：实时游戏、直播、高频交易、弱网场景',
      ['WebTransport 基于 QUIC 解决 WebSocket 在 TCP 上的队头阻塞', 'Datagram API 支持不可靠传输（游戏场景关键）'], ['websocket', 'webtransport', 'quic']),

    q('design_network', 'hard', 'short_answer', '负载均衡算法深度对比',
      '全面对比负载均衡算法：轮询（Round Robin）、加权轮询（WRR）、最少连接（Least Connections）、一致性哈希（Consistent Hashing）、随机（Random）、P2C（Power of Two Choices）。各算法的适用场景、优劣以及实现中的优化。',
      '负载均衡算法：\n\n1. **Round Robin**：\n   - 请求依次分配给后端\n   - 简单，但后端性能不均时不适用\n   - Nginx upstream RR 实现\n\n2. **Weighted RR（WRR）**：\n   - 按权重比例分配请求\n   - 平滑 WRR（Nginx 实现）：保证请求均匀分布\n\n3. **Least Connections**：\n   - 分配给当前活跃连接最少的后端\n   - 适合长连接场景（MySQL、gRPC）\n\n4. **Consistent Hashing**：\n   - 按请求 key（IP/URL/Header）哈希\n   - 后端增删只影响少量 key（虚拟节点提高均衡性）\n   - 适合缓存类应用\n\n5. **P2C（Power of Two Choices）**：\n   - 随机选两个后端，选连接更少的那个\n   - 理论保证：比随机好、比 Least Connections 简单\n   - Envoy、Linkerd 默认使用\n\n6. **算法选择**：\n   - 无状态服务：RR/WRR\n   - 长连接：Least Connections\n   - 缓存：Consistent Hashing\n   - 全局负载均衡：P2C',
      ['P2C 是 Envoy 默认算法，兼顾性能和公平性', '一致性哈希适合缓存场景但增删节点有 rehash 成本'], ['load-balancing', 'algorithm']),

    q('design_network', 'medium', 'short_answer', 'mTLS 双向认证与证书管理',
      '详细说明 mTLS（双向 TLS）的工作原理。CA 证书链的验证过程。服务间证书的签发和轮换。Kubernetes 中 mTLS 的实现（Istio 的证书管理、SPIRE 的 SPIFFE 身份）。大规模证书管理的挑战和最佳实践。',
      'mTLS 详解：\n\n1. **单向 TLS vs mTLS**：\n   - TLS：Client 验证 Server 证书\n   - mTLS：Client 和 Server 互相验证\n\n2. **握手流程**：\n   - Client Hello → Server Hello + Server Certificate + Client Certificate Request\n   - Client → Client Certificate + Client CertificateVerify\n   - 双方验证对端证书是否由信任的 CA 签发\n\n3. **证书管理**：\n   - 短期证书（Istio 默认 24h 过期自动轮换）\n   - SPIFFE 标准身份格式：spiffe://cluster.local/ns/{ns}/sa/{sa}\n   - SPIRE Server 签发工作负载证书\n\n4. **K8s 实现**：\n   - Istio：Citadel（CA）→ 每个 Sidecar Envoy 获取证书\n   - Cilium：基于 mTLS 的身份验证\n   - Linkerd：控制平面 CA + 数据平面 mTLS\n\n5. **最佳实践**：\n   - 证书自动轮换（避免手动管理的死锁）\n   - 证书吊销（CRL/OCSP）\n   - 短期证书 + 自动轮换 = 无吊销需求',
      ['mTLS 让通信双方互相验证证书（零信任网络基础）', 'K8s Service Mesh 实现证书自动签发和轮换'], ['mtls', 'certificate', 'security']),

    q('design_network', 'hard', 'short_answer', 'BGP 在数据中心网络中的应用',
      '分析 BGP 在数据中心网络中的应用场景。Clos 网络架构（Spine-Leaf）中的 BGP underlay。BGP 的 ASN 规划、路由聚合和策略控制。对比 BGP 与 OSPF/IS-IS 在数据中心的适用性。BGP 的收敛优化和故障切换。',
      'BGP 数据中心：\n\n1. **Clos（Spine-Leaf）**：\n   - Leaf 交换机连接服务器\n   - Spine 交换机连接所有 Leaf（全连接）\n   - 任意 Leaf 到另一 Leaf 经过 ≤2 跳\n   - 水平扩展：增加 Spine 扩大带宽\n\n2. **BGP underlay**：\n   - Leaf 和 Spine 之间运行 eBGP\n   - 每个 Leaf 一个私有 ASN（64512-65535）\n   - Spine 使用同一个 ASN\n   - 优点：不需要 IGP 同步、策略控制灵活\n\n3. **BGP vs OSPF/IS-IS**：\n   - BGP：策略丰富、稳定性好、大规模成熟\n   - OSPF：配置简单、收敛快、但扩展性有限\n   - IS-IS：类似 OSPF、CLNS 协议、部分场景更优\n\n4. **优化**：\n   - **BFD**（Bidirectional Forwarding Detection）：毫秒级故障检测\n   - **收敛优化**：BGP PIC（Prefix Independent Convergence）\n   - **anycast**：多个 Leaf 宣告同一个 IP\n\n5. **BGP overlay**：\n   - EVPN VXLAN over BGP（数据中心主流）\n   - MP-BGP 承载路由 + MAC 地址信息',
      ['Spine-Leaf + eBGP 是现代数据中心网络标准架构', 'BFD + BGP PIC 实现亚秒级故障切换'], ['bgp', 'datacenter', 'clos']),

    q('design_network', 'medium', 'short_answer', 'HTTP/2 多路复用与队头阻塞',
      '深入分析 HTTP/2 的多路复用机制。HTTP/2 的 Stream、Frame、Message 三层结构。HTTP/2 在 TCP 层的队头阻塞问题（为什么 HTTP/2 还有 HOL？）。HPACK 头部压缩的原理。HTTP/2 的服务端推送（Server Push）。',
      'HTTP/2 详解：\n\n1. **三层结构**：\n   - **Stream**：一个连接内的双向字节流（对应一个 HTTP 请求/响应）\n   - **Frame**：Stream 中的数据单元（HEADERS/DATA/SETTINGS/PRIORITY 等）\n   - **Message**：一个完整的 HTTP 消息（由多个 Frame 组成）\n\n2. **多路复用**：\n   - 多个 Stream 在一个 TCP 连接上并发\n   - 避免了 HTTP/1.1 的队头阻塞（应用层）\n   - 但 **TCP 层 HOL 仍然存在**：TCP 丢包 → 所有 Stream 都等重传\n   - 这就是为什么 QUIC/HTTP/3 要解决的根本问题\n\n3. **HPACK 压缩**：\n   - 静态表：59 个常见 HTTP 头部（method: GET 等）\n   - 动态表：连接过程中动态学习\n   - Huffman 编码：减少 header 大小\n\n4. **Server Push**：\n   - 服务器预测客户端需要的资源\n   - PUSH_PROMISE frame 提前推送\n   - 浏览器缓存推送的资源\n   - 实际使用率不高（Chrome 已移除）',
      ['HTTP/2 多路复用解决了应用层 HOL 但 TCP 层 HOL 仍在', '这就是 QUIC/HTTP/3 的动力'], ['http2', 'multiplexing']),

    q('design_network', 'hard', 'short_answer', '网络虚拟化：VXLAN 与 Geneve 深度对比',
      '对比 VXLAN 和 Geneve 两种网络虚拟化封装协议。VXLAN 的 VTEP 架构和 24-bit VNI。Geneve 的可变长度 TLV option。Overlay 网络中 ARP 抑制和 BUM 流量优化。EVPN 控制平面如何替代 Flood-and-Learn。',
      'VXLAN vs Geneve：\n\n1. **VXLAN**：\n   - MAC in UDP 封装（外层 UDP 4789）\n   - 24-bit VNI（~1600 万租户）\n   - VTEP（VXLAN Tunnel Endpoint）封装/解封\n   - **局限**：固定头部、无扩展能力\n\n2. **Geneve**：\n   - 类似 VXLAN（MAC in UDP）\n   - **可变长度 TLV**：支持自定义 metadata\n   - 灵活扩展：安全上下文、时间戳等\n   - Linux 内核 5.0+ 原生支持\n\n3. **ARP 抑制**：\n   - Overlay 网络中的 ARP 广播会封装成多播\n   - 问题：多播在大规模网络中不可控\n   - **解决**：VTEP 学习 MAC-VNI 映射（ARP 抑制）\n\n4. **EVPN 控制平面**：\n   - 用 MP-BGP 替代 Flood-and-Learn\n   - Type-2（MAC/IP 路由）和 Type-3（IMET 多播路由）\n   - 控制平面通知 MAC 地址 → 入站端 VTEP 知道去哪里\n   - 消除 BUM 洪泛（除了首次）\n\n5. **部署**：\n   - VXLAN：成熟稳定，广泛部署\n   - Geneve：新部署的首选（灵活扩展性）',
      ['VXLAN 成熟稳定，Geneve 灵活可扩展（TLV）', 'EVPN 替代 Flood-and-Learn 解决大规模网络 BUM 问题'], ['vxlan', 'geneve', 'overlay']),

    q('design_network', 'medium', 'short_answer', '网络性能监控与可观测性',
      '讨论网络可观测性的关键指标和工具。四大黄金信号：延迟、流量、错误、饱和度。SNMP 和流量采样的局限。eBPF 如何实现无侵入的全量网络观测。网络拓扑自动发现。网络性能基线和告警策略。',
      '网络可观测性：\n\n1. **四大黄金信号**：\n   - **延迟**：RTT、TTFB、p50/p95/p99\n   - **流量**：带宽使用率、pps、连接数\n   - **错误**：丢包率、重传率、TCP reset\n   - **饱和度**：队列深度、CPU/内存使用\n\n2. **数据采集方式**：\n   - **SNMP**：传统方式、轮询采集、精度有限\n   - **NetFlow/sFlow**：采样、适合流量分析\n   - **eBPF**：内核级观测、零采样、全量数据\n   - **tcpdump/pcap**：完整抓包\n\n3. **eBPF 优势**：\n   - 内核级可编程观测\n   - 每秒百万包处理（零拷贝）\n   - 按需注入观测代码（无需重启）\n   - **Hubble**：Cilium 的 eBPF 网络观测\n\n4. **基线与告警**：\n   - 动态基线：基于历史数据自适应\n   - 告警规则：突增/突降/持续异常\n   - 告警风暴抑制：聚合、去重、升级\n\n5. **拓扑发现**：\n   - LLDP/CDP：链路层发现\n   - LLDP + eBPF：自动绘制网络拓扑',
      ['四大黄金信号：延迟、流量、错误、饱和度', 'eBPF 实现内核级零采样全量观测'], ['monitoring', 'observability', 'ebpf']),

    q('design_network', 'hard', 'short_answer', '服务网格数据面深度对比：Envoy vs Linkerd vs Cilium',
      '对比三大服务网格数据平面的架构和性能。Envoy 的 L4/L7 过滤器链机制、xDS 配置热更新。Linkerd 的 Rust 微代理和 miniminal 资源消耗。Cilium 基于 eBPF 的内核态数据面。性能基准：延迟/吞吐/资源占用。',
      '服务网格数据面对比：\n\n1. **Envoy（Istio）**：\n   - C++ 实现，功能最全面\n   - 过滤器链机制（Listener Filter → Network Filter → HTTP Filter）\n   - xDS 协议动态配置\n   - **资源消耗**：~30-50MB/实例，延迟增加 ~2-5ms\n\n2. **Linkerd-proxy**：\n   - Rust 实现（Tokio + Hyper）\n   - 功能精简（只做必要的事）\n   - 配置通过 Kubernetes CRD\n   - **资源消耗**：~10-15MB/实例，延迟增加 ~1-2ms\n\n3. **Cilium（eBPF）**：\n   - 内核态数据面（eBPF 程序挂载在 XDP/TC）\n   - L3/L4 策略零拷贝转发\n   - L7 通过 Envoy 代理\n   - **资源消耗**：~5-10MB/实例，L3/L4 几乎零延迟\n\n4. **性能对比**：\n   - **Latency p99**：Cilium（eBPF）< Linkerd < Envoy\n   - **CPU**：Envoy > Linkerd > Cilium\n   - **Memory**：Envoy > Cilium > Linkerd\n   - **功能完整度**：Envoy > Cilium > Linkerd\n\n5. **选择建议**：\n   - Envoy：需要丰富的 L7 能力（限流/熔断/重试）\n   - Linkerd：轻量、简单、低资源消耗\n   - Cilium：性能敏感、eBPF 优势场景',
      ['功能丰富度：Envoy > Cilium > Linkerd', '性能：Cilium > Linkerd > Envoy'], ['service-mesh', 'envoy', 'linkerd', 'cilium']),

    q('design_network', 'medium', 'short_answer', '网络故障排查方法论与工具链',
      '系统化的网络故障排查方法。从物理层到应用层的分层排查模型。各层常用工具：ping/mtr（网络层）、tcptraceroute/tcpdump（传输层）、curl/wget（应用层）。经典网络问题案例：MTU 问题、TCP 重传分析、DNS 污染、不对称路由。',
      '网络排障方法：\n\n1. **分层排查模型（OSI）**：\n   - **L1 物理**：网线/光模块/交换机端口指示灯\n   - **L2 数据链路**：ARP、MAC 表、VLAN\n   - **L3 网络**：ping、traceroute/mtr、路由表\n   - **L4 传输**：tcptraceroute、ss、netstat\n   - **L5-L7 应用**：curl、openssl s_client、HTTP 状态码\n\n2. **关键工具**：\n   - **ping**：连通性 + RTT + 丢包率\n   - **mtr**：逐跳延迟\n   - **tcpdump**：抓包分析\n   - **Wireshark**：协议级分析\n   - **ss/netstat**：套接字状态\n   - **curl -v**：HTTP 请求细节\n   - **openssl s_client**：TLS 握手\n\n3. **经典问题**：\n   - **MTU 问题**：ICMP Fragmentation Needed 被屏蔽 → 黑洞\n   - **TCP 重传**：tcpdump 分析重传模式\n   - **DNS 污染**：dig +trace vs HTTP DNS 结果对比\n   - **不对称路由**：mtr 正向 vs 反向路径不同\n\n4. **黄金命令**：\n   - 延迟问题：`mtr --report`\n   - 带宽问题：`iperf3 -c server`\n   - 抓包：`tcpdump -i eth0 host X and port 80 -w capture.pcap`',
      ['分层排查：物理→链路→网络→传输→应用', 'mtr 逐跳 > ping 整体，tcpdump 抓包 > 看计数器'], ['troubleshooting', 'network']),

    q('design_network', 'hard', 'short_answer', '零拷贝网络：DPDK 与 RDMA 原理',
      '讨论 DPDK 和 RDMA 的零拷贝网络技术。DPDK 如何绕过内核协议栈（UIO/VPF + 轮询模式驱动）。RDMA 的三种通道：Infiniband/iWARP/RoCEv2。零拷贝在 AI 分布式训练中的关键作用。DPDK 和 RDMA 的适用场景和运维成本。',
      '零拷贝网络：\n\n1. **DPDK**：\n   - **UIO（Userspace I/O）**：将设备映射到用户态\n   - **PMD（Poll Mode Driver）**：轮询替代中断\n   - 消除内核协议栈开销（中断、上下文切换、数据拷贝）\n   - 性能：10M+ pps（vs Linux 内核 ~1-2M pps）\n\n2. **RDMA**：\n   - **Infiniband**：专有硬件、最高性能\n   - **RoCEv2**：基于 UDP 的 RDMA（最广泛部署）\n   - **iWARP**：基于 TCP 的 RDMA\n   - 核心能力：内核旁路 + 零拷贝 + CPU 卸载\n\n3. **AI 训练中作用**：\n   - NCCL（NVIDIA Collective Communication Library）\n   - AllReduce 通信使用 RDMA\n   - 带宽越大、通信耗时越短（加速训练）\n   - GPUDirect RDMA：GPU 直接网卡通信（跳过 CPU）\n\n4. **运维成本**：\n   - DPDK：需要 CPU 隔离、大页内存配置、应用改造\n   - RDMA：需要 RoCE 交换机配置（PFC/ECN）\n   - 混合部署：DPDK + RDMA 共同使用时需协调\n\n5. **适用场景**：\n   - DPDK：NFV、vSwitch、防火墙、负载均衡\n   - RDMA：AI 分布式训练、HPC、高速存储（NVMe-oF）',
      ['DPDK 绕过内核协议栈（UIO + PMD）实现零拷贝', 'RDMA 在 AI 分布式训练中通过 NCCL 加速通信'], ['dpdk', 'rdma', 'zero-copy']),

    q('design_network', 'medium', 'short_answer', 'Kubernetes 网络模型与 CNI 实现',
      '说明 Kubernetes 网络模型的核心要求。CNI 的工作原理：ADD/DEL/CHECK 命令。主流 CNI 插件的网络方案对比：Flannel（VXLAN）、Calico（BGP）、Cilium（eBPF）、Weave。Pod 网络、Service 网络、Node 网络的关系。',
      'K8s 网络详解：\n\n1. **K8s 网络模型**：\n   - 所有 Pod 可以不经过 NAT 直接通信\n   - 所有 Node 可以不经过 NAT 和所有 Pod 通信\n   - Pod 看到自己的 IP = 别人看到它的 IP\n\n2. **CNI 原理**：\n   - kubelet → CNI 插件（ADD/DEL/CHECK）\n   - 创建 Pod → CNI 插件分配 IP + 配置网络\n   - 插件通过 stdin/stdout 接收/返回 JSON\n\n3. **CNI 对比**：\n   - **Flannel**：VXLAN overlay、简单但性能差\n   - **Calico**：BGP 直连路由（underlay），性能好\n   - **Cilium**：eBPF 实现，性能最优\n   - **Weave**：自己的 overlay 协议\n\n4. **三层网络**：\n   - **Pod 网络**：Pod IP（10.0.0.0/16 等）\n   - **Service 网络**：Cluster IP（10.96.0.0/12）\n   - **Node 网络**：物理节点 IP\n   - Service 到 Pod 通过 kube-proxy 或 eBPF 转发',
      ['K8s 网络模型核心：Pod IP 全网可见、无需 NAT', 'Calico BGP > Flannel VXLAN > Cilium eBPF 性能递增'], ['kubernetes', 'cni']),

    q('design_network', 'hard', 'short_answer', 'API 网关与 Ingress Controller 架构对比',
      '对比 API 网关和 Ingress Controller 的功能和架构。Ingress Controller（Nginx/Kong/AWS ALB）的工作原理。API 网关（Kong/Apisix/Tyk）的高级功能：限流、认证、转换、监控。Gateway API 规范（替代 Ingress v1）。',
      'API 网关 vs Ingress：\n\n1. **Ingress Controller**：\n   - K8s 原生资源（Ingress 对象定义规则）\n   - **Nginx Ingress**：基于 Nginx + Lua/Go\n   - **Kong Ingress**：基于 OpenResty + 插件\n   - **AWS ALB Ingress**：AWS 负载均衡器\n\n2. **API 网关**：\n   - 功能比 Ingress 丰富\n   - **Kong**：插件化架构（认证/限流/日志 200+ 插件）\n   - **Apisix**：高性能（基准 100k qps）、热加载\n   - **Tyk**：多协议（HTTP/gRPC/TCP/GraphQL）\n\n3. **Ingress vs 网关**：\n   - Ingress：L7 HTTP 路由（基础）\n   - 网关：路由 + 限流 + 熔断 + 重试 + 认证 + 转换 + 监控\n   - Ingress v1 有限，**Gateway API** 是下一代\n\n4. **Gateway API**：\n   - GatewayClass → Gateway → HTTPRoute/TCPRoute\n   - 多种后端：Service/HTTPRoute 映射\n   - 分区负责：基础设施团队创建 Gateway、应用团队创建 Route\n\n5. **选型建议**：\n   - 简单场景：Nginx Ingress\n   - 丰富功能：Kong/Apisix\n   - 云原生：Gateway API + 兼容实现',
      ['Ingress 做基础路由，API 网关做策略执行', 'Gateway API 正在替代 Ingress v1（关注/路由/后端三层）'], ['api-gateway', 'ingress']),

    q('design_network', 'medium', 'short_answer', 'TCP 状态机与 TIME_WAIT 优化',
      '详细说明 TCP 的状态转换。三次握手和四次挥手的状态变化。TIME_WAIT 存在的原因（2MSL 等待）。大量 TIME_WAIT 对服务器的影响。优化策略：tcp_tw_reuse、tcp_tw_recycle（已废弃）、SO_LINGER、长连接复用。',
      'TCP 状态机：\n\n1. **三次握手**：\n   - CLOSED → SYN_SENT → SYN_RCVD → ESTABLISHED\n\n2. **四次挥手**：\n   - FIN_WAIT_1 → FIN_WAIT_2（主动关闭方）\n   - CLOSE_WAIT → LAST_ACK（被动关闭方）\n   - TIME_WAIT（主动方收到 FIN 后）\n\n3. **TIME_WAIT**：\n   - 持续 2MSL（默认 60 秒，MSL=30s）\n   - **存在原因 1**：确保 ACK 不会被丢（被动方重发 FIN 时还能回 ACK）\n   - **存在原因 2**：防止旧连接的数据包干扰新连接\n   - 大量 TIME_WAIT 占用端口资源\n\n4. **优化策略**：\n   - **tcp_tw_reuse**（推荐）：主动方复用 TIME_WAIT 端口（出站连接）\n   - **tcp_tw_recycle**（已废弃）：对 NAT 有害，Linux 4.12 移除\n   - **SO_LINGER**：设置 0 则直接 RST（不等待，但可能丢数据）\n   - **长连接复用**：减少连接创建/销毁（HTTP Keepalive、连接池）\n\n5. **CLOSE_WAIT 问题**：\n   - 被动关闭方收到 FIN 后未关闭 → 大量 CLOSE_WAIT\n   - 通常代码没正确调用 close()',
      ['TIME_WAIT = 2MSL（默认 60s），确保 ACK 不丢', '大量 TIME_WAIT 用 tcp_tw_reuse + 连接池优化'], ['tcp', 'time-wait']),

    q('design_network', 'hard', 'short_answer', 'TCP 的 Nagle 算法与延迟确认',
      '分析 Nagle 算法和延迟确认（Delayed ACK）的交互问题。Nagle 算法对小包的聚合规则。延迟确认等待 200ms 发送 ACK 的机制。两者的「确认死锁」问题及解决。TCP_NODELAY 的使用时机和效果。',
      'Nagle & Delayed ACK：\n\n1. **Nagle 算法**：\n   - 规则：如果数据 < MSS 且还有未确认包 → 等待直到 ACK 回来或数据攒够 MSS\n   - 目的：减少小包数量（Telnet、SSH）\n   - 条件：`(已发送 - 已确认) > 0 && 待发数据 < MSS` → 等待\n\n2. **延迟确认（Delayed ACK）**：\n   - 不立即发 ACK（等待最多 200ms）\n   - 期待合并到响应数据中\n   - 如果 200ms 内没有数据 → 发送纯 ACK\n\n3. **交互死锁**：\n   - Nagle 等待 ACK 才能发数据\n   - Delayed ACK 等待数据才发 ACK\n   - 双方互相等待 → 死锁直到 200ms 超时\n   - **结果**：交互式应用延迟增加 200ms\n\n4. **解决**：\n   - **TCP_NODELAY**：禁用 Nagle（实时应用必设）\n   - TCP_QUICKACK：立即发 ACK\n   - 大多数应用服务器（Nginx、Redis）默认设 TCP_NODELAY\n\n5. **适用场景**：\n   - 大文件传输：Nagle 有益（减少包数）\n   - 实时交互（SSH、游戏、API）：设 TCP_NODELAY\n   - 批量传输 + 实时请求：设 TCP_NODELAY + 应用层攒批',
      ['Nagle + Delayed ACK 死锁导致 200ms 延迟', '实时应用一定要设 TCP_NODELAY（禁用 Nagle）'], ['tcp', 'nagle', 'delayed-ack']),

    q('design_network', 'hard', 'short_answer', 'QUIC 连接迁移与移动网络优化',
      '深入分析 QUIC 的连接迁移机制。Connection ID 的设计——如何通过多种 Connection ID 实现无感迁移。NAT 重绑定场景的处理。QUIC 在移动网络（WiFi↔5G 切换）中的表现。QUIC 迁移的多路径扩展（Multipath QUIC）。',
      'QUIC 连接迁移：\n\n1. **Connection ID（CID）**：\n   - Server 分配多个 Connection ID\n   - CID 不包含 IP/端口信息（纯标识符）\n   - 网络变化（IP/端口改变）→ 用相同 CID 继续通信\n   - 目标 CID 和源 CID 分离\n\n2. **迁移过程**：\n   - 网络切换 → 用新 IP 发送包（携带相同 CID）\n   - 服务器识别 CID → 更新连接 → 继续通信\n   - 接收 PATH_CHALLENGE/PATH_RESPONSE 验证新路径\n   - **无缝切换**：零中断\n\n3. **NAT 重绑定**：\n   - NAT 设备超时 → IP/端口变化\n   - QUIC 通过 CID 恢复（TCP 做不到）\n   - 无感恢复\n\n4. **移动网络效果**：\n   - WiFi→5G：TCP 重建需要 1-3 秒 + 新 TLS 握手\n   - QUIC：0 中断 + 0-RTT\n   - 弱网：多路径 QUIC 可以同时使用 WiFi + 蜂窝\n\n5. **Multipath QUIC**：\n   - 同时使用多条路径（WiFi + 蜂窝）\n   - 调度策略：冗余/最小 RTT/负载均衡\n   - 草案标准中',
      ['QUIC 通过 Connection ID 实现 IP 变化后无感迁移', '移动网络下 QUIC 比 TCP 快 1-3s（WiFi↔5G 切换实验'],

['quic', 'connection-migration', 'mobile']),

    q('design_network', 'medium', 'short_answer', 'TLS 1.3 握手协议与性能优化',
      '详细说明 TLS 1.3 的握手流程。相比 TLS 1.2 的改进——减少 RTT（1-RTT + 0-RTT）。TLS 1.3 只支持 5 个加密套件。PSK（Pre-Shared Key）会话恢复。TLS 1.3 的部署注意事项和兼容性。',
      'TLS 1.3 详解：\n\n1. **TLS 1.2 握手**：\n   - 2-RTT：ClientHello → ServerHello+Cert → ClientKeyExchange → Finished\n\n2. **TLS 1.3 握手**：\n   - **1-RTT**：ClientHello（KeyShare）→ ServerHello+Cert+Finish\n   - **0-RTT**：复用 PSK → 直接发数据\n   - 减少了 1-RTT\n\n3. **核心改进**：\n   - 移除不安全算法（RSA 密钥交换、RC4、3DES、CBC 模式）\n   - 5 个加密套件（全部 AEAD）\n   - 只有 1 个握手阶段（之前是 2 个）\n   - PSK + Ticket 机制实现会话恢复\n\n4. **0-RTT 安全风险**：\n   - 重放攻击（和 QUIC 0-RTT 相同问题）\n   - **解决**：幂等性保证 + 反重放窗口\n\n5. **部署**：\n   - OpenSSL 1.1.1+ 支持 TLS 1.3\n   - Nginx 1.15+ 支持\n   - CDN 厂商全面支持\n   - 浏览器全面支持（Chrome/Firefox/Safari）',
      ['TLS 1.3 握手 1-RTT（TLS 1.2 是 2-RTT）', '移除不安全算法 + 简化握手 = 更安全更快'], ['tls', 'tls13']),

    q('design_network', 'medium', 'short_answer', '网络 QoS 与流量控制',
      '讨论网络 QoS（服务质量）的实现机制。DiffServ 和 ToS 标记分类。流量整形（Shaper）、限速（Rate Limiter）、调度（Scheduler）算法。Token Bucket 和 Leaky Bucket 对比。在云原生环境中实现 Pod 级别的网络 QoS。',
      '网络 QoS：\n\n1. **DiffServ 模型**：\n   - **DSCP**（DiffServ Code Point）：IP 头部的 6-bit\n   - 分类：EF（加速转发）、AF（保证转发）、BE（尽力而为）\n   - 边缘路由器标记 → 核心路由器按标记处理\n\n2. **流量控制算法**：\n   - **Token Bucket**：允许突发（累积 token），平均速率限制\n   - **Leaky Bucket**：固定流出速率（平滑流量）\n   - **WRR（Weighted Round Robin）**：按权重分配带宽\n   - **HTB（Hierarchical Token Bucket）**：层级流量控制\n\n3. **K8s 网络 QoS**：\n   - Pod 的 resources.limits/requests CPU/内存\n   - 网络 QoS：CNI 插件实现（Cilium Bandwidth Manager）\n   - eBPF 实现 Pod 级别的带宽限制\n\n4. **Cilium Bandwidth Manager**：\n   - 基于 eBPF 的 EDT（Earliest Departure Time）\n   - 每个 Pod 独立限速\n   - 比传统 tc-tbf 更精确\n\n5. **拥塞管理**：\n   - AQM（Active Queue Management）：CoDel、fq_codel\n   - ECN（Explicit Congestion Notification）',
      ['Token Bucket 允许突发 vs Leaky Bucket 完全平滑', 'eBPF 实现 Pod 级别的精确网络 QoS'], ['qos', 'traffic-control']),

    q('design_network', 'hard', 'short_answer', '分布式一致性协议在 NFV 中的应用',
      '讨论 Raft/Paxos 在网络功能虚拟化（NFV）中的应用场景。控制面高可用——Kubernetes 网络控制面（Calico/Cilium）中的 Raft 架构。vRouter 配置同步的一致性保证。多数据中心网络控制器的一致性模型。',
      '分布式共识 NFV：\n\n1. **控制面 HA**：\n   - Calico：typha 组件连接 etcd（Raft）\n   - Cilium：KVStore（etcd/Consul）存储 Identity/Policy\n   - 控制面状态通过 Raft 复制\n\n2. **vRouter 配置同步**：\n   - vRouter（FRR/BIRD）配置一致性\n   - 多副本之间通过 Raft 同步路由策略\n   - 网络配置变更的线性一致性\n\n3. **一致性模型**：\n   - **强一致**：网络策略变更（限制性策略立刻生效）\n   - **最终一致**：路由传播（可以容忍短暂不一致）\n   - 按场景选择合适的一致级别\n\n4. **多数据中心**：\n   - 单 etcd：同机房 Raft\n   - 跨 DC：异步复制（AP 模式）\n   - Network Policy 在分区的行为\n\n5. **实践问题**：\n   - Raft leader 故障导致控制面不可用\n   - 网络分区下的策略僵局\n   - 大规模集群的 etcd 性能瓶颈',
      ['Calico/Cilium 控制面依赖 etcd/Consul 的 Raft 实现高可用', '网络策略变更需要强一致但路由传播可以最终一致'], ['raft', 'nfv', 'consensus']),

    q('design_network', 'medium', 'short_answer', 'Anycast 路由架构与应用',
      '分析 Anycast 路由的原理和应用场景。Anycast 通过 BGP 宣告相同 IP 实现。Anycast 在 DNS、CDN、DDoS 防护中的应用。Anycast 的路由问题——ECMP 哈希漂移和路由收敛。Anycast vs DNS GSLB 的对比。',
      'Anycast 详解：\n\n1. **原理**：\n   - 多个节点宣告相同 IP 前缀\n   - BGP 路由协议决定哪个节点响应\n   - 用户访问 → 最近的节点（AS 路径最短）\n\n2. **应用场景**：\n   - **DNS**：根 DNS 服务器（13 个 IP，实际数百节点）\n   - **CDN**：边缘节点通过 Anycast 接入\n   - **DDoS 防护**：流量分散到多个清洗节点\n\n3. **路由问题**：\n   - **ECMP 哈希漂移**：同源 IP 可能落在不同节点\n   - **路由收敛**：BGP 收敛慢（秒级）期间可能丢包\n   - **TCP 连接**：路由变化导致 TCP 连接断开（QUIC 可解决）\n\n4. **Anycast vs DNS GSLB**：\n   - Anycast：网络层调度（BGP 路由）\n   - GSLB：应用层调度（DNS 解析）\n   - Anycast 粒度粗（AS 路径最小），GSLB 细（用户地理位置）\n   - 两者可配合使用\n\n5. **设计考虑**：\n   - 每个节点可承载的总流量\n   - 故障切换时的流量再分配\n   - Anycast 节点间的会话保持',
      ['Anycast = 多地宣告同一 IP，BGP 路由决定归属', 'Anycast 适合无状态服务（DNS、DDoS 清洗）'], ['anycast', 'bgp']),

    q('design_network', 'hard', 'short_answer', 'ROS 网络分析：全链路延迟拆解',
      '详细的请求延迟分析方法。从客户端到服务端的完整延迟拆解模型。DNS 解析 + TCP 连接 + TLS 握手 + HTTP 请求/响应 + 首字节（TTFB）+ 内容下载。千兆/万兆网络下每毫秒能传多少数据。浏览器 RUM 和实验室测试（Lighthouse）的配合。',
      '全链路延迟：\n\n1. **延迟拆解**：\n   - **DNS**：~10-50ms（有缓存 0ms）\n   - **TCP 连接**：1-RTT（~10-100ms）\n   - **TLS 握手**：1-2 RTT（TLS 1.3 = 1 RTT）\n   - **HTTP 请求**：~1-10ms（取决于数据包往返）\n   - **服务端处理**：~1-1000ms（看业务复杂度）\n   - **TTFB**：连接 + 请求 + 处理 = 用户感知延迟\n   - **内容下载**：文件大小 / 带宽\n\n2. **带宽概念**：\n   - 千兆（1Gbps）：~125MB/s → 1MB 传 ~8ms\n   - 万兆（10Gbps）：~1.25GB/s → 1MB 传 ~0.8ms\n   - **TCP 慢启动**：初始窗口（initcwnd）10 段 ≈ 14KB\n\n3. **RUM vs Lab**：\n   - **RUM**（Real User Monitoring）：真实用户数据\n     - TTFB、FCP、LCP、CLS、INP\n     - 工具：Chrome UX Report、SpeedCurve\n   - **Lab**（实验室测试）：可控环境\n     - Lighthouse、WebPageTest\n     - 可复现、可调试\n\n4. **优化策略**：\n   - 缩短物理距离（CDN、边缘节点）\n   - 减少 RTT（HTTP/2 多路复用、TLS 1.3 0-RTT）\n   - 预连接（preconnect）\n   - 资源预加载（preload/prefetch）',
      ['TTFB = 连接 + 请求 + 处理 = 关键用户体验指标', '物理距离决定传播延迟底线（光速限制）'], ['latency', 'rum', 'optimization']),

    q('design_network', 'medium', 'short_answer', '容器网络接口（CNI）的带宽与安全策略',
      '讨论 CNI 插件的带宽限制和网络安全策略实现。Cilium 的 NetworkPolicy 与 bandwidth annotation。Calico 的 NetworkPolicy 与 eBPF XDP 加速。Pod 注解 kubernetes.io/ingress/egress-bandwidth。网络策略的规则匹配性能。',
      'CNI 策略：\n\n1. **带宽限制**：\n   - Pod annotation：`kubernetes.io/egress-bandwidth: 10M`\n   - Cilium：通过 eBPF EDT（Earliest Departure Time）\n   - Calico：通过 tc 过滤器\n   - 支持入站和出站限速\n\n2. **网络策略**：\n   - **CiliumNetworkPolicy**：\n     - 支持 L3/L4/L7\n     - 基于 Identity 而非 IP（策略简化）\n     - L7：HTTP/gRPC/Kafka/DNS 感知\n   - **Calico NetworkPolicy**：\n     - 支持优先级、Order 字段\n     - 策略匹配顺序\n     - 支持 deny 规则\n\n3. **性能**：\n   - iptables-based：规则数增加 → 延迟线性增加\n   - eBPF-based：策略匹配 O(1)（哈希表查找）\n   - 大规模集群（500+ 策略）差异显著\n\n4. **最佳实践**：\n   - 默认拒绝（Deny All）→ 按需允许\n   - 最小权限原则\n   - 使用 Namespace 级别的策略隔离环境',
      ['eBPF 策略匹配 O(1) vs iptables O(n)', '默认拒绝 + 最小权限是网络策略的最佳实践'], ['cni', 'network-policy']),

    q('design_network', 'hard', 'short_answer', '网络硬件卸载技术：SmartNIC 与 DPU',
      '讨论 SmartNIC 和 DPU（数据处理单元）的硬件卸载技术。硬件卸载的分类：TCP 卸载（TSO/GRO/LRO）、加密卸载（TLS/IPSec）、虚拟化卸载（OVS offload）。NVIDIA BlueField、Intel IPU、AWS Nitro 的架构对比。eBPF 在硬件卸载中的角色。',
      '硬件卸载：\n\n1. **卸载类型**：\n   - **TSO（TCP Segmentation Offload）**：网卡分割大 TCP 段\n   - **GRO（Generic Receive Offload）**：网卡合并小 TCP 段\n   - **GSO**：类似 TSO 但可 Software GSO\n   - **TLS 卸载**：TLS 加解密由网卡完成\n   - **IPSec 卸载**：IPSec 加解密由网卡完成\n\n2. **OVS 卸载**：\n   - Open vSwitch 数据面卸载到硬件\n   - 流表 → 硬件 TCAM\n   - 完全绕过主机 CPU\n\n3. **SmartNIC/DPU 对比**：\n   - **NVIDIA BlueField**：Arm 核心 + 网络加速 + 存储加速\n   - **Intel IPU**：FPGA-based 灵活编程\n   - **AWS Nitro**：专用硬件（不与客户争用）\n   - 共同点：CPU 卸载 + 可编程\n\n4. **eBPF 卸载**：\n   - eBPF 程序可编译为硬件指令\n   - XDP 程序卸载到网卡\n   - 在包到达驱动前处理\n\n5. **选型考虑**：\n   - 需要多少 CPU 卸载\n   - 可编程灵活性\n   - 厂商锁定风险',
      ['TSO/GRO/GSO 是最基本的网卡卸载能力', 'SmartNIC/DPU 将网络/存储/安全从 CPU 卸载到专用硬件'], ['smartnic', 'dpu', 'offload']),

    q('design_network', 'medium', 'short_answer', 'HTTP 缓存策略与 CDN 缓存控制',
      '全面分析 HTTP 缓存策略。强缓存（Expires/Cache-Control max-age）和协商缓存（ETag/Last-Modified）。CDN 缓存的控制：Cache-Control 的 s-maxage/private/public。缓存失效策略：key-based 和 purging。服务端 Cache-Control 配置的最佳实践。',
      'HTTP 缓存：\n\n1. **强缓存**：\n   - **Expires**：HTTP/1.0 绝对过期时间\n   - **Cache-Control: max-age=3600**：HTTP/1.1 相对过期时间\n   - 状态码 200（from disk/memory cache）\n\n2. **协商缓存**：\n   - **ETag**：文件 hash/版本号\n   - **Last-Modified**：文件最后修改时间\n   - 请求头：If-None-Match（ETag）/ If-Modified-Since（Last-Modified）\n   - 响应 304（Not Modified）→ 使用缓存\n\n3. **CDN 缓存**：\n   - **s-maxage**：CDN 缓存时间（覆盖 max-age）\n   - **public**：任何人可以缓存\n   - **private**：只缓存到浏览器\n   - **no-cache**：使用前必须验证（不是不缓存）\n   - **no-store**：永不缓存\n\n4. **缓存失效**：\n   - **key-based**：通过 URL 缓存（版本号/q 参数）\n   - **purge**：手动清除 CDN 缓存\n   - **时间到期**：TTL 到期自动失效\n\n5. **最佳实践**：\n   - 静态资源：长期缓存（immutable + content hash）\n   - HTML：no-cache（每次验证版本）\n   - API：max-age=0 + ETag',
      ['强缓存减少请求次数，协商缓存减少传输量', 'immutable + content hash = 静态资源最佳缓存策略'], ['http', 'caching', 'cdn']),

    q('design_network', 'hard', 'short_answer', '分布式追踪中的网络标签与上下文传播',
      '讨论分布式追踪中网络标签的采集和传播。W3C Trace-Context（traceparent/tracestate）HTTP 头的传播机制。eBPF 自动捕获网络流量中的 Trace ID。Istio/Envoy 的 OpenTelemetry 集成。网络延迟 vs 应用延迟的关联分析。',
      '分布式追踪：\n\n1. **W3C Trace-Context**：\n   - **traceparent**：00-{trace-id}-{parent-id}-{flags}（16-8-2 bytes）\n   - **tracestate**：厂商扩展信息（多平台兼容）\n   - 传播机制：HTTP Request → Response（通过 Header 传递）\n\n2. **eBPF 自动追踪**：\n   - 内核级捕获 HTTP 请求头\n   - 自动提取 Trace ID\n   - 关联网络包和 Trace Span\n   - 无侵入（不需要修改应用代码）\n\n3. **Envoy/Istio 集成**：\n   - Envoy 自动生成/转发 Trace Header\n   - 生成：入口 Sidecar 生成 Trace ID\n   - 转发：Header 传递到下游服务\n   - 每个 Envoy 生成 Network Span\n\n4. **关联分析**：\n   - 网络延迟（Network Span）= 发送 + 传输 + 接收\n   - 应用延迟（Application Span）= 业务处理\n   - 延迟分解：是网络问题还是应用问题\n\n5. **工具**：\n   - Jaeger / Tempo / Zipkin\n   - OpenTelemetry SDK + Collector\n   - 数据采样策略（头部采样/尾部采样）',
      ['W3C Trace-Context 是分布式追踪 Header 的标准', 'eBPF 自动捕获 Trace ID 实现无侵入网络追踪'], ['distributed-tracing', 'opentelemetry']),

    q('design_network', 'medium', 'short_answer', 'TCP BBR 的 ProbeBW 与 ProbeRTT 调参',
      '深入 BBR 的两个核心阶段：ProbeBW（带宽探测）和 ProbeRTT（RTT 探测）。ProbeBW 的增益系数和周期。ProbeRTT 的降速间隔和时长。BBRv2 和 BBRv3 的改进。实际部署中 BBR 参数的调整经验。',
      'BBR 阶段调参：\n\n1. **ProbeBW 阶段**：\n   - 占 BBR 时间 ~98%\n   - 周期性地升速到 1.25x BtlBw（探测更多带宽）\n   - 然后降到 0.75x BtlBw（排空队列）\n   - CYCLE_LEN：8 轮（4 轮升速 + 4 轮降速）≈ 几秒\n\n2. **ProbeRTT 阶段**：\n   - 每 10 秒进入一次\n   - cwnd 降到 4 个段（~6KB）\n   - 持续至少 200ms 或一个 RTT\n   - 目的：排空队列，测量真实的 RTprop\n\n3. **BBRv2**：\n   - 增加 ECN 信号（处理与 CUBIC 共存的不公平性）\n   - BBRv1 与 CUBIC 共存时 BBR 可能占太多带宽\n   - v2：检测 CUBIC 流的存在 → 共享带宽\n\n4. **BBRv3**：\n   - 进一步改进公平性\n   - 改进 Wi-Fi 场景下的性能\n\n5. **调参建议**：\n   - 默认参数在大部分场景最优\n   - 长肥网络：提升初始 cwnd\n   - 无线网络：调整 ProbeRTT 间隔避免频繁降速',
      ['BBR 大部分时间在 ProbeBW（~98%），定期 ProbeRTT（每 10s）', 'BBRv2 改进了与 CUBIC 共存时的公平性'], ['bbr', 'congestion-control']),

    q('design_network', 'hard', 'short_answer', '软件定义网络（SDN）与网络自动化',
      '讨论 SDN 的架构演进。OpenFlow 协议的控制面和数据面分离。从 OpenFlow 到 NETCONF/YANG 的配置管理演进。网络自动化工具链：Ansible/Terraform 网络模块、NAPALM。意图驱动网络（IBN）的概念和实现。',
      'SDN 与自动化：\n\n1. **OpenFlow**：\n   - 控制面（Controller）和数面分离\n   - 流表匹配 → 动作执行\n   - 局限：粒度太细、硬件兼容性差\n\n2. **NETCONF/YANG**：\n   - **NETCONF**：基于 XML-RPC 的网络配置协议\n   - **YANG**：数据建模语言（定义配置的数据结构）\n   - 替代 CLI 和 SNMP 的配置管理方式\n   - 事务性配置（commit/rollback）\n\n3. **自动化工具**：\n   - **Ansible**：Playbook 驱动、模板化的网络配置\n   - **Terraform**：声明式基础设施即代码\n   - **NAPALM**：多厂商统一 API 层\n   - **gNMI**：gRPC Network Management Interface\n\n4. **CI/CD for Network**：\n   - 配置变更 → Code Review → Testing → Deploy\n   - 预检（syntax check、diff review）\n   - 变更审批流\n\n5. **意图驱动网络（IBN）**：\n   - 声明式意图 → 自动翻译为配置\n   - 持续验证网络状态符合意图\n   - Cisco SDA、Apstra',
      ['OpenFlow 控制面/数面分离是 SDN 起点', 'NETCONF/YANG + CI/CD 是现代网络自动化标准'], ['sdn', 'automation']),

    q('design_network', 'medium', 'short_answer', 'HTTP/3 的 WebTransport 与 WebCodecs',
      '讨论 HTTP/3 和 WebTransport 在实时音视频传输中的应用。WebCodecs 的低延迟编解码接口。WebTransport 的 Datagram 用于音视频数据。WebTransport 的 Unidirectional/Bidirectional Stream。与 WebRTC 的对比和互补关系。',
      'WebTransport 音视频：\n\n1. **WebCodecs**：\n   - 浏览器底层编码/解码接口\n   - 直接控制编码器（H.264/AV1/VP9）\n   - 绕过 MediaStream 的抽象层\n\n2. **WebTransport 传输**：\n   - **Datagram**：音视频数据（允许丢包）\n   - **Unidirectional Stream**：元数据/控制信令\n   - **Bidirectional Stream**：双向控制\n\n3. **WebTransport vs WebRTC**：\n   - WebRTC：为实时通信设计（音视频优化）\n     - ICE/STUN/TURN 连接建立复杂\n     - 捆绑了编解码和传输\n   - WebTransport + WebCodecs：\n     - 更低延迟（QUIC）\n     - 解耦传输和编解码\n     - 更灵活的控制\n\n4. **应用场景**：\n   - 云游戏（低延迟视频帧）\n   - 直播（自定义拥塞控制）\n   - AI 实时推理（视频流）\n\n5. **现状**：\n   - WebCodecs：Chrome/Edge 支持\n   - WebTransport：Chrome 支持\n   - Safari 支持较慢',
      ['WebTransport + WebCodecs 解耦传输和音视频编解码', '相比 WebRTC 更低延迟、更灵活'], ['http3', 'webtransport', 'video']),

    q('design_network', 'medium', 'short_answer', 'IP 隧道技术：GRE、IPIP、WireGuard',
      '对比各种 IP 隧道技术的原理和应用场景。GRE（Generic Routing Encapsulation）的简单封装。IPIP 的轻量隧道。WireGuard 的加密隧道设计——内核级、噪音协议握手。Overlay 网络中隧道协议的选择。',
      'IP 隧道：\n\n1. **GRE**：\n   - IP 协议 47\n   - 封装任意协议（不限于 IP）\n   - 头部 4-20 bytes\n   - 无加密（可配合 IPSec）\n\n2. **IPIP**：\n   - IP 协议 4\n   - 简单：外层 IP + 内层 IP\n   - 4 bytes 开销\n   - 最轻量\n\n3. **WireGuard**：\n   - UDP 封装（监听单端口）\n   - 内核级实现\n   - Noise 协议握手（1-RTT）\n   - 内建加密（ChaCha20 + Poly1305）\n   - 密钥管理简单（公私钥对）\n\n4. **性能对比**：\n   - IPIP：最低开销、无加密\n   - GRE：更多开销、支持更多协议\n   - WireGuard：加密开销低、性能远超 OpenVPN\n\n5. **选型**：\n   - K8s 跨集群通信：IPIP/GRE（配合 Calico）\n   - 安全通道：WireGuard\n   - MPLS/多协议环境：GRE',
      ['GRE 和 IPIP 是简单封装隧道，WireGuard 是加密隧道', 'WireGuard 性能远超 OpenVPN（内核级 + Noise 协议）'], ['tunnel', 'wireguard', 'gre']),

    q('design_network', 'hard', 'short_answer', 'DNS 安全：DNSSEC、CAA 与 DANE',
      '分析 DNS 安全机制。DNSSEC 的数字签名链——从根密钥到区域签名的信任链。CAA 记录限制 CA 签发证书。DANE（TLSA 记录）将证书绑定到 DNS。DNS 劫持和缓存投毒的防御。部署 DNSSEC 的挑战。',
      'DNS 安全：\n\n1. **DNSSEC**：\n   - 核心机制：数字签名（RSA/ECDSA）\n   - 信任链：根 KSK → TLD ZSK → 域 KSK → 域 ZSK\n   - DS（Delegation Signer）记录连接信任链\n   - RRSIG 签名记录\n   - DNSKEY 包含公钥\n\n2. **CAA（Certification Authority Authorization）**：\n   - DNS 记录说明「哪些 CA 可以给本域名签发证书」\n   - 防止 CA 误签发\n   - Google 等 CA 强制检查\n\n3. **DANE（TLSA）**：\n   - TLSA 记录绑定证书到域名\n   - 不依赖 CA 信任体系\n   - 需要 DNSSEC 保护\n\n4. **攻击防御**：\n   - DNS 缓存投毒 → DNSSEC 验证\n   - DNS 劫持 → DoH/DoT 加密\n   - NXDOMAIN 劫持 → 验证\n\n5. **部署挑战**：\n   - DNSSEC：配置复杂、密钥轮换\n   - DNSSEC 验证未广泛部署（部分 ISP 不支持）\n   - DoH/DoT 部署门槛低',
      ['DNSSEC 建立签名链保护 DNS 完整性', 'DoH/DoT 加密 DNS 查询保护隐私和防劫持'], ['dns', 'security', 'dnssec']),

    q('design_network', 'medium', 'short_answer', 'Modern HTTP 连接管理与连接池',
      '分析 HTTP/1.1、HTTP/2、HTTP/3 的连接管理策略。HTTP/1.1 的 Keepalive 和 Domain Sharding。HTTP/2 的连接复用和 Stream 优先级（Weight/Dependency）。HTTP/3 的 QUIC 连接迁移。客户端和服务端的连接池配置。',
      'HTTP 连接管理：\n\n1. **HTTP/1.1**：\n   - Keepalive（Connection: keep-alive）\n   - 浏览器限制：每域名 6-8 个连接\n   - Domain Sharding：拆分到多个域名绕过限制\n   - 连接池：最小/最大连接、空闲超时\n\n2. **HTTP/2**：\n   - 单连接多 Stream\n   - **Stream 优先级**：\n     - 依赖关系（Stream B depends on Stream A）\n     - 权重（1-256，决定比例）\n   - 浏览器限制：单连接\n\n3. **HTTP/3**：\n   - QUIC 连接（UDP）\n   - 无 TCP 连接限制\n   - 连接迁移\n\n4. **连接池配置**：\n   - **MaxConnections**：硬限制\n   - **MaxIdleTime**：空闲保活\n   - **TTL**：连接最大寿命（避免长时间连接不稳定）\n   - **Circuit Breaker**：错误率过高断开\n\n5. **实战建议**：\n   - HTTP/2 不需要 Domain Sharding\n   - 客户端连接池用 H2 单连接复用\n   - 服务端连接池根据后端延迟和 QPS 配置',
      ['HTTP/2 单连接复用（不需要 Domain Sharding）', 'Stream 优先级通过 Dependency + Weight 实现'], ['http', 'connection-pool']),
]

def main():
    path = os.path.join(os.path.dirname(__file__), 'design_network.json')
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
    print(f'Total design_network questions: {len(data)}')

if __name__ == '__main__':
    main()
