"use client";

import { useState } from "react";

const musicOptions = [
  { id: "upbeat", label: "欢快节奏" },
  { id: "calm", label: "舒缓轻音" },
  { id: "epic", label: "大气磅礴" },
];

export default function EditorPage() {
  const [subtitle, setSubtitle] = useState("");
  const [music, setMusic] = useState("upbeat");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSaving(false);
  };

  const handleExport = async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setExporting(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">视频编辑</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* 左侧：视频预览 */}
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-secondary lg:w-1/2">
          <span className="text-muted">视频预览区域</span>
        </div>

        {/* 右侧：编辑面板 */}
        <div className="flex w-full flex-col gap-5 lg:w-1/2">
          {/* 字幕编辑 */}
          <div>
            <label className="mb-1 block text-sm font-medium">字幕编辑</label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="输入字幕内容..."
              rows={4}
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* 背景音乐 */}
          <div>
            <label className="mb-1 block text-sm font-medium">背景音乐</label>
            <div className="flex gap-3">
              {musicOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMusic(opt.id)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    music === opt.id
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 封面设置 */}
          <div>
            <label className="mb-1 block text-sm font-medium">封面设置</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary">
              <span>上传封面图片</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>

          {/* 视频裁剪 */}
          <div>
            <label className="mb-1 block text-sm font-medium">视频裁剪</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="00:00"
                className="w-24 rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <span className="text-muted">至</span>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="00:00"
                className="w-24 rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg border border-border px-6 py-2 text-sm transition-colors hover:bg-secondary disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg bg-primary px-6 py-2 text-sm text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {exporting ? "导出中..." : "导出视频"}
        </button>
      </div>
    </div>
  );
}
