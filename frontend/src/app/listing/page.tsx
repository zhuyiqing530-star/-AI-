"use client";

import { useState, useRef } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8787";

const MARKETPLACES = [
  { value: "US", label: "🇺🇸 US" },
  { value: "UK", label: "🇬🇧 UK" },
  { value: "JP", label: "🇯🇵 JP" },
  { value: "DE", label: "🇩🇪 DE" },
  { value: "FR", label: "🇫🇷 FR" },
  { value: "ES", label: "🇪🇸 ES" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
];

type Mode = "rewrite" | "translate" | "keywords";

export default function ListingPage() {
  const [title, setTitle] = useState("");
  const [bullets, setBullets] = useState(["", "", "", "", ""]);
  const [description, setDescription] = useState("");
  const [searchTerms, setSearchTerms] = useState("");
  const [marketplace, setMarketplace] = useState("US");
  const [language, setLanguage] = useState("en");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("rewrite");
  const abortRef = useRef<AbortController | null>(null);

  const listing = {
    title,
    bulletPoints: bullets.filter(Boolean),
    description,
    searchTerms,
  };

  async function streamRequest(endpoint: string, body: object) {
    setLoading(true);
    setOutput("");
    abortRef.current = new AbortController();
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`请求失败：${res.status}`);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) setOutput((prev) => prev + delta);
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setOutput(`[错误] ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleRewrite = () =>
    streamRequest("/api/listing/rewrite", { listing, marketplace, language });

  const handleTranslate = () =>
    streamRequest("/api/listing/translate", { listing, marketplace, language });

  const handleKeywords = () =>
    streamRequest("/api/keywords/suggest", { title, category: description.slice(0, 50), marketplace });

  const handleRun = () => {
    if (mode === "rewrite") handleRewrite();
    else if (mode === "translate") handleTranslate();
    else handleKeywords();
  };

  const handleStop = () => abortRef.current?.abort();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">AI 文案优化</h1>
      <p className="mb-8 text-muted">DeepSeek 驱动的 Amazon Listing 智能改写 · 翻译 · 关键词建议</p>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 左侧：输入区 */}
        <div className="space-y-4">
          {/* 操作模式选择 */}
          <div className="flex gap-2">
            {(["rewrite", "translate", "keywords"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-4 py-2 text-sm transition-all ${
                  mode === m
                    ? "bg-primary text-white"
                    : "border border-border hover:border-primary/50"
                }`}
              >
                {m === "rewrite" ? "🔁 AI改写" : m === "translate" ? "🌐 翻译适配" : "🔑 关键词建议"}
              </button>
            ))}
          </div>

          {/* 站点 & 语言 */}
          <div className="flex gap-3">
            <select
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {MARKETPLACES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Listing 输入表单 */}
          <div>
            <label className="mb-1 block text-xs text-muted">标题 (Title)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="商品标题，最多200字符"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">卖点 (Bullet Points)</label>
            <div className="space-y-2">
              {bullets.map((b, i) => (
                <input
                  key={i}
                  value={b}
                  onChange={(e) => {
                    const next = [...bullets];
                    next[i] = e.target.value;
                    setBullets(next);
                  }}
                  placeholder={`卖点 ${i + 1}`}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">描述 (Description)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="商品详情描述"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">搜索词 (Search Terms)</label>
            <input
              value={searchTerms}
              onChange={(e) => setSearchTerms(e.target.value)}
              placeholder="后台搜索词，空格分隔"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={loading || !title}
              className="flex-1 rounded-lg bg-primary py-3 text-sm text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  AI 生成中...
                </span>
              ) : (
                mode === "rewrite" ? "🔁 开始改写" : mode === "translate" ? "🌐 开始翻译" : "🔑 生成关键词"
              )}
            </button>
            {loading && (
              <button
                onClick={handleStop}
                className="rounded-lg border border-border px-4 py-3 text-sm hover:bg-secondary"
              >
                停止
              </button>
            )}
          </div>
        </div>

        {/* 右侧：输出区 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-muted uppercase">AI 输出</label>
            {output && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-xs text-primary hover:underline"
              >
                复制
              </button>
            )}
          </div>
          <div className="min-h-[480px] rounded-xl border border-border bg-secondary/30 p-4">
            {output ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{output}</pre>
            ) : (
              <div className="flex h-full min-h-[440px] flex-col items-center justify-center text-muted">
                <p className="text-4xl mb-4">✨</p>
                <p className="text-sm">填写商品信息后点击按钮，AI 将实时输出结果</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
