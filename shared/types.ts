/** Listing数据结构 — 从Amazon Seller Central提取 */
export interface ListingData {
  title: string;
  bulletPoints: string[];
  description: string;
  searchTerms: string;
}

/** 重写请求 */
export interface RewriteRequest {
  listing: ListingData;
  marketplace: Marketplace;
  language: Language;
}

/** 重写响应（流式完成后的最终结构） */
export interface RewriteResponse {
  listing: ListingData;
  changes: { field: string; reason: string }[];
}

/** 关键词建议响应 */
export interface KeywordResponse {
  keywords: string[];
  longTail: string[];
}

export type Marketplace = 'US' | 'JP' | 'DE' | 'FR' | 'ES' | 'UK';
export type Language = 'en' | 'ja' | 'de' | 'fr' | 'es';

/** Chrome消息类型 */
export type MessageType =
  | { type: 'READ_LISTING' }
  | { type: 'LISTING_DATA'; data: ListingData }
  | { type: 'FILL_LISTING'; data: ListingData }
  | { type: 'FILL_RESULT'; success: boolean; error?: string };
