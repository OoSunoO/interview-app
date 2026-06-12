export const knowledge = {
  网络: {
    category: "network",
    content: `##计算机网络核心概念

### TCP/IP 四层模型
应用层 -> 传输层 -> 网络层 -> 网络接口层（OSI 七层精简版）。

### HTTP vs HTTPS
- HTTP 端口 80，明文传输；HTTPS 端口 443，SSL/TLS 加密。

### HTTP/1.1 vs HTTP/2.0
- 多路复用：HTTP/2.0 在同一连接上并行传输多个请求/响应。
- 二进制帧：更紧凑高效。
- 头部压缩：HPACK 算法。
- 服务器推送。

### HTTP/3.0
改用 QUIC 协议（基于 UDP），0-RTT 或 1-RTT 握手，解决 TCP 队头阻塞问题。

### GET vs POST
| 维度 | GET | POST |
|------|-----|------|
| 语义 | 获取/查询资源 | 创建/修改资源 |
| 幂等性 | 幂等 | 非幂等 |
| 参数 | URL 中（querystring） | 请求体中 |
| 缓存 | 可缓存 | 不应缓存 |

### 状态码分类
2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。`,
    source: null,
    domain: "network",
  },
  TCP: {
    category: "network",
    content: `##TCP 核心概念

### TCP vs UDP
| 特性 | TCP | UDP |
|------|-----|-----|
| 连接性 | 面向连接 | 无连接 |
| 可靠性 | 可靠 | 不可靠 |
| 传输形式 | 面向字节流 | 面向报文 |
| 首部开销 | 20-60 字节 | 8 字节 |
| 通信模式 | 点对点 | 单播、多播、广播 |
| 典型应用 | HTTP/HTTPS, FTP, SMTP, SSH | DNS, DHCP, 音视频 |

### 三次握手
1. 客户端发送 SYN（seq=x）
2. 服务端回复 SYN+ACK（seq=y, ack=x+1）
3. 客户端发送 ACK（ack=y+1）

### 四次挥手
客户端发送 FIN → 服务端回复 ACK → 服务端发送 FIN → 客户端回复 ACK。客户端需等待 2MSL。

### 可靠性保障
序列号与确认应答、超时重传、流量控制（滑动窗口）、拥塞控制（慢启动、拥塞避免、快重传、快恢复）。`,
    source: null,
    domain: "network",
  },
  HTTP: {
    category: "network",
    content: `## HTTP 协议

### HTTP 版本演进
| 版本 | 特点 |
|------|------|
| HTTP/1.0 | 短连接，每次请求新建 TCP 连接 |
| HTTP/1.1 | 持久连接（Keep-Alive）、管道化、Host 头 |
| HTTP/2 | 多路复用、二进制分帧、头部压缩（HPACK）、服务端推送 |
| HTTP/3 | 基于 QUIC（UDP）、0-RTT 握手、无队头阻塞 |

### HTTP 方法
- **GET**：幂等，安全（只读），可缓存
- **POST**：非幂等，不安全，通常不可缓存
- **PUT**：幂等，更新资源
- **DELETE**：幂等，删除资源
- **PATCH**：部分更新
- **HEAD**：类似 GET 但只返回响应头

### 状态码
- 2xx：成功 — 200 OK, 201 Created, 204 No Content
- 3xx：重定向 — 301, 302, 304 Not Modified
- 4xx：客户端错误 — 400, 401, 403, 404
- 5xx：服务端错误 — 500, 502, 503

### HTTPS = HTTP + TLS
- **非对称加密**：客户端用公钥加密对称密钥，服务端用私钥解密
- **数字证书**：CA 签发，验证服务端身份
- **TLS 握手**：ClientHello → ServerHello + 证书 + 密钥交换 → 完成`,
    source: null,
    domain: "network",
  },
  TCP_IP: {
    category: "network",
    content: `## TCP/IP 协议栈

### 四层模型
- **应用层**：HTTP、FTP、SMTP、DNS
- **传输层**：TCP、UDP
- **网络层**：IP、ICMP
- **链路层**：以太网、Wi-Fi

### TCP 核心特性
| 特性 | 说明 |
|------|------|
| 面向连接 | 三次握手建立，四次挥手释放 |
| 可靠传输 | 确认重传（ARQ）、序列号、校验和 |
| 流量控制 | 滑动窗口机制 |
| 拥塞控制 | 慢开始、拥塞避免、快重传、快恢复 |

### 三次握手
1. **SYN**：客户端发送 SYN=1, seq=x
2. **SYN+ACK**：服务端回复 SYN=1, ACK=1, seq=y, ack=x+1
3. **ACK**：客户端发送 ACK=1, seq=x+1, ack=y+1

**为什么是三次？** 防止已失效的连接请求到达服务端。

### 四次挥手
1. **FIN**：客户端发送 FIN=1
2. **ACK**：服务端回复 ACK（半关闭状态）
3. **FIN**：服务端发送 FIN=1
4. **ACK**：客户端回复 ACK，等待 2MSL

### UDP 特点
- 无连接，不可靠
- 头部仅 8 字节
- 支持广播和多播
- 适用于 DNS、视频通话、直播等实时场景`,
    source: null,
    domain: "network",
  },
};
