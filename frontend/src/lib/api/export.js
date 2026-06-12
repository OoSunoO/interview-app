import { questionIndex, questions as allQuestions, loadAll } from "./loader.js";
import { CATEGORY_LABELS } from "../categories.js";

export async function exportMarkdown(ids) {
  await loadAll();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const items = allQuestions.filter((q) => ids.includes(q.id));

  let md = `# 面试题库导出 (${dateStr})\n\n共 ${items.length} 题\n\n`;
  for (const q of items) {
    const catLabel = CATEGORY_LABELS[q.category] || q.category;
    const diffLabel = { easy: "简单", medium: "中等", hard: "困难" }[q.difficulty] || q.difficulty;
    const typeLabel =
      {
        short_answer: "简答",
        coding: "编程",
        choice: "选择",
        true_false: "判断",
        multiple_choice: "多选",
        fill_in_blank: "填空",
      }[q.type] || q.type;
    const tags = (q.tags || []).map((t) => `\`${t}\``).join(" ");
    md += `---\n\n### ${q.id}. ${q.title}\n\n**分类：** ${catLabel} | **难度：** ${diffLabel} | **题型：** ${typeLabel}`;
    if (q.source) md += ` | **来源：** ${q.source}`;
    md += `\n\n`;
    if (tags) md += `${tags}\n\n`;
    md += `${q.content}\n\n`;
    if (q.options && q.options.length > 0) {
      md += `**选项：**\n\n${q.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\n`;
    }
    md += `**答案：**\n> ${q.answer?.replace(/\n/g, "\n> ") ?? ""}\n\n`;
  }
  return md;
}
