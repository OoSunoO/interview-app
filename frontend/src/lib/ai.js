const STORAGE_KEY = "interview_ai_config";

export const PROVIDERS = [
  {
    label: "Anthropic (Claude)",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-6",
  },
  {
    label: "OpenAI (GPT)",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
  },
  {
    label: "DeepSeek",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
  },
];

let _config = null;

function load() {
  if (_config) return _config;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) _config = JSON.parse(raw);
  } catch {}
  if (!_config)
    _config = { key: "", endpoint: PROVIDERS[0].endpoint, model: PROVIDERS[0].model, provider: 0 };
  return _config;
}

export function getAIConfig() {
  return { ...load() };
}

export function saveAIConfig(partial) {
  _config = { ...load(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
}

export function setProvider(idx) {
  const p = PROVIDERS[idx];
  if (p) saveAIConfig({ provider: idx, endpoint: p.endpoint, model: p.model });
}

export function hasAI() {
  return !!load().key;
}

export async function aiChat(systemPrompt, messages) {
  const cfg = load();
  if (!cfg.key) throw new Error("请先配置 API Key");

  const isAnthropic = cfg.endpoint.includes("anthropic.com");
  const body = isAnthropic
    ? { model: cfg.model, max_tokens: 1024, system: systemPrompt, messages }
    : {
        model: cfg.model,
        max_tokens: 1024,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      };

  const headers = { "Content-Type": "application/json" };
  if (isAnthropic) {
    headers["x-api-key"] = cfg.key;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${cfg.key}`;
  }

  const res = await fetch(cfg.endpoint, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API 错误 (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return isAnthropic ? data.content[0].text : data.choices[0].message.content;
}

export async function gradeAnswer(question, userAnswer, referenceAnswer) {
  return aiChat(
    "你是一个面试教练，评估候选人的答案。先用 ✅ 或 ⚠️ 判断正误，然后给出简短解释（不超过 100 字）。",
    [
      {
        role: "user",
        content: `题目：${question}\n\n参考答案：${referenceAnswer}\n\n我的答案：${userAnswer}\n\n请判断我的答案是否正确并给出建议。`,
      },
    ],
  );
}

export async function analyzeMistakes(wrongQuestions) {
  // Group by knowledge point tag
  const groups = {};
  for (const q of wrongQuestions) {
    for (const tag of q.tags || []) {
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(q);
    }
  }

  const summary = Object.entries(groups)
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([tag, qs]) => {
      const totalWrong = qs.reduce((s, q) => s + q.wrong_count, 0);
      const types = [...new Set(qs.map((q) => q.type))];
      const titles = qs.map((q) => `  - [${q.type}] ${q.title}`).join("\n");
      return `## ${tag}（${qs.length} 题，共错 ${totalWrong} 次）\n题型：${types.join(", ")}\n题目：\n${titles}`;
    })
    .join("\n\n");

  const system =
    "你是一个资深技术面试教练。分析候选人的错题数据，找出知识薄弱点和错误模式。只输出 JSON，不要额外文字。";

  const data = await aiChat(system, [
    {
      role: "user",
      content: `分析以下错题数据，输出 JSON 格式分析报告：\n\n${summary}\n\nJSON 格式：{\n  "summary": "一句话整体评估",\n  "weakest_points": [\n    { "point": "知识点名", "severity": "high|medium|low", "wrong_count": 5, "analysis": "薄弱原因分析" }\n  ],\n  "error_patterns": [\n    { "pattern": "错误模式", "detail": "具体说明", "affected_tags": ["关联知识点"] }\n  ],\n  "learning_suggestions": [\n    { "priority": "high|medium|low", "suggestion": "学习建议" }\n  ]\n}`,
    },
  ]);

  // Try to extract JSON from the response
  try {
    // Strip markdown code fences if present
    const cleaned = data
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    // If parsing fails, return as raw text
    return { raw: data };
  }
}

export async function gradeDetailed(question, userAnswer, referenceAnswer) {
  const data = await aiChat(
    "你是一个严谨的面试评分系统。根据参考答案评估用户答案，输出 JSON 格式的多维评分。只输出 JSON，不要额外文字。",
    [
      {
        role: "user",
        content: `题目：${question}\n\n参考答案：${referenceAnswer}\n\n用户答案：${userAnswer}\n\n请从完整性、准确性、代码质量三个维度评分（0-100），输出 JSON：{"overall":"通过/部分通过/不通过","dimensions":[{"name":"完整性","score":80,"comment":"..."},{"name":"准确性","score":90,"comment":"..."},{"name":"代码质量","score":70,"comment":"..."}],"suggestion":"改进建议"}`,
      },
    ],
  );

  // Try to extract JSON
  try {
    const cleaned = data
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    // Ensure dimensions exist
    if (!parsed.dimensions) parsed.dimensions = [];
    return parsed;
  } catch {
    return {
      overall: "未知",
      dimensions: [{ name: "总评", score: 0, comment: data.slice(0, 200) }],
      suggestion: "",
    };
  }
}

const AI_SCORES_KEY = "ai_scores";

export function getScoreHistory() {
  try {
    return JSON.parse(localStorage.getItem(AI_SCORES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveScoreEntry(entry) {
  const history = getScoreHistory();
  history.push({ ...entry, timestamp: new Date().toISOString() });
  try {
    localStorage.setItem(AI_SCORES_KEY, JSON.stringify(history.slice(-100)));
  } catch {
    /* ignore */
  }
}

export async function socraticChat(question, userAnswer, referenceAnswer, history) {
  const system =
    "你是一个苏格拉底式面试教练。用户回答错了这道题，你的任务是通过提问引导他们自己发现正确答案。每次只问一个问题，不要直接给出答案。鼓励但不代答。";

  if (!history || history.length === 0) {
    return aiChat(system, [
      {
        role: "user",
        content: `题目：${question}\n\n用户的答案：${userAnswer}\n\n参考答案：${referenceAnswer}\n\n问第一个苏格拉底式问题，引导用户深入思考。`,
      },
    ]);
  }

  return aiChat(system, history);
}
