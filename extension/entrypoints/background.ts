export default defineBackground(() => {
  // 点击扩展图标时打开side panel
  chrome.action.onClicked.addListener((tab) => {
    if (tab.id) chrome.sidePanel.open({ tabId: tab.id });
  });
});
