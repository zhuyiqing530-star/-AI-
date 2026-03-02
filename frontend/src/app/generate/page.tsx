"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const languages = [
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const styles = ["商品展示", "种草测评", "开箱视频", "对比评测"];

export default function GeneratePage() {
  const router = useRouter();
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["en"]);
  const [style, setStyle] = useState(styles[0]);

  const toggleLang = (code: string) => {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">配置视频</h1>
      <p className="mb-8 text-muted">选择目标语言和视频风格</p>

      {/* 语言选择 */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">目标语言（可多选）</h2>
        <div className="flex flex-wrap gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => toggleLang(lang.code)}
              className={`rounded-lg border px-4 py-2 transition-colors ${
                selectedLangs.includes(lang.code)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 视频风格 */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">视频风格</h2>
        <div className="grid grid-cols-2 gap-3">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-lg border px-4 py-3 transition-colors ${
                style === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={() => router.push("/preview")}
        disabled={selectedLangs.length === 0}
        className="w-full rounded-lg bg-primary py-3 text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        开始生成（{selectedLangs.length}个语言版本）
      </button>
    </div>
  );
}
