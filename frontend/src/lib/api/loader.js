import { initStorage } from "./storage.js";

export let questionIndex,
  knowledgeMap,
  loadCategory,
  loadAll,
  questions,
  categoryIndex,
  buildKnowledgeMap,
  getKnowledgeForTag;

export const ready = (async () => {
  await initStorage();
  try {
    const [qMod, kMod] = await Promise.all([
      import("../question-data/index.js"),
      import("../knowledge-data.js"),
    ]);
    ({ questionIndex, loadCategory, loadAll, questions, categoryIndex } = qMod);
    ({ buildKnowledgeMap, getKnowledgeForTag } = kMod);
    knowledgeMap = buildKnowledgeMap(questionIndex);
    loadAll();
  } catch (e) {
    console.error("Failed to load question/knowledge data:", e);
    throw e;
  }
})();
