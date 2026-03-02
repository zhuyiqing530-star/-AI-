"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  { title: "多语言视频生成", desc: "支持中/英/日/韩/西班牙语，AI口型同步", icon: "🌍" },
  { title: "一键商品视频", desc: "上传商品图片，自动生成营销短视频", icon: "🎬" },
  { title: "智能文案优化", desc: "AI驱动的多语言商品文案，精准本地化", icon: "✍️" },
  { title: "多平台适配", desc: "TikTok Shop / Amazon / 独立站一键发布", icon: "🚀" },
];

const stats = [
  { value: "10,000+", label: "视频已生成" },
  { value: "500+", label: "活跃卖家" },
  { value: "5", label: "语言支持" },
];

const cases = [
  { name: "深圳蓝牙耳机卖家", scene: "TikTok Shop 美区推广", result: "转化率提升 40%" },
  { name: "义乌瑜伽用品商家", scene: "Amazon 日本站视频", result: "点击率提升 65%" },
  { name: "广州美妆品牌", scene: "多平台多语言投放", result: "获客成本降低 30%" },
];

const faqs = [
  { q: "支持哪些语言？", a: "目前支持中文、英语、日语、韩语、西班牙语五种语言，更多语言持续接入中。" },
  { q: "生成一条视频需要多久？", a: "通常 1-3 分钟即可完成单语言版本，多语言版本同时生成，无需额外等待。" },
  { q: "免费版有什么限制？", a: "免费版每月可生成 3 条视频，支持单语言。升级后可解锁多语言和批量生成。" },
  { q: "视频可以自定义编辑吗？", a: "支持字幕编辑、背景音乐选择、封面设置和视频裁剪等基础编辑功能。" },
  { q: "支持哪些电商平台？", a: "目前深度适配 TikTok Shop 和 Amazon，同时支持 Shopee、独立站等平台的视频格式。" },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center px-4 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          AI驱动的<span className="text-primary">跨境电商</span>视频本地化
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">一键将商品图片转化为多语言营销视频，助力卖家高效出海</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/upload" className="rounded-lg bg-primary px-8 py-3 text-white hover:bg-primary-hover">免费试用</Link>
          <Link href="/templates" className="rounded-lg border border-border px-8 py-3 hover:bg-secondary">浏览模板</Link>
        </div>
      </section>

      {/* 数据展示 */}
      <section className="border-y border-border bg-secondary/50 px-4 py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-around gap-8 sm:flex-row">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 核心功能 */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">核心功能</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 text-4xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 客户案例 */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">卖家成功案例</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {cases.map((c) => (
            <div key={c.name} className="rounded-xl border border-border p-6">
              <p className="text-2xl font-bold text-primary">{c.result}</p>
              <p className="mt-3 font-medium">{c.name}</p>
              <p className="mt-1 text-sm text-muted">{c.scene}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">常见问题</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-border">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
              >
                {faq.q}
                <span className={`transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▾</span>
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-sm text-muted">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">开始生成你的第一个多语言视频</h2>
        <p className="mt-4 text-muted">无需信用卡，免费体验3次视频生成</p>
        <Link href="/upload" className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 text-white hover:bg-primary-hover">立即开始</Link>
      </section>
    </div>
  );
}
