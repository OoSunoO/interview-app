import { CATEGORY_LABELS } from "../categories.js";
import {
  questionIndex,
  questions as allQuestions,
  loadAll,
  knowledgeMap,
  buildKnowledgeMap,
  getKnowledgeForTag,
} from "./loader.js";
import { getProgress } from "./storage.js";
import { CATEGORY_TO_DOMAIN, domainLabel } from "../knowledge-data/domains.js";

function computeMastery(tag, progress) {
  const tagQuestions = questionIndex.filter((q) => q.tags.includes(tag));
  if (tagQuestions.length === 0) return 0;
  let totalScore = 0;
  for (const q of tagQuestions) {
    const p = progress[q.id];
    if (!p || p.status === "new") totalScore += 0;
    else if (p.status === "correct") totalScore += 1;
    else if (p.status === "reviewing") totalScore += 0.5;
    else if (p.status === "wrong") totalScore += 0;
  }
  return Math.round((totalScore / tagQuestions.length) * 100);
}

function getTagCategoryMap() {
  const map = Object.create(null);
  for (const q of questionIndex) {
    for (const t of q.tags) {
      if (!map[t]) map[t] = new Set();
      map[t].add(q.category);
    }
  }
  const result = {};
  for (const [tag, cats] of Object.entries(map)) {
    result[tag] = Array.from(cats).map((c) => CATEGORY_LABELS[c] || c);
  }
  return result;
}

export const knowledge = {
  list(search) {
    const progress = getProgress();
    const tagMap = Object.create(null);
    const tagCategories = getTagCategoryMap();

    for (const q of questionIndex) {
      for (const t of q.tags) {
        if (!tagMap[t]) tagMap[t] = [];
        tagMap[t].push(q.id);
      }
    }
    for (const tag of Object.keys(knowledgeMap)) {
      if (!tagMap[tag]) tagMap[tag] = [];
    }

    let entries = Object.entries(tagMap)
      .map(([tag, ids]) => {
        const cat = tagCategories[tag]?.[0] || knowledgeMap[tag]?.category || "";
        const domainId = CATEGORY_TO_DOMAIN[cat] || "";
        return {
          name: tag,
          question_count: ids.length,
          mastery: ids.length > 0 ? computeMastery(tag, progress) : 0,
          categories: tagCategories[tag] || [knowledgeMap[tag]?.category || "其他"],
          has_content: !!getKnowledgeForTag(tag),
          domain: domainId,
          domain_label: domainLabel(domainId),
        };
      })
      .sort((a, b) => b.question_count - a.question_count);

    if (search) {
      const q = search.toLowerCase().trim();
      const contentCache = Object.create(null);
      entries = entries.filter((e) => {
        if (e.name.toLowerCase().includes(q)) return true;
        if (e.categories.some((c) => c.toLowerCase().includes(q))) return true;
        const stored = getKnowledgeForTag(e.name);
        if (stored?.content) {
          if (contentCache[e.name] === undefined)
            contentCache[e.name] = stored.content.toLowerCase();
          return contentCache[e.name].includes(q);
        }
        return false;
      });
    }
    return entries;
  },

  async get(tag) {
    await loadAll();
    const progress = getProgress();
    const tagQuestions = allQuestions.filter((q) => (q.tags || []).includes(tag));
    const tagCategories = getTagCategoryMap();
    const stored = getKnowledgeForTag(tag);
    const cat = tagCategories[tag]?.[0] || stored?.category || "";
    const domainId = CATEGORY_TO_DOMAIN[cat] || stored?.domain || "";
    return {
      name: tag,
      question_count: tagQuestions.length,
      mastery: tagQuestions.length > 0 ? computeMastery(tag, progress) : 0,
      categories: tagCategories[tag] || (stored ? [stored.category || ""] : []),
      domain: domainId,
      domain_label: domainLabel(domainId),
      source: stored?.source || "",
      content: stored?.content || "",
      questions: tagQuestions.map((q) => {
        const p = progress[q.id] || {};
        return {
          id: q.id,
          title: q.title,
          category: q.category,
          difficulty: q.difficulty,
          type: q.type,
          content: q.content,
          tags: q.tags,
          status: p.status || "new",
          wrong_count: p.wrong_count || 0,
          review_count: p.review_count || 0,
          bookmarked: p.bookmarked || false,
        };
      }),
    };
  },

  getTagsForQuestion(questionId) {
    const q = questionIndex.find((x) => x.id === questionId);
    if (!q) return [];
    return (q.tags || []).map((t) => ({ name: t, has_content: !!getKnowledgeForTag(t) }));
  },
};
