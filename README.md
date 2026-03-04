# Cross-Border AI — 跨境电商 AI 工具套件

一款面向 Amazon 卖家的 AI 驱动 Listing 优化工具，集成 Chrome 浏览器扩展 + Cloudflare Workers 后端，提供 **一键读取、AI 重写、多语言翻译、智能回填** 等核心功能，帮助卖家快速提升 Listing 搜索排名与转化率。

## 功能特性

- **一键读取** — 自动从 Amazon Seller Central 页面提取 Title、Bullet Points、Description、Search Terms
- **AI 智能重写** — 基于 DeepSeek 大模型，按照 A9/A10 搜索算法规则优化 Listing 文案
- **多语言翻译** — 支持英语、日语、德语、法语、西班牙语，自动适配目标市场的本地化表达习惯
- **智能回填** — 优化结果一键回填到 Amazon 卖家后台表单，兼容 React 受控输入
- **关键词建议** — AI 分析商品标题和类目，推荐高转化主关键词和长尾词
- **AI 视频生成** — 集成可灵 (Kling) AI，支持文生视频 / 图生视频，自动生成商品展示视频
- **多站点支持** — 覆盖 Amazon US、UK、JP、DE、FR、ES 六大站点
- **SSE 流式输出** — AI 结果实时流式显示，无需等待完整响应
- **JWT 认证** — 完整的用户注册/登录系统，HMAC-SHA256 签名，零第三方依赖

## 技术架构

```
┌──────────────────────────────────────────────────────────┐
│                   Chrome Extension (WXT)                 │
│              React 19 + Tailwind CSS + SidePanel         │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Content  │  │ SidePanel│  │Background│  │   API    │  │
│  │ Script   │  │  (React) │  │  Script  │  │  Client  │  │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └────┬─────┘  │
│       │ 读取/回填    │ UI 交互                    │ HTTP   │
└───────┼──────────────┼────────────────────────────┼───────┘
        │              │                            │
  Amazon Seller        │                            │ SSE Stream
  Central 页面          │                            │
                       └────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   Cloudflare Workers (Hono)   │
                    │        localhost:8787          │
                    │                               │
                    │  /api/listing/rewrite          │
                    │  /api/listing/translate        │
                    │  /api/keywords/suggest         │
                    │  /api/auth/register | login    │
                    │  /api/user/profile             │
                    │  /api/products                 │
                    │  /api/videos/generate | :id    │
                    └───────┬───────────┬───────────┘
                            │           │
                            ▼           ▼
                     ┌──────────┐ ┌──────────┐
                     │ DeepSeek │ │ Kling AI │
                     │   API    │ │   API    │
                     └──────────┘ └──────────┘
```

## 项目结构

```
cross-border-ai/
├── api/                          # 后端 — Cloudflare Workers
│   ├── src/
│   │   ├── index.ts              # 应用入口，路由注册
│   │   ├── routes/
│   │   │   ├── listing.ts        # AI Listing 重写 (SSE)
│   │   │   ├── translate.ts      # 多语言翻译 (SSE)
│   │   │   ├── keywords.ts       # 关键词建议 (SSE)
│   │   │   ├── auth.ts           # 注册 / 登录
│   │   │   ├── user.ts           # 用户信息
│   │   │   ├── products.ts       # 商品管理
│   │   │   └── videos.ts         # AI 视频生成 (可灵)
│   │   ├── services/
│   │   │   ├── deepseek.ts       # DeepSeek API 客户端
│   │   │   ├── prompts.ts        # 各站点 SEO Prompt 模板
│   │   │   └── kling.ts          # 可灵 OmniVideo API 客户端
│   │   └── middleware/
│   │       └── auth.ts           # JWT 签发/验证/中间件
│   ├── wrangler.toml             # Wrangler 配置
│   └── package.json
├── extension/                    # 前端 — Chrome 浏览器扩展
│   ├── entrypoints/
│   │   ├── background.ts         # Service Worker，处理图标点击
│   │   ├── content.ts            # Content Script，读取/回填 Amazon 表单
│   │   └── sidepanel/
│   │       ├── App.tsx           # 主界面组件
│   │       ├── main.tsx          # React 入口
│   │       ├── index.html        # SidePanel HTML
│   │       └── style.css         # Tailwind 样式
│   ├── lib/
│   │   └── api.ts                # API 请求 + SSE 流消费
│   ├── selectors/
│   │   └── amazon.ts             # Amazon 页面 DOM 选择器
│   ├── wxt.config.ts             # WXT 框架配置
│   └── package.json
├── shared/                       # 共享类型定义
│   └── types.ts                  # ListingData, RewriteRequest 等
└── package.json                  # Monorepo Workspaces 配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- Chrome 浏览器（用于加载扩展）

### 1. 安装依赖

```bash
git clone https://github.com/zhuyiqing530-star/-AI-.git
cd cross-border-ai
npm install
```

### 2. 配置环境变量

在 `api/` 目录下创建 `.dev.vars` 文件：

```ini
DEEPSEEK_API_KEY=your_deepseek_api_key
JWT_SECRET=your_jwt_secret
KLING_ACCESS_KEY=your_kling_access_key
KLING_SECRET_KEY=your_kling_secret_key
```

| 变量 | 说明 | 获取方式 |
|------|------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | [platform.deepseek.com](https://platform.deepseek.com) |
| `JWT_SECRET` | JWT 签名密钥 | 自定义任意字符串 |
| `KLING_ACCESS_KEY` | 可灵 AI AccessKey | [klingai.com](https://app.klingai.com) |
| `KLING_SECRET_KEY` | 可灵 AI SecretKey | [klingai.com](https://app.klingai.com) |

### 3. 启动后端

```bash
cd api
npm run dev
```

后端将在 `http://localhost:8787` 启动。

### 4. 启动扩展开发模式

```bash
cd extension
npm run dev
```

### 5. 加载扩展到 Chrome

1. 打开 Chrome，访问 `chrome://extensions`
2. 开启右上角「开发者模式」
3. 点击「加载已解包的扩展程序」
4. 选择 `extension/.output/chrome-mv3` 目录

### 6. 开始使用

1. 打开 [Amazon Seller Central](https://sellercentral.amazon.com) 并进入商品编辑页面
2. 点击浏览器工具栏中的扩展图标，打开侧边栏
3. 点击 **Read Listing** 读取当前页面的 Listing 数据
4. 选择目标市场和语言
5. 点击 **AI Rewrite** 进行智能优化，或点击 **Translate** 翻译
6. 点击 **Fill Back** 将优化结果回填到页面

## API 接口文档

### Listing 优化

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/listing/rewrite` | AI 重写 Listing | 否 |
| POST | `/api/listing/translate` | 翻译 Listing | 否 |
| POST | `/api/keywords/suggest` | 关键词建议 | 否 |

**请求体示例（重写/翻译）：**

```json
{
  "listing": {
    "title": "商品标题",
    "bulletPoints": ["卖点1", "卖点2", "卖点3", "卖点4", "卖点5"],
    "description": "商品描述",
    "searchTerms": "搜索关键词"
  },
  "marketplace": "US",
  "language": "en"
}
```

**响应格式：** SSE 流（`text/event-stream`），实时返回 AI 生成内容。

### 用户认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/user/profile` | 获取用户信息（需认证） |

### AI 视频生成

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/videos/generate` | 创建视频生成任务 | 是 |
| GET | `/api/videos/:id/status` | 查询生成状态 | 是 |
| GET | `/api/videos/:id` | 获取视频详情 | 是 |
| GET | `/api/videos` | 视频列表 | 是 |

## 支持的站点与语言

| 站点 | 代码 | 优化规则 |
|------|------|----------|
| Amazon US | `US` | 标题 200 字符上限，前 80 字符前置核心关键词 |
| Amazon UK | `UK` | 英式英语拼写，符合英国市场习惯 |
| Amazon JP | `JP` | 日语关键词规范，含片假名变体 |
| Amazon DE | `DE` | 德语复合名词关键词，正式语气 |
| Amazon FR | `FR` | 法语关键词规范，优雅表达 |
| Amazon ES | `ES` | 西班牙语关键词，亲切语气 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | [WXT](https://wxt.dev) (Chrome Extension) |
| UI 框架 | React 19 + Tailwind CSS 3 |
| 后端框架 | [Hono](https://hono.dev) (Cloudflare Workers) |
| 运行时 | Cloudflare Workers |
| AI 模型 | DeepSeek Chat |
| 视频生成 | 可灵 OmniVideo (kling-video-o1) |
| 认证 | HMAC-SHA256 JWT（原生 crypto.subtle） |
| 包管理 | npm Workspaces (Monorepo) |
| 语言 | TypeScript 5.7 |

## 部署

### 部署后端到 Cloudflare Workers

```bash
cd api
npx wrangler deploy
```

部署前需在 Cloudflare Dashboard 配置 Secrets：`DEEPSEEK_API_KEY`、`JWT_SECRET`、`KLING_ACCESS_KEY`、`KLING_SECRET_KEY`。

### 打包扩展

```bash
cd extension
npm run build    # 构建生产版本
npm run zip      # 打包为 .zip（用于上传 Chrome Web Store）
```

发布前需将 `extension/lib/api.ts` 中的 `API_BASE` 修改为线上 Workers 域名。

## License

MIT
