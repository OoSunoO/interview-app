import { getProgress, saveProgress, getTagDefs, saveTagDefs } from "./storage.js";

export const tags = {
  definitions() {
    return getTagDefs();
  },
  saveDefinition(tag) {
    const all = getTagDefs();
    const idx = all.findIndex((t) => t.id === tag.id);
    if (idx >= 0) all[idx] = tag;
    else all.push(tag);
    saveTagDefs(all);
    return all;
  },
  deleteDefinition(tagId) {
    const all = getTagDefs().filter((t) => t.id !== tagId);
    saveTagDefs(all);
    const progress = getProgress();
    let changed = false;
    for (const [qId, entry] of Object.entries(progress)) {
      if (entry.user_tags?.includes(tagId)) {
        entry.user_tags = entry.user_tags.filter((id) => id !== tagId);
        changed = true;
      }
    }
    if (changed) saveProgress(progress);
    return all;
  },
  getForQuestion(questionId) {
    const progress = getProgress();
    return progress[questionId]?.user_tags || [];
  },
  setForQuestion(questionId, tagIds) {
    const progress = getProgress();
    if (!progress[questionId]) progress[questionId] = {};
    progress[questionId].user_tags = tagIds;
    saveProgress(progress);
  },
};
