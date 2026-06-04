import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { readFileSync } from "fs";
import { resolve } from "path";

const version = readFileSync(resolve(__dirname, "../VERSION"), "utf-8").trim();

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: { dev: true, css: "injected" },
      hot: false,
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    conditions: ["browser"],
  },
  test: {
    environment: "jsdom",
    exclude: ["e2e/**", "node_modules/**"],
    setupFiles: ["src/lib/__tests__/setup.js"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/ai.js",
        "src/lib/local-api.js",
        "src/lib/render-utils.js",
      ],
      thresholds: {
        functions: 80,
        lines: 85,
      },
    },
  },
});
