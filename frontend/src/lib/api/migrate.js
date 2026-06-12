import { getProgress, saveProgress } from "./storage.js";
import { questionIndex } from "./loader.js";
import { getDefaultProgress } from "../sm2.js";

export function migrateProgress() {
  const progress = getProgress();
  let changed = false;

  const hashToId = {};
  for (const q of questionIndex) {
    if (q.content_hash) hashToId[q.content_hash] = q.id;
  }

  const remapped = {};
  const oldKeys = Object.keys(progress);
  for (const idStr of oldKeys) {
    const id = Number(idStr);
    const entry = progress[idStr];
    if (!entry) continue;
    const currentQuestion = questionIndex.find((q) => q.id === id);
    if (
      currentQuestion &&
      entry.content_hash &&
      entry.content_hash === currentQuestion.content_hash
    ) {
      remapped[id] = entry;
    } else if (entry.content_hash && hashToId[entry.content_hash]) {
      const newId = hashToId[entry.content_hash];
      if (newId !== id) {
        if (!remapped[newId]) {
          remapped[newId] = entry;
          changed = true;
        }
      } else {
        remapped[newId] = entry;
      }
    } else {
      remapped[id] = entry;
    }
  }

  for (const q of questionIndex) {
    if (remapped[q.id] && !remapped[q.id].content_hash) {
      remapped[q.id].content_hash = q.content_hash;
      changed = true;
    }
  }

  for (const id of Object.keys(remapped)) {
    const entry = remapped[id];
    if (entry.ef === undefined) {
      const defaults = getDefaultProgress();
      remapped[id] = { ...defaults, ...entry };
      if (entry.status === "correct" && !entry.next_review_at) {
        const d = new Date();
        d.setDate(d.getDate() + 4);
        remapped[id].next_review_at = d.toISOString();
        remapped[id].interval = 4;
        remapped[id].repetitions = 1;
      }
      changed = true;
    }
  }

  if (changed) saveProgress(remapped);
  return { migrated: changed };
}
