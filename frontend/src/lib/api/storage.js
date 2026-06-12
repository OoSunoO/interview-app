import { gistSync } from "../gist-sync.js";

function usernameSuffix(key) {
  const u = gistSync.getUsername();
  if (!u) return key;
  return `${key}_${u}`;
}

const PROGRESS_KEY = "quiz_progress";
const SESSION_KEY = "quiz_review_sessions";
const DAILY_STATS_KEY = "quiz_daily_stats";
const GOAL_KEY = "quiz_daily_goal";

export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(usernameSuffix(PROGRESS_KEY)) || "{}");
  } catch {
    return {};
  }
}

export function saveProgress(p) {
  try {
    localStorage.setItem(usernameSuffix(PROGRESS_KEY), JSON.stringify(p));
    gistSync.queueSync();
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22 || e.code === 1014) {
      document.dispatchEvent(new CustomEvent("storage-quota-exceeded"));
    }
    console.warn("localStorage write failed:", e);
  }
}

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(usernameSuffix(SESSION_KEY)) || "[]");
  } catch {
    return [];
  }
}

export function saveSessions(s) {
  try {
    localStorage.setItem(usernameSuffix(SESSION_KEY), JSON.stringify(s.slice(-500)));
    gistSync.queueSync();
  } catch {
    /* ignore */
  }
}

export function getDailyStats() {
  try {
    return JSON.parse(localStorage.getItem(usernameSuffix(DAILY_STATS_KEY)) || "{}");
  } catch {
    return {};
  }
}

export function saveDailyStats(stats) {
  try {
    localStorage.setItem(usernameSuffix(DAILY_STATS_KEY), JSON.stringify(stats));
    gistSync.queueSync();
  } catch {
    /* ignore */
  }
}

export function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function computeStreak(daily) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = dateKey(d);
    if ((daily[key]?.reviewed || 0) > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

export function recordReviewActivity(rating) {
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

export function matchesSearch(q, search) {
  if (!search) return true;
  const s = search.toLowerCase();
  return (
    q.title.toLowerCase().includes(s) ||
    (q.content || "").toLowerCase().includes(s) ||
    (q.answer || "").toLowerCase().includes(s) ||
    (q.tags || []).some((t) => t.toLowerCase().includes(s))
  );
}

export function getGoal() {
  try {
    return parseInt(localStorage.getItem(GOAL_KEY), 10) || 0;
  } catch {
    return 0;
  }
}

export function setGoal(n) {
  const val = Math.max(0, Math.min(200, Math.round(n)));
  try {
    localStorage.setItem(GOAL_KEY, String(val));
  } catch {
    /* ignore */
  }
  return val;
}
