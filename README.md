# AI Listing Optimizer

Chrome Extension + Cloudflare Workers 驱动的 Amazon Listing AI优化工具。

一键读取 Amazon Seller Central 商品listing，通过 DeepSeek V3 API 自动进行SEO优化重写、多语言翻译，并回填至卖家后台。

## 功能

- **一键读取** — 自动抓取当前页面的标题、五点描述、长描述、Search Terms
- **AI智能重写** — 基于 A9/A10 算法规则，DeepSeek 流式输出优化结果
- **多语言翻译** — 支持英/日/德/法/西，本地化适配而非直译
- **一键回填** — 优化后的文案自动填充回 Seller Central 表单
- **关键词建议** — 推荐高转化关键词并嵌入文案

## 技术栈

| 模块 | 技术 |
|------|------|
| 插件框架 | WXT + Chrome Extension Manifest V3 |
| 前端UI | React 19 + TailwindCSS |
| 后端API | Cloudflare Workers + Hono |
| AI模型 | DeepSeek V3.2 API |
| Monorepo | npm workspaces |

## 项目结构

```
cross-border-ai/
├── extension/          # Chrome扩展
│   ├── entrypoints/    # background / content script / sidepanel
│   ├── selectors/      # Amazon DOM选择器配置
│   ├── components/     # React组件
│   └── lib/            # API客户端
├── api/                # Cloudflare Workers后端
│   └── src/
│       ├── routes/     # rewrite / translate / keywords
│       └── services/   # DeepSeek客户端 + Prompt模板
└── shared/             # 共享类型定义
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 DeepSeek API Key

```bash
# api/.dev.vars 文件（本地开发，已在.gitignore中）
DEEPSEEK_API_KEY=your-api-key-here
```

### 3. 启动后端

```bash
cd api
npm run dev
# 默认运行在 http://localhost:8787
```

### 4. 构建扩展

```bash
cd extension
npm run build
```

### 5. 加载扩展

1. 打开 `chrome://extensions`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `extension/.output/chrome-mv3` 目录

### 6. 使用

1. 登录 Amazon Seller Central
2. 进入商品 listing 编辑页
3. 点击扩展图标打开 Side Panel
4. 点击 "Read Listing" → "AI Rewrite" → "Fill Back"

## 支持的站点

- amazon.com (US)
- amazon.co.uk (UK)
- amazon.co.jp (JP)
- amazon.de (DE)
- amazon.fr (FR)
- amazon.es (ES)

## 部署

```bash
# 后端部署到 Cloudflare Workers
cd api
wrangler secret put DEEPSEEK_API_KEY
npm run deploy

# 扩展打包
cd extension
npm run zip
# 上传至 Chrome Web Store
```
