import { getProgress, getSessions, getDailyStats, saveDailyStats } from "./storage.js";
import { gistSync } from "../gist-sync.js";

function usernameSuffix(key) {
  const u = gistSync.getUsername();
  if (!u) return key;
  return `${key}_${u}`;
}

export const quickReview = {
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
    } catch {
      /* ignore */
    }
  },
  saveHistory(result) {
    try {
      const key = usernameSuffix("quick_review_history");
      const history = JSON.parse(localStorage.getItem(key) || "[]");
      history.unshift({ ...result, date: new Date().toISOString() });
      if (history.length > 50) history.length = 50;
      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.warn("quickReview saveHistory failed:", e);
    }
  },
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(usernameSuffix("quick_review_history")) || "[]");
    } catch {
      return [];
    }
  },
  clearHistory() {
    try {
      localStorage.removeItem(usernameSuffix("quick_review_history"));
    } catch {
      /* ignore */
    }
  },
};

export const mockInterview = {
  saveHistory(result) {
    try {
      const key = usernameSuffix("mock_interview_history");
      const history = JSON.parse(localStorage.getItem(key) || "[]");
      history.unshift({ ...result, date: new Date().toISOString() });
      if (history.length > 50) history.length = 50;
      localStorage.setItem(key, JSON.stringify(history));
    } catch (e) {
      console.warn("mockInterview saveHistory failed:", e);
    }
  },
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(usernameSuffix("mock_interview_history")) || "[]");
    } catch {
      return [];
    }
  },
  clearHistory() {
    try {
      localStorage.removeItem(usernameSuffix("mock_interview_history"));
    } catch {
      /* ignore */
    }
  },
};
