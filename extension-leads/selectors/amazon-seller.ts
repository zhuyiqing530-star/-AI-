// 亚马逊 Seller Central 表单选择器（复用现有 extension 的模式）

export const SELLER_CENTRAL_URL_PATTERN =
  /sellercentral\.amazon\.(com|co\.jp|de|fr|es|co\.uk)\/.*(listing\/edit|abis\/listing|inventory)/;

export const SELLER_SELECTORS = {
  title: [
    "#attribute-title",
    "input[name='title']",
    "[data-test-id='title-input']",
    "input[aria-label='Product name']",
  ],

  bulletPoints: [
    "input[name*='bullet_point']",
    "[data-test-id*='bullet-point']",
    "input[id*='bullet']",
    "textarea[name*='bullet']",
  ],

  description: [
    "textarea[name='description']",
    "[data-test-id='description-textarea']",
    "#description",
    "textarea[aria-label*='description']",
  ],

  searchTerms: [
    "input[name='generic_keyword']",
    "[data-test-id='search-terms']",
    "input[aria-label*='Search terms']",
    "#generic_keyword",
  ],
};

// 判断当前页面是否是 Seller Central 的 Listing 编辑页
export function isListingEditPage(): boolean {
  return SELLER_CENTRAL_URL_PATTERN.test(window.location.href);
}

// React 受控输入的回填方法（触发 React 的 onChange 事件）
export function setReactInputValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set || Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;

  nativeInputValueSetter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

export function queryField(selectors: string[]): Element | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export function queryAllFields(selectors: string[]): Element[] {
  for (const sel of selectors) {
    const els = Array.from(document.querySelectorAll(sel));
    if (els.length > 0) return els;
  }
  return [];
}
