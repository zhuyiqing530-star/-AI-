"use client";

import { useState } from "react";

const mockVideos = [
  { lang: "English", flag: "🇺🇸", status: "done" },
  { lang: "日本語", flag: "🇯🇵", status: "done" },
  { lang: "한국어", flag: "🇰🇷", status: "generating" },
];

export default function PreviewPage() {
  const [activeLang, setActiveLang] = useState(0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">视频预览</h1>
      <p className="mb-8 text-muted">预览和下载生成的多语言视频</p>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 视频预览区 */}
        <div className="lg:col-span-2">
          <div className="flex aspect-video items-center justify-center rounded-xl bg-secondary">
            {mockVideos[activeLang].status === "done" ? (
              <p className="text-muted">视频播放器占位 - {mockVideos[activeLang].lang}</p>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted">生成中...</p>
              </div>
            )}
          </div>
        </div>

        {/* 语言版本列表 */}
        <div className="space-y-3">
          <h2 className="font-semibold">语言版本</h2>
          {mockVideos.map((v, i) => (
            <button
              key={i}
              onClick={() => setActiveLang(i)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 transition-colors ${
                activeLang === i ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <span>{v.flag} {v.lang}</span>
              <span className={`text-xs ${v.status === "done" ? "text-success" : "text-muted"}`}>
                {v.status === "done" ? "已完成" : "生成中"}
              </span>
            </button>
          ))}

          <button className="mt-4 w-full rounded-lg bg-primary py-3 text-white hover:bg-primary-hover">
            下载全部视频
          </button>
        </div>
      </div>
    </div>
  );
}
