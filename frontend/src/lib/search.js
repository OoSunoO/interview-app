import Fuse from "fuse.js";

let fuse = null;

export function initSearch(questions) {
  fuse = new Fuse(questions, {
    keys: [
      { name: "title", weight: 2 },
      { name: "content", weight: 1 },
      { name: "answer", weight: 1 },
      { name: "tags", weight: 1.5 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });
}

export function searchQuestions(query, items) {
  if (!fuse) return items;
  if (!query.trim()) return items;
  const results = fuse.search(query.trim());
  const scored = new Map(results.map((r) => [r.item.id, r.score]));
  return items
    .map((q) => ({ q, score: scored.get(q.id) ?? 1 }))
    .filter(({ score }) => score < 1)
    .sort((a, b) => a.score - b.score)
    .map(({ q }) => q);
}

const HISTORY_KEY = "search_history";

export function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function addSearchHistory(term) {
  if (!term || !term.trim()) return;
  const history = getSearchHistory().filter((h) => h !== term);
  history.unshift(term.trim());
  if (history.length > 10) history.length = 10;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

export function clearSearchHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}
