export const knowledge = {
  安全基础: {
    category: "security",
    domain: "security",
    source: "综合整理",
    content: `## 安全基础

> 来源：综合整理

### 常见攻击与防御
| 攻击 | 原理 | 防御 |
|------|------|------|
| SQL 注入 | 拼接用户输入到 SQL | 参数化查询、ORM |
| XSS | 注入恶意脚本 | 输出编码、CSP |
| CSRF | 跨站请求伪造 | Token、SameSite Cookie |
| SSRF | 服务端请求伪造 | URL 白名单 |
| 命令注入 | 拼接用户输入到系统命令 | 避免 shell 调用 |

### 认证与授权
- **OAuth 2.0**：授权协议（授权码流程最安全）
- **JWT**：无状态 Token，签名防篡改
- **Session**：服务端存储，适合传统 Web
- **RBAC**：基于角色的访问控制

### 传输安全
- TLS 1.3：1-RTT 握手，前向安全
- HTTPS 必须（HSTS 强制）
- 证书管理：Let's Encrypt（免费自动化）

### 数据安全
- **传输加密**：TLS
- **存储加密**：AES-256
- **脱敏**：日志/响应中隐藏敏感字段
- **密钥管理**：Vault / KMS`,
  },
  加密算法: {
    category: "security",
    domain: "security",
    source: "综合整理",
    content: `## 加密算法

> 来源：综合整理

### 对称加密
- **AES**：最常用，密钥长度 128/192/256
- **ChaCha20**：移动端更快的流密码
- 模式：GCM（认证加密，推荐）、CBC（需 IV）、CTR

### 非对称加密
- **RSA**：广泛但慢，密钥 2048+ 位
- **ECC**：同安全性下密钥更短（256 位 ECC ≈ 3072 位 RSA）
- **Ed25519**：现代签名算法，性能优异

### 哈希
- **SHA-256**：常用摘要
- **bcrypt/scrypt/Argon2**：密码哈希（加盐 + 工作因子）
- **MD5/SHA-1**：已不安全，禁止用于签名

### 数字签名
- 私钥签名，公钥验签
- 用途：JWT、TLS 证书、代码签名`,
  },
};
