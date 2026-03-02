"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [productUrl, setProductUrl] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleNext = () => {
    if (files.length > 0 || productUrl) {
      router.push("/generate");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">上传商品素材</h1>
      <p className="mb-8 text-muted">上传商品图片或输入商品链接，开始生成视频</p>

      {/* 拖拽上传区 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border"
        }`}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <p className="text-4xl">📸</p>
        <p className="mt-4 font-medium">拖拽图片到此处，或点击上传</p>
        <p className="mt-1 text-sm text-muted">支持 JPG、PNG，最多10张</p>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* 已上传文件列表 */}
      {files.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <span key={i} className="rounded-lg bg-secondary px-3 py-1 text-sm">
              {f.name}
              <button
                className="ml-2 text-muted hover:text-destructive"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 分隔线 */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted">或</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* 商品链接输入 */}
      <input
        type="url"
        placeholder="粘贴商品链接（TikTok Shop / Amazon / 1688）"
        value={productUrl}
        onChange={(e) => setProductUrl(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
      />

      {/* 下一步 */}
      <button
        onClick={handleNext}
        disabled={files.length === 0 && !productUrl}
        className="mt-8 w-full rounded-lg bg-primary py-3 text-white transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一步：配置视频
      </button>
    </div>
  );
}
