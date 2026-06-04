#!/usr/bin/env python3
"""Supplement design_network.json from 82 to 100+ questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    # 1 - CDN origin pull / cache key design (unique angle: origin shield, coalescing, cache key)
    q('design_network', 'medium', 'short_answer',
      'CDN 回源链路与源站保护机制',
      '请详细介绍 CDN 的回源链路组成和 Origin Shield 的作用。回源合并如何工作？缓存预热和突发回源问题如何解决？Cache Key 应如何设计才能在命中率和正确性之间取得平衡？',
      'CDN 回源链路从用户请求到源站经过多级缓存：客户端到边缘节点到中层区域节点到 Origin Shield 再到源站。层级越多源站压力越小但边缘回源延迟略有增加。关键组件包括：\n1) Origin Shield——位于边缘节点和源站之间的专用缓存层。所有边缘节点统一从 Shield 回源而非直接访问源站，将源站的并发回源请求数从 N 个边缘节点请求降低到 1 个 Shield 回源请求（同一资源）。Shield 层通常部署在离源站较近的数据中心以减少回源延迟。\n2) 回源合并（Request Coalescing）——当多个边缘节点同时请求同一未缓存资源时只有第一个请求实际回源，后续请求等待第一个结果填充缓存完成。Nginx 通过 proxy_cache_lock 实现该功能，使用 in-flight 标记和等待队列。解决了 Thundering Herd 问题——大量并发回源请求同时到达源站导致过载。\n3) 缓存预热（Cache Preheating）——在大促或新版本上线前主动将热点资源推送到 CDN 各级节点。通过预热 API 或者模拟请求触发缓存填充。预热需控制速率（如限制每秒预热请求数）防止预热本身冲击源站。\n4) Cache Key 设计——Cache Key 的粒度直接影响缓存命中率和正确性。基础 Key 包含请求方法加 URI 路径。需要考虑的额外维度：查询参数（排序标准化避免因参数顺序不同缓存多次），Vary 头部（按 Accept-Encoding 区分压缩版本），Cookie（个性化内容需区分），语言和地区（加入 Accept-Language 区分多语言版本）。粒度越细命中率越低但正确性越高。最佳实践：公共内容用粗粒度 Key 高 TTL，个性化内容用细粒度 Key 短 TTL。\n5) 分层 TTL 策略——边缘节点 TTL 较短（分钟到小时级），中层节点 TTL 较长（小时到天级），Shield 层 TTL 最长（天到周级）。较长的 TTL 在中层和 Shield 层有助于大幅提升命中率同时降低源站负载。',
      ['Origin Shield 为什么要设计成独立层级而不是让边缘直接回源',
       'Cache Key 的粒度如何权衡——精细 vs 粗粒度对命中率和正确性的影响',
       'Thundering Herd 在多层 CDN 缓存中如何传播如何逐层吸收'],
      ['CDN', '回源', '缓存', '架构']),

    # 2 - NAT traversal STUN/TURN/ICE (NOT covered at all)
    q('design_network', 'hard', 'short_answer',
      'NAT 穿透技术：STUN/TURN/ICE 协议详解',
      '详细说明 STUN、TURN 和 ICE 三种 NAT 穿透协议的工作原理。NAT 有哪几种类型？ICE 的 Candidate 收集和连通性检查过程是怎样的？什么场景下必须使用 TURN 中继？',
      'NAT 类型分为四种。Full Cone NAT——任何外部主机只要知道内部主机的公网映射地址均可到达内部主机。Restricted Cone NAT——只有内部主机曾向某个外部 IP 发送过包时该外部 IP 才能到达。Port Restricted Cone NAT——在 Restricted Cone 基础上进一步限制仅允许来自内部主机曾发送过的外部 IP+端口对的流量到达。Symmetric NAT——每个内部 IP+端口到不同外部目标的映射使用不同外部端口，只有曾经收到过内部主机包的相邻主机才能回复。Symmetric NAT 最严格，传统 UDP 打洞无法穿透。\n\nSTUN（RFC 5389）——客户端向公网 STUN 服务器发送 Binding Request，服务器回复客户端观察到的公网 IP 和端口（MAPPED-ADDRESS 属性）。客户端据此判断自身 NAT 类型和公网映射地址。STUN 适用于 Full Cone 和 Restricted Cone 但对 Symmetric NAT 无效（因为映射端口随目标地址变化）。STUN 只能用于穿透检测不能保证连通性建立。\n\nTURN（RFC 5766）——当 STUN 穿透失败时使用 TURN 中继。客户端通过 Allocate 请求在 TURN 服务器上分配中继地址，所有流量经中继转发（客户端发送到中继地址，服务器从该地址读取转发到对端）。TURN 的 Permission 机制控制哪些对端可通过中继通信。TURN 消耗中继服务器的带宽和计算资源（成本高于点对点传输），通常只作为 ICE 候选路径中的最后选择。\n\nICE（RFC 8445）——整合 STUN 和 TURN 的完整框架。流程分为四个步骤：1) Candidate 收集——每端收集三种类型候选地址。Host Candidate（本机局域网地址），Server Reflexive Candidate（STUN 获取的公网地址），Relay Candidate（TURN 中继地址）。2) Candidate 优先级排序——按类型优先级从高到低：Host 最高，Server Reflexive 次之，Relay 最低。同类型内按地址属性排序。3) 候选地址交换——通过信令通道（如 SIP 或 WebRTC Offer/Answer）交换双方的候选列表。4) 连通性检查——两端对候选对进行 STUN 连通性测试（每对 Candidate 之间发送 STUN Binding Request 等待 Response），检查通过后选择可用路径。最终选择优先级最高的连通路径。ICE 在 WebRTC、VoIP 和即时通讯中广泛应用。',
      ['为什么 Symmetric NAT 是 STUN 无法穿透的边界情况——端口分配算法',
       'ICE 中的 Regular Nomination 和 Aggressive Nomination 两种提名模式有何区别',
       'TURN 中继的带宽成本问题在实际大规模部署中如何优化'],
      ['NAT', 'STUN', 'TURN', 'ICE']),

    # 3 - IPv6 transition dual-stack/tunnel/NAT64 (NOT covered at all)
    q('design_network', 'medium', 'short_answer',
      'IPv6 过渡技术：双栈、隧道与 NAT64',
      'IPv4 到 IPv6 的过渡有哪些主要技术方案？双栈策略如何部署？6to4 和 6in4 隧道有什么区别和各自优缺点？NAT64/DNS64 的工作机制是什么？各种方案分别适用于什么场景？',
      'IPv6 过渡的三大主流技术方案是双栈、隧道和翻译。在真实网络中三种方案经常混合使用，根据网络位置和设备能力选择合适的过渡策略。\n\n双栈（Dual-Stack）——网络设备和主机同时运行 IPv4 和 IPv6 协议栈，DNS 同时返回 A 记录（IPv4）和 AAAA 记录（IPv6）。客户端根据自身能力和应用需求选择协议，通常使用 Happy Eyeballs（RFC 8305）算法——客户端优先尝试 IPv6 连接如果连接失败或延迟过高则快速回退到 IPv4。双栈是过渡期的理想方案不需要做协议转换但需要运营商和企业同时支持双栈部署成本高。面对 IPv4 地址耗尽许多 ISP 使用 DS-Lite（Dual-Stack Lite）——CPE 和运营商之间用 IPv4-in-IPv6 隧道传输 IPv4 流量，运营商侧 AFTR 处理封装和解封装。\n\n隧道技术——6to4（RFC 3056）将 IPv6 包封装在 IPv4 包中传输。使用 2002::/16 前缀自动构造 IPv6 地址（2002:IPv4地址::/48）。6to4 中继路由器负责封装和解封装。优势在于自动配置不需要隧道手动建立。缺点包括依赖公共 6to4 中继的可用性（不稳定），安全性差（没有认证机制），已因安全问题被许多运营商弃用。6in4（RFC 4213）在两个 IPv6 站点之间建立点对点的 IPv4 隧道，需要手动配置隧道端点和路由。优势在于稳定可控，缺点是需要公网 IPv4 地址和手动管理。6rd（IPv6 Rapid Deployment）是 6to4 的改进版由 ISP 控制中继更可靠。GRE 隧道（RFC 2784）可以传输多种网络协议包括 IPv6。\n\nNAT64/DNS64（RFC 6146/6147）——纯 IPv6 网络中的客户端访问 IPv4 服务的翻译机制。DNS64 负责合成 AAAA 记录：当 IPv6-only 客户端查询域名时若没有 AAAA 记录但存在 A 记录，DNS64 将 A 记录 IPv4 地址嵌入 Well-Known Prefix（64:ff9b::/96）或运营商自定义前缀来构造 AAAA 记录返回给客户端。NAT64 网关接收发往该前缀的 IPv6 包将其转换为 IPv4 包转发到 IPv4 目标网络，同时维护状态表将响应 IPv4 包转换回 IPv6 包返回客户端。适用于 IPv6-only 移动网络和 5G 网络访问 IPv4-only 互联网。限制是只支持 IP 层翻译不支持嵌入式 IP 地址的应用层协议。',
      ['双栈部署中 Happy Eyeballs 算法如何避免 IPv6 连接慢于 IPv4 导致的体验下降',
       '6to4 隧道为什么被标记为 Experimental 而不推荐生产部署——安全性和可靠性',
       'NAT64/DNS64 如何解决纯 IPv6 节点访问 IPv4 服务的翻译问题——有状态翻译'],
      ['IPv6', '双栈', 'NAT64', '隧道']),

    # 4 - QUIC deep: recovery, QPACK, unidirectional streams (unique angle beyond existing QUIC questions)
    q('design_network', 'hard', 'short_answer',
      'QUIC 传输机制详解：丢包恢复、QPACK 与单向流',
      'QUIC 协议的丢包恢复机制与 TCP 有哪些关键区别？QPACK 头部压缩解决了什么问题？QUIC 的单向流（Unidirectional Stream）在协议中扮演什么角色？QUIC 连接迁移如何实现无损切换？',
      'QUIC 的丢包恢复机制与 TCP 有三个关键区别。第一 Packet Number 空间——QUIC 分为 Initial、Handshake 和 Application 三个独立 Packet Number 空间，不会相互干扰。每个包使用严格单调递增的 Packet Number。TCP 重传包使用与原始包相同的序列号导致重传歧义（Retransmission Ambiguity）——收到 ACK 时无法确定是对原始包还是重传包的确认。QUIC 消除了这个歧义，每个包（包括重传）都有唯一的 Packet Number，RTT 测量更准确。第二更精细的 Loss Detection——使用基于时间的检测（Probe Timeout PTO 代替 TCP 的 RTO，避免 RTO 重置拥塞窗口）和基于包的检测（Packet Threshold——丢失 N 个包后触发）。第三 NACK 机制——接收方在 ACK 帧中明确声明丢失的 Packet Number 范围，发送方精准重传。\n\nQPACK（RFC 9204）——HTTP/2 中 HPACK 的压缩上下文是所有并发流共享的，一个丢包导致后续所有流的解压缩阻塞（TCP 队头阻塞在头部压缩层的体现）。QPACK 将压缩和解压缩的解耦到两个专用单向流：Encoder Stream（发送方推送压缩表更新）和 Decoder Stream（接收方反馈表条目确认）。每条请求流上的头部使用相对索引引用压缩表条目，只有当所依赖的表条目确认真实到达后才解码。QPACK 引入了阻塞模式（等待表数据确认真后才解码保证正确）和非阻塞模式（表数据未到时返回流的后续数据传输不阻塞）。\n\n单向流（Unidirectional Stream）——QUIC 使用多个独立的单向流传输协议控制数据。包括 Crypto Stream（TLS 1.3 握手数据——密钥交换和证书验证）和 QPACK Encoder/Decoder Stream。单向流与双向流共享同一 QUIC 连接的流 ID 空间但用不同位标记方向。单向流的好处是每个流独立受流控，丢失一个只阻塞对应功能不影响其他流的数据传输。\n\n连接迁移（Connection Migration）——QUIC 连接由 Connection ID 标识而非 IP 加端口对。当客户端的网络环境切换时（如 WiFi 切换到 4G 或基站切换导致 IP 变化）使用新路径继续发送包即可无缝切换。服务器根据 Connection ID 识别同一连接无需终止和重建。迁移过程中执行 Path Validation——在新路径上发送 PATH_CHALLENGE 帧等待 PATH_RESPONSE 确认路径可达。验证通过后再迁移数据流防止地址欺骗（避免恶意节点劫持连接）。',
      ['QPACK 为何比 HPACK 更复杂——QUIC 流模型与 TCP 字节流的根本差异',
       'QUIC Packet Number 的单调递增如何彻底消除 TCP 的重传歧义问题',
       'QUIC 连接迁移的安全验证——Path Validation 如何防止地址欺骗攻击'],
      ['QUIC', 'HTTP/3', 'QPACK', '传输协议']),

    # 5 - eBPF XDP vs TC hook (unique angle: programming model comparison)
    q('design_network', 'hard', 'short_answer',
      'eBPF XDP 与 TC 钩子编程模型对比',
      'eBPF 在网络数据面中的 XDP 和 TC 两种钩子在处理阶段、能力和应用场景上有哪些区别？BPF Map 和 Helper 函数在两种钩子中的使用有何限制？Cilium 为什么同时使用两种钩子？',
      'XDP（eXpress Data Path）钩子位于网络驱动层，在网卡驱动接收到数据包后、sk_buff 分配和执行协议栈处理之前执行。XDP 程序可以直接在驱动层面或网卡硬件层面（硬件卸载）处理包。XDP 支持五种动作：XDP_DROP 丢弃包（最快性能），XDP_PASS 送入内核协议栈继续处理，XDP_TX 从原网卡发送出去（可用于快速转发如负载均衡），XDP_REDIRECT 重定向到其他网卡或 CPU 或用户态程序（AF_XDP 套接字），XDP_ABORTED 程序异常触发 tracepoint。XDP 的 Helper 函数有限只能访问包数据不能访问内核协议栈状态（如路由表、socket 信息）。适用于 DDoS 防护（快速丢弃攻击流量）、负载均衡（XDP_TX + BPF Map 实现一致性哈希）、包采样和 AF_XDP 零拷贝用户态包处理。\n\nTC（Traffic Control）钩子位于内核协议栈内部，分为 ingress（入口）和 egress（出口）两个挂载点。TC 处理的是已经分配到完整 sk_buff 结构体的包，因此可以访问协议栈数据和元数据。TC 程序通过 cls_bpf（作为分类器）或 act_bpf（作为动作）挂载。TC 的支持的操作比 XDP 更丰富：修改包头字段（TTL、TOS、MAC 地址等）、重路由、隧道封装和解封装（VXLAN/Geneve）、流量整形与 QoS 结合。TC 可访问的 Helper 函数更多包括路由查找（bpf_skb_set_tunnel_key/bpf_skb_get_tunnel_key 等隧道相关 Helper）。适用于容器网络策略执行如 Cilium 使用 TC ingress/egress 实现 L3/L4 网络策略、负载均衡 NAT（DNAT/SNAT）、隧道封装和带宽管理。\n\nCilium 为什么同时使用两者——XDP 用于入口方向的 DDoS 过滤、NodePort 转发加速（XDP 直接转发不需要经过内核协议栈）和服务负载均衡。TC 用于完整的网络策略执行（XDP 无法访问 L7 信息）、隧道封装和解封装（VXLAN/Geneve 需要 sk_buff 元数据）、出口方向的策略控制（XDP 只有 ingress 没有 egress）。两者通过 BPF Map 共享数据（如服务后端映射、策略规则），实现数据面统一。',
      ['XDP 程序中为什么不能直接访问路由表——sk_buff 尚未分配的限制',
       'TC egress 钩子为什么对于容器网络的出站流量控制至关重要',
       'XDP_REDIRECT 到 AF_XDP 套接字如何实现零拷贝用户态包处理'],
      ['eBPF', 'XDP', 'TC', '包处理']),

    # 6 - WireGuard vs IPsec protocol comparison (unique angle beyond Q79 tunnel types)
    q('design_network', 'medium', 'short_answer',
      'WireGuard vs IPsec：协议架构与性能深度对比',
      'WireGuard 和 IPsec 在协议设计上有哪些关键区别？各自的加密模型和握手协议如何工作？为什么 WireGuard 性能通常优于 IPsec？各适合什么部署场景？',
      'WireGuard 的设计哲学是极简和现代加密原语。仅使用 Curve25519（密钥交换）、ChaCha20-Poly1305（对称加密和认证）、BLAKE2s（哈希函数）和 HKDF（密钥衍生函数）。所有加密算法固定不可配置消除了算法降级攻击风险。代码量约 4000 行，在内核中实现路径短开销小。IPsec 则是一个庞大的协议族（RFC 数量超过 50 个），支持多种加密和认证算法组合（AES-CBC/AES-GCM/3DES/SHA1/SHA256 等），配置参数极其丰富但也带来了复杂性和安全配置错误风险。\n\n握手协议对比——WireGuard 使用 Noise IK 模式，1-RTT 完成密钥交换和传输密钥生成。单次握手消息同时携带静态密钥协商和临时密钥交换，服务器可以无状态回复。IPsec IKEv2 需要 2-4 次消息交换（IKE_SA_INIT 协商加密参数和 DH 交换，IKE_AUTH 认证身份和建立第一个 Child SA）。WireGuard 的无状态 Cookie 机制防御 DDoS——服务器在负载高时先发 Cookie 验证客户端地址再继续握手。IPsec 依赖手工配置的反重放窗口或无状态 DoS 保护扩展。\n\n密钥管理差异——WireGuard 是静态配置的对等关系（公钥白名单方式），没有证书体系，不适配大规模部署和企业集中管理。IPsec 支持完整的 PKI 证书体系、EAP 认证、XAUTH、与 RADIUS 和 LDAP 集成，适合企业级大规模远程访问场景。\n\n性能对比——WireGuard 在内核中实现路径短上下文切换少。ChaCha20-Poly1305 在无 AES 硬件加速的 CPU 上性能远优于 AES-CBC 或 AES-GCM（移动设备和物联网设备收益明显）。IPsec 需要处理复杂的 SA 查找、ESP 封装分片、反重放窗口维护。WireGuard 不支持 Tunnel Mode 封装的头部开销更低。延迟方面 WireGuard 通常更低（简单握手加内核实现），吞吐量在同等条件下比 IPsec 高 10-30%。IPsec 的 ESP Tunnel Mode 支持完整的隧道模式（封装整个 IP 包），WireGuard 只支持传输模式。',
      ['WireGuard 为什么不支持证书体系——其目标场景和使用模型的取舍',
       'IPsec 的 ESP 和 AH 两种协议的区别和各自的安全属性',
       'ChaCha20-Poly1305 在无 AES-NI 的移动设备上相比 AES-GCM 的优势'],
      ['WireGuard', 'IPsec', 'VPN', '安全']),

    # 7 - Zero Trust identity-aware proxy (unique angle beyond Q21 ZTNA general)
    q('design_network', 'hard', 'short_answer',
      '零信任架构：身份感知代理与设备信任评估',
      '零信任网络的核心原则有哪些？Google BeyondCorp 的架构如何设计？身份感知代理（IAP）如何工作？微隔离在零信任中扮演什么角色？设备信任评估的机制是什么？',
      '零信任网络的核心原则有三条。第一 Never Trust Always Verify——不基于网络位置（如内网 IP 段）信任任何请求，每次都进行认证和授权。第二最小权限原则——用户和系统只获得完成任务所需的最小访问权限，按需授予。第三 Assume Breach——假设网络已被入侵，从设计上就防御攻击者的横向移动。\n\nGoogle BeyondCorp 架构——2014 年公开的零信任实践，核心理念是将所有企业应用从内网迁移到公共域名下，通过统一反向代理暴露。不再区分内网和外网界限。访问控制依赖三个要素：用户身份（通过 SSO 和 2FA 认证），设备信息（设备型号、OS 版本、补丁级别、合规状态），请求上下文（地理位置、访问时间、网络信号强度）。访问决策引擎综合评估三个要素满足条件才授权。核心约束：不在企业内部网络上部署专属应用，所有应用都通过公共互联网访问。\n\n身份感知代理（IAP - Identity-Aware Proxy）——在用户和应用之间插入反向代理层，在请求到达应用之前完成认证和授权。工作流程：用户请求到达 IAP，IAP 重定向到身份提供商（IdP）完成 OAuth2/OIDC 认证，认证通过后 IAP 注入用户身份信息到请求头（经过签名的 JWT），后端应用从请求头中提取用户身份实现免登录。IAP 支持 Context-Aware Access——根据请求上下文动态调整访问权限（如外网访问需要 2FA 加最新设备补丁，内网仅需 SSO 认证）。\n\n微隔离（Micro-Segmentation）——将数据中心或云网络划分为细粒度的安全段，每段基于工作负载身份而非 IP 地址定义访问策略。在 Kubernetes 中通过 NetworkPolicy 和 Cilium 实现基于标签的隔离。微隔离防止攻击者从已攻陷的 Pod 横向移动到其他服务（东西向流量控制）。\n\n设备信任评估——设备首次访问企业资源时注册到设备清单并分配证书。持续监控设备状态包括磁盘加密是否开启、操作系统版本和补丁级别、设备是否越狱或 Root、杀毒软件状态和最后扫描时间、设备地理位置。不同属性按权重计算信任分数。信任分数低于阈值时设备放入隔离网络仅允许访问补救服务（如补丁更新服务器）。',
      ['BeyondCorp 的约束为什么要求所有应用通过公共域名访问而非保留内网应用',
       '微隔离在 Kubernetes 中如何实现跨节点一致性的标签到策略映射',
       '设备信任分数模型如何平衡安全性和用户便捷性——分数动态调整策略'],
      ['零信任', 'BeyondCorp', '身份代理', '微隔离']),

    # 8 - NetConf/YANG/gNMI (unique angle beyond Q36 IaC/Ansible)
    q('design_network', 'medium', 'short_answer',
      'NetConf/YANG 与 gNMI：新一代网络设备管理协议',
      'NetConf、YANG 和 gNMI 三者之间是什么关系？NetConf 相比传统 SNMP 有哪些本质优势？YANG 数据模型如何定义网络设备配置？gNMI 的流式遥测（Streaming Telemetry）如何工作？',
      'YANG（RFC 7950）是一种数据建模语言专门用于定义网络设备的配置和状态数据结构。YANG 模型定义了数据的层次树结构、节点类型（leaf/list/container/leaf-list）、数据类型约束（string/integer/enum/boolean 等）、必须字段、默认值以及配置数据和状态数据的区分。YANG 模块通过 IETF RFC 标准组织或设备厂商自定义发布，具有高度的可读性和模块化特性。\n\nNetConf（RFC 6241）是一种基于 XML 的网络配置管理协议，使用 YANG 作为底层数据模型。NetConf 使用 SSH 作为传输层（默认 830 端口），通过 RPC 交互。核心操作包括 get（读取运行配置和状态）、get-config（读取候选或启动配置）、edit-config（修改配置支持 merge/replace/create/delete/remove 语义）、copy-config（配置复制）、commit（提交候选配置到运行配置使其生效）、lock/unlock（锁定配置防止并发修改冲突）、validate（配置正确性验证）和 delete-config（删除配置）。NetConf 的事务化提交机制是 SNMP 不具备的关键优势——候选配置先验证后提交保证配置变更的原子性。\n\nNetConf vs SNMP 对比——1）事务化配置：NetConf 候选配置验证确认后提交的原子操作，SNMP 逐条设置无事务支持中间状态失败。2）数据模型：YANG 比 SNMP MIB 结构更清晰易读（OID 树难以理解和维护），YANG 的约束声明可自动验证配置正确性。3）操作语义：edit-config 有明确的 merge/replace/create/delete 语义，SNMP 只有 set 操作不区分意图。4）传输安全：NetConf 强制 SSH 加密传输，SNMPv3 的安全配置复杂且常被简化为弱口令 SNMPv2c（明文传输）。\n\ngNMI（gRPC Network Management Interface）——基于 gRPC 的现代网络管理协议，使用 Protobuf 作为数据编码。核心能力：Capabilities RPC（获取设备支持的 YANG 模型和数据编码），Get/Set RPC（读取和修改配置支持 JSON/JSON_IETF/Protobuf 编码），Subscribe RPC（Push 模式流式遥测）。流式遥测机制——设备按照配置的采样间隔持续推送状态数据到采集端，采集端无需轮询。支持三种采样模式：TARGET_DEFINED（设备决定采样周期和路径），ON_CHANGE（数据变化时立即推送），SAMPLE（按固定时间间隔推送）。gNMI 的流式 Push 模式克服了 SNMP Polling 的扩展性问题（轮询间隔短设备负载高，间隔长数据粒度粗）。',
      ['SNMP 的 Polling 模式在大规模网络中为什么遇到扩展性瓶颈——轮询压力和遗漏间隙',
       'gNMI Subscribe 的 ON_CHANGE 和 SAMPLE 两种模式分别适用于什么监控场景',
       'YANG 模型的约束声明如何实现配置的自动化校验——must 和 when 表达式'],
      ['NetConf', 'YANG', 'gNMI', '网络自动化']),

    # 9 - Cilium Hubble observability (unique angle: Hubble specific, not general Cilium)
    q('design_network', 'medium', 'short_answer',
      'Cilium Hubble：基于 eBPF 的网络可观测性平台',
      'Cilium Hubble 是什么？它的架构由哪些核心组件构成？Hubble 如何通过 eBPF 捕获网络流量信息？Hubble 相比传统监控方案（tcpdump/Prometheus/cAdvisor）有哪些优势？',
      'Hubble 是 Cilium 开源项目中的网络可观测性层，利用 eBPF 程序在内核中捕获网络流量和事件数据，提供实时的 Kubernetes 服务通信视图。Hubble 不依赖 sidecar 或代理，内核级数据捕获带来的性能开销极低。\n\n核心架构组件：1）Hubble Agent——在每个节点运行内嵌在 Cilium Agent 中。通过挂载 eBPF 程序到网络钩子点捕获流经节点的每个网络事件。Hubble Agent 创建 BPF Map 存储连接跟踪信息（源目 IP 和端口、协议类型、连接状态、开始结束时间戳、字节数和包数统计）。Agent 通过 gRPC API 对外提供查询服务。2）Hubble Relay——跨节点查询聚合器，类似 Hubble 集群入口。所有节点上的 Hubble Agent 向 Relay 注册，Relay 对外提供统一的集群级查询接口。用户查询跨 Pod 或跨节点的流量时 Relay 协调多个 Agent 返回聚合结果。3）Hubble UI——基于 React 的 Web 界面，以服务依赖关系图可视化集群网络流量。展示服务间通信关系、流量路径、延迟分布、错误率和丢包率。4）Hubble Metrics——导出 Prometheus 指标包括转发字节数、丢弃包数、TCP 连接状态分布、DNS 响应延迟、HTTP/gRPC 请求速率和延迟分位数。\n\neBPF 数据捕获细节——Hubble 挂载 eBPF 程序到多个内核钩子：TC ingress/egress 捕获数据包，XDP 捕获入口方向高速包，Socket-level eBPF 捕获应用层数据（需配置 L7 策略）。捕获的数据包括 L3/L4 流日志（五元组加统计信息），L7 协议解析（HTTP/gRPC/DNS/Kafka 头部、状态码、方法、延迟），TCP 连接完整生命周期（从 SYN 到 FIN/RST 的每个状态转换时间戳）。Hubble 的 Flows 数据结构包含源端和目标端的 Kubernetes 标签、命名空间、Pod 名称和服务名称，便于与 Kubernetes RBAC 和网络策略关联分析。\n\nHubble vs 传统监控——传统方案依赖 iptables 日志（性能差数据不全）、应用侧主动埋点（需要代码改造）、cAdvisor（仅容器级别指标无网络视角）、tcpdump 分析 pcap 文件（离线分析无法实时监控）。Hubble 的优势在于内核级无侵入捕获、自动关联 K8s 元数据、低性能开销（eBPF 零拷贝）、实时 L7 协议解析、友好可视化。',
      ['Hubble 捕获的流量是否包含数据包载荷——L7 策略配置对数据捕获的影响',
       'Hubble 如何与 Cilium NetworkPolicy 关联——从策略到流量的双向可视化',
       '在大规模集群中 Hubble Relay 如何避免成为性能瓶颈——订阅过滤和下推优化'],
      ['Cilium', 'Hubble', 'eBPF', '可观测性']),

    # 10 - SRv6 vs MPLS (unique angle beyond Q43 general SRv6)
    q('design_network', 'hard', 'short_answer',
      'SRv6 分段路由与 MPLS 的深度对比分析',
      'SRv6（Segment Routing over IPv6）的基本原理是什么？SID 的格式和 SRH 头部结构如何设计？SRv6 相比 MPLS 有哪些核心优势和当前存在的挑战？SRv6 在哪些典型场景下比 MPLS 更有优势？',
      'SRv6 的核心思想是将路由路径编码为一个有序的 Segment 列表插入 IPv6 扩展头部中。源节点预先计算好完整的转发路径或按需分段编码为 Segment 列表，数据包沿着列表指定的路径转发，中间节点不需要维护每流状态（仅依据 Segment 列表转发）。\n\nSID（Segment Identifier）格式——标准 SRv6 SID 是 128 位 IPv6 地址，结构分为三部分：Locator（前缀路由到持有该 SID 的节点），Function（指定节点应执行的操作——如 END 直接转发到下一跳、END.X 转发到指定邻居、END.DT6 解封装 IPv6、END.DX6 解封装并转发到指定出接口），Arguments（可选参数如 QoS 编号）。SRH 头部包含 Segment Left（当前处理位置指针）、Flags、Tag、Segment List 和可选 TLV。节点根据 Segment Left 递减推进路径，SegmentsLeft 归零时到达最终目的。\n\nSRv6 vs MPLS 核心优势：1）控制平面简化——SRv6 使用 IGP（OSPFv3/IS-IS）扩展或 BGP 分发 SID 信息，不需要运行 MPLS 的 LDP 或 RSVP-TE 等多套协议。2）数据面简化——不需要 MPLS 标签的 Push/Swap/Pop 操作，直接操作 IPv6 扩展头部更自然。3）可编程性——Function 字段支持任意网络行为定义（如服务功能链中插入防火墙 SID、负载均衡 SID），MPLS 标签只能做简单的交换转发。4）与 IPv6 原生融合——SRv6 包就是标准 IPv6 包可通过现有 IPv6 网络传输不需要中间设备支持 MPLS。5）Service Chaining——SID 可直接编码网络服务功能（防火墙、NAT、负载均衡器）实现精细的服务链编排而不需要 NSH 等额外协议。\n\n当前挑战——1）头部开销大：每个 Segment 128 位（MPLS 标签仅 20 位），深度 Segment 列表导致 MTU 问题需使用 uSID（微 SID 压缩方案）缓解。2）硬件支持：需要新一代路由器硬件支持 SRH 高速处理，现网设备升级成本高。3）运维成熟度：MPLS 在运营商网络部署二十多年经验积累深厚，SRv6 的工具链和运维知识仍在发展中。4）安全关注：SRH 可能被用于绕过安全策略，需部署 SRH 过滤机制防护。\n\n典型场景——SRv6 更适合 5G 用户面功能链编排、云网融合场景（云内 VPC 和物理网络统一 SRv6 策略）、需要精细流量工程的场景。MPLS 更适合现有运营商骨干网、L3VPN/L2VPN、传统企业互联等成熟业务场景。',
      ['SRv6 的 SID Function 字段如何编码服务功能——服务链编排的具体实现',
       'SRv6 头部开销在 MTU 受限的网络中通过 uSID 压缩方案如何解决',
       '从 MPLS 到 SRv6 的迁移路径——运营商如何分段逐步部署而非全网切换'],
      ['SRv6', '分段路由', 'MPLS', '网络编程']),

    # 11 - VPN technologies comparison (unique angle: four-protocol comprehensive comparison)
    q('design_network', 'medium', 'short_answer',
      'VPN 技术全景：WireGuard vs OpenVPN vs IPsec vs SSTP',
      'WireGuard、OpenVPN、IPsec/IKEv2 和 SSTP 四种主流 VPN 协议在安全性、性能、配置便捷性和适用场景方面有哪些关键差异？如何根据实际需求选择合适的 VPN 协议？',
      'WireGuard（2016 年发布）——设计极简仅约 4000 行内核代码。加密原语固定为 Curve25519 加 ChaCha20-Poly1305 加 BLAKE2s 加 HKDF，不可配置因此没有算法协商降级风险。优势：连接建立极快（1-RTT）、内核态实现带来高吞吐低延迟、配置极简单（仅需公钥私钥对和对端公钥）。劣势：不支持证书 PKI 和用户身份认证、不适合大规模企业集中管理。适用于个人 VPN、站点间隧道、微服务和容器间加密通信。\n\nOpenVPN（2001 年发布）——最成熟的开源用户态 VPN。基于 OpenSSL 支持所有主流加密算法和 TLS 握手。优势：跨平台兼容性最好（几乎所有 OS 都支持）、灵活性和可定制性最高（支持 TCP/UDP 传输、可运行在任意端口穿透防火墙）、支持证书和预共享密钥多种认证方式。劣势：用户态实现导致性能低于内核态方案（上下文切换和数据拷贝开销大）、配置复杂（CA 证书、CRL、DH 参数、TLS 加密算法配置项繁多）、TLS 控制通道在大规模并发部署中可能成为瓶颈。在大带宽场景下用 TCP 模式存在 TCP over TCP 的性能回退问题（上层 TCP 丢包重传触发下层 TCP 重传形成叠加效应）。\n\nIPsec/IKEv2——IETF 标准 VPN 协议族。IKEv2（RFC 7296）比 IKEv1 简化了握手过程（4 条消息完成认证和密钥协商），支持 MOBIKE（连接迁移——切换网络时 VPN 连接不中断）。优势：系统集成度高（主流 OS 原生支持 IKEv2）、支持证书/EAP/MOBIKE 等扩展。劣势：协议族庞大复杂度高、NAT 穿越需要额外配置（IKEv2 比 IKEv1 有所改善但仍需配置）、不同厂商实现兼容性差（互操作性测试不可少）。适用于企业远程访问 VPN 和站点到站点 VPN。\n\nSSTP（Secure Socket Tunneling Protocol）——微软开发的 VPN 协议，基于 SSL/TLS 隧道默认端口 443。优势在于使用 HTTPS 标准端口极难被防火墙识别和阻挡、与 Windows 及 Active Directory 深度集成。劣势在于仅限 Windows 平台非开源实现、性能一般且跨平台支持有限。适用于需要绕过严格防火墙的企业 Windows 远程访问场景。\n\n选型建议——高性能轻量隧道选 WireGuard；企业远程办公选 IPsec/IKEv2 或 OpenVPN；防火墙严格环境选 SSTP 或 OpenVPN over TCP 443；大规模站点互联选 IPsec。',
      ['OpenVPN 用户态实现为什么比内核态 WireGuard 吞吐量低——数据拷贝和上下文切换',
       'IKEv2 的 MOBIKE 如何支持移动用户在网络切换时 VPN 不中断',
       '为什么 OpenVPN 的 TCP 模式在大带宽和高延迟场景下性能显著下降'],
      ['VPN', 'WireGuard', 'OpenVPN', 'IPsec']),

    # 12 - RPC framework comparison (NOT covered at all)
    q('design_network', 'hard', 'short_answer',
      'RPC 框架选型：gRPC vs Thrift vs Dubbo vs JSON-RPC',
      'gRPC、Apache Thrift、Apache Dubbo 和 JSON-RPC 四种 RPC 框架在协议设计、序列化方式、传输模型和生态集成方面有哪些关键区别？各框架最适合什么场景？选型时应考虑哪些核心要素？',
      'gRPC（Google Remote Procedure Call）——基于 HTTP/2 传输，默认序列化为 Protocol Buffers（Proto3）。核心特性包括 HTTP/2 多路复用（多个 RPC 调用共享同一 TCP 连接减少连接数）、四种服务模式（Unary 单请求单响应、Server Streaming 单请求流响应、Client Streaming 流请求单响应、Bidirectional Streaming 双向流）、Protocol Buffers 序列化（体积小速度快的二进制格式比 JSON 小 3-10 倍快 10-100 倍）、内置认证（基于 TLS/mTLS）、负载均衡（通过 xDS API 集成）、健康检查和元数据传递。强类型接口定义通过 .proto 文件生成客户端和服务器存根。性能高延迟低，适合微服务间通信、流式服务和多语言分布式系统。\n\nApache Thrift——Facebook 开源的跨语言 RPC 框架。序列化支持多种协议包括 Binary、Compact（可变长整数编码比 Binary 节省空间）和 JSON。传输层支持 TCP、HTTP 和 Unix Socket。优势在于代码生成框架成熟稳定（支持超过 20 种语言）、简单请求-响应场景下性能接近 gRPC（Binary 协议体积略大于 Protobuf 但序列化速度相当）。劣势在于协议约束比 gRPC 弱（无强制的流式传输支持、无内建服务发现）、非 HTTP/2 传输需要额外网关或代理实现 Web 友好、Thrift 社区活跃度低于 gRPC。适用于与已有 Thrift 系统兼容的场景或需要支持 gRPC 不提供的语言（如特定旧版本语言）的情况。\n\nApache Dubbo——阿里巴巴开源的 Java RPC 框架，侧重 Java 微服务体系。区别于 gRPC 和 Thrift 的协议优先设计，Dubbo 更侧重 Java 服务治理。特性包括原生集成服务发现（Nacos/Zookeeper/Consul）、三层模型（Interface 接口定义、Proxy 代理层动态代理封装、Protocol 协议层支持 Dubbo/Hessian/gRPC/Thrift 多协议）、内置集群容错策略（Failover/Failfast/Failsafe/Broadcast/Forking）、多种负载均衡算法（加权随机、最少活跃、一致性哈希、最短响应时间）。生态集成与 Spring Cloud/Nacos/Sentinel 深度整合。适用于 Java 技术栈的微服务体系特别适合已采用 Dubbo 生态组件的团队。\n\nJSON-RPC（RFC 4627）——最轻量级的 RPC 协议，基于 JSON 编码通过 HTTP 或 WebSocket 传输。优势在于极简单——不需要代码生成、客户端直接用 HTTP POST 加 JSON Body 即可调用、调试直观（curl 直接调用）。劣势在于性能低于二进制协议（JSON 编码解析开销大）、无类型检查、无内建流式传输。适用于快速原型开发、非性能敏感的内部工具 API、Web3 以太坊节点间通信标准（JSON-RPC 是以太坊的标准接口）。\n\n选型核心要素——性能要求高选 gRPC 或 Thrift；Java 技术栈为主选 Dubbo；多语言且需要流式传输选 gRPC；快速集成和调试便利选 JSON-RPC；需要与已有基础设施兼容则优先考虑现有生态。',
      ['gRPC 的 HTTP/2 多路复用在大规模微服务场景下的连接数管理优势',
       'Dubbo 为何比 gRPC 更适合 Java 微服务体系——内建服务发现和治理能力',
       'Thrift 的 Compact 协议相比 Binary 协议通过可变长编码节省多少空间'],
      ['RPC', 'gRPC', 'Thrift', 'Dubbo']),

    # 13 - TCP HoL blocking vs QUIC deep (unique angle beyond Q40/Q56)
    q('design_network', 'hard', 'short_answer',
      'TCP 队头阻塞与 QUIC 无阻塞传输深度对比',
      'TCP 在 HTTP 协议栈中引发队头阻塞（Head-of-Line Blocking）的机制是什么？HTTP/1.1 和 HTTP/2 分别面临什么样的队头阻塞问题？QUIC 如何从根本上解决队头阻塞？QUIC 方案的取舍和局限有哪些？',
      '队头阻塞在 HTTP 协议栈中出现在多个层面。HTTP/1.1 的应用层队头阻塞——一个 TCP 连接上同时只能处理一个请求，前一个请求未完成时后续请求必须排队等待。HTTP Pipelining 理论上允许在未收到响应前发送后续请求但由于实现和代理兼容性问题未被广泛采纳。HTTP/1.1 的规避方案是每个域名打开多个 TCP 连接（浏览器通常每个域名开 6-8 个连接），这增加了连接建立开销（三次握手加 TLS 握手）、系统资源消耗（每个连接占用 socket 和端口）和网络拥塞（TCP 慢启动每个连接独立进行）。\n\nHTTP/2 基于 TCP 的队头阻塞——HTTP/2 在单个 TCP 连接上复用多个流解决了 HTTP/1.1 的应用层队头阻塞。但引入了 TCP 层的队头阻塞问题。TCP 是面向字节流的协议保证数据按序交付给上层应用。当 TCP 分段在传输中丢失时，接收方的 TCP 层必须等待该分段重传成功才能将后续所有数据交付给上层应用（即使后续分段已到达接收缓冲区）。这意味着一个 TCP 丢包阻塞了同一个连接上的所有 HTTP/2 流的数据交付。在丢包率 2% 的网络中测试显示 HTTP/2 的页面加载性能甚至低于 HTTP/1.1 的多连接方案（因为多连接时一个连接丢包不影响其他连接的请求处理）。\n\nQUIC 的独立流设计从根本上解决队头阻塞——QUIC 在 UDP 之上自行实现了多路复用层和可靠传输层。每个 Stream 有独立的编号空间和独立的数据缓冲机制。Stream A 的丢包仅阻塞 Stream A 的数据交付，Stream B、Stream C 的数据可以正常交付给应用层（即使它们在同一个 QUIC 连接中）。QUIC 的帧结构中 Stream Frame 携带 Stream ID 加 Offset 加 Data 三元组，接收方以 Stream 粒度重组数据流，不同 Stream 之间不互相阻塞。QPACK 头部压缩也通过独立的双向流（Encoder/Decoder）避免了 HPACK 的压缩上下文阻塞问题。\n\nQUIC 方案的取舍与局限——1）UDP 穿透问题：部分企业防火墙、NAT 和中间设备会丢弃或限制 UDP 流量，QUIC 需要回退到 TCP（或通过 Alt-Svc 机制降级到 HTTP/2 over TCP）。2）用户态开销：QUIC 通常实现在用户态（如 Google quiche、Cloudflare quiche），与 TCP 内核态实现相比有额外的用户态-内核态内存拷贝和系统调用开销。虽然 GSO/GRO 和 sendmmsg/recvmmsg 批量处理缓解了此问题，但仍不如内核态 TCP 在极端场景下的优化程度。3）CPU 开销：QUIC 的 TLS 1.3 加密默认启用（TCP 可选择性启用 TLS），每个包都要加解密，在纯转发场景下 CPU 消耗比 TCP 高。4）协议复杂度：QUIC 协议规范远比 TCP 复杂（TCP RFC 约 2000 行、QUIC 核心规范约 8000 行加多个扩展），实现和调试门槛高。',
      ['HTTP/2 在 1% 丢包率下为什么性能显著下降——TCP 字节流模型的阻塞效应',
       'QUIC 独立流模型与 HTTP/2 的虚拟流模型的根本区别在哪里',
       'UDP 被企业防火墙限制的问题在互联网实际部署中的应对策略'],
      ['TCP', 'QUIC', '队头阻塞', '传输协议']),

    # 14 - DDoS BGP Flowspec (unique angle beyond Q14 general DDoS)
    q('design_network', 'hard', 'short_answer',
      'DDoS 防护技术全景：流量清洗与 BGP Flowspec',
      'DDoS 攻击的主要类型有哪些？多层防护体系如何设计？流量清洗中心（Scrubbing Center）的架构是怎样的？BGP Flowspec 如何实现分布式流量精确过滤？RTBH 远程触发黑洞路由的工作机制是什么？',
      'DDoS 攻击按层级分为三类。L3/L4 攻击包括 UDP Flood（大流量填充带宽）、SYN Flood（耗尽服务器连接表）、ICMP Flood（反射放大攻击如 NTP/DNS Amplification 可达 50-100 倍放大倍数）和 ACK Flood/ACK PSH Flood。L7 应用层攻击包括 HTTP Flood（慢速但有效的 HTTPS 请求洪水）、Slowloris（慢速打开连接保持打开耗尽连接池）、DNS Query Flood（大量随机域名查询耗尽 DNS 服务器资源）和 API 滥用攻击。协议缺陷攻击包括 TCP 状态耗尽（利用半连接/全连接表容量限制）。多层防护架构自下而上为：边界路由器（RTBH 粗粒度过滤）-> 流量清洗中心（逐包分析过滤）-> WAF（应用层 SQL 注入/XSS/CC 攻击防护）-> CDN（缓存静态内容并分散攻击流量）-> 应用自身限流降级。\n\n流量清洗中心（Scrubbing Center）架构——通过 BGP 路由将目标 IP 的所有流量从生产网络引流到清洗中心。核心组件：Detector 实时分析 NetFlow/sFlow/IPFIX 流量数据识别异常模式（基线对比、源 IP 分布熵分析、包速率和字节速率异常检测）。Mitigator 执行攻击流量过滤（源 IP 信誉数据库过滤、速率限制、协议完整性验证如 SYN Cookie 验证三次握手完整性、深度包检测检测 HTTP/HTTPS 载荷中攻击特征）。Injector 将清洗后的干净流量通过隧道回注到生产网络。性能指标包括清洗容量、检测到清洗的延迟、误杀正常流量的比例。\n\nBGP Flowspec（RFC 8955/8956）——通过 BGP 扩展将流量过滤规则分发到网络中的路由器，实现分布式流量过滤不需要将流量集中到清洗中心。Flowspec 规则由匹配条件和动作两部分组成。匹配条件包括源/目的 IP 前缀、端口号范围、协议类型、TCP Flags、ICMP Type/Code、包长度范围等。动作包括 Traffic-rate（限速到指定带宽）、Traffic-action（丢弃或标记）、Redirect（重定向到指定 VRF 或下一跳）。路由器将 Flowspec 规则下发到硬件转发表实现线速过滤。Flowspec 的优势在于分布式执行（靠近攻击源端过滤）和规则灵活（匹配条件可组合）。\n\nRTBH（Remote Triggered Black Hole，RFC 5635）——网络边界路由器向内部 iBGP 传播特定 IP 前缀的下一跳指向 Null0 接口（类似丢弃所有去往该 IP 的流量）。触发方式分为源 RTBH（丢弃攻击来源的流量）和目的 RTBH（丢弃攻击目标的流量）。RTBH 的局限是粗粒度——整个 IP 前缀都被黑洞，正常流量也受影响。使用 BGP Flowspec 可以做到更精细的协议级和端口级过滤。',
      ['海量 UDP Flood 攻击中清洗中心如何区分攻击包和正常包——行为分析模型与基线',
       'BGP Flowspec 规则下发到路由器后硬件转发表有限时如何处理规则数量过多',
       'RTBH 和 Flowspec 的选型——什么时候用粗粒度黑洞什么时候用细粒度过滤'],
      ['DDoS', 'BGP Flowspec', '流量清洗', '安全']),

    # 15 - Overlay VXLAN/GENEVE/NVGRE (unique angle: NVGRE added beyond Q57 VXLAN vs Geneve)
    q('design_network', 'hard', 'short_answer',
      'Overlay 网络隧道协议：VXLAN、GENEVE 与 NVGRE',
      'VXLAN、GENEVE 和 NVGRE 三种网络虚拟化隧道协议在封装格式、多协议支持和灵活性方面各有什么特点？VTEP 如何工作？三种协议的选型建议是什么？',
      'VXLAN（RFC 7348）——使用 MAC-in-UDP 封装技术，将 L2 以太网帧封装在 UDP 包中传输（目的端口 4789）。VXLAN 头部包含 24 位 VNI（VXLAN Network Identifier）支持最多 1600 万个隔离网络。封装结构为 Outer MAC + Outer IP + Outer UDP + VXLAN Header（VNI、Flags）+ Inner MAC + Inner IP + Payload。VTEP（VXLAN Tunnel End Point）负责在网络的入口点封装原始数据帧为 VXLAN 包，在出口点解封装还原。VXLAN 依赖 IP 多播或控制平面（BGP EVPN）进行 ARP 学习和主机发现。VXLAN 部署最广泛几乎被所有主流云平台和虚拟化平台采用（AWS VPC、VMware NSX、OpenStack Neutron）。UDP 封装带来的好处包括利用传统交换机 ECMP 哈希（基于 UDP 源端口做负载均衡）和通过标准 IP 网络传输。\n\nNVGRE（RFC 7637）——微软和 Intel 推动的协议，使用 GRE 封装而非 UDP。24 位 VSI（Virtual Subnet Identifier）相当于 VXLAN 的 VNI。封装结构为 Outer MAC + Outer IP + GRE Header（Key 字段携带 VSI）+ Inner MAC + Inner IP + Payload。NVGRE 的优势在于 GRE 的协议类型字段支持封装更多类型的网络协议（非仅以太网帧）。但 NVGRE 不使用 UDP 封装导致传统交换机基于 L4 哈希的 ECMP 负载均衡失效。需额外配置或硬件支持根据 GRE Key 做等价路由（部分交换机支持 non-IP GRE 的 RSS 哈希）。NVGRE 主要被 Microsoft Hyper-V Network Virtualization 采用部署范围有限。\n\nGENEVE（RFC 8926）——旨在统一和替代 VXLAN 和 NVGRE 的下一代隧道协议。设计核心强调灵活性：1）可变长选项头部——GENEVE 头部包含固定部分（VNI、长度、Flags）和可选的 TLV Options。Options 支持携带各种元数据如 In-band Network Telemetry（INT）时间戳和延迟信息、服务链标识、安全上下文标签。2）使用 UDP 封装（目的端口 6081）支持标准 ECMP 哈希。3）头部包含协议类型字段支持任意封装协议（L2 帧或 L3 包）。GENEVE 的灵活性适合需要携带丰富元数据的复杂 Overlay 场景但协议较新硬件支持仍在推进中。\n\n选型建议——标准数据中心虚拟化选 VXLAN（最成熟部署最广）；微软 Windows 环境选 NVGRE（与 Hyper-V 集成好）；需要携带额外元数据和 Telemetry 选 GENEVE。三个协议的控制平面都趋向使用 BGP EVPN（RFC 7432）分发 MAC/VNI 路由信息替代传统多播学习和泛滥学习机制。EVPN 支持 ARP 代理抑制、多活转发和分布式网关功能。',
      ['VXLAN 使用 UDP 封装相比 NVGRE 的 GRE 封装在 ECMP 负载均衡中的根本优势',
       'GENEVE 的可选 TLV Options 如何实现在 Overlay 网络中携带网络 Telemetry 信息',
       'BGP EVPN 作为控制平面如何替代 VXLAN 泛滥学习机制减少广播风暴'],
      ['VXLAN', 'GENEVE', 'NVGRE', 'Overlay']),

    # 16 - API Gateway vendor comparison (unique angle beyond Q8 features and Q63 vs Ingress)
    q('design_network', 'medium', 'short_answer',
      'API 网关产品对比：Kong vs APISIX vs Traefik vs Envoy',
      'Kong、Apache APISIX、Traefik 和 Envoy 四种 API 网关在架构设计、路由性能、扩展性和部署模式方面有哪些关键区别？如何根据业务场景选择合适的 API 网关产品？',
      'Kong——基于 Nginx 和 Lua（OpenResty）的 API 网关，是最早开源的云原生 API 网关之一。架构分为控制面和数据面：Kong 数据面是 Nginx worker 进程处理实际请求，控制面通过 Admin API（RESTful）管理路由、服务、消费者和插件配置。数据库支持 PostgreSQL 和 Cassandra（无 DB 模式使用 YAML 声明式配置）。插件系统使用 Lua 编写，社区插件生态丰富（认证、日志、限流、缓存、转换等）。核心能力包括服务编排、负载均衡、健康检查和多样化认证协议（OAuth2/OIDC/JWT/Key-Auth/Basic-Auth）。性能与 Nginx 相当，但在大量插件启用时 Lua 执行可能成为性能瓶颈。Kong 提供 Kong Enterprise（商业版增加开发者门户和高级安全）。\n\nApache APISIX——Apache 顶级项目，同样基于 Nginx 和 Lua（OpenResty）但设计更现代。核心技术优势：1）Radix Tree 路由匹配——比 Kong 的前缀/正则匹配性能高数倍，适合大规模路由规则。2）插件热加载——修改插件配置无需 Reload Nginx worker（Kong 需要 Reload）。3）多语言插件支持——通过 Plugin Runner 机制支持 Java/Python/Go/Wasm 编写插件不限于 Lua。4）内置服务发现——直接集成 Nacos/Eureka/Consul/DNS（Kong 需要通过外部插件实现）。5）Admin API 支持 REST 和 GraphQL 两种风格。APISIX 在性能基准测试中路由匹配延迟和代理延迟略优于 Kong。\n\nTraefik——专为容器化环境设计的第二代反向代理和负载均衡器（Go 语言实现）。核心特性：1）自动服务发现——自动监听 Docker/K8s/Consul/ECS 等平台事件自动更新路由配置（零配置）。2）原生 Let Encrypt TLS 证书自动申请和续签。3）单二进制部署统一数据面和控制面无需 Nginx/OpenResty 依赖。4）中间件链模式——每个路由可配置多个中间件（限流、重试、熔断、链路追踪）按链式顺序执行。5）Traefik Hub 商业版提供 API 管理和开发者门户。Traefik 在纯路由场景下性能不错但在复杂转换和高并发规则场景下 Go 实现不如 Nginx C 核心的极致性能。\n\nEnvoy（作为网关使用）——高性能 L3/L4/L7 代理不仅作为 API 网关，也广泛作为 Service Mesh 数据面。核心特性：1）xDS API 实现控制面与数据面完全解耦（推荐与 Istio/K8s Gateway API 集成）。2）全协议支持——TCP/UDP/HTTP/gRPC/MongoDB/Redis/Kafka/Elasticsearch 等。3）高级负载均衡——区域感知、权重调整、主动健康检查、Maglev/一致性哈希、最闲请求。4）内建可观测性——OpenTelemetry/Zipkin/Jaeger/Datadog 分布式追踪、StatsD/Prometheus 指标、详细访问日志。Envoy 功能最强大但配置极其复杂（xDS 配置结构深层次嵌套），通常需配合 Istio/Contour/Gloo 等控制面使用。',
      ['APISIX 的 Radix Tree 路由匹配相比 Kong 传统 prefix 匹配在大规模路由下的性能优势',
       'Traefik 的自动服务发现机制在 K8s 环境下的零配置体验如何实现',
       'Envoy 为什么通常需要配套控制面使用——xDS 配置的复杂性和动态化需求'],
      ['API Gateway', 'Kong', 'APISIX', 'Envoy']),

    # 17 - DNS security DoT/DoH (unique angle beyond Q80 DNSSEC/CAA/DANE)
    q('design_network', 'medium', 'short_answer',
      'DNS 安全加固：DNSSEC 部署与 DoT/DoH 协议',
      'DNS 面临哪些主要安全威胁？DNSSEC 如何通过数字签名保证 DNS 响应完整性和来源认证？DNS over TLS（DoT）和 DNS over HTTPS（DoH）如何保护 DNS 查询隐私？DNS 缓存污染（Cache Poisoning）的防御机制有哪些？',
      'DNS 安全威胁主要有四种类型。DNS 缓存污染（Kaminsky 攻击）——攻击者向递归 DNS 服务器发送大量伪造的 DNS 响应，利用 TXID 空间有限（仅 16 位 65536 种可能值）的漏洞猜测 TXID 注入虚假域名记录。DNS 劫持和欺骗——中间人篡改 DNS 查询或响应内容将用户重定向到恶意站点。DNS Amplification DDoS——攻击者利用开放 DNS 解析器发送伪造源 IP 的小查询，DNS 服务器向受害者返回大响应（放大倍数可达 50-100 倍）。DNS 隧道——将数据编码在 DNS 查询和响应中实现隐蔽通信（数据窃取或 C2 命令控制）。\n\nDNSSEC（DNS Security Extensions，RFC 4033-4035）——通过数字签名保证 DNS 响应的完整性和来源认证（不加密 DNS 查询也不解决隐私问题）。核心机制：Zone Signing Key（ZSK）对区域内每条 DNS 记录生成 RRSIG 数字签名。Key Signing Key（KSK）签名 ZSK 公钥用于验证 ZSK 的合法性和可信性。DS（Delegation Signer）记录将子区域的 KSK 哈希传递给父区域形成信任链。信任链从 DNS 根区签名开始（Root Zone KSK 是初始信任锚）逐级验证到目标域名。使用 EDNS0（RFC 6891）扩展携带 DNSSEC 相关数据。DNSSEC 的局限——增加 DNS 响应大小（可能超过 512 字节需要 TCP 回退增加延迟）、DNSSEC 只验证不加密（查询路径和内容仍暴露）、全球部署率仍不高。\n\nDoT（DNS over TLS，RFC 7858）和 DoH（DNS over HTTPS，RFC 8484）——两者都解决 DNS 查询的加密和隐私保护。DoT 使用专用端口 853 建立 TLS 连接传输 DNS 数据，结构简单协议开销低。Android 的 Private DNS 模式即使用 DoT。专用端口可能被 DPI 设备识别和阻塞。DoH 将 DNS 查询封装在 HTTPS 请求中（端口 443 与普通 HTTPS 流量混合），隐藏 DNS 查询行为使 DPI 难以区分。利用现有 HTTP/2 连接池减少连接数。方便浏览器集成（Firefox 和 Chrome 都支持 DoH 配置）。DoH 的协议开销比 DoT 略高（HTTPS 封装的额外头部和 HTTP 状态维护）。\n\n缓存污染防御——现代递归解析器综合使用多种技术：Source Port Randomization（随机化 UDP 查询的源端口增加 TXID 猜测难度从 16 位扩展到 32 位），0x20 编码（在查询域名中随机使用大小写增加额外不可预测性），Query Name Case Randomization。DNSSEC 验证从根本解决缓存污染——签名验证失败递归解析器直接拒绝响应。',
      ['DoH 隐藏 DNS 查询在 HTTPS 流量中是否可能被 TLS SNI 泄露路由域名',
       'DNSSEC 信任链验证失败时递归解析器如何处理——SERVFAIL 回退的可用性风险',
       '源端口随机化为什么能有效防御 Kaminsky 缓存污染攻击——不可预测性'],
      ['DNS', 'DNSSEC', 'DoH', 'DoT']),

    # 18 - Packet analysis tcpdump/Wireshark (NOT covered at all)
    q('design_network', 'easy', 'short_answer',
      '网络抓包与协议分析：tcpdump 与 Wireshark 核心用法',
      'tcpdump 和 Wireshark 在网络故障排查中各自的作用是什么？常用的 tcpdump BPF 过滤语法有哪些？Wireshark 的显示过滤器与捕获过滤器的区别是什么？常见的网络问题分析模式有哪些？',
      'tcpdump 是命令行抓包工具适合在远程服务器和网络设备上实时抓取和分析网络流量。Wireshark 是图形化协议分析工具提供强大的协议解析、流重组和可视化分析功能。两者共享相同的底层抓包引擎（libpcap），Wireshark 通常用于详细分析 tcpdump 生成的 pcap 文件。常用组合：生产服务器上用 tcpdump 抓取小样本文件，传到本地用 Wireshark 深入分析。\n\ntcpdump 常用过滤语法——基础参数：tcpdump -i eth0 指定网卡、tcpdump -c 100 限制抓包数量、tcpdump -s 0 抓取完整包（默认 65535 字节）、tcpdump -w output.pcap 写入文件、tcpdump -r input.pcap 读取已有文件分析。BPF（Berkeley Packet Filter）表达式示例：host 192.168.1.1 过滤特定主机 IP、port 443 或 dst port 80 过滤端口、tcp and port 8080 组合条件（逻辑 and/or/not 连接）、src 10.0.0.1 and dst port 8080 源地址加目标端口组合、tcp[tcpflags] & tcp-syn != 0 过滤 SYN 包（用于观察 TCP 握手）、net 10.0.0.0/24 过滤网段、icmp 或 arp 按协议过滤。高级用法：tcpdump -X 十六进制和 ASCII 显示包内容、tcpdump -A 仅 ASCII 显示适合查看 HTTP 载荷、tcpdump -G 60 -w file_%Y%m%d%H%M.pcap 每 60 秒自动轮转文件。\n\nWireshark 捕获过滤器 vs 显示过滤器——捕获过滤器（Capture Filter）在抓包时使用 BPF 语法直接丢弃不匹配的数据包（减少抓包文件大小，但丢弃的包不能恢复）。显示过滤器（Display Filter）在已捕获的包数据中过滤显示，不丢失任何原始数据。Wireshark 显示过滤器语法更丰富：http.request 显示 HTTP 请求包、tcp.analysis.flags 显示 TCP 分析器标记的异常包（重传/零窗口/乱序等）、dns.qry.name contains example.com DNS 查询中包含特定域名、ip.addr == 10.0.0.1 等于运算符、tcp.port >= 1024 比较运算符、http.request and !dns 逻辑组合。显示过滤器不区分单双等号（== 和 = 均可）。\n\n常见网络问题分析模式——1）TCP 三次握手排查：观察 SYN、SYN-ACK、ACK 是否完整，SYN-ACK 是否返回正确 MSS 和 Window Scale 选项，是否有 RST 中断握手。2）延迟分析：记录从客户端到服务器的各阶段时间（DNS 解析时间、TCP 握手耗时、TLS 握手耗时、首字节时间 TTFB）。3）丢包判断：TCP 重传包数量、Dup ACK 数量、Window Full 和 Window Zero 窗口关闭事件、快速重传和超时重传。4）TLS/SSL 握手：Client Hello 中支持的 Cipher Suite 列表、Server Hello 中选择的算法、证书链完整性、TLS 版本兼容性。5）小包和 Nagle 问题：观察小包发送模式确认是否受 Nagle 算法和延迟确认交互影响。',
      ['tcpdump BPF 捕获过滤器和 Wireshark 显示过滤器的设计目的有何不同',
       'TCP 重传分析中如何区分正常重传和 Spurious Retransmission 虚假重传',
       'Wireshark Follow TCP Stream 功能如何帮助分析 HTTP/SCP/RPC 等应用层协议内容'],
      ['tcpdump', 'Wireshark', '抓包', '网络排障']),

    # 19 - SD-WAN architecture deep (unique angle beyond Q17)
    q('design_network', 'medium', 'short_answer',
      'SD-WAN 架构详解与部署实践',
      'SD-WAN 的核心架构包含哪些组件？SD-WAN 相比传统 MPLS VPN 广域网有哪些核心优势？SD-WAN 有哪些部署模型？零接触部署（ZTP）的流程是怎样的？',
      'SD-WAN 的架构分为三个层面。CPE（Customer Premises Equipment）——位于分支机构的 SD-WAN 边缘设备，通常是物理设备或虚拟化 vCPE。CPE 负责连接多个 WAN 链路（MPLS、宽带、4G/5G LTE）并执行流量转发、QoS 标记、加密隧道建立、链路负载均衡和应用识别。控制器（SD-WAN Controller）——控制面核心组件，集中管理所有 CPE 设备的策略下发、拓扑管理、隧道建立和路由计算。控制器通过 NetConf/YANG 或厂商专有协议与 CPE 通信。编排器（Orchestrator）——提供管理 Portal 和 API，配置 SD-WAN 策略（应用识别规则、流量工程策略、SLA 阈值、安全策略），监控全网设备运行状态。部分厂商将控制器和编排器集成在同一产品中。\n\nSD-WAN 相比传统 MPLS WAN 的优势：1）多链路负载均衡——同时使用 MPLS、宽带、LTE 等多条链路，流量按应用策略自动分配。2）动态路径控制——根据实时延迟、丢包和抖动指标自动选择最优链路（基于 SLA 的策略路由），链路质量劣化时自动切换。3）应用识别和 QoS——DPI 深度包检测识别应用类型（视频会议、ERP、文件同步）按优先级分配带宽和路径。4）零接触部署（ZTP）——分支机构 CPE 上电后自动从控制器下载配置文件和策略实现免现场配置。5）成本优化——使用低成本互联网链路替代部分 MPLS 链路，降低广域网带宽成本 40-60%。\n\n部署模型——Hub-and-Spoke 模型（所有分支机构流量经中心站点中转，适合总部集中式网络）；Full Mesh 模型（所有站点之间直接建立加密隧道，适合多点互联场景，延迟更低但控制面复杂）；Hybrid 模型（关键站点 Full Mesh、普通站点 Hub-and-Spoke 混合部署）。\n\n零接触部署流程——CPE 设备上电后通过 DHCP 获取 IP 地址，向预配置的控制器 URL 发起注册请求（使用设备证书或序列号认证），控制器识别设备后下发完整配置（WAN 链路配置、隧道参数、路由策略、安全策略），CPE 应用配置并与对端建立加密隧道。整个过程不需要现场网络工程师配置。\n\n控制面与数据面分离——控制面运行在控制器（中心化或分布式部署）负责路由计算、策略管理和隧道建立。数据面运行在 CPE 设备本地执行包转发、QoS 和应用识别。控制通道通常使用 DTLS 或 TLS 加密保护。数据隧道使用 IPsec 或 WireGuard 等协议加密。',
      ['SD-WAN 零接触部署流程中设备如何安全地首次注册到控制器——证书和序列号认证',
       'SD-WAN 基于 SLA 的动态路径选择算法的实时性要求——检测间隔和切换延迟的平衡',
       'SD-WAN 部署中链路故障切换的收敛时间如何控制在秒级以内'],
      ['SD-WAN', '广域网', '混合链路', '边缘']),

    # 20 - H2C HTTP/2 Cleartext (NOT covered at all)
    q('design_network', 'medium', 'short_answer',
      'H2C (HTTP/2 Cleartext)：原理、应用场景与配置',
      '什么是 H2C（HTTP/2 Cleartext）？H2 和 H2C 的核心区别是什么？gRPC 为什么需要 H2C 支持？H2C 的 Upgrade 升级机制和 Prior Knowledge 模式分别如何工作？H2C 的安全风险和部署注意事项有哪些？',
      'H2C（HTTP/2 Cleartext，RFC 7540 Section 3）是明文传输的 HTTP/2 协议。标准 HTTP/2（标识为 h2）使用 TLS 加密传输，H2C（标识为 h2c）则直接在 TCP 上传输 HTTP/2 二进制帧不使用 TLS。两者的协议格式和帧结构完全相同——都使用二进制帧（DATA、HEADERS、SETTINGS、PING、GOAWAY 等）、多路复用流机制、HPACK 头部压缩和流优先级控制。唯一区别在于 H2 通过 TLS ALPN（Application-Layer Protocol Negotiation）扩展协商 h2 协议，H2C 通过 HTTP/1.1 Upgrade 头或直接发送 HTTP/2 前奏（PRI 魔法字符串）建立连接。\n\nUpgrade 升级机制——客户端先发送 HTTP/1.1 请求，头部包含 Upgrade: h2c 和 HTTP2-Settings 字段（编码后的客户端初始 SETTINGS 帧）。服务器如果支持 H2C 则返回 101 Switching Protocols 状态码表示接受升级。之后连接切换为 HTTP/2 二进制帧模式。这种机制兼容现有的 HTTP/1.1 基础设施（代理和负载均衡器可以自动识别 Upgrade 头并将请求转发到正确后端）。\n\nPrior Knowledge 模式（RFC 7540 Section 3.4）——客户端在建立 TCP 连接后立即发送 HTTP/2 连接前奏（PRI STAR HTTP/2.0 魔法字符串加 SETTINGS 帧），不需要 Upgrade 握手过程。这种模式要求客户端确认服务器确实支持 HTTP/2（否则服务器会将 PRI 字符串视为 HTTP/1.1 请求导致错误）。Prior Knowledge 适用于已知支持 H2C 的后端服务之间的直接通信。\n\ngRPC 与 H2C 的关系——gRPC 传输层要求底层必须支持 HTTP/2。生产环境中标准部署使用 gRPC over TLS（基于 h2），但在测试环境、内部网络、或无法配置 TLS 证书的环境下 gRPC 支持 H2C 模式（无需 TLS 即可运行 gRPC）。gRPC-Go 和 gRPC-Java 等实现提供 WithInsecure 或 usePlaintext 等选项启用 H2C。在已有服务网格 mTLS 加密的 Kubernetes 集群中内部 gRPC 通信可配置为 H2C 避免双重加密开销。\n\n安全风险和部署注意事项——1）H2C 是明文传输不提供机密性和完整性保护，绝不能在不信任网络（如公网）上使用。2）反向代理和负载均衡器需特别配置支持 H2C 后端连接：Nginx 需要在 upstream 配置 http2 参数（注意 Nginx 的 http2 模式仅支持 H2 over TLS，H2C 需要特殊配置 http2 on 和 ssl off），Envoy 的 upstream cluster 设置 http2_protocol_options。3）大多数标准 HTTP 代理不支持 Upgrade 到 H2C（它们期望看到完整的 HTTP/1.1 或纯 HTTP/2），使用 Prior Knowledge 前需要确认中间代理不会干扰。4）H2C 不支持 ALPN 协商，服务器必须通过端口号区分或手动配置来启用 H2C（通常在非标准端口如 8080 启用 H2C）。5）浏览器不支持 H2C，浏览器只支持 H2 over TLS，H2C 严格用于后端服务间通信。',
      ['gRPC 为什么默认使用 TLS 加密的 H2 而非 H2C——安全要求和数据完整性保证',
       'Nginx/Envoy 如何配置将前端 H2 TLS 流量转换为后端 H2C 明文流量',
       'H2C 的 Upgrade 和 Prior Knowledge 两种模式分别适用于什么网络拓扑场景'],
      ['H2C', 'HTTP/2', 'gRPC', '协议']),
]

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(DATA_DIR, 'design_network.json')
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
print(f'Total design_network questions: {len(data)}')
