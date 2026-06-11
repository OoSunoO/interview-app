/**
 * Domain taxonomy — single source of truth for knowledge domain hierarchy.
 *
 * Structure:
 *   domain.id -> { label, icon?, children: [subdomain.id], categories: [question slugs] }
 *
 * The `categories` array maps question category slugs → this domain,
 * so the backend API can aggregate progress stats by domain.
 */
export const DOMAINS = {
  cs_basics: {
    label: "计算机基础",
    children: ["os", "network", "algorithm", "security"],
    categories: [],
  },
  os: {
    label: "操作系统",
    parent: "cs_basics",
    categories: ["cs_basics", "cs_basics_extras"],
  },
  network: {
    label: "网络",
    parent: "cs_basics",
    categories: ["network", "design_network", "design_network_extras"],
  },
  algorithm: {
    label: "算法与数据结构",
    parent: "cs_basics",
    categories: ["algorithm", "algorithm_extras"],
  },
  security: {
    label: "安全",
    parent: "cs_basics",
    categories: ["security"],
  },

  backend: {
    label: "后端开发",
    children: [
      "java",
      "java_advanced",
      "java_collections",
      "jvm",
      "concurrency",
      "design_patterns",
      "spring",
      "database",
      "redis",
      "mq",
      "distributed",
      "microservices",
      "devops",
      "linux",
    ],
    categories: [],
  },
  java: {
    label: "Java 基础",
    parent: "backend",
    categories: [
      "java",
      "java_basic",
      "java_basic_choice",
      "java_multiple_choice",
      "java_true_false",
    ],
  },
  java_advanced: {
    label: "Java 进阶",
    parent: "backend",
    categories: ["java_advanced", "java_advanced_choice"],
  },
  java_collections: {
    label: "Java 集合",
    parent: "backend",
    categories: ["java_collections", "java_collections_choice"],
  },
  jvm: {
    label: "JVM",
    parent: "backend",
    categories: ["jvm", "jvm_extras", "jvm_fill_blank"],
  },
  concurrency: {
    label: "并发编程",
    parent: "backend",
    categories: ["concurrency", "concurrency_fill_blank"],
  },
  design_patterns: {
    label: "设计模式",
    parent: "backend",
    categories: ["design_patterns"],
  },
  spring: {
    label: "Spring",
    parent: "backend",
    categories: [],
  },
  database: {
    label: "数据库",
    parent: "backend",
    categories: ["database", "database_extras"],
  },
  redis: {
    label: "Redis",
    parent: "backend",
    categories: ["redis", "redis_extras"],
  },
  mq: {
    label: "消息队列",
    parent: "backend",
    categories: ["mq", "mq_extras"],
  },
  distributed: {
    label: "分布式系统",
    parent: "backend",
    categories: ["distributed_systems"],
  },
  microservices: {
    label: "微服务",
    parent: "backend",
    categories: ["microservices"],
  },
  devops: {
    label: "DevOps",
    parent: "backend",
    categories: ["devops", "kubernetes"],
  },
  linux: {
    label: "Linux",
    parent: "backend",
    categories: ["linux"],
  },

  frontend: {
    label: "前端",
    children: ["frontend_basics", "react"],
    categories: [],
  },
  frontend_basics: {
    label: "前端基础",
    parent: "frontend",
    categories: ["frontend"],
  },
  react: {
    label: "React",
    parent: "frontend",
    categories: ["react"],
  },

  ai: {
    label: "人工智能",
    children: ["ai_basics", "ai_infra", "ai_agent"],
    categories: [],
  },
  ai_basics: {
    label: "AI 基础",
    parent: "ai",
    categories: ["ai"],
  },
  ai_infra: {
    label: "AI 基础设施",
    parent: "ai",
    categories: ["ai_infra", "ai_infra_extras"],
  },
  ai_agent: {
    label: "AI Agent",
    parent: "ai",
    categories: ["agent", "agent_dev_extras"],
  },

  system_design: {
    label: "系统设计",
    children: ["system_design_main"],
    categories: [],
  },
  system_design_main: {
    label: "系统设计",
    parent: "system_design",
    categories: ["system_design", "system_design_extras", "system_design_micro"],
  },

  other: {
    label: "其他",
    children: ["python", "server"],
    categories: [],
  },
  python: {
    label: "Python",
    parent: "other",
    categories: ["python"],
  },
  server: {
    label: "服务器与中间件",
    parent: "other",
    categories: ["server"],
  },

  soft_skills: {
    label: "软技能",
    children: ["behavioral", "career", "product", "project_mgmt"],
    categories: [],
  },
  behavioral: {
    label: "行为面试",
    parent: "soft_skills",
    categories: ["behavioral", "behavioral_extras"],
  },
  career: {
    label: "求职与职业发展",
    parent: "soft_skills",
    categories: ["career", "career_extras"],
  },
  product: {
    label: "产品思维",
    parent: "soft_skills",
    categories: ["product"],
  },
  project_mgmt: {
    label: "项目管理",
    parent: "soft_skills",
    categories: ["project_mgmt"],
  },
};

/**
 * Reverse map: question category slug → domain id.
 * Used by the backend progress API to aggregate stats by domain.
 */
export const CATEGORY_TO_DOMAIN = {};
for (const [id, def] of Object.entries(DOMAINS)) {
  for (const cat of def.categories || []) {
    CATEGORY_TO_DOMAIN[cat] = id;
  }
}

/** Get all top-level domain IDs (ones without a parent). */
export function topDomains() {
  return Object.entries(DOMAINS)
    .filter(([, d]) => !d.parent)
    .map(([id]) => id);
}

/** Get children of a domain. */
export function domainChildren(id) {
  const d = DOMAINS[id];
  return d?.children || [];
}

/** Get domain label. */
export function domainLabel(id) {
  return DOMAINS[id]?.label || id;
}
