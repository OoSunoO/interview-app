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
});
let _quizSession = $state([]);
let _quizIndex = $state(0);

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

  startQuiz(list, shuffle = false) {
    _quizSession = shuffle ? shuffled(list) : list;
    _quizIndex = 0;
  },

  advanceQuiz() {
    if (_quizIndex < _quizSession.length - 1) {
      _quizIndex++;
      return true;
    }
    return false;
  },

  retreatQuiz() {
    if (_quizIndex > 0) {
      _quizIndex--;
      return true;
    }
    return false;
  },

  shuffleSession() {
    _quizSession = shuffled(_quizSession);
    _quizIndex = 0;
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

  async markProgress(questionId, status, duration = 0) {
    await api.progress.update(questionId, { status, duration_seconds: duration });
    if (status === "wrong") {
      _wrongQuestions = await api.progress.wrong();
      _dueReviews = await api.progress.dueReviews();
    }
    _stats = await api.progress.stats();
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
