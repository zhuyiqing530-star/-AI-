// 触达话术模板模块
// 根据线索的缺口动态生成个性化的中文触达消息

export interface OutreachMessage {
  title: string;       // 话术标题（用于展示）
  message: string;     // 完整消息内容
  channel: "微信" | "邮件" | "站内信";
}

interface LeadContext {
  productTitle: string;
  sellerName: string;
  marketplace: string;
  gaps: string[];
  opportunityScore: number;
}

const MARKETPLACE_LABELS: Record<string, string> = {
  US: "美国站",
  JP: "日本站",
  DE: "德国站",
  FR: "法国站",
  ES: "西班牙站",
  UK: "英国站",
};

// 截断商品名，取前20个字符
function shortTitle(title: string): string {
  return title.length > 20 ? title.slice(0, 20) + "..." : title;
}

export function generateOutreachMessages(ctx: LeadContext): OutreachMessage[] {
  const messages: OutreachMessage[] = [];
  const short = shortTitle(ctx.productTitle);
  const market = MARKETPLACE_LABELS[ctx.marketplace] || ctx.marketplace;

  const hasVideoGap = ctx.gaps.some((g) => g.includes("视频"));
  const hasLangGap = ctx.gaps.some((g) => g.includes("语言") || g.includes("英语"));
  const hasBulletGap = ctx.gaps.some((g) => g.includes("卖点"));

  // 模板A：缺少视频
  if (hasVideoGap) {
    messages.push({
      title: "模板A · 缺视频",
      channel: "微信",
      message:
        `你好！我注意到您在亚马逊${market}上的「${short}」，产品很不错，但目前没有推广视频。\n\n` +
        `研究显示，亚马逊/TikTok Shop 有视频的 Listing 转化率平均高出 40%。\n\n` +
        `我们的 AI 工具可以：\n` +
        `✅ 30秒生成英/日/西语版推广视频\n` +
        `✅ 口型自然同步，不是机器配音\n` +
        `✅ 直接适配 TikTok Shop + Amazon 视频规格\n\n` +
        `现在有免费体验名额（3条视频），感兴趣的话发我产品图片就可以直接试！`,
    });
  }

  // 模板B：仅英语 Listing
  if (hasLangGap) {
    messages.push({
      title: "模板B · 缺多语言",
      channel: "微信",
      message:
        `您好！看到您的「${short}」目前只有英语版本 Listing。\n\n` +
        `日本站/德国站竞争比美国站少很多，利润空间也更大，很多卖家靠多语言版本实现了销量翻倍。\n\n` +
        `我们帮 500+ 卖家做过多语言 Listing 优化：\n` +
        `✅ AI 改写，不是机器翻译，本地化地道表达\n` +
        `✅ 支持日/德/法/西班牙语，符合各站 SEO 规则\n` +
        `✅ 同步生成多语言推广视频\n\n` +
        `免费试用 3 条 Listing 改写，感兴趣吗？发我产品链接直接开始！`,
    });
  }

  // 模板C：综合优化（标题/卖点问题）
  if (hasBulletGap || ctx.gaps.length >= 3) {
    messages.push({
      title: "模板C · 综合优化",
      channel: "微信",
      message:
        `您好，我发现您在亚马逊${market}的「${short}」有一些优化空间（${ctx.gaps.slice(0, 2).join("、")}）。\n\n` +
        `我们的 AI 工具可以一键优化：\n` +
        `✅ 标题/卖点/描述/搜索词全面重写\n` +
        `✅ 同步生成多语言版本（日/德/西语）\n` +
        `✅ 配套生成 TikTok/Amazon 推广视频\n\n` +
        `已帮助 500+ 中国卖家平均提升 30% 转化率。\n` +
        `现在有免费体验名额，发我产品链接我们帮您分析？`,
    });
  }

  // 默认模板（当无明显缺口时）
  if (messages.length === 0) {
    messages.push({
      title: "模板D · 通用",
      channel: "微信",
      message:
        `您好！看到您在亚马逊${market}上的「${short}」，想了解您是否有多语言视频/Listing本地化的需求？\n\n` +
        `我们的 AI 工具可以一键生成日/德/西语版推广视频，帮卖家低成本打开多语言市场。\n\n` +
        `现有免费体验名额，感兴趣可以聊聊？`,
    });
  }

  // 邮件版本（通用）
  messages.push({
    title: "邮件版 · 正式",
    channel: "邮件",
    message:
      `主题：AI多语言视频工具 | 帮助您的「${short}」打开日本/欧洲市场\n\n` +
      `尊敬的卖家，\n\n` +
      `您好！我们注意到您在亚马逊${market}上的产品「${short}」，经分析发现以下优化机会：\n` +
      ctx.gaps.map((g) => `• ${g}`).join("\n") +
      `\n\n我们的 VideoLingo AI 工具专为跨境卖家设计：\n` +
      `1. 一键生成日/德/法/西班牙语多语言 Listing（非机翻，本地化文案）\n` +
      `2. 30秒内生成多语言商品推广视频（可灵3.0口型同步）\n` +
      `3. 已服务 500+ 中国卖家，平均转化率提升 30%\n\n` +
      `现提供免费试用（3条 Listing + 3条视频），无需信用卡，感兴趣请回复此邮件或扫码联系。\n\n` +
      `VideoLingo 团队`,
  });

  return messages;
}
