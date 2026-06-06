/**
 * Knowledge Data Index
 *
 * Re-exports all knowledge point data from split files.
 * Each file contains knowledge points for a specific topic area.
 */

import { knowledge as javaBasics } from "./java-basics.js";
import { knowledge as javaCollections } from "./java-collections.js";
import { knowledge as javaAdvanced } from "./java-advanced.js";
import { knowledge as jvmConcurrency } from "./jvm-concurrency.js";
import { knowledge as spring } from "./spring.js";
import { knowledge as database } from "./database.js";
import { knowledge as network } from "./network.js";
import { knowledge as frontend } from "./frontend.js";
import { knowledge as aiAgent } from "./ai-agent.js";
import { knowledge as systemDesign } from "./system-design.js";
import { knowledge as algorithms } from "./algorithms.js";
import { knowledge as softSkills } from "./soft-skills.js";

// Merge all knowledge data
export const knowledgeContent = {
  ...javaBasics,
  ...javaCollections,
  ...javaAdvanced,
  ...jvmConcurrency,
  ...spring,
  ...database,
  ...network,
  ...frontend,
  ...aiAgent,
  ...systemDesign,
  ...algorithms,
  ...softSkills,
};

/**
 * Get knowledge metadata for a tag, or null if not defined.
 */
export function getKnowledgeForTag(tag) {
  return knowledgeContent[tag] || null;
}

/**
 * Build a map of tag → { knowledgeContent, related question IDs }
 */
export function buildKnowledgeMap(questions) {
  const map = Object.create(null);

  // First pass: accumulate question IDs per tag
  for (const q of questions) {
    if (!q.tags) continue;
    for (const t of q.tags) {
      if (!map[t]) {
        map[t] = {
          questionIds: [],
          ...(knowledgeContent[t] || { category: q.category || "" }),
        };
      }
      map[t].questionIds.push(q.id);
    }
  }

  // Merge with pre-stored content for tags that have no associated questions
  for (const [tag, content] of Object.entries(knowledgeContent)) {
    if (!map[tag]) {
      map[tag] = { ...content, questionIds: [] };
    }
  }

  return map;
}
