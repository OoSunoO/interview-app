// Offline-capable API — reads bundled question data, stores progress in localStorage

// Dynamic imports for code-splitting: Vite creates separate chunks
// so the main bundle stays lean.
const [{ questions }, { buildKnowledgeMap, getKnowledgeForTag }] = await Promise.all([
  import("./question-data.js"),
  import("./knowledge-data.js"),
]);

import { rateCard, getDefaultProgress, QUICK_REVIEW_MAP, RATINGS } from "./sm2.js";

// Build knowledge map once (question data is static)
const knowledgeMap = buildKnowledgeMap(questions);

const PROGRESS_KEY = "quiz_progress";
const SESSION_KEY = "quiz_review_sessions";
const DAILY_STATS_KEY = "quiz_daily_stats";

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(p) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(s) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s.slice(-500))); // keep last 500
  } catch {
    /* ignore */
  }
}

function getDailyStats() {
  try {
    return JSON.parse(localStorage.getItem(DAILY_STATS_KEY) || "{}");
  } catch { return {}; }
}

function saveDailyStats(stats) {
  try {
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
  } catch { /* ignore */ }
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(daily) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = dateKey(d);
    if ((daily[key]?.reviewed || 0) > 0) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function recordReviewActivity(rating) {
  if (!rating) return;
  const daily = getDailyStats();
  const today = dateKey(new Date());
  if (!daily[today]) daily[today] = { reviewed: 0, remembered: 0, hard: 0, forgot: 0 };
  daily[today].reviewed++;
  if (rating === "good" || rating === "easy") daily[today].remembered++;
  else if (rating === "hard") daily[today].hard++;
  else if (rating === "forgot") daily[today].forgot++;
  const entries = Object.entries(daily);
  if (entries.length > 365) {
    entries.sort(([a], [b]) => a.localeCompare(b));
    for (let i = 0; i < entries.length - 365; i++) delete daily[entries[i][0]];
  }
  saveDailyStats(daily);
}

function matchesSearch(q, search) {
  if (!search) return true;
  const s = search.toLowerCase();
  return q.title.toLowerCase().includes(s) ||
    q.content.toLowerCase().includes(s) ||
    (q.answer || "").toLowerCase().includes(s) ||
    (q.tags || []).some((t) => t.toLowerCase().includes(s));
}

// ── Knowledge Points helpers ──────────────────────────────────────

const CATEGORY_NAMES = {
  java_basic: "Java 基础",
  java_advanced: "Java 进阶",
  ai: "AI 基础",
  agent: "AI Agent",
  algorithm: "算法",
  system_design: "系统设计",
  frontend: "前端",
  cs_basics: "计算机基础",
  database: "数据库",
  linux: "Linux",
  devops: "DevOps",
  react: "React",
  project_mgmt: "项目管理",
  product: "产品思维",
  java_collections: "Java 集合",
};

/** Build a readable summary for a knowledge point from its questions */
function generateSummary(tag, tagQuestions) {
  // Collect unique key phrases from question titles and content
  const concepts = new Set();
  for (const q of tagQuestions) {
    // Extract key concepts from content
    const content = q.content || "";
    const title = q.title || "";
    // Add title
    concepts.add(title.replace(/^请(解释|介绍|描述)?/, "").trim());
    // Extract short meaningful phrases from content
    const snippets = content.split(/[。，；]/).filter((s) => s.length > 5 && s.length < 40);
    for (const s of snippets.slice(0, 2)) {
      concepts.add(s.trim() + "。");
    }
  }
  return Array.from(concepts).slice(0, 5).join("");
}

/** Compute mastery for a tag across all questions, using progress data */
function computeMastery(tag, progress) {
  const tagQuestions = questions.filter((q) => q.tags.includes(tag));
  if (tagQuestions.length === 0) return 0;
  let totalScore = 0;
  for (const q of tagQuestions) {
    const p = progress[q.id];
    if (!p || p.status === "new") {
      totalScore += 0;
    } else if (p.status === "correct") {
      totalScore += 1;
    } else if (p.status === "reviewing") {
      totalScore += 0.5;
    } else if (p.status === "wrong") {
      totalScore += 0;
    }
  }
  return Math.round((totalScore / tagQuestions.length) * 100);
}

/** Get category group mapping for each tag */
function getTagCategoryMap() {
  const map = Object.create(null);
  for (const q of questions) {
    for (const t of q.tags) {
      if (!map[t]) map[t] = new Set();
      map[t].add(q.category);
    }
  }
  const result = {};
  for (const [tag, cats] of Object.entries(map)) {
    result[tag] = Array.from(cats).map((c) => CATEGORY_NAMES[c] || c);
  }
  return result;
}

const BUILD_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0";

export const api = {
  version: () => ({ version: BUILD_VERSION, name: "面试题 App" }),
  questions: {
    list(params = {}) {
      let result = questions;
      if (params.category) result = result.filter((q) => q.category === params.category);
      if (params.difficulty) result = result.filter((q) => q.difficulty === params.difficulty);
      if (params.type) result = result.filter((q) => q.type === params.type);
      if (params.search) result = result.filter((q) => matchesSearch(q, params.search));
      if (params.tag) result = result.filter((q) => q.tags.includes(params.tag));

      const progress = getProgress();
      if (params.company) {
        result = result.filter((q) => q.company && q.company.includes(params.company));
      }
      if (params.status) {
        result = result.filter((q) => (progress[q.id]?.status || "new") === params.status);
      }

      // sort
      const diffRank = { easy: 0, medium: 1, hard: 2 };
      if (params.sort_by === "difficulty") {
        result = [...result].sort((a, b) => (diffRank[a.difficulty] ?? 1) - (diffRank[b.difficulty] ?? 1));
      } else if (params.sort_by === "category") {
        result = [...result].sort((a, b) => a.category.localeCompare(b.category));
      } else if (params.sort_by === "type") {
        result = [...result].sort((a, b) => a.type.localeCompare(b.type));
      } else if (params.sort_by === "status") {
        const statusRank = { wrong: 0, reviewing: 1, new: 2, correct: 3 };
        result = [...result].sort((a, b) => (statusRank[progress[a.id]?.status || "new"] - statusRank[progress[b.id]?.status || "new"]));
      }

      const page = params.page || 1;
      const pageSize = params.page_size || 200;
      const offset = (page - 1) * pageSize;

      return result.slice(offset, offset + pageSize).map((q) => {
        const p = progress[q.id] || {};
        return {
          id: q.id,
          category: q.category,
          difficulty: q.difficulty,
          type: q.type,
          title: q.title,
          tags: q.tags,
          company: q.company || "",
          status: p.status || "new",
          wrong_count: p.wrong_count || 0,
        };
      });
    },

    get(id) {
      const q = questions.find((x) => x.id === id);
      if (!q) throw new Error(`Question ${id} not found`);
      const p = getProgress()[id] || {};
      return {
        ...q,
        company: q.company || "",
        status: p.status || "new",
        review_count: p.review_count || 0,
        wrong_count: p.wrong_count || 0,
        ef: p.ef ?? 2.5,
        interval: p.interval ?? 0,
        repetitions: p.repetitions ?? 0,
        next_review_at: p.next_review_at || null,
        notes: p.notes || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
  },

  progress: {
    update(questionId, body) {
      const progress = getProgress();
      const existing = progress[questionId] || {};
      const prevSM2 = { ef: existing.ef, interval: existing.interval, repetitions: existing.repetitions };

      // Determine rating: explicit or mapped from status
      let rating = body.rating;
      if (!rating && body.status) {
        rating = body.status === "correct" ? "good" : "forgot";
      }

      // Compute SM-2 values when rating is available
      let sm2 = {};
      if (rating && RATINGS[rating]) {
        sm2 = rateCard(rating, prevSM2);
      }

      const wrongCount = (existing.wrong_count || 0) + (body.status === "wrong" || rating === "forgot" || rating === "hard" ? 1 : 0);
      let newStatus = body.status;
      if (!newStatus && rating) {
        newStatus = (rating === "forgot" || rating === "hard") ? "wrong" : "correct";
      }
      if (existing.status === "wrong" && newStatus === "correct" && body.source !== "quick_review") {
        newStatus = "reviewing";
      }

      const entry = {
        status: newStatus || existing.status || "new",
        wrong_count: wrongCount,
        review_count: (existing.review_count || 0) + 1,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: sm2.next_review_at || existing.next_review_at || null,
        ef: sm2.ef ?? existing.ef ?? 2.5,
        interval: sm2.interval ?? existing.interval ?? 0,
        repetitions: sm2.repetitions ?? existing.repetitions ?? 0,
        notes: body.notes || existing.notes || "",
        source: body.source || "quiz",
      };
      progress[questionId] = entry;
      saveProgress(progress);

      // Log review session
      const sessions = getSessions();
      const maxId = sessions.length > 0 ? Math.max(...sessions.map((s) => s.id)) : 0;
      sessions.push({
        id: maxId + 1,
        question_id: questionId,
        reviewed_at: new Date().toISOString(),
        result: newStatus || body.status,
        duration_seconds: body.duration_seconds || 0,
        source: body.source || "quiz",
      });
      saveSessions(sessions);

      // Record daily activity
      recordReviewActivity(rating);

      return { ok: true, sm2: entry };
    },

    stats() {
      const progress = getProgress();
      const total = questions.length;
      let correct = 0,
        wrong = 0,
        reviewing = 0;
      const byCategory = {};

      for (const q of questions) {
        if (!byCategory[q.category]) {
          byCategory[q.category] = { total: 0, done: 0 };
        }
        byCategory[q.category].total++;

        const p = progress[q.id];
        if (p?.status === "correct") {
          correct++;
          byCategory[q.category].done++;
        } else if (p?.status === "reviewing") {
          reviewing++;
          byCategory[q.category].done++;
        } else if (p?.status === "wrong") {
          wrong++;
        }
      }

      const done = correct + reviewing;
      return {
        total,
        done,
        correct,
        wrong,
        by_category: byCategory,
      };
    },

    weeklyActivity() {
      const daily = getDailyStats();
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = dateKey(d);
        const day = daily[key] || { reviewed: 0, remembered: 0, hard: 0, forgot: 0 };
        const weekday = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
        const label = i === 6 ? weekday : i === 0 ? "今天" : weekday;
        days.push({
          label,
          full: `${d.getMonth() + 1}/${d.getDate()}`,
          ...day,
          retention: day.reviewed > 0 ? Math.round((day.remembered / day.reviewed) * 100) : null,
          max: 0,
        });
      }
      const maxReviewed = Math.max(1, ...days.map((d) => d.reviewed));
      for (const d of days) d.max = maxReviewed;
      return days;
    },

    dailyStats() {
      const daily = getDailyStats();
      const today = dateKey(new Date());
      const todayStats = daily[today] || { reviewed: 0, remembered: 0, hard: 0, forgot: 0 };
      const streak = computeStreak(daily);
      const retention = todayStats.reviewed > 0
        ? Math.round((todayStats.remembered / todayStats.reviewed) * 100)
        : 0;
      return { today: todayStats, streak, retention };
    },

    wrong() {
      const progress = getProgress();
      const wrongIds = Object.entries(progress)
        .filter(([, p]) => p.status === "wrong" || p.status === "reviewing")
        .map(([id]) => Number(id));

      return questions
        .filter((q) => wrongIds.includes(q.id))
        .map((q) => {
          const p = progress[q.id];
          return {
            id: q.id,
            title: q.title,
            category: q.category,
            difficulty: q.difficulty,
            type: q.type,
            tags: q.tags,
            wrong_count: p.wrong_count || 0,
            last_reviewed_at: p.last_reviewed_at || null,
            next_review_at: p.next_review_at || null,
          };
        });
    },

    dueReviews() {
      const progress = getProgress();
      const now = new Date().toISOString();
      const dueIds = Object.entries(progress)
        .filter(([, p]) => p.next_review_at && p.next_review_at <= now)
        .map(([id]) => Number(id));

      return questions
        .filter((q) => dueIds.includes(q.id))
        .map((q) => {
          const p = progress[q.id];
          return {
            id: q.id,
            title: q.title,
            category: q.category,
            difficulty: q.difficulty,
            type: q.type,
            wrong_count: p.wrong_count || 0,
            next_review_at: p.next_review_at,
            ef: p.ef,
            interval: p.interval,
          };
        });
    },

    /**
     * Return up to `count` unreviewed questions for a review session.
     * Does NOT fall back to mastered questions when unreviewed count is insufficient.
     */
    review(count = 10) {
      const progress = getProgress();
      const unreviewed = [];

      for (const q of questions) {
        const p = progress[q.id];
        if (!p || p.status === "new") {
          unreviewed.push(q);
          if (unreviewed.length >= count) break;
        }
      }

      return unreviewed.slice(0, count).map((q) => {
        const p = progress[q.id] || {};
        return {
          id: q.id,
          title: q.title,
          category: q.category,
          difficulty: q.difficulty,
          type: q.type,
          content: q.content,
          tags: q.tags,
          status: p.status || "new",
          wrong_count: p.wrong_count || 0,
        };
      });
    },

    startReviewSession(count = 20, category) {
      const progress = getProgress();
      const now = new Date();
      const overdue = [];
      const newCards = [];

      for (const q of questions) {
        if (category && q.category !== category) continue;
        const p = progress[q.id];
        if (!p || p.status === "new") {
          if (newCards.length < count) newCards.push(q);
        } else if (p.next_review_at && new Date(p.next_review_at) <= now) {
          overdue.push(q);
        }
      }

      overdue.sort((a, b) => new Date(progress[a.id].next_review_at) - new Date(progress[b.id].next_review_at));

      const session = [...overdue.slice(0, count), ...newCards].slice(0, count);
      // Fisher-Yates shuffle
      for (let i = session.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [session[i], session[j]] = [session[j], session[i]];
      }
      return session.map((q) => {
        const p = progress[q.id] || {};
        return {
          id: q.id,
          title: q.title,
          category: q.category,
          difficulty: q.difficulty,
          type: q.type,
          content: q.content,
          tags: q.tags,
          status: p.status || "new",
          wrong_count: p.wrong_count || 0,
          ef: p.ef,
          interval: p.interval,
        };
      });
    },

    knowledge() {
      const progress = getProgress();
      const catData = {};

      for (const q of questions) {
        const cat = q.category;
        if (!catData[cat]) {
          catData[cat] = { total: 0, done: 0, tags: {} };
        }
        catData[cat].total++;

        const p = progress[q.id];
        const done = p?.status === "correct" || p?.status === "reviewing";
        if (done) catData[cat].done++;

        for (const tag of q.tags || []) {
          if (!catData[cat].tags[tag]) {
            catData[cat].tags[tag] = { total: 0, done: 0 };
          }
          catData[cat].tags[tag].total++;
          if (done) catData[cat].tags[tag].done++;
        }
      }

      const categoryNames = {
        ai: "AI",
        agent: "AI Agent",
        algorithm: "算法",
        cs_basics: "计算机基础",
        database: "数据库",
        devops: "DevOps",
        frontend: "前端",
        java_basic: "Java 基础",
        java_advanced: "Java 进阶",
        java_collections: "Java 集合",
        linux: "Linux",
        react: "React",
        system_design: "系统设计",
        product: "产品思维",
        project_mgmt: "项目管理",
        career: "求职与职业发展",
        behavioral: "行为面试",
        kubernetes: "Kubernetes",
      };

      return Object.entries(catData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, cd]) => ({
          name,
          label: categoryNames[name] || name,
          total: cd.total,
          done: cd.done,
          tags: Object.entries(cd.tags)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([tname, td]) => ({ name: tname, total: td.total, done: td.done })),
        }));
    },
  },

  // ── Quick Review Session ──────────────────────────────────
  quickReview: {
    saveSession(session) {
      try {
        localStorage.setItem("quick_review_session", JSON.stringify(session));
      } catch (e) {
        console.warn("quickReview save failed:", e);
      }
    },
    getSession() {
      try {
        return JSON.parse(localStorage.getItem("quick_review_session") || "null");
      } catch {
        return null;
      }
    },
    clearSession() {
      try {
        localStorage.removeItem("quick_review_session");
      } catch { /* ignore */ }
    },
  },

  // ── Knowledge Points API ─────────────────────────────────────
  knowledge: {
    /** List all knowledge points (from tags), with counts, mastery, and hasContent flag */
    list() {
      const progress = getProgress();
      const tagMap = Object.create(null);
      const tagCategories = getTagCategoryMap();

      for (const q of questions) {
        for (const t of q.tags) {
          if (!tagMap[t]) tagMap[t] = [];
          tagMap[t].push(q.id);
        }
      }

      // Also include knowledge-only tags (no question associations but have pre-written content)
      for (const tag of Object.keys(knowledgeMap)) {
        if (!tagMap[tag]) {
          tagMap[tag] = [];
        }
      }

      return Object.entries(tagMap)
        .map(([tag, ids]) => ({
          name: tag,
          question_count: ids.length,
          mastery: ids.length > 0 ? computeMastery(tag, progress) : 0,
          categories: tagCategories[tag] || [knowledgeMap[tag]?.category || "其他"],
          has_content: !!getKnowledgeForTag(tag),
        }))
        .sort((a, b) => b.question_count - a.question_count);
    },

    /** Get detail for a specific knowledge point, with pre-stored content */
    get(tag) {
      const progress = getProgress();
      const tagQuestions = questions.filter((q) => q.tags.includes(tag));

      const ids = tagQuestions.map((q) => q.id);
      const tagCategories = getTagCategoryMap();
      const stored = getKnowledgeForTag(tag);

      return {
        name: tag,
        question_count: tagQuestions.length,
        mastery: tagQuestions.length > 0 ? computeMastery(tag, progress) : 0,
        categories: tagCategories[tag] || (stored ? [stored.category || ""] : []),
        content: stored?.content || "",
        source: stored?.source || null,
        has_content: !!stored?.content,
        // AI-generated summary falls back to heuristic
        summary: generateSummary(tag, tagQuestions),
        questions: tagQuestions.map((q) => {
          const p = progress[q.id] || {};
          return {
            id: q.id,
            title: q.title,
            category: q.category,
            difficulty: q.difficulty,
            type: q.type,
            content: q.content,
            tags: q.tags,
            status: p.status || "new",
            wrong_count: p.wrong_count || 0,
            review_count: p.review_count || 0,
          };
        }),
      };
    },

    /**
     * Get knowledge tags for a given question ID.
     * Returns array of { name, has_content } for each tag on this question.
     */
    getTagsForQuestion(questionId) {
      const q = questions.find((x) => x.id === questionId);
      if (!q) return [];
      return (q.tags || []).map((t) => ({
        name: t,
        has_content: !!getKnowledgeForTag(t),
      }));
    },
  },

  /** Export filtered questions as Markdown */
  exportMarkdown(ids) {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const items = questions.filter((q) => ids.includes(q.id));
    const lines = [`# 面试题库导出 (${dateStr})`, `共 ${items.length} 题\n`, ...Array(items.length).fill("---")];

    const cats = { cs_basics: "计算机基础", algorithm: "算法", database: "数据库", linux: "Linux", devops: "DevOps", java_basic: "Java", java_advanced: "Java 进阶", java_collections: "Java 集合", react: "React", frontend: "前端", ai: "AI 基础", agent: "AI Agent", system_design: "系统设计", project_mgmt: "项目管理", product: "产品思维", kubernetes: "Kubernetes" };

    let md = `# 面试题库导出 (${dateStr})\n\n共 ${items.length} 题\n\n`;
    for (const q of items) {
      const catLabel = cats[q.category] || q.category;
      const diffLabel = { easy: "简单", medium: "中等", hard: "困难" }[q.difficulty] || q.difficulty;
      const typeLabel = { short_answer: "简答", coding: "编程", choice: "选择", true_false: "判断", multiple_choice: "多选", fill_in_blank: "填空" }[q.type] || q.type;
      const tags = (q.tags || []).map((t) => `\`${t}\``).join(" ");

      md += `---\n\n### ${q.id}. ${q.title}\n\n**分类：** ${catLabel} | **难度：** ${diffLabel} | **题型：** ${typeLabel}`;
      if (q.company) md += ` | **来源：** ${q.company}`;
      md += `\n\n`;
      if (tags) md += `${tags}\n\n`;
      md += `${q.content}\n\n`;
      if (q.options && q.options.length > 0) {
        md += `**选项：**\n\n${q.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\n`;
      }
      md += `**答案：**\n> ${q.answer?.replace(/\n/g, "\n> ") ?? ""}\n\n`;
    }
    return md;
  },

  migrateProgress() {
    const progress = getProgress();
    let changed = false;
    for (const id of Object.keys(progress)) {
      const entry = progress[id];
      if (entry.ef === undefined) {
        const defaults = getDefaultProgress();
        progress[id] = { ...defaults, ...entry };
        if (entry.status === "correct" && !entry.next_review_at) {
          const d = new Date();
          d.setDate(d.getDate() + 4);
          progress[id].next_review_at = d.toISOString();
          progress[id].interval = 4;
          progress[id].repetitions = 1;
        }
        changed = true;
      }
    }
    if (changed) saveProgress(progress);
    return { migrated: changed };
  },
};
