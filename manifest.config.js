import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

// Định nghĩa manifest cho Chrome extension (https://crxjs.dev/)
// Link thiết kế logo tại: https://www.figma.com/design/LQZ71h1fXXcDEcVlK8aO4V/AI-Agent-Monitor?node-id=0-1&t=ycQcWMXFNgaz2nsU-1

export default defineManifest({
  manifest_version: 3,
  name: "AI Agent Monitor",
  version: pkg.version,

  permissions: ["storage", "activeTab", "notifications", "scripting", "alarms"],

  action: {
    default_popup: "index.html",
    default_icon: "public/logo-32.png",
    default_title: "AI Agent Monitor (Nhấn Ctrl + B để mở)",
  },

  icons: {
    16: "public/logo-16.png",
    32: "public/logo-32.png",
    48: "public/logo-48.png",
    128: "public/logo-128.png",
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

  // Cho phép extension truy cập vào tất cả các URL
  host_permissions: ["<all_urls>"],
});
