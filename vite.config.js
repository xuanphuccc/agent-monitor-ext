import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config.js";
import zip from "vite-plugin-zip-pack";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    // Plugin xử lý manifest và packaging extension
    // crx plugin sẽ tự động xử lý manifest và các file cần thiết
    // để tạo Chrome extension (https://crxjs.dev/).
    crx({
      manifest,
    }),
    zip({ outDir: "release", outFileName: "release.zip" }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
