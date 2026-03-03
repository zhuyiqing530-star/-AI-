import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "VideoLingo 引流助手",
    description: "自动识别亚马逊中国卖家线索，实时分析 Listing 质量，AI 辅助流量优化",
    version: "0.1.0",
    permissions: [
      "sidePanel",
      "storage",
      "activeTab",
      "scripting",
      "badges"
    ],
    host_permissions: [
      "https://*.amazon.com/*",
      "https://*.amazon.co.jp/*",
      "https://*.amazon.de/*",
      "https://*.amazon.fr/*",
      "https://*.amazon.es/*",
      "https://*.amazon.co.uk/*",
      "https://sellercentral.amazon.com/*",
      "https://sellercentral.amazon.co.jp/*",
      "https://sellercentral.amazon.de/*",
      "https://sellercentral.amazon.fr/*",
      "https://sellercentral.amazon.es/*",
      "https://sellercentral.amazon.co.uk/*"
    ],
    side_panel: {
      default_path: "sidepanel/index.html"
    },
    action: {
      default_title: "VideoLingo 引流助手"
    }
  }
});
