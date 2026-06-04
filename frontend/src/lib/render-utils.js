/**
 * Render content: splits text by code blocks (```).
 * Returns an array of { type: "text", content } or { type: "code", lang, code }.
 */
export function renderContent(text) {
  if (!text) return [{ type: "text", content: "" }];
  const parts = text.split(/(```\w*\n[\s\S]*?```)/g);
  return parts.map((p) => {
    const match = p.match(/```(\w*)\n([\s\S]*?)```/);
    if (match) return { type: "code", lang: match[1], code: match[2].trimEnd() };
    return { type: "text", content: p };
  });
}

/**
 * Render answer: splits answer text by headers (答案/解析/扩展延伸).
 * Each section is further processed through renderContent for code blocks.
 */
export function renderAnswer(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const sections = [];
  let curType = "answer";
  let curLines = [];
  const headerRe = /^(答案|解析|扩展延伸|推荐阅读)[：:]\s*/;

  for (const line of lines) {
    const h = line.match(headerRe);
    if (h) {
      if (curLines.length) sections.push({ type: curType, text: curLines.join("\n").trim() });
      curType = { 答案: "answer", 解析: "explanation" }[h[1]] ?? "extension";
      curLines = [line.slice(h[0].length)];
    } else {
      curLines.push(line);
    }
  }
  if (curLines.length) sections.push({ type: curType, text: curLines.join("\n").trim() });

  const hasMarkers = lines.some((l) => headerRe.test(l));
  if (!hasMarkers) {
    const t = text.trim();
    return t ? [{ type: "answer", parts: renderContent(t) }] : [];
  }
  return sections.map((s) => ({ type: s.type, parts: renderContent(s.text) }));
}
