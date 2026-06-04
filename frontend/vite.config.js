import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "fs";
import { resolve } from "path";

const version = readFileSync(resolve(__dirname, "../VERSION"), "utf-8").trim();

export default defineConfig({
  base: "./",
  build: { target: "es2022", chunkSizeWarningLimit: 8000 },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      includeManifestIcons: false,
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,png,svg,ico}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: { "/api": process.env.API_PROXY || "http://localhost:8000" },
  },
});
