const BASE = "/api";

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  questions: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") q.set(k, v);
      });
      return get(`/questions?${q}`);
    },
    get: (id) => get(`/questions/${id}`),
  },
  progress: {
    update: (questionId, body) => post(`/progress/${questionId}`, body),
    stats: () => get("/progress/stats"),
    wrong: () => get("/progress/wrong"),
    dueReviews: () => get("/progress/review/due"),
    knowledge: () => get("/progress/knowledge"),
  },
};
