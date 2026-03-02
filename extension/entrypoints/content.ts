import { AMAZON_SELECTORS, queryField, queryAllFields } from '../selectors/amazon';
import type { ListingData, MessageType } from 'shared/types';

export default defineContentScript({
  matches: [
    '*://sellercentral.amazon.com/*',
    '*://sellercentral.amazon.co.jp/*',
    '*://sellercentral.amazon.de/*',
    '*://sellercentral.amazon.fr/*',
    '*://sellercentral.amazon.es/*',
    '*://sellercentral.amazon.co.uk/*',
  ],
  main() {
    chrome.runtime.onMessage.addListener((msg: MessageType, _sender, sendResponse) => {
      if (msg.type === 'READ_LISTING') {
        waitForForm().then((data) => sendResponse({ type: 'LISTING_DATA', data }));
        return true; // async response
      }
      if (msg.type === 'FILL_LISTING') {
        try {
          fillListing(msg.data);
          sendResponse({ type: 'FILL_RESULT', success: true });
        } catch (e: any) {
          sendResponse({ type: 'FILL_RESULT', success: false, error: e.message });
        }
      }
    });
  },
});

/** 等待表单渲染后提取数据 */
function waitForForm(timeout = 5000): Promise<ListingData> {
  return new Promise((resolve) => {
    const tryExtract = () => {
      const title = queryField(AMAZON_SELECTORS.title.selectors);
      if (title) return resolve(extractListing());
      // 表单还没渲染，用MutationObserver等
      const observer = new MutationObserver(() => {
        const t = queryField(AMAZON_SELECTORS.title.selectors);
        if (t) { observer.disconnect(); resolve(extractListing()); }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { observer.disconnect(); resolve(extractListing()); }, timeout);
    };
    tryExtract();
  });
}

function extractListing(): ListingData {
  const titleEl = queryField(AMAZON_SELECTORS.title.selectors);
  const bulletEls = queryAllFields(AMAZON_SELECTORS.bulletPoints.selectors);
  const descEl = queryField(AMAZON_SELECTORS.description.selectors);
  const searchEl = queryField(AMAZON_SELECTORS.searchTerms.selectors);

  return {
    title: titleEl?.value ?? '',
    bulletPoints: bulletEls.map((el) => el.value),
    description: descEl?.value ?? '',
    searchTerms: searchEl?.value ?? '',
  };
}

/** React受控输入的正确写入方式 */
function setInputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function fillListing(data: ListingData) {
  const titleEl = queryField(AMAZON_SELECTORS.title.selectors);
  if (titleEl) setInputValue(titleEl, data.title);

  const bulletEls = queryAllFields(AMAZON_SELECTORS.bulletPoints.selectors);
  data.bulletPoints.forEach((bp, i) => {
    if (bulletEls[i]) setInputValue(bulletEls[i], bp);
  });

  const descEl = queryField(AMAZON_SELECTORS.description.selectors);
  if (descEl) setInputValue(descEl, data.description);

  const searchEl = queryField(AMAZON_SELECTORS.searchTerms.selectors);
  if (searchEl) setInputValue(searchEl, data.searchTerms);
}
