/**
 * Knowledge Point Content Data
 *
 * Maps tag name → metadata with source links to JavaGuide (https://javaguide.cn/).
 * AI-generated content has been removed — only real JavaGuide references are kept.
 *
 * Each entry: { title, source: { url, title } | null }
 * - source.url: link to the relevant JavaGuide page
 * - source.title: display text for the button
 * - source: null means no JavaGuide page found for this topic
 */

export const knowledgeContent = {
  // ── Java 基础 ──
  基础: {
    category: "java_basic",
    source: {
      url: "https://javaguide.cn/java/basis/",
      title: "JavaGuide - Java 基础",
    },
  },
  面向对象: {
    category: "java_basic",
    source: {
      url: "https://javaguide.cn/java/basis/",
      title: "JavaGuide - Java 基础",
    },
  },
  String: {
    category: "java_basic",
    source: {
      url: "https://javaguide.cn/java/basis/",
      title: "JavaGuide - Java 基础",
    },
  },

  // ── Java 集合 ──
  集合: {
    category: "java_collections",
    source: {
      url: "https://javaguide.cn/java/collection/",
      title: "JavaGuide - Java 集合",
    },
  },
  HashMap: {
    category: "java_collections",
    source: {
      url: "https://javaguide.cn/java/collection/",
      title: "JavaGuide - Java 集合",
    },
  },
  ConcurrentHashMap: {
    category: "java_collections",
    source: {
      url: "https://javaguide.cn/java/collection/",
      title: "JavaGuide - Java 集合",
    },
  },
  ArrayList: {
    category: "java_collections",
    source: {
      url: "https://javaguide.cn/java/collection/",
      title: "JavaGuide - Java 集合",
    },
  },
  LinkedList: {
    category: "java_collections",
    source: {
      url: "https://javaguide.cn/java/collection/",
      title: "JavaGuide - Java 集合",
    },
  },

  // ── JVM ──
  JVM: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/jvm/",
      title: "JavaGuide - JVM",
    },
  },
  GC: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/jvm/",
      title: "JavaGuide - JVM",
    },
  },

  // ── Java 并发 ──
  并发: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/concurrent/",
      title: "JavaGuide - Java 并发",
    },
  },
  线程池: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/concurrent/",
      title: "JavaGuide - Java 并发",
    },
  },
  synchronized: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/concurrent/",
      title: "JavaGuide - Java 并发",
    },
  },
  volatile: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/concurrent/",
      title: "JavaGuide - Java 并发",
    },
  },
  CAS: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/concurrent/",
      title: "JavaGuide - Java 并发",
    },
  },
  AQS: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/concurrent/",
      title: "JavaGuide - Java 并发",
    },
  },

  // ── Java IO ──
  IO: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/java/io/",
      title: "JavaGuide - Java IO",
    },
  },

  // ── Spring ──
  Spring: {
    category: "java_advanced",
    source: {
      url: "https://javaguide.cn/system-design/framework/spring/",
      title: "JavaGuide - Spring",
    },
  },

  // ── 计算机基础 ──
  操作系统: {
    category: "cs_basics",
    source: {
      url: "https://javaguide.cn/cs-basics/operating-system/",
      title: "JavaGuide - 操作系统",
    },
  },
  网络: {
    category: "cs_basics",
    source: {
      url: "https://javaguide.cn/cs-basics/network/",
      title: "JavaGuide - 计算机网络",
    },
  },
  TCP: {
    category: "cs_basics",
    source: {
      url: "https://javaguide.cn/cs-basics/network/",
      title: "JavaGuide - 计算机网络",
    },
  },
  HTTP: {
    category: "cs_basics",
    source: {
      url: "https://javaguide.cn/cs-basics/network/",
      title: "JavaGuide - 计算机网络",
    },
  },

  // ── 数据库 ──
  MySQL: {
    category: "database",
    source: {
      url: "https://javaguide.cn/database/mysql/",
      title: "JavaGuide - MySQL",
    },
  },
  Redis: {
    category: "database",
    source: {
      url: "https://javaguide.cn/database/redis/",
      title: "JavaGuide - Redis",
    },
  },
  事务: {
    category: "database",
    source: {
      url: "https://javaguide.cn/database/mysql/",
      title: "JavaGuide - MySQL",
    },
  },

  // ── DevOps ──
  Docker: {
    category: "devops",
    source: {
      url: "https://javaguide.cn/tools/docker/",
      title: "JavaGuide - Docker",
    },
  },
  // K8s — 暂无 JavaGuide 对应页面
  K8s: {
    category: "devops",
    source: null,
  },

  // ── React（非 Java 范畴，暂无可引用的 JavaGuide 页面）──
  React: {
    category: "react",
    source: null,
  },
  Hooks: {
    category: "react",
    source: null,
  },

  // ── AI Agent（非 Java 范畴）──
  Agent: {
    category: "agent",
    source: null,
  },
  "Multi-Agent": {
    category: "agent",
    source: null,
  },

  // ── AI 基础（非 Java 范畴）──
  LLM: {
    category: "ai",
    source: null,
  },
  RAG: {
    category: "ai",
    source: null,
  },

  // ── 前端（非 Java 范畴）──
  JavaScript: {
    category: "frontend",
    source: null,
  },
  CSS: {
    category: "frontend",
    source: null,
  },
};

/**
 * Get knowledge metadata for a tag, or null if not defined.
 * Returns { category, source } or null.
 */
export function getKnowledgeForTag(tag) {
  return knowledgeContent[tag] || null;
}

/**
 * Build a map of tag → { knowledgeContent, related question IDs } with
 * relatedQuestionIds filled from the actual question data (imported lazily).
 */
export function buildKnowledgeMap(questions) {
  const map = {};

  // First pass: accumulate question IDs per tag
  for (const q of questions) {
    if (!q.tags) continue;
    for (const t of q.tags) {
      if (!map[t]) {
        map[t] = {
          questionIds: [],
          ...(knowledgeContent[t] || { category: q.category || "" }),
        };
      }
      map[t].questionIds.push(q.id);
    }
  }

  // Merge with pre-stored content for tags that have no associated questions
  for (const [tag, content] of Object.entries(knowledgeContent)) {
    if (!map[tag]) {
      map[tag] = { ...content, questionIds: [] };
    }
  }

  return map;
}
