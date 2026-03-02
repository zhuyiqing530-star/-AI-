import Link from "next/link";

const features = [
  { title: "多语言视频生成", desc: "支持中/英/日/韩/西班牙语，AI口型同步", icon: "🌍" },
  { title: "一键商品视频", desc: "上传商品图片，自动生成营销短视频", icon: "🎬" },
  { title: "智能文案优化", desc: "AI驱动的多语言商品文案，精准本地化", icon: "✍️" },
  { title: "多平台适配", desc: "TikTok Shop / Amazon / 独立站一键发布", icon: "🚀" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center px-4 py-24 text-center">
        <h1 className="max-w-3xl text-5xl font-bold leading-tight">
          AI驱动的<span className="text-primary">跨境电商</span>视频本地化
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          一键将商品图片转化为多语言营销视频，助力卖家高效出海
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/upload"
            className="rounded-lg bg-primary px-8 py-3 text-white transition-colors hover:bg-primary-hover"
          >
            免费试用
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-border px-8 py-3 transition-colors hover:bg-secondary"
          >
            了解更多
          </Link>
        </div>
      </section>

      {/* Features */}
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

      {/* CTA */}
      <section className="bg-primary/5 px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">开始生成你的第一个多语言视频</h2>
        <p className="mt-4 text-muted">无需信用卡，免费体验3次视频生成</p>
        <Link
          href="/upload"
          className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 text-white transition-colors hover:bg-primary-hover"
        >
          立即开始
        </Link>
      </section>
    </div>
  );
}
