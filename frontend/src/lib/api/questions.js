import { getProgress } from "./storage.js";
import { questionIndex, loadCategory, questions as allQuestions } from "./loader.js";
import { MAIN_CATEGORY } from "../categories.js";
import { searchQuestions } from "../search.js";

const diffRank = { easy: 0, medium: 1, hard: 2 };

export const questions = {
  list(params = {}) {
    let result = questionIndex;
    if (params.category) {
      result = result.filter((q) => (MAIN_CATEGORY[q.category] || q.category) === params.category);
    }
    if (params.difficulty) result = result.filter((q) => q.difficulty === params.difficulty);
    if (params.type) result = result.filter((q) => q.type === params.type);
    if (params.search) result = searchQuestions(params.search, result);
    if (params.tag) result = result.filter((q) => q.tags.includes(params.tag));
    if (params.user_tag) {
      const p = getProgress();
      result = result.filter((q) => (p[q.id]?.user_tags || []).includes(params.user_tag));
    }

    const progress = getProgress();
    if (params.source) {
      result = result.filter((q) => q.source && q.source.includes(params.source));
    }
    if (params.status) {
      result = result.filter((q) => (progress[q.id]?.status || "new") === params.status);
    }
    if (params.bookmarked) {
      result = result.filter((q) => progress[q.id]?.bookmarked === true);
    }

    if (params.sort_by === "difficulty") {
      result = [...result].sort(
        (a, b) => (diffRank[a.difficulty] ?? 1) - (diffRank[b.difficulty] ?? 1),
      );
    } else if (params.sort_by === "category") {
      result = [...result].sort((a, b) => a.category.localeCompare(b.category));
    } else if (params.sort_by === "type") {
      result = [...result].sort((a, b) => a.type.localeCompare(b.type));
    } else if (params.sort_by === "status") {
      const statusRank = { wrong: 0, reviewing: 1, new: 2, correct: 3 };
      result = [...result].sort(
        (a, b) =>
          statusRank[progress[a.id]?.status || "new"] - statusRank[progress[b.id]?.status || "new"],
      );
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
        source: q.source || "",
        status: p.status || "new",
        wrong_count: p.wrong_count || 0,
        bookmarked: p.bookmarked || false,
        user_tags: p.user_tags || [],
      };
    });
  },

  related(questionId, limit = 5) {
    const src = questionIndex.find((q) => q.id === questionId);
    if (!src) return [];
    const scores = [];
    for (const q of questionIndex) {
      if (q.id === questionId) continue;
      let score = 0;
      for (const t of src.tags) {
        if (q.tags.includes(t)) score += 2;
      }
      if (q.category === src.category) score += 1;
      if (score > 0)
        scores.push({
          id: q.id,
          title: q.title,
          score,
          difficulty: q.difficulty,
          category: q.category,
          type: q.type,
        });
    }
    return scores.sort((a, b) => b.score - a.score).slice(0, limit);
  },

  sources() {
    const freq = Object.create(null);
    for (const q of questionIndex) {
      if (!q.source) continue;
      for (const c of q.source.split(",")) {
        const name = c.trim();
        if (name) freq[name] = (freq[name] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  },

  tags() {
    const set = new Set();
    for (const q of questionIndex) {
      for (const t of q.tags) set.add(t);
    }
    return [...set].sort();
  },

  tagsWithCount() {
    const freq = Object.create(null);
    for (const q of questionIndex) {
      for (const t of q.tags) {
        freq[t] = (freq[t] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  },

  random(filter = {}) {
    let pool = questionIndex;
    if (filter.category) {
      pool = pool.filter((q) => (MAIN_CATEGORY[q.category] || q.category) === filter.category);
    }
    if (filter.difficulty) pool = pool.filter((q) => q.difficulty === filter.difficulty);
    if (filter.status) {
      const progress = getProgress();
      pool = pool.filter((q) => (progress[q.id]?.status || "new") === filter.status);
    }
    return pool[Math.floor(Math.random() * pool.length)] || null;
  },

  async get(id) {
    const meta = questionIndex.find((x) => x.id === id);
    if (!meta) throw new Error(`Question ${id} not found`);
    await loadCategory(meta.category);
    const q = allQuestions.find((x) => x.id === id);
    if (!q) throw new Error(`Question ${id} not found in loaded data`);
    const p = getProgress()[id] || {};
    return {
      ...q,
      source: q.source || "",
      status: p.status || "new",
      review_count: p.review_count || 0,
      wrong_count: p.wrong_count || 0,
      ef: p.ef ?? 2.5,
      interval: p.interval ?? 0,
      repetitions: p.repetitions ?? 0,
      next_review_at: p.next_review_at || null,
      notes: p.notes || "",
      bookmarked: p.bookmarked || false,
      user_tags: p.user_tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },
};
