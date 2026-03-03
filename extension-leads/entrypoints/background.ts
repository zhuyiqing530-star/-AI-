// Background Service Worker
// 职责：点击图标开启侧边栏；接收内容脚本消息并更新角标

export default defineBackground(() => {
  // 点击扩展图标 → 打开侧边栏
  chrome.action.onClicked.addListener((tab) => {
    if (tab.id) chrome.sidePanel.open({ tabId: tab.id });
  });

  // 接收来自内容脚本的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PAGE_ANALYZED") {
      const { opportunityScore, isChinese } = message.payload;

      // 更新角标：机会分高 + 中国卖家 → 显示红色角标
      if (isChinese && opportunityScore >= 60) {
        chrome.action.setBadgeText({
          text: String(opportunityScore),
          tabId: sender.tab?.id,
        });
        chrome.action.setBadgeBackgroundColor({
          color: opportunityScore >= 80 ? "#ef4444" : "#f59e0b",
          tabId: sender.tab?.id,
        });
      } else {
        chrome.action.setBadgeText({ text: "", tabId: sender.tab?.id });
      }

      sendResponse({ ok: true });
    }
    return true;
  });
});
