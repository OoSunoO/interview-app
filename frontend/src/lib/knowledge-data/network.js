export const knowledge = {
  操作系统: {
    category: "cs_basics",
    content:
      "##操作系统核心概念\n\n### 进程 vs 线程\n- **进程**：资源分配的基本单位，独立地址空间，创建/切换开销大。\n- **线程**：CPU 调度的基本单位，共享所属进程资源，创建/切换开销小。一个线程崩溃可能导致整个进程崩溃。\n\n### 用户态 vs 内核态\n- 用户态：低权限，只能访问用户程序数据。\n- 内核态：高权限，可访问任何资源。\n- 切换方式：系统调用（主动）、中断（外部设备触发）、异常（程序自身错误）。\n\n### 进程间通信方式\n管道、有名管道（FIFO）、信号、消息队列、信号量、共享内存、套接字。\n\n### 死锁四个必要条件\n互斥、占有并等待、非抢占、循环等待。破坏任一则可预防。\n\n### 进程调度算法\nFCFS（先来先服务）、SJF（短作业优先）、RR（时间片轮转）、MFQ（多级反馈队列，平衡长短作业）。\n\n### 虚拟内存\n将物理内存抽象为逻辑地址空间，通过分页/分段实现。页面置换算法：FIFO、LRU、时钟算法等。\n\n### 内存管理\n- **分页**：将虚拟内存和物理内存划分为固定大小的页（4KB），通过页表映射。多级页表减少页表占用。\n- **分段**：按逻辑段（代码段、数据段、堆、栈）管理内存，段大小可变。\n- **段页式**：先分段，每段内再分页，兼具分段逻辑清晰和分页无碎片优势。\n- **内存碎片**：外部碎片（分段导致，无法连续分配）通过紧凑技术解决；内部碎片（分页导致，页内未用完空间），现代 OS 主要用分页。\n- **页面置换算法**：最佳置换（OPT，理论最优）、FIFO（先进先出，Belady 异常）、LRU（最近最少使用，栈实现）、时钟算法（近似 LRU，效率高）。\n- **写时复制（Copy-on-Write）**：fork() 创建子进程时共享物理内存，仅写入时复制，节省内存。\n",
    source: null,
    domain: "os",
  },
  网络: {
    category: "cs_basics",
    content:
      "##计算机网络核心概念\n\n### TCP/IP 四层模型\n应用层 -> 传输层 -> 网络层 -> 网络接口层（OSI 七层精简版）。\n\n### HTTP vs HTTPS\n- HTTP 端口 80，明文传输；HTTPS 端口 443，SSL/TLS 加密。\n\n### HTTP/1.1 vs HTTP/2.0\n- 多路复用：HTTP/2.0 在同一连接上并行传输多个请求/响应。\n- 二进制帧：更紧凑高效。\n- 头部压缩：HPACK 算法。\n- 服务器推送。\n\n### HTTP/3.0\n改用 QUIC 协议（基于 UDP），0-RTT 或 1-RTT 握手，解决 TCP 队头阻塞问题。\n\n### GET vs POST\n| 维度 | GET | POST |\n|------|-----|------|\n| 语义 | 获取/查询资源 | 创建/修改资源 |\n| 幂等性 | 幂等 | 非幂等 |\n| 参数 | URL 中（querystring） | 请求体中 |\n| 缓存 | 可缓存 | 不应缓存 |\n\n### 状态码分类\n2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。\n",
    source: null,
    domain: "os",
  },
  TCP: {
    category: "cs_basics",
    content:
      "##TCP 核心概念\n\n### TCP vs UDP\n| 特性 | TCP | UDP |\n|------|-----|-----|\n| 连接性 | 面向连接（三次握手/四次挥手） | 无连接 |\n| 可靠性 | 可靠（序列号、ACK、重传、流量/拥塞控制） | 不可靠（尽力交付） |\n| 传输形式 | 面向字节流 | 面向报文 |\n| 首部开销 | 20-60 字节 | 8 字节 |\n| 通信模式 | 点对点（单播） | 单播、多播、广播 |\n| 典型应用 | HTTP/HTTPS, FTP, SMTP, SSH | DNS, DHCP, 音视频, 在线游戏 |\n\n### 三次握手\n1. 客户端发送 SYN（seq=x）\n2. 服务端回复 SYN+ACK（seq=y, ack=x+1）\n3. 客户端发送 ACK（ack=y+1）\n\n### 四次挥手\n客户端发送 FIN -> 服务端回复 ACK -> 服务端发送 FIN -> 客户端回复 ACK。客户端需等待 2MSL 才进入 CLOSED 状态。\n\n### 可靠性保障机制\n序列号与确认应答、超时重传、流量控制（滑动窗口）、拥塞控制（慢启动、拥塞避免、快重传、快恢复）。\n",
    source: null,
    domain: "os",
  },
  HTTP: {
    category: "network",
    content:
      "## HTTP 协议\n\n### HTTP 版本演进\n| 版本 | 特点 |\n|------|------|\n| HTTP/1.0 | 短连接，每次请求新建 TCP 连接 |\n| HTTP/1.1 | 持久连接（Keep-Alive）、管道化、Host 头 |\n| HTTP/2 | 多路复用、二进制分帧、头部压缩（HPACK）、服务端推送 |\n| HTTP/3 | 基于 QUIC（UDP）、0-RTT 握手、无队头阻塞 |\n\n### HTTP 方法\n- **GET**：幂等，安全（只读），可缓存\n- **POST**：非幂等，不安全，通常不可缓存\n- **PUT**：幂等，更新资源\n- **DELETE**：幂等，删除资源\n- **PATCH**：部分更新\n- **HEAD**：类似 GET 但只返回响应头\n\n### 状态码\n- 1xx：信息性 — 100 Continue\n- 2xx：成功 — 200 OK, 201 Created, 204 No Content\n- 3xx：重定向 — 301 Moved Permanently, 302 Found, 304 Not Modified\n- 4xx：客户端错误 — 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found\n- 5xx：服务端错误 — 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable\n\n### HTTPS = HTTP + TLS\n- **非对称加密**：客户端用服务端公钥加密对称密钥，服务端用私钥解密\n- **数字证书**：CA 签发，验证服务端身份\n- **TLS 握手**：ClientHello → ServerHello + 证书 + 密钥交换 → 完成\n",
    source: null,
    domain: "network",
  },
  TCP_IP: {
    category: "network",
    content:
      "## TCP/IP 协议栈\n\n### 四层模型\n- **应用层**：HTTP、FTP、SMTP、DNS — 为用户提供网络应用服务。\n- **传输层**：TCP、UDP — 端到端通信，提供可靠或不可靠传输。\n- **网络层**：IP、ICMP — 路由寻址、分组转发。\n- **链路层**：以太网、Wi-Fi — 相邻节点间的帧传输。\n\n### TCP 核心特性\n| 特性 | 说明 |\n|------|------|\n| 面向连接 | 三次握手建立连接，四次挥手释放连接 |\n| 可靠传输 | 确认重传（ARQ）、序列号、校验和 |\n| 流量控制 | 滑动窗口机制，防止发送方过快 |\n| 拥塞控制 | 慢开始、拥塞避免、快重传、快恢复 |\n\n### 三次握手\n1. **SYN**：客户端发送 SYN=1, seq=x → 服务端\n2. **SYN+ACK**：服务端回复 SYN=1, ACK=1, seq=y, ack=x+1 → 客户端\n3. **ACK**：客户端发送 ACK=1, seq=x+1, ack=y+1 → 服务端\n\n**为什么是三次？** 防止已失效的连接请求到达服务端，避免资源浪费。\n\n### 四次挥手\n1. **FIN**：客户端发送 FIN=1 → 服务端（不再发送数据）\n2. **ACK**：服务端回复 ACK（半关闭状态，客户端→服务端通道关闭）\n3. **FIN**：服务端数据发送完毕，发送 FIN=1 → 客户端\n4. **ACK**：客户端回复 ACK，等待 2MSL 后关闭\n\n**为什么 TIME_WAIT 需要 2MSL？** 确保最后一个 ACK 被收到，以及让过期的报文段在网络中消失。\n\n### UDP 特点\n- 无连接，不可靠\n- 头部仅 8 字节（TCP 20-60 字节）\n- 支持广播和多播\n- 适用于 DNS、视频通话、直播等实时场景\n",
    source: null,
    domain: "network",
  },
  Linux: {
    category: "linux",
    content:
      '## Linux 核心要点\n\n### 常用命令分类\n\n#### 文件操作\n- `ls -la`：列出文件详情（-a 包含隐藏文件，-l 长格式）\n- `find . -name "*.log" -mtime +7`：查找 7 天前的 .log 文件\n- `grep -r "error" --include="*.java"`：递归搜索 Java 文件中的 error\n- `awk \'{print $1, $NF}\'`：打印每行第一列和最后一列\n- `sed -i \'s/old/new/g\' file`：原地替换文本\n- `tar -czf archive.tar.gz dir/`：压缩目录\n\n#### 进程管理\n- `ps aux --sort=-%mem`：按内存降序查看所有进程\n- `top -o %CPU`：实时查看 CPU 占用最高的进程\n- `htop`：增强版 top（需安装）\n- `kill -15 PID`：优雅终止进程（SIGTERM）\n- `kill -9 PID`：强制终止（SIGKILL，谨慎使用）\n- `nohup command &`：后台运行，退出终端不终止\n- `systemctl start/stop/status/restart`：systemd 服务管理\n\n#### 网络\n- `netstat -tlnp` / `ss -tlnp`：查看监听端口\n- `curl -v http://example.com`：调试 HTTP 请求详情\n- `ping -c 5 host`：网络连通性测试\n- `traceroute host` / `mtr host`：路由跟踪\n- `tcpdump -i eth0 port 80`：抓包分析\n- `lsof -i :8080`：查看端口被哪个进程占用\n\n#### 磁盘与内存\n- `df -h`：磁盘分区使用情况\n- `du -sh *`：当前目录各项目大小\n- `iostat -x 1`：磁盘 I/O 性能监控（每秒刷新）\n- `free -h`：内存使用情况\n- `vmstat 1`：虚拟内存、CPU、I/O 综合统计\n\n### Linux 内核关键概念\n\n#### 进程与线程\n- Linux 不区分进程和线程——都使用 `task_struct` 表示\n- 线程是共享地址空间的进程（通过 clone 系统调用创建）\n- 调度器基于 CFS（Completely Fair Scheduler），时间复杂度 O(log n)\n\n#### 文件系统\n- 一切皆文件：普通文件、目录、设备、socket、pipe 都是 fd\n- inode 存储元数据（权限、大小、时间戳），不存储文件名\n- 硬链接共享同一个 inode（`ln source target`）\n- 符号链接是独立的 inode 指向目标路径（`ln -s source target`）\n\n#### I/O 模型\n\n| 模型 | 特点 | 系统调用 |\n|------|------|---------|\n| 阻塞 I/O | 进程休眠等待 | read / write |\n| 非阻塞 I/O | 立即返回，轮询检查 | O_NONBLOCK |\n| I/O 多路复用 | 单线程监控多个 fd | select / poll / epoll |\n| 信号驱动 I/O | fd 就绪时发信号通知 | SIGIO |\n| 异步 I/O | 内核完成 I/O 后通知 | io_uring |\n\n#### epoll 进阶\n- `epoll_create`：创建 epoll 实例\n- `epoll_ctl`：注册/修改/删除关心的 fd\n- `epoll_wait`：等待事件就绪\n- **水平触发（LT）**：fd 还有数据未读就会继续通知（默认）\n- **边缘触发（ET）**：fd 状态变化时才通知一次，需配合非阻塞 I/O 循环读取\n- epoll 相比 select/poll 的优势：O(1) 复杂度，无 1024 fd 上限，无需拷贝 fd 集合\n\n### 性能排查常用命令\n\n| 场景 | 命令 | 关注点 |\n|------|------|--------|\n| CPU 高 | `top` / `perf top` | 哪个进程/函数占 CPU |\n| 内存高 | `free -h` / `ps aux --sort=-%mem` | 内存泄漏嫌疑进程 |\n| IO 高 | `iostat -x 1` / `iotop` | await, %util |\n| 网络慢 | `ss -ti` / `ping` / `mtr` | 延迟、丢包率 |\n| 文件句柄泄漏 | `lsof -p PID | wc -l` | fd 数量是否持续增长 |\n| 上下文切换高 | `vmstat 1` / `pidstat -w` | cs（context switch）列 |\n',
    source: "综合整理",
    domain: "linux",
  },
};
