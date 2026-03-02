"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("请填写所有字段"); return; }
    if (password.length < 8) { setError("密码至少8位"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-center">注册 VideoLingo</h1>
        <p className="mb-8 text-center text-sm text-muted">免费体验3次视频生成</p>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="昵称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="密码（至少8位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                注册中...
              </span>
            ) : "注册"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          已有账号？<Link href="/login" className="text-primary hover:underline">登录</Link>
        </p>
      </div>
    </div>
  );
}
