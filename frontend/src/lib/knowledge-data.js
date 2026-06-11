/**
 * Knowledge Data Index
 *
 * Re-exports all knowledge point data from split files.
 * Each file contains knowledge points for a specific topic area.
 */

import { knowledge as javaBasics } from "./knowledge-data/java-basics.js";
import { knowledge as javaCollections } from "./knowledge-data/java-collections.js";
import { knowledge as javaAdvanced } from "./knowledge-data/java-advanced.js";
import { knowledge as jvmConcurrency } from "./knowledge-data/jvm-concurrency.js";
import { knowledge as spring } from "./knowledge-data/spring.js";
import { knowledge as database } from "./knowledge-data/database.js";
import { knowledge as network } from "./knowledge-data/network.js";
import { knowledge as frontend } from "./knowledge-data/frontend.js";
import { knowledge as aiAgent } from "./knowledge-data/ai-agent.js";
import { knowledge as systemDesign } from "./knowledge-data/system-design.js";
import { knowledge as algorithms } from "./knowledge-data/algorithms.js";
import { knowledge as softSkills } from "./knowledge-data/soft-skills.js";
import { knowledge as linux } from "./knowledge-data/linux.js";
import { knowledge as devops } from "./knowledge-data/devops.js";
import { knowledge as security } from "./knowledge-data/security.js";
import { knowledge as redis } from "./knowledge-data/redis.js";
import { knowledge as mq } from "./knowledge-data/mq.js";
import { knowledge as distributed } from "./knowledge-data/distributed.js";

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
  ...linux,
  ...devops,
  ...security,
  ...redis,
  ...mq,
  ...distributed,
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
