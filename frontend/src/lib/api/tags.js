import { getProgress, saveProgress } from "./storage.js";
import { gistSync } from "../gist-sync.js";

function usernameSuffix(key) {
  const u = gistSync.getUsername();
  if (!u) return key;
  return `${key}_${u}`;
}

const TAG_DEFS_KEY = "user_tag_definitions";

export const tags = {
  definitions() {
    try {
      return JSON.parse(localStorage.getItem(usernameSuffix(TAG_DEFS_KEY)) || "[]");
    } catch {
      return [];
    }
  },
  saveDefinition(tag) {
    const all = this.definitions();
    const idx = all.findIndex((t) => t.id === tag.id);
    if (idx >= 0) all[idx] = tag;
    else all.push(tag);
    try {
      localStorage.setItem(usernameSuffix(TAG_DEFS_KEY), JSON.stringify(all));
    } catch {
      /* ignore */
    }
    return all;
  },
  deleteDefinition(tagId) {
    const all = this.definitions().filter((t) => t.id !== tagId);
    try {
      localStorage.setItem(usernameSuffix(TAG_DEFS_KEY), JSON.stringify(all));
    } catch {
      /* ignore */
    }
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
