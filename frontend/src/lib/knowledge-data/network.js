export const knowledge = {
  操作系统: {
    category: "cs_basics",
    content: `##操作系统核心概念

### 进程 vs 线程
- **进程**：资源分配的基本单位，独立地址空间，创建/切换开销大。
- **线程**：CPU 调度的基本单位，共享所属进程资源，创建/切换开销小。一个线程崩溃可能导致整个进程崩溃。

### 用户态 vs 内核态
- 用户态：低权限，只能访问用户程序数据。
- 内核态：高权限，可访问任何资源。
- 切换方式：系统调用（主动）、中断（外部设备触发）、异常（程序自身错误）。

### 进程间通信方式
管道、有名管道（FIFO）、信号、消息队列、信号量、共享内存、套接字。

### 死锁四个必要条件
互斥、占有并等待、非抢占、循环等待。破坏任一则可预防。

### 进程调度算法
FCFS（先来先服务）、SJF（短作业优先）、RR（时间片轮转）、MFQ（多级反馈队列，平衡长短作业）。

### 虚拟内存
将物理内存抽象为逻辑地址空间，通过分页/分段实现。页面置换算法：FIFO、LRU、时钟算法等。

### 内存管理
- **分页**：将虚拟内存和物理内存划分为固定大小的页（4KB），通过页表映射。多级页表减少页表占用。
- **分段**：按逻辑段（代码段、数据段、堆、栈）管理内存，段大小可变。
- **段页式**：先分段，每段内再分页，兼具分段逻辑清晰和分页无碎片优势。
- **内存碎片**：外部碎片（分段导致，无法连续分配）通过紧凑技术解决；内部碎片（分页导致，页内未用完空间），现代 OS 主要用分页。
- **页面置换算法**：最佳置换（OPT，理论最优）、FIFO（先进先出，Belady 异常）、LRU（最近最少使用，栈实现）、时钟算法（近似 LRU，效率高）。
- **写时复制（Copy-on-Write）**：fork() 创建子进程时共享物理内存，仅写入时复制，节省内存。
`,
    source: null,
  },
  网络: {
    category: "cs_basics",
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
2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。
`,
    source: null,
  },
  TCP: {
    category: "cs_basics",
    content: `##TCP 核心概念

### TCP vs UDP
| 特性 | TCP | UDP |
|------|-----|-----|
| 连接性 | 面向连接（三次握手/四次挥手） | 无连接 |
| 可靠性 | 可靠（序列号、ACK、重传、流量/拥塞控制） | 不可靠（尽力交付） |
| 传输形式 | 面向字节流 | 面向报文 |
| 首部开销 | 20-60 字节 | 8 字节 |
| 通信模式 | 点对点（单播） | 单播、多播、广播 |
| 典型应用 | HTTP/HTTPS, FTP, SMTP, SSH | DNS, DHCP, 音视频, 在线游戏 |

### 三次握手
1. 客户端发送 SYN（seq=x）
2. 服务端回复 SYN+ACK（seq=y, ack=x+1）
3. 客户端发送 ACK（ack=y+1）

### 四次挥手
客户端发送 FIN -> 服务端回复 ACK -> 服务端发送 FIN -> 客户端回复 ACK。客户端需等待 2MSL 才进入 CLOSED 状态。

### 可靠性保障机制
序列号与确认应答、超时重传、流量控制（滑动窗口）、拥塞控制（慢启动、拥塞避免、快重传、快恢复）。
`,
    source: null,
  },
  HTTP: {
    category: "cs_basics",
    content: `##HTTP 核心要点

### 状态码
- **2xx** 成功：200 OK、201 Created、204 No Content
- **3xx** 重定向：301 Moved Permanently、302 Found、304 Not Modified
- **4xx** 客户端错误：400 Bad Request、401 Unauthorized、403 Forbidden、404 Not Found
- **5xx** 服务端错误：500 Internal Server Error、502 Bad Gateway、503 Service Unavailable

### HTTP/1.0 vs HTTP/1.1
| 特性 | HTTP/1.0 | HTTP/1.1 |
|------|----------|----------|
| 连接 | 短连接 | 长连接（持久连接） |
| 缓存 | If-Modified-Since, Expires | 增加 Entity tag, If-None-Match |
| 带宽 | 不支持范围请求 | 支持 Range 头（206 Partial Content） |
| Host 头 | 无 | 支持虚拟主机 |

### HTTP/2.0 vs HTTP/3.0
| 维度 | HTTP/2.0 | HTTP/3.0 |
|------|----------|----------|
| 传输协议 | TCP | QUIC（基于 UDP） |
| 连接建立 | 约 3 RTT（TCP + TLS） | 0-RTT 或 1-RTT |
| 队头阻塞 | TCP 层队头阻塞 | 独立数据流，降低阻塞 |
| 连接迁移 | 四元组改变失效 | 64 位 ID，网络切换不中断 |

### WebSocket vs HTTP
WebSocket 全双工通信，服务端可主动推送数据；HTTP 半双工，需客户端发起请求。
`,
    source: null,
  },
  TCP_IP: {
    category: "network",
    content: `## TCP/IP 协议栈

### 四层模型
- **应用层**：HTTP、FTP、SMTP、DNS — 为用户提供网络应用服务。
- **传输层**：TCP、UDP — 端到端通信，提供可靠或不可靠传输。
- **网络层**：IP、ICMP — 路由寻址、分组转发。
- **链路层**：以太网、Wi-Fi — 相邻节点间的帧传输。

### TCP 核心特性
| 特性 | 说明 |
|------|------|
| 面向连接 | 三次握手建立连接，四次挥手释放连接 |
| 可靠传输 | 确认重传（ARQ）、序列号、校验和 |
| 流量控制 | 滑动窗口机制，防止发送方过快 |
| 拥塞控制 | 慢开始、拥塞避免、快重传、快恢复 |

### 三次握手
1. **SYN**：客户端发送 SYN=1, seq=x → 服务端
2. **SYN+ACK**：服务端回复 SYN=1, ACK=1, seq=y, ack=x+1 → 客户端
3. **ACK**：客户端发送 ACK=1, seq=x+1, ack=y+1 → 服务端

**为什么是三次？** 防止已失效的连接请求到达服务端，避免资源浪费。

### 四次挥手
1. **FIN**：客户端发送 FIN=1 → 服务端（不再发送数据）
2. **ACK**：服务端回复 ACK（半关闭状态，客户端→服务端通道关闭）
3. **FIN**：服务端数据发送完毕，发送 FIN=1 → 客户端
4. **ACK**：客户端回复 ACK，等待 2MSL 后关闭

**为什么 TIME_WAIT 需要 2MSL？** 确保最后一个 ACK 被收到，以及让过期的报文段在网络中消失。

### UDP 特点
- 无连接，不可靠
- 头部仅 8 字节（TCP 20-60 字节）
- 支持广播和多播
- 适用于 DNS、视频通话、直播等实时场景
`,
    source: null,
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
- 1xx：信息性 — 100 Continue
- 2xx：成功 — 200 OK, 201 Created, 204 No Content
- 3xx：重定向 — 301 Moved Permanently, 302 Found, 304 Not Modified
- 4xx：客户端错误 — 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
- 5xx：服务端错误 — 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable

### HTTPS = HTTP + TLS
- **非对称加密**：客户端用服务端公钥加密对称密钥，服务端用私钥解密
- **数字证书**：CA 签发，验证服务端身份
- **TLS 握手**：ClientHello → ServerHello + 证书 + 密钥交换 → 完成
`,
    source: null,
  },
  Linux: {
    category: "linux",
    content: `## Linux 核心要点

### 常用命令分类

#### 文件操作
- \`ls -la\`：列出文件详情（-a 包含隐藏文件，-l 长格式）
- \`find . -name "*.log" -mtime +7\`：查找 7 天前的 .log 文件
- \`grep -r "error" --include="*.java"\`：递归搜索 Java 文件中的 error
- \`awk '{print \$1, \$NF}'\`：打印每行第一列和最后一列
- \`sed -i 's/old/new/g' file\`：原地替换文本
- \`tar -czf archive.tar.gz dir/\`：压缩目录

#### 进程管理
- \`ps aux --sort=-%mem\`：按内存降序查看所有进程
- \`top -o %CPU\`：实时查看 CPU 占用最高的进程
- \`htop\`：增强版 top（需安装）
- \`kill -15 PID\`：优雅终止进程（SIGTERM）
- \`kill -9 PID\`：强制终止（SIGKILL，谨慎使用）
- \`nohup command &\`：后台运行，退出终端不终止
- \`systemctl start/stop/status/restart\`：systemd 服务管理

#### 网络
- \`netstat -tlnp\` / \`ss -tlnp\`：查看监听端口
- \`curl -v http://example.com\`：调试 HTTP 请求详情
- \`ping -c 5 host\`：网络连通性测试
- \`traceroute host\` / \`mtr host\`：路由跟踪
- \`tcpdump -i eth0 port 80\`：抓包分析
- \`lsof -i :8080\`：查看端口被哪个进程占用

#### 磁盘与内存
- \`df -h\`：磁盘分区使用情况
- \`du -sh *\`：当前目录各项目大小
- \`iostat -x 1\`：磁盘 I/O 性能监控（每秒刷新）
- \`free -h\`：内存使用情况
- \`vmstat 1\`：虚拟内存、CPU、I/O 综合统计

### Linux 内核关键概念

#### 进程与线程
- Linux 不区分进程和线程——都使用 \`task_struct\` 表示
- 线程是共享地址空间的进程（通过 clone 系统调用创建）
- 调度器基于 CFS（Completely Fair Scheduler），时间复杂度 O(log n)

#### 文件系统
- 一切皆文件：普通文件、目录、设备、socket、pipe 都是 fd
- inode 存储元数据（权限、大小、时间戳），不存储文件名
- 硬链接共享同一个 inode（\`ln source target\`）
- 符号链接是独立的 inode 指向目标路径（\`ln -s source target\`）

#### I/O 模型

| 模型 | 特点 | 系统调用 |
|------|------|---------|
| 阻塞 I/O | 进程休眠等待 | read / write |
| 非阻塞 I/O | 立即返回，轮询检查 | O_NONBLOCK |
| I/O 多路复用 | 单线程监控多个 fd | select / poll / epoll |
| 信号驱动 I/O | fd 就绪时发信号通知 | SIGIO |
| 异步 I/O | 内核完成 I/O 后通知 | io_uring |

#### epoll 进阶
- \`epoll_create\`：创建 epoll 实例
- \`epoll_ctl\`：注册/修改/删除关心的 fd
- \`epoll_wait\`：等待事件就绪
- **水平触发（LT）**：fd 还有数据未读就会继续通知（默认）
- **边缘触发（ET）**：fd 状态变化时才通知一次，需配合非阻塞 I/O 循环读取
- epoll 相比 select/poll 的优势：O(1) 复杂度，无 1024 fd 上限，无需拷贝 fd 集合

### 性能排查常用命令

| 场景 | 命令 | 关注点 |
|------|------|--------|
| CPU 高 | \`top\` / \`perf top\` | 哪个进程/函数占 CPU |
| 内存高 | \`free -h\` / \`ps aux --sort=-%mem\` | 内存泄漏嫌疑进程 |
| IO 高 | \`iostat -x 1\` / \`iotop\` | await, %util |
| 网络慢 | \`ss -ti\` / \`ping\` / \`mtr\` | 延迟、丢包率 |
| 文件句柄泄漏 | \`lsof -p PID | wc -l\` | fd 数量是否持续增长 |
| 上下文切换高 | \`vmstat 1\` / \`pidstat -w\` | cs（context switch）列 |
`,
    source: "综合整理",
  },
};
