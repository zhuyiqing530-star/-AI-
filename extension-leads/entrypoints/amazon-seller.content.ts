// Content Script：注入亚马逊 Seller Central
// 职责：读取 Listing 表单数据（供 Tab3 流量优化使用）；将优化内容回填表单

import {
  SELLER_CENTRAL_URL_PATTERN,
  SELLER_SELECTORS,
  setReactInputValue,
  queryField,
  queryAllFields,
} from "../selectors/amazon-seller";

export default defineContentScript({
  matches: [
    "https://sellercentral.amazon.com/*",
    "https://sellercentral.amazon.co.jp/*",
    "https://sellercentral.amazon.de/*",
    "https://sellercentral.amazon.fr/*",
    "https://sellercentral.amazon.es/*",
    "https://sellercentral.amazon.co.uk/*",
  ],
  runAt: "document_idle",

  main() {
    // 仅在 Listing 编辑页激活
    if (!SELLER_CENTRAL_URL_PATTERN.test(window.location.href)) return;

    // 等待表单出现
    waitForForm(() => {
      // 通知侧边栏：当前在 Seller Central 编辑页
      chrome.runtime.sendMessage({
        type: "SELLER_CENTRAL_DETECTED",
        payload: { url: window.location.href },
      });
    });

    // 监听来自侧边栏的消息
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === "READ_SELLER_LISTING") {
        sendResponse({ type: "SELLER_LISTING_DATA", payload: extractListing() });
      }

      if (message.type === "FILL_SELLER_LISTING") {
        fillListing(message.payload);
        sendResponse({ ok: true });
      }
      return true;
    });
  },
});

function extractListing() {
  const titleEl = queryField(SELLER_SELECTORS.title) as HTMLInputElement;
  const title = titleEl?.value || titleEl?.textContent?.trim() || "";

  const bulletEls = queryAllFields(SELLER_SELECTORS.bulletPoints) as HTMLInputElement[];
  const bulletPoints = bulletEls.map((el) => el.value || el.textContent?.trim() || "").filter(Boolean);

  const descEl = queryField(SELLER_SELECTORS.description) as HTMLTextAreaElement;
  const description = descEl?.value || "";

  const searchEl = queryField(SELLER_SELECTORS.searchTerms) as HTMLInputElement;
  const searchTerms = searchEl?.value || "";

  return { title, bulletPoints, description, searchTerms };
}

function fillListing(data: {
  title?: string;
  bulletPoints?: string[];
  description?: string;
  searchTerms?: string;
}) {
  if (data.title) {
    const el = queryField(SELLER_SELECTORS.title) as HTMLInputElement;
    if (el) setReactInputValue(el, data.title);
  }

  if (data.bulletPoints?.length) {
    const els = queryAllFields(SELLER_SELECTORS.bulletPoints) as HTMLInputElement[];
    data.bulletPoints.forEach((text, i) => {
      if (els[i]) setReactInputValue(els[i], text);
    });
  }

  if (data.description) {
    const el = queryField(SELLER_SELECTORS.description) as HTMLTextAreaElement;
    if (el) setReactInputValue(el, data.description);
  }

  if (data.searchTerms) {
    const el = queryField(SELLER_SELECTORS.searchTerms) as HTMLInputElement;
    if (el) setReactInputValue(el, data.searchTerms);
  }
}

function waitForForm(onReady: () => void) {
  const check = () => queryField(SELLER_SELECTORS.title);
  if (check()) { onReady(); return; }

  const observer = new MutationObserver(() => {
    if (check()) {
      observer.disconnect();
      onReady();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 5000);
}
