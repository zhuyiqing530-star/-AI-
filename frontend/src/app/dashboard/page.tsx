"use client";

const mockHistory = [
  { id: 1, name: "蓝牙耳机推广视频", langs: 3, date: "2026-03-01", status: "done" },
  { id: 2, name: "瑜伽裤种草视频", langs: 5, date: "2026-03-02", status: "generating" },
];

const mockTrend = [
  { day: "2/24", count: 3 },
  { day: "2/25", count: 1 },
  { day: "2/26", count: 4 },
  { day: "2/27", count: 2 },
  { day: "2/28", count: 5 },
  { day: "3/01", count: 2 },
  { day: "3/02", count: 3 },
];

const mockLangs = [
  { name: "英语", pct: 35, color: "bg-blue-500" },
  { name: "日语", pct: 25, color: "bg-rose-500" },
  { name: "西班牙语", pct: 20, color: "bg-amber-500" },
  { name: "法语", pct: 12, color: "bg-emerald-500" },
  { name: "其他", pct: 8, color: "bg-gray-400" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">工作台</h1>

      {/* 用量统计 */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "已生成视频", value: "12", unit: "个" },
          { label: "本月剩余", value: "8", unit: "次" },
          { label: "支持语言", value: "5", unit: "种" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}<span className="text-sm font-normal text-muted"> {s.unit}</span></p>
          </div>
        ))}
      </div>

      {/* 视频生成趋势 - 最近7天 */}
      <h2 className="mb-4 text-lg font-semibold">生成趋势（近7天）</h2>
      <div className="mb-10 flex items-end gap-3 rounded-xl border border-border p-5" style={{ height: 180 }}>
        {mockTrend.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium">{d.count}</span>
            <div className="w-full rounded-t bg-primary transition-all" style={{ height: `${(d.count / 5) * 100}%` }} />
            <span className="text-xs text-muted">{d.day}</span>
          </div>
        ))}
      </div>

      {/* 语言分布统计 */}
      <h2 className="mb-4 text-lg font-semibold">语言分布</h2>
      <div className="mb-10 space-y-3 rounded-xl border border-border p-5">
        {mockLangs.map((l) => (
          <div key={l.name} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-sm">{l.name}</span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted/20">
              <div className={`h-full rounded-full ${l.color}`} style={{ width: `${l.pct}%` }} />
            </div>
            <span className="w-10 text-right text-sm text-muted">{l.pct}%</span>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <h2 className="mb-4 text-lg font-semibold">快捷操作</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          { title: "新建视频", desc: "开始创建多语言视频", href: "/create", icon: "🎬" },
          { title: "查看模板", desc: "浏览热门视频模板", href: "/templates", icon: "📋" },
          { title: "账户设置", desc: "管理套餐与偏好", href: "/settings", icon: "⚙️" },
        ].map((a) => (
          <a key={a.title} href={a.href} className="group rounded-xl border border-border p-5 transition hover:border-primary hover:shadow-sm">
            <p className="mb-1 text-2xl">{a.icon}</p>
            <p className="font-medium group-hover:text-primary">{a.title}</p>
            <p className="text-sm text-muted">{a.desc}</p>
          </a>
        ))}
      </div>

      {/* 历史记录 */}
      <h2 className="mb-4 text-lg font-semibold">生成历史</h2>
      <div className="space-y-3">
        {mockHistory.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted">{item.date} · {item.langs}个语言版本</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${
              item.status === "done" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
            }`}>
              {item.status === "done" ? "已完成" : "生成中"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
