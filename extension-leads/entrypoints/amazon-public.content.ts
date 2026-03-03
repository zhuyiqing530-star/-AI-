// Content Script：注入亚马逊公开商品页
// 自动提取 Listing 数据，分析是否为中国卖家，计算机会分，发送给侧边栏

import {
  PUBLIC_SELECTORS,
  extractAsinFromUrl,
  extractMarketplace,
  queryField,
  queryAllFields,
} from "../selectors/amazon-public";
import { detectChineseSeller } from "../lib/detector";
import { analyzeListing } from "../lib/analyzer";

// 仅在亚马逊商品详情页运行
export default defineContentScript({
  matches: [
    "https://*.amazon.com/dp/*",
    "https://*.amazon.com/gp/product/*",
    "https://*.amazon.co.jp/dp/*",
    "https://*.amazon.de/dp/*",
    "https://*.amazon.fr/dp/*",
    "https://*.amazon.es/dp/*",
    "https://*.amazon.co.uk/dp/*",
  ],
  runAt: "document_idle",

  main() {
    // 等待页面关键元素加载完成后再分析
    waitForElement(PUBLIC_SELECTORS.title[0], 5000).then(() => {
      analyzeCurrentPage();
    });

    // 监听来自侧边栏的消息（"重新分析"请求）
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === "REQUEST_PAGE_DATA") {
        const data = extractPageData();
        sendResponse({ type: "PAGE_DATA", payload: data });
      }
      return true;
    });
  },
});

function analyzeCurrentPage() {
  const data = extractPageData();
  if (!data) return;

  const detection = detectChineseSeller({
    sellerName: data.sellerName,
    brand: data.brand,
    shipsFrom: data.shipsFrom,
    soldBy: data.soldBy,
  });

  const analysis = analyzeListing({
    title: data.title,
    bullets: data.bullets,
    description: data.description,
    hasVideo: data.hasVideo,
    hasMultiLanguage: false, // 公开页暂不检测多语言
  });

  // 发送分析结果给 background（更新角标）
  chrome.runtime.sendMessage({
    type: "PAGE_ANALYZED",
    payload: {
      opportunityScore: analysis.opportunityScore,
      isChinese: detection.isChinese,
    },
  });

  // 同时广播给侧边栏
  chrome.runtime.sendMessage({
    type: "LISTING_ANALYZED",
    payload: {
      ...data,
      detection,
      analysis,
    },
  });
}

function extractPageData() {
  const asin =
    extractAsinFromUrl(window.location.href) ||
    (queryField(PUBLIC_SELECTORS.asin) as HTMLInputElement)?.value ||
    "";

  const titleEl = queryField(PUBLIC_SELECTORS.title);
  const title = titleEl?.textContent?.trim() || "";

  const bulletEls = queryAllFields(PUBLIC_SELECTORS.bullets);
  const bullets = bulletEls
    .map((el) => el.textContent?.trim() || "")
    .filter((b) => b.length > 5);

  const descEl = queryField(PUBLIC_SELECTORS.description);
  const description = descEl?.textContent?.trim() || "";

  const sellerEl = queryField(PUBLIC_SELECTORS.sellerName);
  const sellerName = sellerEl?.textContent?.trim() || "";

  const brandEl = queryField(PUBLIC_SELECTORS.brand);
  const brand = brandEl?.textContent?.trim().replace(/^Visit the /, "").replace(/ Store$/, "") || "";

  // 发货地：遍历所有候选元素找 "Ships from" 旁边的值
  const shipsFrom = extractShipsFrom();
  const soldBy = extractSoldBy();

  const hasVideo = PUBLIC_SELECTORS.videoSection.some(
    (sel) => document.querySelector(sel) !== null
  );

  const imageEl = queryField(PUBLIC_SELECTORS.mainImage) as HTMLImageElement;
  const imageUrl = imageEl?.src || "";

  const marketplace = extractMarketplace(window.location.href);

  return {
    asin,
    title,
    bullets,
    description,
    sellerName,
    brand,
    shipsFrom,
    soldBy,
    hasVideo,
    imageUrl,
    marketplace,
    productUrl: window.location.href,
  };
}

function extractShipsFrom(): string {
  // 在 tabular buybox 中查找 "Ships from" 行
  const rows = document.querySelectorAll("#tabular-buybox .tabular-buybox-container tr");
  for (const row of Array.from(rows)) {
    const label = row.querySelector(".tabular-buybox-text")?.textContent?.toLowerCase() || "";
    if (label.includes("ships from") || label.includes("发货")) {
      return row.querySelector(".a-color-base")?.textContent?.trim() || "";
    }
  }
  // fallback
  const el = queryField(PUBLIC_SELECTORS.shipsFrom);
  return el?.textContent?.trim() || "";
}

function extractSoldBy(): string {
  const rows = document.querySelectorAll("#tabular-buybox .tabular-buybox-container tr");
  for (const row of Array.from(rows)) {
    const label = row.querySelector(".tabular-buybox-text")?.textContent?.toLowerCase() || "";
    if (label.includes("sold by") || label.includes("卖家")) {
      return row.querySelector(".a-color-base")?.textContent?.trim() || "";
    }
  }
  return "";
}

function waitForElement(selector: string, timeout: number): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}
