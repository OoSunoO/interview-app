import { ready } from "./loader.js";
import { questions } from "./questions.js";
import { progress } from "./progress.js";
import { tags } from "./tags.js";
import { knowledge } from "./knowledge.js";
import { quickReview, mockInterview } from "./history.js";
import { exportMarkdown } from "./export.js";
import { migrateProgress } from "./migrate.js";
import { version as appVersion } from "../../../package.json";

export { ready };

export const api = {
  version: () => ({ version: appVersion, name: "面试题 App" }),
  questions,
  progress,
  tags,
  knowledge,
  quickReview,
  mockInterview,
  exportMarkdown,
  migrateProgress,
};
