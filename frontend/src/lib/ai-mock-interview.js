import { aiChat, hasAI } from "./ai.js";
import { api } from "./local-api.js";

const STORAGE_KEY = "ai_interview_history";
const SESSION_KEY = "ai_interview_session";

const SYSTEM_PROMPT = `你是一个资深技术面试官，正在模拟真实的技术面试。你的职责是：

1. 选择一个题目（从题库选题），先问出这道题
2. 评估候选人的回答，给出简短的建设性反馈（1-2 句话）
3. 根据候选人回答的深度和准确性，决定是追问还是到下一题：
   - 如果回答不够完整，追问 1-2 次深入问题
   - 如果回答正确且完整，给予肯定并进入下一题
   - 如果回答错误，指出关键遗漏点后进入下一题
4. 保持面试官语气，专业但不刻板
5. 每轮回复格式：先简要评价，再给出下一题或追问

注意：这是模拟面试，要像真实面试一样有节奏感。不要一次性给太多提示。`;

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  const h = getHistory();
  h.push(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(-50)));
  } catch {}
}

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSession(s) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {}
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

/**
 * Start a new AI mock interview session.
 * @param {Object} config - { category, difficulty, type, count, timeLimit }
 * @returns {Object} session state
 */
export function startInterview(config) {
  const list = api.questions.list({
    category: config.category || "",
    difficulty: config.difficulty || "",
    type: config.type || "short_answer",
    tag: config.tag || "",
    page_size: 500,
  });

  const shuffled = [...list].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, config.count || 5);

  const session = {
    config,
    questions: questions.map((q) => ({
      id: q.id,
      title: q.title,
      content: q.content,
      answer: q.answer,
      tags: q.tags,
      category: q.category,
    })),
    currentIndex: 0,
    history: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
    results: [],
  };

  saveSession(session);
  return session;
}

/**
 * Get the AI-generated question/follow-up for the current round.
 * @param {Object} session
 * @param {string} [userAnswer] - user's answer (omit for first question)
 * @returns {Promise<{ message: string, done: boolean }>}
 */
export async function nextRound(session, userAnswer) {
  if (!hasAI()) {
    return { message: "请先在 AI 评分设置中配置 API Key", done: true };
  }

  const q = session.questions[session.currentIndex];
  if (!q) {
    return { message: "面试已结束，点击查看总结", done: true };
  }

  const isFirstRound = session.history.length === 0;
  const roundNum = session.history.filter((h) => h.type === "question").length + 1;

  let messages;

  if (isFirstRound) {
    // First question: ask it
    const topicContext = session.config.category ? `（分类：${session.config.category}）` : "";
    messages = [
      {
        role: "user",
        content: `这是第 ${roundNum} 题${topicContext}。\n\n题目：${q.title}\n\n题目描述：${q.content}\n\n请以面试官的口吻问出这道题。`,
      },
    ];
  } else {
    // Build conversation context
    const allHistory = session.history.map((h) => ({
      role: h.role,
      content: h.content,
    }));

    // Evaluate the user's last answer
    const isLastRound = session.currentIndex >= session.questions.length - 1;
    const followUpCount = session.history.filter(
      (h) => h.type === "followup" && h.questionIndex === session.currentIndex,
    ).length;

    if (followUpCount < 2) {
      // Ask a follow-up question
      messages = [
        ...allHistory,
        {
          role: "user",
          content: `用户的回答：${userAnswer}\n\n参考答案：${q.answer}\n\n用户回答得不够深入，请追问 1 个更深入的问题来考察用户的理解。追问要像真实面试一样自然衔接。`,
        },
      ];
    } else if (!isLastRound) {
      // Move to next question
      const nextQ = session.questions[session.currentIndex + 1];
      messages = [
        ...allHistory,
        {
          role: "user",
          content: `用户的回答：${userAnswer}\n\n参考答案：${q.answer}\n\n请给出简短评价（1-2 句），然后自然过渡到下一题：\n\n题目：${nextQ.title}\n\n题目描述：${nextQ.content}`,
        },
      ];
    } else {
      // Interview complete
      messages = [
        ...allHistory,
        {
          role: "user",
          content: `用户的回答：${userAnswer}\n\n这是最后一道题。请给出简短评价，并宣布模拟面试结束。然后输出 "【面试结束】"。`,
        },
      ];
    }
  }

  const reply = await aiChat(SYSTEM_PROMPT, messages);

  // Record the round
  const type = isFirstRound
    ? "question"
    : session.history.length > 0 && session.history[session.history.length - 1].type === "question"
      ? "followup"
      : "question";

  session.history.push({
    role: "assistant",
    content: reply,
    type,
    questionIndex: session.currentIndex,
  });

  if (userAnswer) {
    session.history.push({
      role: "user",
      content: userAnswer,
      type: "answer",
      questionIndex: session.currentIndex,
    });
  }

  const isDone =
    reply.includes("【面试结束】") ||
    (!isFirstRound &&
      session.currentIndex >= session.questions.length - 1 &&
      session.history.filter(
        (h) => h.type === "followup" && h.questionIndex === session.currentIndex,
      ).length >= 2);

  if (isDone) {
    session.completedAt = new Date().toISOString();
  }

  saveSession(session);
  return { message: reply, done: isDone };
}

/**
 * Finish the interview and save results.
 */
export function finishInterview(session, results) {
  session.completedAt = new Date().toISOString();
  session.results = results;

  const correct = results.filter((r) => r.status === "correct").length;
  const total = results.length;

  saveHistory({
    date: session.startedAt,
    total,
    correct,
    wrong: total - correct,
    pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    category: session.config.category,
    difficulty: session.config.difficulty,
    config: session.config,
  });

  clearSession();
  return session;
}
