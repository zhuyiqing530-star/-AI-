/** Amazon Seller Central DOM选择器配置
 *  高频更新文件 — Amazon改版时只需改这里 */

export const AMAZON_SELECTORS = {
  /** 页面检测 */
  urlPattern: /sellercentral\.amazon\.(com|co\.jp|de|fr|es|co\.uk)\/.*(listing\/edit|abis\/listing)/,

  title: {
    selectors: [
      '[data-test-id="title-input"] input',
      '[name="item_name"]',
      '#productTitle input',
      'input[aria-label*="Title"]',
    ],
    maxLength: 200,
  },

  bulletPoints: {
    selectors: [
      '[data-test-id="bullet-point-input"] textarea',
      '[name^="bullet_point"]',
      'textarea[aria-label*="Key Product Feature"]',
    ],
    maxCount: 5,
    maxLength: 500,
  },

  description: {
    selectors: [
      '[data-test-id="description-input"] textarea',
      '[name="product_description"]',
      'textarea[aria-label*="Description"]',
    ],
    maxLength: 2000,
  },

  searchTerms: {
    selectors: [
      '[data-test-id="search-terms-input"] input',
      '[name="generic_keyword"]',
      'input[aria-label*="Search Terms"]',
    ],
    maxLength: 250,
  },
} as const;

/** 多层回退查找元素 */
export function queryField(selectors: readonly string[]): HTMLInputElement | HTMLTextAreaElement | null {
  for (const sel of selectors) {
    const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(sel);
    if (el) return el;
  }
  return null;
}

/** 查找所有匹配的元素（用于bullet points） */
export function queryAllFields(selectors: readonly string[]): (HTMLInputElement | HTMLTextAreaElement)[] {
  for (const sel of selectors) {
    const els = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(sel);
    if (els.length > 0) return Array.from(els);
  }
  return [];
}
