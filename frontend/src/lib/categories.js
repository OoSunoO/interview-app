/**
 * Shared category definitions — single source of truth for category labels
 * and filter dropdown options across all pages.
 *
 * CATEGORY_LABELS maps every raw category slug to its display name.
 * FILTER_CATEGORIES is the curated list for <select> dropdowns.
 */

export const CATEGORY_LABELS = {
  // Core CS
  cs_basics: "计算机基础",
  cs_basics_extras: "计算机基础",
  algorithm: "算法",
  algorithm_extras: "算法",
  database: "数据库",
  database_extras: "数据库",
  network: "网络",
  design_network: "网络设计",
  design_network_extras: "网络设计",
  linux: "Linux",
  devops: "DevOps",

  // Java ecosystem
  java: "Java",
  java_basic: "Java 基础",
  java_advanced: "Java 进阶",
  java_advanced_choice: "Java 进阶",
  java_collections: "Java 集合",
  java_collections_choice: "Java 集合",
  java_multiple_choice: "Java 基础",
  java_true_false: "Java 基础",
  jvm: "JVM",
  jvm_extras: "JVM",
  jvm_fill_blank: "JVM",
  concurrency: "并发编程",
  concurrency_fill_blank: "并发编程",
  design_patterns: "设计模式",
  microservices: "微服务",

  // Frontend
  frontend: "前端",
  react: "React",

  // AI / Agent
  ai: "AI 基础",
  ai_infra: "AI 基础设施",
  ai_infra_extras: "AI 基础设施",
  ai_agent: "AI Agent",
  agent: "AI Agent",
  agent_dev_extras: "AI Agent",

  // System design
  system_design: "系统设计",
  system_design_extras: "系统设计",
  system_design_micro: "系统设计",

  // Middleware & infra
  redis: "Redis",
  redis_extras: "Redis",
  mq: "消息队列",
  mq_extras: "消息队列",
  kubernetes: "Kubernetes",

  // Other languages
  python: "Python",

  // Soft skills
  product: "产品思维",
  project_mgmt: "项目管理",
  behavioral: "行为面试",
  behavioral_extras: "行为面试",
  career: "求职与职业发展",
  career_extras: "求职与职业发展",

  // Mixed
  系统设计: "系统设计",
};

/**
 * Main category grouping — maps every slug to its primary group key.
 * Sub-categories (e.g. java_advanced_choice, concurrency_fill_blank)
 * resolve to their parent for stats aggregation.
 */
export const MAIN_CATEGORY = {
  cs_basics: "cs_basics",
  cs_basics_extras: "cs_basics",
  algorithm: "algorithm",
  algorithm_extras: "algorithm",
  database: "database",
  database_extras: "database",
  network: "network",
  design_network: "design_network",
  design_network_extras: "design_network",
  linux: "linux",
  devops: "devops",

  java: "java",
  java_basic: "java_basic",
  java_advanced: "java_advanced",
  java_advanced_choice: "java_advanced",
  java_collections: "java_collections",
  java_collections_choice: "java_collections",
  java_multiple_choice: "java_basic",
  java_true_false: "java_basic",
  jvm: "jvm",
  jvm_extras: "jvm",
  jvm_fill_blank: "jvm",
  concurrency: "concurrency",
  concurrency_fill_blank: "concurrency",
  design_patterns: "design_patterns",
  microservices: "microservices",

  frontend: "frontend",
  react: "react",

  ai: "ai",
  ai_infra: "ai_infra",
  ai_infra_extras: "ai_infra",
  ai_agent: "agent",
  agent: "agent",
  agent_dev_extras: "agent",

  system_design: "system_design",
  system_design_extras: "system_design",
  system_design_micro: "system_design",

  redis: "redis",
  redis_extras: "redis",
  mq: "mq",
  mq_extras: "mq",
  kubernetes: "kubernetes",

  python: "python",

  product: "product",
  project_mgmt: "project_mgmt",
  behavioral: "behavioral",
  behavioral_extras: "behavioral",
  career: "career",
  career_extras: "career",
  系统设计: "system_design",
};

/**
 * Curated filter dropdown options for Browse / Home / ReviewSession.
 * Each entry: { value, label } where value is a main-category slug
 * (or "" for "all").
 */
export const FILTER_CATEGORIES = [
  { value: "", label: "全部" },

  { value: "cs_basics", label: "计算机基础" },
  { value: "algorithm", label: "算法" },
  { value: "database", label: "数据库" },
  { value: "network", label: "网络" },
  { value: "linux", label: "Linux" },
  { value: "devops", label: "DevOps" },

  { value: "java_basic", label: "Java 基础" },
  { value: "java_advanced", label: "Java 进阶" },
  { value: "java_collections", label: "Java 集合" },
  { value: "jvm", label: "JVM" },
  { value: "concurrency", label: "并发编程" },
  { value: "design_patterns", label: "设计模式" },
  { value: "microservices", label: "微服务" },

  { value: "react", label: "React" },
  { value: "frontend", label: "前端" },

  { value: "ai", label: "AI 基础" },
  { value: "agent", label: "AI Agent" },
  { value: "ai_infra", label: "AI 基础设施" },
  { value: "system_design", label: "系统设计" },

  { value: "redis", label: "Redis" },
  { value: "mq", label: "消息队列" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "python", label: "Python" },

  { value: "project_mgmt", label: "项目管理" },
  { value: "product", label: "产品思维" },
  { value: "behavioral", label: "行为面试" },
  { value: "career", label: "求职与职业发展" },
];

export function categoryLabel(slug) {
  return CATEGORY_LABELS[slug] || slug;
}
