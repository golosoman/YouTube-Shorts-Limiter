import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  manifestVersion: 3,
  browser: "chrome",
  manifest: {
    name: "YouTube Shorts Limiter",
    description: "Limits YouTube Shorts watch time while leaving ordinary YouTube available.",
    permissions: ["tabs", "storage", "alarms", "webNavigation"],
    host_permissions: ["*://youtube.com/*", "*://www.youtube.com/*", "*://m.youtube.com/*"],
  },
});
