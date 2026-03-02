// API 类型定义

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: string;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  status: string;
  languages: string[];
  thumbnailUrl: string;
  videoUrls: string[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  sourceUrl: string;
  platform: string;
}

export interface GenerateConfig {
  productId: string;
  languages: string[];
  style: string;
  duration: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
