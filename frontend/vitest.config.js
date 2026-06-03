import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["src/lib/ai.js", "src/lib/local-api.js"],
      thresholds: {
        functions: 55,
        lines: 44,
      },
    },
  },
});
