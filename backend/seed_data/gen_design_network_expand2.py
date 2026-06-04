#!/usr/bin/env python3
"""Expand design_network.json from 40 to ~50 questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('design_network', 'hard', '问答', 'QUIC 传输协议与 TCP+TLS 的深入对比',
      '深入对比 QUIC（HTTP/3 传输层）与 TCP+TLS（HTTP/2 传输层）的详细差异。QUIC 基于 UDP 的实现如何解决 TCP 的队头阻塞（HOL Blocking）问题。0-RTT 连接建立、连接迁移、多路复用的底层实现。QUIC 的拥塞控制可插拔设计。',
      'QUIC vs TCP+TLS：\n\n1. **连接建立**：\n   - TCP + TLS 1.3：1-RTT（首次），0-RTT（复用）\n   - QUIC：0-RTT 首次连接即可发送数据\n   - QUIC 将加密握手集成到传输层（减少一次 RTT）\n\n2. **队头阻塞**：\n   - TCP：一个丢失的包阻塞整个连接的所有流\n   - QUIC：流级独立——一个流的丢包不影响其他流\n   - HTTP/2 的 HOL：TCP 层 HOL 仍存在（即使 HTTP/2 解决了应用层 HOL）\n   - QUIC 彻底消除传输层 HOL\n\n3. **连接迁移**：\n   - TCP：IP 变化 → 连接断开（WiFi → 5G 切换需要重连）\n   - QUIC：Connection ID 唯一标识连接 → IP 变化不影响\n   - 移动端体验大幅提升\n\n4. **拥塞控制**：\n   - TCP：拥塞控制在内核，更新困难\n   - QUIC：拥塞控制在用户态应用层\n   - QUIC 可自由切换算法（NewReno/CUBIC/BBR）\n   - 新算法可以快速迭代（APP 更新即可）\n\n5. **性能对比**：\n   - 弱网环境：QUIC 比 TCP+TLS 好 15-30%\n   - 连接迁移：QUIC 零中断 vs TCP 重建需要 1-3s\n   - CPU 开销：QUIC 高于 TCP（用户态处理 + 加密开销）',
      ['QUIC 核心优势：0-RTT、无 HOL 阻塞、连接迁移', 'TCP 拥塞控制在内核 vs QUIC 在用户态——QUIC 迭代更快', 'QUIC CPU 开销高于 TCP，但弱网性能更好'], ['quic', 'tcp', 'comparison']),

    q('design_network', 'hard', '问答', 'eBPF 在云原生网络中的深度应用',
      '深入分析 eBPF（Extended Berkeley Packet Filter）在云原生网络中的应用。Cilium 如何利用 eBPF 替代 kube-proxy 实现 Service 负载均衡？eBPF 的 XDP（eXpress Data Path）和 TC（Traffic Control）hook 点。eBPF 的网络可观测性——Bandwidth Manager、Flow 可视化。',
      'eBPF 云原生网络：\n\n1. **Cilium Service 替代 kube-proxy**：\n   - eBPF 在 XDP/TC 层直接处理 Service 转发\n   - 不需要 iptables 规则遍历（O(n) → O(1)）\n   - 性能提升：延迟降低 50-70%，吞吐提升 2-3x\n   - 支持 ClusterIP、NodePort、LoadBalancer\n\n2. **XDP vs TC hook**：\n   - **XDP**：在网卡驱动层（最早的 BPF 程序），零拷贝\n   - **TC**：在内核协议栈 ingress/egress\n   - XDP 适合 DDoS 防护和高速转发\n   - TC 适合更复杂的流量处理\n\n3. **网络可观测性**：\n   - **Hubble**：基于 eBPF 的 flow 可视化\n   - 完整记录：源/目的 IP、协议、TCP 标志位、DNS 请求\n   - 实时监控 + 历史查询\n   - 无侵入（无需 sidecar、无需应用修改）\n\n4. **Bandwidth Manager**：\n   - eBPF 实现带宽限制（替代 tc-tbf）\n   - Pod 级别的精细限速\n   - 配合 CNI 实现网络 QoS\n\n5. **安全性**：\n   - eBPF 实现网络策略（identity-aware）\n   - DNS-aware 策略（基于域名允许/拒绝）\n   - L7 协议感知（HTTP/gRPC/Kafka）',
      ['Cilium 用 eBPF 替代 kube-proxy 实现高性能 Service 转发', 'XDP（驱动层零拷贝）vs TC（协议栈层更灵活）', 'Hubble 基于 eBPF 实现无侵入的网络可观测性'], ['ebpf', 'cilium', 'cloud-native']),

    q('design_network', 'hard', '问答', 'Envoy xDS 协议详解与控制平面设计',
      '详细说明 Envoy 的 xDS（Discovery Service）协议族。CDS/LDS/RDS/EDS/ScDS/SDS 各自的作用和工作流程。xDS 的 gRPC 流式推送机制——SotW（State of the World）和 Incremental（增量）两种模式。控制平面（Istio Pilot/Envoy Control Plane）的设计模式。',
      'Envoy xDS 协议：\n\n1. **xDS 协议族**：\n   - **LDS**（Listener）：监听端口 → 接收连接\n   - **RDS**（Route）：HTTP 路由规则（域名/路径匹配）\n   - **CDS**（Cluster）：后端服务集群定义\n   - **EDS**（Endpoint）：集群的具体端点（IP+端口）\n   - **SDS**（Secret）：TLS 证书动态下发\n   - **ScDS**（Scoped Route）：作用域路由\n\n2. **推送模式**：\n   - **SotW（State of the World）**：每次推送全量配置\n   - **Incremental（Delta）**：只推送变更部分\n   - 默认 SotW，Envoy 1.19+ 支持 Delta\n   - 增量模式适合大规模配置变更（减少推送量）\n\n3. **配置传播流程**：\n   - 控制平面（Pilot）→ 通过 gRPC stream 推送 xDS\n   - Envoy 接收 → 热更新配置 → 新连接使用新配置\n   - 旧连接按原有配置处理直至结束\n\n4. **控制平面设计**：\n   - **Aggregated xDS（ADS）**：统一 xDS 通道避免顺序问题\n   - 配置生成：K8s 资源 → xDS 转换 → 下发\n   - 性能：大规模集群下需要分 namespace/region 下发\n\n5. **高级特性**：\n   - EDS 端点健康检查（主动/被动）\n   - 区域感知路由（Zone Aware Routing）\n   - 按权重/元数据的端点选择',
      ['xDS 协议族：LDS/RDS/CDS/EDS/SDS 各司其职', 'SotW（全量）vs Incremental（增量）——大规模集群用增量', 'ADS 统一 xDS 通道解决配置顺序依赖问题'], ['envoy', 'xds', 'service-mesh']),

    q('design_network', 'hard', '问答', 'SRv6 网络编程与分段路由',
      '介绍 SRv6（Segment Routing over IPv6）网络编程技术。SRv6 的基本原理——通过 IPv6 扩展头中插入 Segment List 实现路径编程。SRv6 与 MPLS 的对比——简化网络协议栈。SRv6 在云网络、5G 承载中的典型应用。',
      'SRv6 网络编程：\n\n1. **基本原理**：\n   - **Segment**：网络路径中的一段（节点或链路）\n   - **Segment List**：IPv6 的 Routing Extension Header 中的有序段列表\n   - **SRH（Segment Routing Header）**：携带 Segment List\n   - 源节点指定完整的转发路径（源路由）\n\n2. **工作模式**：\n   - **SRv6 BE（Best Effort）**：普通 IPv6 转发，不携带 SRH\n   - **SRv6 TE（Traffic Engineering）**：携带 SRH 显式指定路径\n   - **SRv6 VPN**：基于 SRv6 的 L3VPN 实现\n\n3. **SRv6 vs MPLS**：\n   - MPLS 需要额外的标签协议（LDP/RSVP-TE）\n   - SRv6 原生 IPv6，不需要额外信令协议\n   - MPLS 标签空间有限（20 bit），SRv6 无此限制\n   - SRv6 减少网络协议复杂度\n\n4. **应用场景**：\n   - **云网络**：跨 DC 流量调优、SLA 保障\n   - **5G 承载**：网络切片、低延迟路径\n   - **服务链**：流量按顺序经过指定服务节点',
      ['SRv6 用 IPv6 SRH 扩展头实现源路由路径编程', '不需要 MPLS 的额外信令协议（更简单）', '适合跨 DC 流量调优和网络切片场景'], ['srv6', 'segment-routing']),

    q('design_network', 'hard', '问答', '网络延迟的精确定位与优化方法',
      '系统化分析方法论：延迟的类型（传输延迟、传播延迟、处理延迟、队列延迟）及其物理限制。如何通过工具链精确定位延迟瓶颈？traceroute/mtr（路径延迟）、tcpdump/Wireshark（逐包分析）、eBPF 延迟追踪。优化的定量评估方法（A/B 测试 + 统计显著性）。',
      '网络延迟分析：\n\n1. **延迟分解**：\n   - **传输延迟**（Serialization）：数据大小 / 带宽（100Gbps 下 1KB ≈ 0.08μs）\n   - **传播延迟**（Propagation）：距离 / 光速（光纤 ≈ 2/3 光速）\n     - 北京到上海：约 10ms\n     - 北京到纽约：约 60ms\n   - **处理延迟**（Processing）：设备转发能力\n   - **队列延迟**（Queuing）：拥塞时的缓冲区排队\n\n2. **定位工具**：\n   - **mtr**：逐跳延迟 + 丢包率\n   - **tcpdump**：抓包分析每段延迟\n   - **eBPF 延迟追踪**：内核级别的延迟函数追踪\n   - **HTTP 请求分析**：RUM 数据中 TTFB/DNS/SSL/TCP 分段\n\n3. **优化方法论**：\n   - 量化当前延迟 → 分解延迟 → 识别瓶颈 → 优化 → 验证\n   - 传输延迟：升级带宽、压缩数据\n   - 传播延迟：CDN/边缘节点靠近用户\n   - 队列延迟：AQM（CoDel、fq_codel）、BBR\n   - 处理延迟：硬件卸载（TLS/HTTP）、多核优化\n\n4. **验证方法**：\n   - 优化前后的统计对比（置信区间、p-value）\n   - 控制变量：同时只改一个因素\n   - 持续监控：延迟 SLO 告警',
      ['传播延迟受物理极限约束（无法突破光速）', '延迟优化需要先分解定位瓶颈再针对优化', 'BBR 拥塞控制算法对队列延迟改善显著'], ['latency', 'optimization']),

    q('design_network', 'medium', '问答', 'HTTP/3 0-RTT 连接建立的原理与安全',
      '深入解释 HTTP/3 的 0-RTT 连接建立过程。0-RTT 如何实现首次请求就携带数据的？0-RTT 的安全风险——重放攻击（Replay Attack）。QUIC 和 TLS 1.3 的 Early Data 机制。如何在启用 0-RTT 的同时防范重放攻击？',
      'HTTP/3 0-RTT：\n\n1. **0-RTT 流程**：\n   - 首次连接：Client Hello → Server Hello + 证书 → 完成（1-RTT）\n   - **后续连接**：客户端缓存 Server 参数 → 直接发送 Early Data（0-RTT）\n   - Early Data 在第一个包中就携带请求数据\n   - Session Ticket 实现会话恢复\n\n2. **TLS 1.3 Early Data**：\n   - 服务器发送 `max_early_data_size` 限制 0-RTT 数据量\n   - 客户端在 Session Ticket 有效期内使用 0-RTT\n   - Ticket 过期后回退到 1-RTT\n\n3. **重放攻击**：\n   - **风险**：攻击者截获 0-RTT 包 → 重放给服务器\n   - 服务器对 0-RTT 请求无法区分是否重放\n   - **高风险场景**：转账、订单等需要幂等的操作\n\n4. **防护策略**：\n   - 服务器端 0-RTT 限速（只接受有限的 0-RTT 请求）\n   - **幂等设计**：用 0-RTT 只发送 GET/HEAD 等幂等请求\n   - **反重放窗口**：跟踪 ClientHello 的随机数，拒绝重复\n   - **Freshness Check**：检查 0-RTT 的时间戳（过期拒绝）\n\n5. **实践建议**：\n   - 0-RTT 适合：资源加载、页面预加载\n   - 0-RTT 不适合：非幂等的写操作\n   - CDN 场景强烈推荐（大量重复资源请求）\n   - 使用 0-RTT 时需要进行幂等语义保证',
      ['0-RTT 首次发送 Early Data 节省完整 RTT', '重放攻击是 0-RTT 的主要安全威胁', '幂等操作 + 反重放窗口是标准防护手段'], ['http3', '0rtt']),

    q('design_network', 'medium', '问答', 'CDN 动态加速（DCDN）架构',
      '介绍 CDN 动态加速（Dynamic CDN / DCDN）的技术原理。相比静态加速缓存策略，动态加速通过路由优化解决什么核心问题？动态加速的 Key 技术：智能 DNS 调度、动态路由探测（A/B Testing）、私有传输协议优化（TCP 优化/私有 UDP）。',
      'CDN 动态加速：\n\n1. **核心问题**：\n   - 静态加速：缓存 → 降低回源\n   - **动态加速**：动态内容不可缓存（API、个性化页面）\n   - **关键挑战**：公网传输的不稳定性（丢包、延迟抖动）\n\n2. **智能路由优化**：\n   - 节点间建立优化的私有网络（全网状探测）\n   - 实时探测各路径延迟和丢包率\n   - 动态选择最优路径（避开拥堵链路）\n   - 类似 WAF 的 Anycast + 动态路由\n\n3. **传输优化**：\n   - **TCP 优化**：优化拥塞控制算法、初始窗口、快速重传\n   - **私有传输协议**：基于 UDP 的优化协议（类似 QUIC 但不完全一致）\n   - **连接复用**：后端连接池、长连接保持\n   - **0-RTT**：减少连接建立时间\n\n4. **典型效果**：\n   - 跨国动态请求延迟降低 30-50%\n   - 弱网环境下丢包率降低 80%\n   - 首字节时间改善显著（TCP 优化 + 路由优化）\n\n5. **架构组件**：\n   - **L1 边缘节点**：接入层 + 传输优化\n   - **L2 中间层节点**：路由决策 + 路径优化\n   - **专用回源链路**：优化的骨干网/专线',
      ['DCDN 解决的核心问题：公网传输的不稳定性', '智能路由探测 + TCP 优化 + 私有协议 = DCDN 三大支柱', '跨国场景 DCDN 效果最显著（延迟降低 30-50%）'], ['cdn', 'dcdn']),

    q('design_network', 'hard', '问答', 'Cilium 网络策略引擎与 Identity 机制',
      '深入分析 Cilium 的网络策略模型。基于 Identity（身份）的安全策略——Cilium 如何通过 eBPF 实现身份感知的 L3/L4/L7 网络策略？Identity 的分配和传播机制。Clusterwide Network Policy 和 CiliumNetworkPolicy 的类型。DNS 感知策略的实现。',
      'Cilium 网络策略：\n\n1. **Identity 机制**：\n   - 每个 Pod/Endpoint 被分配一个 16-bit 的 Security Identity\n   - Identity 基于标签（Label）生成：相同 label 的 Pod 共享 Identity\n   - Identity 通过 KV 存储传播到所有节点\n   - eBPF map 存储 Identity → 策略映射\n\n2. **策略类型**：\n   - **Ingress/Egress**：入站/出站规则\n   - **L3/L4**：IP/CIDR/端口级别的规则\n   - **L7**：HTTP 方法、路径、gRPC 服务名\n   - **DNS**：基于域名的策略（egress 只能访问特定域名）\n\n3. **L7 策略实现**：\n   - Envoy 作为 L7 代理\n   - Cilium 将网络策略翻译为 Envoy 配置\n   - HTTP URL 匹配、Header 匹配、Method 限制\n   - API 调用粒度的精细化控制\n\n4. **DNS 感知策略**：\n   - cilium-dns 代理 DNS 请求\n   - 在 eBPF map 中缓存 DNS 响应\n   - 策略允许基于域名（FQDN）的出站规则\n   - 自动 DNS TTL 刷新\n\n5. **性能特点**：\n   - 相比 iptables：策略匹配 O(1) vs O(n)\n   - L3/L4 策略：零开销（纯 eBPF 内核态）\n   - L7 策略：Envoy 代理开销',
      ['Identity 基于 Label 生成，相同的 label 共享身份', 'L3/L4 策略纯 eBPF 内核态执行（零额外开销）', 'L7 策略通过 Envoy 实现，支持 HTTP/gRPC/DNS 协议'], ['cilium', 'network-policy']),

    q('design_network', 'hard', '问答', '全球流量管理与故障切换的 GTM 架构',
      '设计一个全球流量管理（Global Traffic Manager）系统。DNS GSLB（全局负载均衡）的实现原理——基于 DNS 响应中返回不同的 IP 实现地域调度。健康检查与自动故障切换的策略。多活和主备场景下的流量调度策略。',
      '全球流量管理：\n\n1. **DNS GSLB 原理**：\n   - 权威 DNS 根据请求者 IP（edns-client-subnet）返回最佳站点 IP\n   - 基于地域、延迟、健康状态、权重等因素\n   - 典型返回：北美用户 → us-east 站点、欧洲用户 → eu-west 站点\n\n2. **健康检查**：\n   - 定期对站点进行 HTTP/TCP/ICMP 探测\n   - 主动探测 + 被动监控\n   - 站点不可用 → 从 DNS 响应中移除\n   - **故障切换（Failover）**：主站点故障 → DNS 切换到备站点\n\n3. **流量调度策略**：\n   - **性能优先**：总是返回当前延迟最低的站点\n   - **地域就近**：返回离用户最近的站点\n   - **权重分配**：按比例分配流量到多个站点\n   - **主备切换**：主站点通过健康检查时一直返回主站点\n\n4. **多活架构**：\n   - 多站点同时提供服务\n   - DNS 解析返回多个 IP（顺序随机）\n   - 每个站点处理部分用户流量\n   - 故障时流量自动分配到其他站点\n\n5. **挑战与优化**：\n   - DNS 缓存导致切换延迟（TTL 控制）\n   - **解决**：降低 TTL（30-60s）结合 HTTP 重定向\n   - Anycast 路由可配合 DNS GSLB 使用\n   - 基于客户端实时探测的路由决策',
      ['DNS GSLB 基于 edns-client-subnet 实现地域感知调度', '健康检查 + 自动故障切换保证服务可用性', '低 TTL + HTTP 重定向解决 DNS 缓存导致的切换延迟'], ['gtm', 'global-traffic']),
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
