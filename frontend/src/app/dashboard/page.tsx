"use client";

const mockHistory = [
  { id: 1, name: "蓝牙耳机推广视频", langs: 3, date: "2026-03-01", status: "done" },
  { id: 2, name: "瑜伽裤种草视频", langs: 5, date: "2026-03-02", status: "generating" },
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
