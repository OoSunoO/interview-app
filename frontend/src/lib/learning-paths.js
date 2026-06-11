export const PATHS = [
  {
    id: "java-backend",
    title: "Java 后端面试突击",
    description: "覆盖 Java 生态核心知识，从基础到系统设计，适合国内中大厂 Java 后端岗位",
    icon: "coffee",
    color: "#e74c3c",
    estimatedWeeks: 12,
    stages: [
      {
        id: "java-core",
        title: "Java 核心基础",
        description: "语法、OOP、集合、异常",
        targets: [
          { category: "java_basic", label: "Java 基础", required: 20 },
          { category: "java_collections", label: "Java 集合", required: 15 },
        ],
      },
      {
        id: "jvm",
        title: "JVM 与内存管理",
        description: "内存模型、GC、类加载、调优",
        targets: [{ category: "jvm", label: "JVM", required: 30 }],
      },
      {
        id: "concurrency",
        title: "并发编程",
        description: "线程、锁、JUC、AQS",
        targets: [{ category: "concurrency", label: "并发编程", required: 25 }],
      },
      {
        id: "java-advanced",
        title: "Java 进阶与框架",
        description: "反射、代理、IO/NIO、Spring 核心",
        targets: [
          { category: "java_advanced", label: "Java 进阶", required: 20 },
          { category: "design_patterns", label: "设计模式", required: 15 },
        ],
      },
      {
        id: "database",
        title: "数据库与缓存",
        description: "MySQL、Redis、索引、事务",
        targets: [
          { category: "database", label: "数据库", required: 10 },
          { category: "redis", label: "Redis", required: 10 },
        ],
      },
      {
        id: "distributed",
        title: "分布式与中间件",
        description: "微服务、MQ、分布式理论",
        targets: [
          { category: "distributed_systems", label: "分布式系统", required: 15 },
          { category: "mq", label: "消息队列", required: 10 },
          { category: "microservices", label: "微服务", required: 15 },
        ],
      },
      {
        id: "system-design",
        title: "系统设计",
        description: "架构设计、高并发、高可用",
        targets: [
          { category: "system_design", label: "系统设计", required: 30 },
          { category: "design_network", label: "网络设计", required: 8 },
        ],
      },
      {
        id: "interview-prep",
        title: "面试冲刺",
        description: "算法、行为面试、软技能",
        targets: [
          { category: "algorithm", label: "算法", required: 20 },
          { category: "behavioral", label: "行为面试", required: 10 },
          { category: "cs_basics", label: "计算机基础", required: 10 },
        ],
      },
    ],
  },
  {
    id: "system-design",
    title: "系统设计面试准备",
    description: "从基础架构到高并发设计，适合架构师/高级工程师岗位",
    icon: "layers",
    color: "#6c8cff",
    estimatedWeeks: 8,
    stages: [
      {
        id: "sd-basics",
        title: "设计基础",
        description: "理论、模式、网络",
        targets: [
          { category: "design_patterns", label: "设计模式", required: 12 },
          { category: "design_network", label: "网络设计", required: 8 },
        ],
      },
      {
        id: "sd-storage",
        title: "存储与缓存",
        description: "数据库、缓存、存储选型",
        targets: [
          { category: "database", label: "数据库", required: 10 },
          { category: "redis", label: "Redis", required: 10 },
        ],
      },
      {
        id: "sd-distributed",
        title: "分布式核心",
        description: "CAP、一致性、分布式事务",
        targets: [
          { category: "distributed_systems", label: "分布式系统", required: 15 },
          { category: "microservices", label: "微服务", required: 10 },
        ],
      },
      {
        id: "sd-middleware",
        title: "消息与中间件",
        description: "MQ 选型、消息可靠性",
        targets: [
          { category: "mq", label: "消息队列", required: 12 },
          { category: "kubernetes", label: "Kubernetes", required: 8 },
        ],
      },
      {
        id: "sd-cases",
        title: "经典设计案例",
        description: "秒杀、短链、网盘等",
        targets: [{ category: "system_design", label: "系统设计", required: 40 }],
      },
    ],
  },
  {
    id: "ai-engineer",
    title: "AI/MLE 面试准备",
    description: "ML 基础、LLM、AI Infra，适合 AI 算法工程师/LLM 应用开发",
    icon: "brain",
    color: "#10b981",
    estimatedWeeks: 8,
    stages: [
      {
        id: "ai-basics",
        title: "AI 基础",
        description: "ML 概念、神经网络、训练",
        targets: [{ category: "ai", label: "AI 基础", required: 20 }],
      },
      {
        id: "ai-infra",
        title: "AI 基础设施",
        description: "分布式训练、推理优化、GPU",
        targets: [{ category: "ai_infra", label: "AI 基础设施", required: 25 }],
      },
      {
        id: "ai-agent",
        title: "AI Agent 与 LLM 应用",
        description: "Agent 架构、RAG、Function Calling",
        targets: [{ category: "agent", label: "AI Agent", required: 25 }],
      },
      {
        id: "ai-system",
        title: "AI 系统设计",
        description: "推荐系统、搜索、LLM 部署",
        targets: [
          { category: "system_design", label: "系统设计", required: 15 },
          { category: "distributed_systems", label: "分布式系统", required: 10 },
        ],
      },
      {
        id: "ai-python",
        title: "Python 与算法",
        description: "Python 语法、ML 算法",
        targets: [
          { category: "python", label: "Python", required: 15 },
          { category: "algorithm", label: "算法", required: 10 },
        ],
      },
    ],
  },
  {
    id: "frontend",
    title: "前端面试准备",
    description: "HTML/CSS/JS/React/工程化，适合前端中高级岗位",
    icon: "code",
    color: "#f59e0b",
    estimatedWeeks: 6,
    stages: [
      {
        id: "fe-core",
        title: "前端基础",
        description: "HTML/CSS/JS 核心",
        targets: [{ category: "frontend", label: "前端", required: 25 }],
      },
      {
        id: "fe-react",
        title: "React 生态",
        description: "Hooks、状态管理、SSR",
        targets: [{ category: "react", label: "React", required: 20 }],
      },
      {
        id: "fe-engineering",
        title: "工程化与性能",
        description: "构建工具、性能优化",
        targets: [
          { category: "cs_basics", label: "计算机基础", required: 10 },
          { category: "network", label: "网络", required: 5 },
        ],
      },
      {
        id: "fe-system",
        title: "系统设计",
        description: "前端架构设计",
        targets: [
          { category: "system_design", label: "系统设计", required: 10 },
          { category: "design_network", label: "网络设计", required: 5 },
        ],
      },
    ],
  },
];
