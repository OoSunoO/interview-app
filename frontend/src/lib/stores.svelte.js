import { api } from "./local-api.js";

let _currentQuestion = $state(null);
let _questions = $state([]);
let _stats = $state(null);
let _wrongQuestions = $state([]);
let _dueReviews = $state([]);
let _knowledge = $state([]);
let _loading = $state(false);
let _error = $state(null);
let _filters = $state({
  category: "",
  difficulty: "",
  type: "",
  status: "",
  search: "",
  sort_by: "",
  company: "",
  bookmarked: false,
});
let _quizSession = $state([]);
let _quizIndex = $state(0);
let _dailyStats = $state({
  today: { reviewed: 0, remembered: 0, hard: 0, forgot: 0 },
  streak: 0,
  retention: 0,
});

function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

let _theme = $state(getInitialTheme());

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
applyTheme(getInitialTheme());

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const store = {
  get currentQuestion() {
    return _currentQuestion;
  },
  set currentQuestion(v) {
    _currentQuestion = v;
  },

  get questions() {
    return _questions;
  },
  set questions(v) {
    _questions = v;
  },

  get stats() {
    return _stats;
  },
  set stats(v) {
    _stats = v;
  },

  get wrongQuestions() {
    return _wrongQuestions;
  },
  set wrongQuestions(v) {
    _wrongQuestions = v;
  },

  get dueReviews() {
    return _dueReviews;
  },
  set dueReviews(v) {
    _dueReviews = v;
  },
  get dueCount() {
    return _dueReviews.length;
  },

  get dailyStats() {
    return _dailyStats;
  },

  get knowledge() {
    return _knowledge;
  },
  set knowledge(v) {
    _knowledge = v;
  },

  get loading() {
    return _loading;
  },
  set loading(v) {
    _loading = v;
  },

  get error() {
    return _error;
  },
  clearError() {
    _error = null;
  },

  get filters() {
    return _filters;
  },
  set filters(v) {
    _filters = v;
  },

  get quizSession() {
    return _quizSession;
  },
  get quizSessionLength() {
    return _quizSession.length;
  },
  get quizIndex() {
    return _quizIndex;
  },
  get hasPrev() {
    return _quizIndex > 0;
  },
  get hasNext() {
    return _quizIndex < _quizSession.length - 1;
  },

  // ── Quiz session persistence ──
  SESSION_BACKUP_KEY: "quiz_session_backup",

  _saveSessionBackup() {
    try {
      const backup = {
        questionIds: _quizSession.map((q) => q.id),
        index: _quizIndex,
        savedAt: Date.now(),
      };
      localStorage.setItem("quiz_session_backup", JSON.stringify(backup));
    } catch {
      /* ignore */
    }
  },

  _clearSessionBackup() {
    try {
      localStorage.removeItem("quiz_session_backup");
    } catch {
      /* ignore */
    }
  },

  getSessionBackup() {
    try {
      const raw = localStorage.getItem("quiz_session_backup");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async restoreFromBackup() {
    const backup = this.getSessionBackup();
    if (!backup || !backup.questionIds || backup.questionIds.length === 0) return false;
    const questions = [];
    for (const id of backup.questionIds) {
      const q = await api.questions.get(id);
      if (q) questions.push(q);
    }
    if (questions.length === 0) {
      this._clearSessionBackup();
      return false;
    }
    _quizSession = questions;
    _quizIndex = Math.min(backup.index, questions.length - 1);
    return true;
  },

  async startQuiz(list, shuffle = false) {
    // Load full question data (content, answer, options) for quiz rendering
    const full = await Promise.all(list.map((q) => api.questions.get(q.id)));
    _quizSession = shuffle ? shuffled(full) : full;
    _quizIndex = 0;
    this._saveSessionBackup();
  },

  advanceQuiz() {
    if (_quizIndex < _quizSession.length - 1) {
      _quizIndex++;
      this._saveSessionBackup();
      return true;
    }
    return false;
  },

  retreatQuiz() {
    if (_quizIndex > 0) {
      _quizIndex--;
      this._saveSessionBackup();
      return true;
    }
    return false;
  },

  goToQuestion(index) {
    if (index < 0 || index >= _quizSession.length) return false;
    _quizIndex = index;
    this._saveSessionBackup();
    return true;
  },

  shuffleSession() {
    _quizSession = shuffled(_quizSession);
    _quizIndex = 0;
    this._saveSessionBackup();
  },

  async loadQuestions(params = {}) {
    _loading = true;
    _error = null;
    try {
      _questions = await api.questions.list({ ..._filters, ...params });
    } catch (e) {
      _error = e.message ?? "加载题目列表失败";
    } finally {
      _loading = false;
    }
  },

  async loadQuestionDetail(id) {
    _loading = true;
    _error = null;
    try {
      _currentQuestion = await api.questions.get(id);
    } catch (e) {
      _error = e.message ?? "加载题目详情失败";
    } finally {
      _loading = false;
    }
    return _currentQuestion;
  },

  async markProgress(questionId, status, duration = 0, rating) {
    await api.progress.update(questionId, { status, rating, duration_seconds: duration });
    if (status === "wrong" || rating === "forgot" || rating === "hard") {
      _wrongQuestions = await api.progress.wrong();
      _dueReviews = await api.progress.dueReviews();
    }
    _stats = await api.progress.stats();
  },

  async rateAndAdvance(questionId, rating) {
    await api.progress.update(questionId, { rating, source: "review_session" });
    _dailyStats = await api.progress.dailyStats();
    _stats = await api.progress.stats();
    _dueReviews = await api.progress.dueReviews();
    _wrongQuestions = await api.progress.wrong();
  },

  async refreshDailyStats() {
    _dailyStats = await api.progress.dailyStats();
  },

  async refreshStats() {
    _stats = await api.progress.stats();
  },
  async refreshWrong() {
    _wrongQuestions = await api.progress.wrong();
  },
  async refreshDue() {
    _dueReviews = await api.progress.dueReviews();
  },

  async loadKnowledge() {
    _loading = true;
    _error = null;
    try {
      _knowledge = await api.progress.knowledge();
    } catch (e) {
      _error = e.message ?? "加载知识点失败";
    } finally {
      _loading = false;
    }
  },

  get theme() {
    return _theme;
  },

  toggleTheme() {
    _theme = _theme === "dark" ? "light" : "dark";
    applyTheme(_theme);
  },
};
