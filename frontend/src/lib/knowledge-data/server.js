export const knowledge = {
  Nginx: {
    category: "server",
    content: `## Nginx 核心要点

### 架构特点
- **事件驱动**：基于 epoll 的异步非阻塞模型，单进程可处理数万并发连接。
- **Master-Worker 架构**：Master 管理配置和 Worker，Worker 处理请求。
- **多进程单线程**：Worker 进程间独立，无需加锁。

### 核心配置
\`\`\`nginx
# 反向代理
location /api/ {
    proxy_pass http://backend:8080/;
    proxy_set_header Host $host;
}

# 负载均衡
upstream backend {
    ip_hash;
    server 10.0.0.1:8080 weight=3;
    server 10.0.0.2:8080;
}

# 静态文件缓存
location /static/ {
    root /var/www;
    expires 30d;
    add_header Cache-Control public;
}

# HTTPS
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
\`\`\`

### 常用功能
- **反向代理**：隐藏后端服务器，统一入口。
- **负载均衡**：轮询、加权、ip_hash、least_conn。
- **静态资源服务**：直接提供静态文件，配合缓存策略。
- **HTTPS 终止**：SSL/TLS 卸载，减轻后端负担。
- **限流**：limit_req_zone + limit_req。
- **访问控制**：allow/deny 白名单。`,
    source: "综合整理",
    domain: "server",
  },
  Tomcat: {
    category: "server",
    content: `## Tomcat 核心要点

### 架构
- **连接器（Connector）**：处理网络连接。BIO/NIO/APR。
- **容器（Container）**：管理 Servlet 生命周期。
  - Engine → Host → Context → Wrapper。
- **Server**：Tomcat 实例。
- **Service**：连接器 + 容器组合。

### 优化参数
\`\`\`
-Xms4g -Xmx4g -XX:+UseG1GC
-Djava.awt.headless=true
\`\`\`

- **连接器配置**：
  - maxThreads：最大线程数（默认 200）。
  - maxConnections：最大连接数（NIO 默认 10000）。
  - acceptCount：排队队列长度。
- **静态资源压缩**：compression="on" compressionMinSize="2048"。
- **APR 模式**：通过 OpenSSL 提供更好的异步 IO 性能。`,
    source: "综合整理",
    domain: "server",
  },
};
