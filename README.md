# VideoLingo 跨境电商 AI 工具套件 — Market 仓库

> **仓库定位**：本仓库由成员 C（运营增长）维护，包含**引流 Chrome 插件**和**运营文档**两大部分，是主项目仓库的配套资产。

---

## 目录结构

```
Market/
├── extension-leads/          # Chrome 插件：VideoLingo 引流助手
│   ├── entrypoints/          # 插件入口文件
│   │   ├── amazon-public.content.ts   # 注入亚马逊商品页
│   │   ├── amazon-seller.content.ts   # 注入 Seller Central
│   │   ├── background.ts              # 后台脚本
│   │   └── sidepanel/                 # 侧边栏 UI（React）
│   ├── lib/                  # 核心逻辑模块
│   │   ├── analyzer.ts       # Listing 质量评分
│   │   ├── detector.ts       # 中国卖家信号检测
│   │   ├── storage.ts        # 线索数据库（chrome.storage）
│   │   ├── templates.ts      # 触达话术模板
│   │   └── api.ts            # 后端 API 对接（AI 改写）
│   ├── selectors/            # Amazon 各页面 DOM 选择器
│   └── wxt.config.ts         # WXT 插件配置
│
├── docs/
│   └── growth/               # 运营增长文档
│       ├── 01_市场调研报告_目标客户画像.md
│       ├── 02_客户访谈模板.md
│       ├── 03_竞品分析_定价策略.md
│       ├── 04_种子用户获取_社群运营计划.md
│       └── 05_内容营销_增长策略方案.md
│
├── PROJECT_STATUS.md         # 整体项目进度报告（含两款产品详情）
└── TEAM_WORK_PLAN.md         # 12 周团队冲刺计划 & 协作规范
```

---

## 产品一：VideoLingo 引流助手（Chrome 插件）

### 这是什么？

一款 Chrome 侧边栏扩展，帮助运营团队**在浏览亚马逊时自动发现潜在客户线索**，并生成个性化触达话术。

### 核心功能

#### Tab 1 — 当前页面分析
打开任意亚马逊商品详情页，插件自动：

1. **识别卖家身份** — 通过发货地、品牌名、店铺名等多个信号判断是否为中国卖家（置信度评分）
2. **评估 Listing 质量** — 从 5 个维度打分（满分 100 分）：

   | 维度 | 满分 | 评估标准 |
   |------|------|---------|
   | 标题完整性 | 20 | ≥150字得满分 |
   | 卖点数量 | 20 | 5条得满分 |
   | 视频内容 | 20 | 有商品视频得满分 |
   | 多语言覆盖 | 20 | 有多语言版本得满分 |
   | 描述完整性 | 20 | ≥500字得满分 |

3. **计算机会分** = `100 - 质量分`，分越高说明该卖家越有优化需求，是越好的潜在客户
4. **一键生成触达话术** — 根据识别出的缺口，自动匹配：
   - 模板 A（缺视频）：强调视频提升转化率 40%
   - 模板 B（缺多语言）：强调日本/德国站蓝海市场
   - 模板 C（综合优化）：全面优化方案
   - 邮件版：正式商务邮件格式

#### Tab 2 — 线索库（CRM）
- 将分析好的卖家**一键保存**到本地线索库
- 支持状态管理：待触达 → 已联系 → 跟进中 → 已转化
- 搜索过滤（按卖家名/ASIN/商品名）
- **一键导出 CSV**，导入到飞书/Excel 进行后续管理

#### Tab 3 — 流量优化（Seller Central 模式）
进入 Amazon Seller Central Listing 编辑页后自动激活：
- **读取表单**：抓取当前 Listing 的标题、卖点、描述、搜索词
- **AI 改写**：调用后端 DeepSeek API，按目标市场（US/JP/DE/FR/ES/UK）和目标语言流式改写
- **关键词建议**：生成 SEO 关键词推荐
- **一键回填**：将 AI 优化结果自动填回 Amazon 表单

### 支持的站点
`amazon.com`（美国）/ `amazon.co.jp`（日本）/ `amazon.de`（德国）/ `amazon.fr`（法国）/ `amazon.es`（西班牙）/ `amazon.co.uk`（英国）+ 对应的 Seller Central

---

## 快速开始（开发环境）

### 环境要求
- Node.js ≥ 18
- npm 或 pnpm

### 安装与启动

```bash
cd extension-leads

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 打包成 .zip（用于 Chrome 商店提交）
npm run zip
```

### 加载到 Chrome
1. 运行 `npm run dev` 或 `npm run build`
2. 打开 Chrome → 地址栏输入 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `extension-leads/.output/chrome-mv3/` 目录

### 配置后端（AI 改写功能需要）
AI 改写功能依赖配套的 Cloudflare Workers 后端（详见主仓库 `api/` 目录）。
默认请求地址：`http://localhost:8787`

---

## 技术栈

| 技术 | 说明 |
|------|------|
| [WXT](https://wxt.dev/) | 现代 Chrome 扩展开发框架 |
| React 19 | 侧边栏 UI |
| TypeScript 5 | 全量类型安全 |
| TailwindCSS 4 | 样式 |
| chrome.storage.local | 线索数据本地持久化 |
| SSE（Server-Sent Events） | AI 流式输出 |

---

## 运营文档索引（`docs/growth/`）

| 文件 | 内容概要 |
|------|---------|
| [01 市场调研报告](docs/growth/01_市场调研报告_目标客户画像.md) | 市场规模（TAM/SAM/SOM）、三类目标客户画像、竞品初步梳理 |
| [02 客户访谈模板](docs/growth/02_客户访谈模板.md) | 30 个种子用户访谈的问题设计与记录格式 |
| [03 竞品分析与定价](docs/growth/03_竞品分析_定价策略.md) | HeyGen/Virbo/Captions 等竞品详细对比，定价策略建议 |
| [04 种子用户获取](docs/growth/04_种子用户获取_社群运营计划.md) | 首批 50 个付费用户的获取路径、微信群渗透计划 |
| [05 内容营销方案](docs/growth/05_内容营销_增长策略方案.md) | 小红书/公众号/TikTok 内容策略，增长飞轮设计 |

---

## 项目整体进度

详见 [PROJECT_STATUS.md](PROJECT_STATUS.md)，包含：
- 产品一（Amazon Listing AI 优化插件）架构与功能详情
- 产品二（VideoLingo 多语言视频 Web App）技术栈与页面列表
- Phase 1 各模块完成状态（截至 2026-03-03）

---

## 相关仓库

| 仓库 | 内容 |
|------|------|
| 主仓库（成员 A） | 后端 API（Cloudflare Workers + Hono）、Amazon Listing 优化插件 |
| 前端仓库（成员 B） | VideoLingo Web App（Next.js 16 + React 19） |
| 本仓库（成员 C） | 引流插件 + 运营文档（当前仓库） |

---

## 团队分工

| 成员 | 角色 | 主要职责 |
|------|------|---------|
| 成员 A | Tech Lead | 后端架构、视频生成 pipeline、Cloudflare 部署 |
| 成员 B | 产品 & 前端 | Web App 设计与开发、落地页 |
| 成员 C | 运营增长 | 市场调研、客户访谈、种子用户获取、本仓库维护 |

> 项目周期：2026 年 3 月 - 5 月（12 周冲刺）
> 目标：50 个付费用户，验证商业模式可行性
