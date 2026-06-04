import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 15000,
  retries: 1,
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 390, height: 844 }, // iPhone 14 size
    storageState: "./e2e/storageState.json",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
