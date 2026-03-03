// 亚马逊公开商品页 DOM 选择器
// 覆盖 amazon.com / .co.jp / .de / .fr / .es / .co.uk

export const PUBLIC_SELECTORS = {
  // 商品标题
  title: [
    "#productTitle",
    "h1.a-size-large",
    "span#title",
  ],

  // 商品卖点（bullet points）
  bullets: [
    "#feature-bullets ul li span.a-list-item",
    "#featurebullets_feature_div li span",
    ".a-unordered-list .a-list-item",
  ],

  // 商品描述
  description: [
    "#productDescription p",
    "#aplus_feature_div",
    "#productDescription_feature_div p",
  ],

  // 卖家名（店铺名）
  sellerName: [
    "#sellerProfileTriggerId",
    "#merchant-info a",
    "#bylineInfo",
    ".a-profile-name",
  ],

  // 品牌
  brand: [
    "#bylineInfo",
    "#brand",
    "a#bylineInfo",
    "tr.a-spacing-small td.a-span9 span",
  ],

  // 发货地
  shipsFrom: [
    "#tabular-buybox .tabular-buybox-text",
    "#shipsFromSoldBy_feature_div span.offer-display-feature-text-message",
    ".offer-display-feature-name",
  ],

  // 是否有视频（视频模块存在即视为有视频）
  videoSection: [
    "#videoBlock_feature_div",
    "#dp-container .video-block",
    ".vse-vp-container",
    "#AWSUI-GENERATED-CONTENT video",
  ],

  // ASIN（从 URL 或页面元数据提取）
  asin: [
    "input[name='ASIN']",
    "#ASIN",
  ],

  // 商品图片（用于线索截图）
  mainImage: [
    "#imgTagWrapperId img",
    "#landingImage",
    "#main-image",
  ],

  // 商品分类（面包屑）
  category: [
    "#wayfinding-breadcrumbs_feature_div ul li a",
    ".a-breadcrumb li a",
  ],

  // 卖家评分
  sellerRating: [
    "#seller-info-feature_div .a-color-secondary",
  ],
};

// 从 URL 提取 ASIN
export function extractAsinFromUrl(url: string): string | null {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/);
  return match ? match[1] : null;
}

// 从 URL 提取站点（marketplace）
export function extractMarketplace(url: string): string {
  if (url.includes("amazon.co.jp")) return "JP";
  if (url.includes("amazon.de")) return "DE";
  if (url.includes("amazon.fr")) return "FR";
  if (url.includes("amazon.es")) return "ES";
  if (url.includes("amazon.co.uk")) return "UK";
  return "US";
}

// 通用查询函数：多选择器降级
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
