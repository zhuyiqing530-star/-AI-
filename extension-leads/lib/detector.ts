// 中国卖家信号检测模块

export interface DetectionResult {
  isChinese: boolean;
  confidence: number; // 0-100
  signals: string[];  // 命中的信号列表
}

// 中国城市拼音关键词（常见跨境卖家城市）
const CHINESE_CITY_PINYIN = [
  "shenzhen", "guangzhou", "yiwu", "hangzhou", "wenzhou",
  "ningbo", "dongguan", "foshan", "zhongshan", "fujian",
  "zhejiang", "guangdong", "shanghai", "beijing", "chengdu",
  "suzhou", "quanzhou", "xiamen", "nanjing", "tianjin",
];

// 中国卖家店铺名常见关键词
const CHINESE_SELLER_KEYWORDS = [
  "co.,ltd", "co., ltd", "trading", "tech", "international",
  "industries", "enterprise", "manufacture", "factory",
  "direct", "official store", "flagship",
];

// 包含中文字符的正则
const CHINESE_CHAR_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf]/;

export function detectChineseSeller(data: {
  sellerName: string;
  brand: string;
  shipsFrom: string;
  soldBy: string;
}): DetectionResult {
  const signals: string[] = [];
  let score = 0;

  const sellerLower = data.sellerName.toLowerCase();
  const brandLower = data.brand.toLowerCase();
  const shipsLower = data.shipsFrom.toLowerCase();
  const soldLower = data.soldBy.toLowerCase();

  // 信号1：发货地含 China/CN（权重最高）
  if (shipsLower.includes("china") || shipsLower.includes(" cn ") || shipsLower === "cn") {
    signals.push("发货地：中国");
    score += 50;
  }

  // 信号2：品牌名或卖家名含中文字符
  if (CHINESE_CHAR_REGEX.test(data.sellerName) || CHINESE_CHAR_REGEX.test(data.brand)) {
    signals.push("含中文字符");
    score += 40;
  }

  // 信号3：卖家名含中国城市拼音
  const cityHit = CHINESE_CITY_PINYIN.find(
    (city) => sellerLower.includes(city) || soldLower.includes(city)
  );
  if (cityHit) {
    signals.push(`城市关键词：${cityHit}`);
    score += 30;
  }

  // 信号4：卖家名含典型中国外贸企业词
  const keywordHit = CHINESE_SELLER_KEYWORDS.find(
    (kw) => sellerLower.includes(kw)
  );
  if (keywordHit) {
    signals.push(`外贸企业词：${keywordHit}`);
    score += 20;
  }

  // 信号5：Sold by 与 Ships from 不一致（FBA 发货，但货源在中国）
  if (
    shipsLower.includes("amazon") &&
    (soldLower.includes("china") || cityHit)
  ) {
    signals.push("FBA发货但卖家在中国");
    score += 15;
  }

  const confidence = Math.min(score, 100);
  return {
    isChinese: confidence >= 30,
    confidence,
    signals,
  };
}
