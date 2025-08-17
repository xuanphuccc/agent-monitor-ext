import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

// Định nghĩa manifest cho Chrome extension (https://crxjs.dev/)

export default defineManifest({
  manifest_version: 3,
  name: "AI Agent Monitor",
  version: pkg.version,

  permissions: ["storage", "activeTab", "notifications", "scripting"],

  action: {
    default_popup: "index.html",
  },

  background: {
    service_worker: "src/background/background.js",
    type: "module",
  },

  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/content.js"],
    },
  ],
});
