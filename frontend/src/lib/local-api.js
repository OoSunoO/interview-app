// Offline-capable API — reads bundled question data, stores progress in localStorage
import { questions } from "./question-data.js";

const PROGRESS_KEY = "quiz_progress";
const SESSION_KEY = "quiz_review_sessions";

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

function matchesSearch(q, search) {
  if (!search) return true;
  const s = search.toLowerCase();
  return q.title.toLowerCase().includes(s) || q.content.toLowerCase().includes(s);
}

export const api = {
  questions: {
    list(params = {}) {
      let result = questions;
      if (params.category) result = result.filter((q) => q.category === params.category);
      if (params.difficulty) result = result.filter((q) => q.difficulty === params.difficulty);
      if (params.search) result = result.filter((q) => matchesSearch(q, params.search));
      if (params.tag) result = result.filter((q) => q.tags.includes(params.tag));

      const progress = getProgress();
      if (params.status) {
        result = result.filter((q) => (progress[q.id]?.status || "new") === params.status);
      }

      const page = params.page || 1;
      const pageSize = params.page_size || 20;
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
        status: p.status || "new",
        review_count: p.review_count || 0,
        wrong_count: p.wrong_count || 0,
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
      const wrongCount = (existing.wrong_count || 0) + (body.status === "wrong" ? 1 : 0);
      let newStatus = body.status;
      if (existing.status === "wrong" && body.status === "correct") {
        newStatus = "reviewing";
      }

      progress[questionId] = {
        status: newStatus,
        wrong_count: wrongCount,
        review_count: (existing.review_count || 0) + 1,
        last_reviewed_at: new Date().toISOString(),
        next_review_at:
          body.status === "wrong"
            ? new Date(Date.now() + 86400000).toISOString()
            : null,
        notes: body.notes || existing.notes || "",
      };
      saveProgress(progress);

      const sessions = getSessions();
      sessions.push({
        id: sessions.length + 1,
        question_id: questionId,
        reviewed_at: new Date().toISOString(),
        result: body.status,
        duration_seconds: body.duration_seconds || 0,
      });
      saveSessions(sessions);

      return { ok: true };
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
        .filter(
          ([, p]) =>
            p.status === "wrong" && p.next_review_at && p.next_review_at <= now,
        )
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
          };
        });
    },
  },
};
