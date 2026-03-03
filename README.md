# VideoLingo × AI Listing Optimizer

> 跨境电商 AI 全栈产品：智能视频生成 + Amazon Listing 优化 + Chrome 扩展

[![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-orange)](https://workers.cloudflare.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black)](https://nextjs.org)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek%20V3-blue)](https://www.deepseek.com)

---

## 产品简介

由三人团队构建的跨境电商 AI 工具平台，整合了两套独立开发的系统：

- **Member A (后端)**：`cross-border-ai` — Cloudflare Workers + DeepSeek，提供 AI Listing 优化 API 和 Chrome 扩展
- **Member B (前端)**：`VideoLingo frontend` — Next.js 全栈前端，支持多语言商品视频生成、AI文案优化和商家工作台

---

## 功能模块

### Web 前端（`/frontend`）
| 功能 | 说明 |
|------|------|
| **用户系统** | 注册/登录（JWT 无状态认证），支持持久化登录 |
| **AI 文案优化** | DeepSeek 驱动的 Listing 改写、翻译、关键词建议（SSE 流式输出） |
| **视频生成** | 商品多语言视频一键生成（可灵 API，当前为 mock 阶段） |
| **工作台** | 视频/商品管理 Dashboard |

### API 后端（`/api`）
| 路由 | 说明 |
|------|------|
| `POST /api/auth/register` | 注册，返回 JWT + 用户信息 |
| `POST /api/auth/login` | 登录，返回 JWT + 用户信息 |
| `GET /api/user/profile` | 获取当前用户信息（需 Bearer Token） |
| `POST /api/products` | 创建商品（需 Bearer Token） |
| `GET /api/videos` | 视频列表（需 Bearer Token） |
| `POST /api/videos/generate` | 触发视频生成（需 Bearer Token） |
| `POST /api/listing/rewrite` | AI 改写 Listing（SSE 流式） |
| `POST /api/listing/translate` | AI 翻译适配（SSE 流式） |
| `POST /api/keywords/suggest` | 关键词建议（SSE 流式） |

### Chrome 扩展（`/extension`）
- 一键读取 Amazon Seller Central 页面 Listing
- DeepSeek AI 改写/翻译，结果一键回填表单

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16.1.6 + React 19 + TailwindCSS v4 |
| 后端框架 | Hono + Cloudflare Workers (Edge Runtime) |
| AI 模型 | DeepSeek V3 API（SSE 流式输出） |
| 认证方案 | HMAC-SHA256 JWT（Workers 原生 `crypto.subtle`，零依赖） |
| 扩展框架 | WXT + Chrome Extension Manifest V3 |
| 共享类型 | npm workspaces monorepo（`/shared`） |

---

## 项目结构

```
├── api/                        # Cloudflare Workers 后端
│   └── src/
│       ├── index.ts            # Hono 入口，路由注册
│       ├── middleware/
│       │   └── auth.ts         # JWT sign/verify/middleware
│       ├── routes/
│       │   ├── auth.ts         # 注册/登录
│       │   ├── user.ts         # 用户 profile
│       │   ├── products.ts     # 商品接口
│       │   ├── videos.ts       # 视频接口（mock）
│       │   ├── listing.ts      # Listing AI 改写/翻译
│       │   └── keywords.ts     # 关键词建议
│       └── services/
│           ├── deepseek.ts     # DeepSeek SSE 客户端
│           └── prompts.ts      # Amazon 站点 Prompt 模板
├── extension/                  # Chrome 扩展
│   ├── entrypoints/            # background / sidepanel
│   ├── selectors/              # Amazon DOM 选择器配置
│   └── components/             # React 组件
├── shared/                     # 共享 TypeScript 类型定义
├── frontend/                   # Next.js Web 前端
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # 首页 Landing
│       │   ├── login/          # 登录页
│       │   ├── register/       # 注册页
│       │   ├── listing/        # AI 文案优化页（SSE 流式）
│       │   ├── dashboard/      # 工作台
│       │   ├── upload/         # 视频生成
│       │   └── ...
│       ├── contexts/
│       │   ├── AuthContext.tsx  # 登录状态管理（localStorage）
│       │   └── VideoContext.tsx # 视频状态管理
│       └── lib/
│           ├── api.ts          # API 请求封装
│           └── types.ts        # 前端类型定义
└── README.md
```

---

## 快速启动

### 前置要求
- Node.js 20+
- Wrangler CLI（`npm install -g wrangler`）
- DeepSeek API Key（[申请地址](https://platform.deepseek.com)）

---

### 1. 启动后端 API

```bash
cd api

# 配置本地环境变量（首次需创建）
# 新建 api/.dev.vars 文件，内容：
# DEEPSEEK_API_KEY=your-deepseek-key-here
# JWT_SECRET=your-random-secret-here

npm install
npm run dev
# ✅ 监听 http://localhost:8787
```

### 2. 启动前端

```bash
cd frontend

# 配置本地环境变量（首次需创建）
# 新建 frontend/.env.local 文件，内容：
# NEXT_PUBLIC_API_URL=http://localhost:8787/api

npm install
npm run dev
# ✅ 监听 http://localhost:3000
```

### 3. 加载 Chrome 扩展（可选）

```bash
cd extension
npm install
npm run build
# 打开 chrome://extensions → 开发者模式 → 加载已解压 → 选 extension/.output/chrome-mv3
```

---

## 使用流程

### Web 端

1. 访问 `http://localhost:3000`
2. 点击「注册」→ 填写昵称/邮箱/密码（≥8位）→ 自动登录跳转工作台
3. 点击顶部导航「AI文案」→ 填写商品信息 → 选择模式 → 点击执行，实时查看 AI 输出
4. 点击「生成视频」→ 上传素材配置 → 生成多语言商品视频

### Chrome 扩展端

1. 打开 Amazon Seller Central 商品 Listing 编辑页
2. 点击扩展图标，打开侧边面板
3. 点击「Read Listing」自动读取当前页面数据
4. 点击「AI Rewrite」/「Translate」进行 AI 优化
5. 点击「Fill Back」将优化结果回填到表单

---

## 认证说明

当前为 **Demo 模式**：
- 任意邮箱 + 任意≥8位密码可注册/登录
- 用户信息自包含于 JWT Token（7天有效期），无需数据库
- 刷新页面仍保持登录（Token 存储于 localStorage）

> 生产部署时替换为数据库校验即可，JWT 签名逻辑无需改动

---

## 支持的 Amazon 站点

| 站点 | 代码 | 语言 |
|------|------|------|
| amazon.com | US | English |
| amazon.co.uk | UK | English |
| amazon.co.jp | JP | 日本語 |
| amazon.de | DE | Deutsch |
| amazon.fr | FR | Français |
| amazon.es | ES | Español |

---

## 部署

### 后端 → Cloudflare Workers

```bash
cd api
wrangler secret put DEEPSEEK_API_KEY   # 输入你的 key
wrangler secret put JWT_SECRET          # 输入随机字符串
npm run deploy
```

### 前端 → Vercel

```bash
cd frontend
# 在 Vercel 控制台设置环境变量：
# NEXT_PUBLIC_API_URL=https://your-worker.your-subdomain.workers.dev/api
vercel --prod
```

---

## 路线图

- [x] Chrome 扩展 + DeepSeek Listing 优化（A）
- [x] Next.js 前端框架 + 视频生成 UI（B）
- [x] 前后端整合：JWT 认证、AI文案页、API 连通
- [ ] 可灵 API 视频生成接入（`api/src/routes/videos.ts`）
- [ ] Cloudflare KV 持久化用户/商品数据
- [ ] Chrome 扩展与 Web 端账户系统打通

---

## Team

三人跨境电商 AI 创业团队，2026年初孵化
