import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  manifestVersion: 3,
  browser: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "YouTube Limiter",
    description: "Limits YouTube and YouTube Shorts watch time with configurable cooldowns.",
    permissions: ["tabs", "storage", "alarms", "webNavigation"],
    host_permissions: ["*://youtube.com/*", "*://www.youtube.com/*", "*://m.youtube.com/*"],
  },
});
