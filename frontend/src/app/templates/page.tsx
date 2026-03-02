"use client";

import { useState } from "react";

const categories = ["全部", "商品展示", "种草测评", "开箱视频", "对比评测"];

const templates = [
  { id: 1, name: "商品360°展示", category: "商品展示", platforms: ["TikTok", "Amazon"], uses: 1280 },
  { id: 2, name: "真人种草推荐", category: "种草测评", platforms: ["TikTok"], uses: 986 },
  { id: 3, name: "开箱第一视角", category: "开箱视频", platforms: ["TikTok", "Amazon"], uses: 2150 },
  { id: 4, name: "A/B产品对比", category: "对比评测", platforms: ["Amazon"], uses: 743 },
  { id: 5, name: "场景化商品演示", category: "商品展示", platforms: ["TikTok"], uses: 1560 },
  { id: 6, name: "沉浸式开箱体验", category: "开箱视频", platforms: ["TikTok", "Amazon"], uses: 1890 },
  { id: 7, name: "达人测评口播", category: "种草测评", platforms: ["TikTok"], uses: 670 },
  { id: 8, name: "多维度横评", category: "对比评测", platforms: ["Amazon"], uses: 520 },
];

export default function TemplatesPage() {
  const [active, setActive] = useState("全部");
  const filtered = active === "全部" ? templates : templates.filter((t) => t.category === active);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">视频模板</h1>

      {/* 分类筛选 */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active === c ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <div key={t.id} className="rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
            {/* 缩略图占位 */}
            <div className="flex h-40 items-center justify-center bg-gray-100 text-4xl text-gray-300">▶</div>
            <div className="p-4">
              <h3 className="font-semibold">{t.name}</h3>
              <div className="mt-2 flex gap-1.5">
                {t.platforms.map((p) => (
                  <span
                    key={p}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      p === "TikTok" ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">已使用 {t.uses} 次</span>
                <button className="rounded-lg bg-primary px-4 py-1.5 text-sm text-white transition-colors hover:bg-primary-hover">
                  使用模板
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
