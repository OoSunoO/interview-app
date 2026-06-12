import { rateCard, RATINGS } from "../sm2.js";
import {
  getProgress,
  saveProgress,
  getSessions,
  saveSessions,
  getDailyStats,
  dateKey,
  computeStreak,
  recordReviewActivity,
  getGoal,
  setGoal,
} from "./storage.js";
import { questionIndex, loadAll, questions as allQuestions } from "./loader.js";
import { MAIN_CATEGORY, CATEGORY_LABELS } from "../categories.js";

export const progress = {
  update(questionId, body) {
    const p = getProgress();
    const existing = p[questionId] || {};
    const prevSM2 = {
      ef: existing.ef,
      interval: existing.interval,
      repetitions: existing.repetitions,
    };

    let rating = body.rating;
    if (!rating && body.status) {
      rating = body.status === "correct" ? "good" : "forgot";
    }

    let sm2 = {};
    if (rating && RATINGS[rating]) {
      sm2 = rateCard(rating, prevSM2);
    }

    const wrongCount =
      (existing.wrong_count || 0) +
      (body.status === "wrong" || rating === "forgot" || rating === "hard" ? 1 : 0);
    let newStatus = body.status;
    if (!newStatus && rating) {
      newStatus = rating === "forgot" || rating === "hard" ? "wrong" : "correct";
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
      bookmarked: body.bookmarked !== undefined ? body.bookmarked : existing.bookmarked || false,
      user_tags: body.user_tags ?? existing.user_tags ?? [],
      source: body.source || "quiz",
      ai_overall: body.aiInfo?.ai_overall ?? existing.ai_overall ?? null,
      ai_dimensions: body.aiInfo?.ai_dimensions ?? existing.ai_dimensions ?? null,
    };
    p[questionId] = entry;
    saveProgress(p);

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
    recordReviewActivity(rating);

    return { ok: true, sm2: entry };
  },

  stats() {
    const p = getProgress();
    const total = questionIndex.length;
    let correct = 0,
      wrong = 0,
      reviewing = 0,
      bookmarked = 0;
    const byCategory = {};
    const byDifficulty = {
      easy: { total: 0, done: 0, wrong: 0 },
      medium: { total: 0, done: 0, wrong: 0 },
      hard: { total: 0, done: 0, wrong: 0 },
    };
    const byType = {};

    for (const q of questionIndex) {
      const mainCat = MAIN_CATEGORY[q.category] || q.category;
      if (!byCategory[mainCat]) byCategory[mainCat] = { total: 0, done: 0 };
      byCategory[mainCat].total++;
      const diff = q.difficulty || "medium";
      if (byDifficulty[diff]) byDifficulty[diff].total++;
      const type = q.type || "short_answer";
      if (!byType[type]) byType[type] = { total: 0, done: 0, wrong: 0 };
      byType[type].total++;

      const pEntry = p[q.id];
      if (pEntry?.bookmarked) bookmarked++;
      if (pEntry?.status === "correct") {
        correct++;
        byCategory[mainCat].done++;
        if (byDifficulty[diff]) byDifficulty[diff].done++;
        byType[type].done++;
      } else if (pEntry?.status === "reviewing") {
        reviewing++;
        byCategory[mainCat].done++;
        if (byDifficulty[diff]) byDifficulty[diff].done++;
        byType[type].done++;
      } else if (pEntry?.status === "wrong") {
        wrong++;
        if (byDifficulty[diff]) byDifficulty[diff].wrong++;
        byType[type].wrong++;
      }
    }
    const done = correct + reviewing;
    return {
      total,
      done,
      correct,
      wrong,
      bookmarked,
      by_category: byCategory,
      by_difficulty: byDifficulty,
      by_type: byType,
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
    const retention =
      todayStats.reviewed > 0 ? Math.round((todayStats.remembered / todayStats.reviewed) * 100) : 0;
    return { today: todayStats, streak, retention };
  },

  allDailyStats() {
    return getDailyStats();
  },

  reviewHistory(limit = 50) {
    const sessions = getSessions();
    return sessions
      .slice(-limit)
      .reverse()
      .map((s) => {
        const q = questionIndex.find((x) => x.id === s.question_id);
        return {
          id: s.id,
          question_id: s.question_id,
          reviewed_at: s.reviewed_at,
          result: s.result,
          duration_seconds: s.duration_seconds,
          source: s.source,
          title: q?.title || `题目 #${s.question_id}`,
          category: q?.category || "",
          difficulty: q?.difficulty || "",
        };
      });
  },

  wrong() {
    const p = getProgress();
    const wrongIds = Object.entries(p)
      .filter(([, pEntry]) => pEntry.status === "wrong" || pEntry.status === "reviewing")
      .map(([id]) => Number(id));
    return questionIndex
      .filter((q) => wrongIds.includes(q.id))
      .map((q) => {
        const pEntry = p[q.id];
        return {
          id: q.id,
          title: q.title,
          category: q.category,
          difficulty: q.difficulty,
          type: q.type,
          tags: q.tags,
          wrong_count: pEntry.wrong_count || 0,
          last_reviewed_at: pEntry.last_reviewed_at || null,
          next_review_at: pEntry.next_review_at || null,
          bookmarked: pEntry.bookmarked || false,
          user_tags: pEntry.user_tags || [],
        };
      });
  },

  toggleBookmark(questionId) {
    const p = getProgress();
    const entry = p[questionId] || {};
    const newVal = !(entry.bookmarked || false);
    p[questionId] = { ...entry, bookmarked: newVal };
    saveProgress(p);
    return newVal;
  },

  dueReviews() {
    const p = getProgress();
    const now = new Date().toISOString();
    const dueIds = Object.entries(p)
      .filter(([, pEntry]) => pEntry.next_review_at && pEntry.next_review_at <= now)
      .map(([id]) => Number(id));
    return questionIndex
      .filter((q) => dueIds.includes(q.id))
      .map((q) => {
        const pEntry = p[q.id];
        return {
          id: q.id,
          title: q.title,
          category: q.category,
          difficulty: q.difficulty,
          type: q.type,
          wrong_count: pEntry.wrong_count || 0,
          next_review_at: pEntry.next_review_at,
          ef: pEntry.ef,
          interval: pEntry.interval,
        };
      });
  },

  async startReviewSession(count = 20, category, difficulty, dueOnly = false) {
    await loadAll();
    const p = getProgress();
    const now = new Date();
    const overdue = [];
    const newCards = [];
    for (const q of allQuestions) {
      if (category && q.category !== category) continue;
      if (difficulty && q.difficulty !== difficulty) continue;
      const pEntry = p[q.id];
      if (!pEntry || pEntry.status === "new") {
        if (newCards.length < count) newCards.push(q);
      } else if (pEntry.next_review_at && new Date(pEntry.next_review_at) <= now) {
        overdue.push(q);
      }
    }
    overdue.sort((a, b) => new Date(p[a.id].next_review_at) - new Date(p[b.id].next_review_at));
    const session = dueOnly
      ? overdue.slice(0, count)
      : [...overdue.slice(0, count), ...newCards].slice(0, count);
    for (let i = session.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [session[i], session[j]] = [session[j], session[i]];
    }
    return session.map((q) => {
      const pEntry = p[q.id] || {};
      return {
        id: q.id,
        title: q.title,
        category: q.category,
        difficulty: q.difficulty,
        type: q.type,
        content: q.content,
        tags: q.tags,
        status: pEntry.status || "new",
        wrong_count: pEntry.wrong_count || 0,
        bookmarked: pEntry.bookmarked || false,
        ef: pEntry.ef,
        interval: pEntry.interval,
      };
    });
  },

  countDue(category, difficulty) {
    const p = getProgress();
    const now = new Date().toISOString();
    let count = 0;
    for (const q of questionIndex) {
      if (category && q.category !== category) continue;
      if (difficulty && q.difficulty !== difficulty) continue;
      const pEntry = p[q.id];
      if (pEntry?.next_review_at && pEntry.next_review_at <= now) count++;
    }
    return count;
  },

  knowledge() {
    const p = getProgress();
    const catData = {};
    const categoryNames = CATEGORY_LABELS;
    for (const q of questionIndex) {
      const cat = q.category;
      if (!catData[cat]) catData[cat] = { total: 0, done: 0, tags: {} };
      catData[cat].total++;
      const done = p[q.id]?.status === "correct" || p[q.id]?.status === "reviewing";
      if (done) catData[cat].done++;
      for (const tag of q.tags) {
        if (!catData[cat].tags[tag]) catData[cat].tags[tag] = { total: 0, done: 0 };
        catData[cat].tags[tag].total++;
        if (done) catData[cat].tags[tag].done++;
      }
    }
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

  getGoal,
  setGoal,

  pathProgress(paths) {
    const stats = this.stats();
    const cats = stats?.by_category || {};
    return paths.map((path) => {
      const stages = path.stages.map((stage) => {
        const targets = stage.targets.map((t) => {
          const cat = cats[t.category] || { total: 0, done: 0, wrong: 0 };
          return { ...t, total: cat.total, done: cat.done, wrong: cat.wrong };
        });
        const totalRequired = targets.reduce((s, t) => s + t.required, 0);
        const totalDone = targets.reduce((s, t) => s + Math.min(t.done, t.required), 0);
        return {
          ...stage,
          targets,
          totalRequired,
          totalDone,
          pct: totalRequired > 0 ? Math.round((totalDone / totalRequired) * 100) : 0,
        };
      });
      const overallTotal = stages.reduce((s, st) => s + st.totalRequired, 0);
      const overallDone = stages.reduce((s, st) => s + st.totalDone, 0);
      return {
        ...path,
        stages,
        overallTotal,
        overallDone,
        pct: overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0,
      };
    });
  },

  sm2Stats() {
    const p = getProgress();
    const now = new Date();
    const todayKey = dateKey(now);
    const todayEnd = new Date(todayKey + "T23:59:59.999Z");
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let dueToday = 0,
      dueWeek = 0,
      overdue = 0;
    let totalEF = 0,
      efCount = 0;
    let totalInterval = 0,
      intervalCount = 0;
    const intervals = { "<1d": 0, "1-3d": 0, "3-7d": 0, "7-30d": 0, ">30d": 0 };
    const efBuckets = { "1.3-1.7": 0, "1.7-2.0": 0, "2.0-2.3": 0, "2.3-2.6": 0, "2.6-3.0": 0 };
    const statusCounts = { new: 0, wrong: 0, reviewing: 0, correct: 0 };
    let withSM2 = 0,
      sm2New = 0,
      learning = 0,
      mature = 0;

    for (const [idStr, entry] of Object.entries(p)) {
      if (!entry || !idStr) continue;
      const st = entry.status || "new";
      statusCounts[st] = (statusCounts[st] || 0) + 1;
      if (entry.ef !== undefined && entry.ef !== null) {
        totalEF += entry.ef;
        efCount++;
        if (entry.ef < 1.7) efBuckets["1.3-1.7"]++;
        else if (entry.ef < 2.0) efBuckets["1.7-2.0"]++;
        else if (entry.ef < 2.3) efBuckets["2.0-2.3"]++;
        else if (entry.ef < 2.6) efBuckets["2.3-2.6"]++;
        else efBuckets["2.6-3.0"]++;
      }
      if (entry.interval !== undefined && entry.interval !== null) {
        totalInterval += entry.interval;
        intervalCount++;
        if (entry.interval < 1) intervals["<1d"]++;
        else if (entry.interval < 3) intervals["1-3d"]++;
        else if (entry.interval < 7) intervals["3-7d"]++;
        else if (entry.interval < 30) intervals["7-30d"]++;
        else intervals[">30d"]++;
      }
      if (entry.ef !== undefined && entry.repetitions !== undefined) {
        withSM2++;
        const reps = entry.repetitions || 0;
        if (reps === 0) sm2New++;
        else if (reps < 3) learning++;
        else mature++;
      }
      if (entry.next_review_at) {
        const due = new Date(entry.next_review_at);
        if (due <= now) {
          overdue++;
          if (due <= todayEnd) dueToday++;
        }
        if (due <= weekEnd) dueWeek++;
      }
    }

    const forecast = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dayStart = new Date(dateKey(d) + "T00:00:00.000Z");
      const dayEnd = new Date(dateKey(d) + "T23:59:59.999Z");
      let count = 0;
      for (const entry of Object.values(p)) {
        if (entry?.next_review_at) {
          const due = new Date(entry.next_review_at);
          if (due >= dayStart && due <= dayEnd) count++;
        }
      }
      const label = i === 0 ? "今天" : i === 1 ? "明天" : `${d.getMonth() + 1}/${d.getDate()}`;
      forecast.push({ label, count });
    }

    return {
      dueToday,
      dueWeek,
      overdue,
      avgEF: efCount > 0 ? Math.round((totalEF / efCount) * 100) / 100 : 0,
      avgInterval: intervalCount > 0 ? Math.round((totalInterval / intervalCount) * 10) / 10 : 0,
      intervals,
      efBuckets,
      statusCounts,
      maturity: { new: sm2New, learning, mature, total: withSM2 },
      forecast,
      maxForecast: Math.max(1, ...forecast.map((f) => f.count)),
    };
  },
};
