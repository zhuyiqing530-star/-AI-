// API 请求工具函数

import type { ApiResponse, GenerateConfig, Product, User, Video } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// 通用请求封装
async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (json.code !== 0) {
    throw new Error(json.message || '请求失败');
  }

  return json.data;
}

// 登录
export const login = (email: string, password: string) =>
  fetchApi<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

// 注册
export const register = (name: string, email: string, password: string) =>
  fetchApi<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

// 获取用户信息
export const getProfile = () => fetchApi<User>('/user/profile');

// 上传商品
export const uploadProduct = (product: Partial<Product>) =>
  fetchApi<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });

// 生成视频
export const generateVideo = (config: GenerateConfig) =>
  fetchApi<Video>('/videos/generate', {
    method: 'POST',
    body: JSON.stringify(config),
  });

// 获取视频列表
export const getVideoList = () => fetchApi<Video[]>('/videos');

// 获取视频详情
export const getVideoDetail = (id: string) => fetchApi<Video>(`/videos/${id}`);
