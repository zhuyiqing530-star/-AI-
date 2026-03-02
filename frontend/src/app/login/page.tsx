"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-center">登录 VideoLingo</h1>
        <p className="mb-8 text-center text-sm text-muted">开始生成多语言商品视频</p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
          />
          <button className="w-full rounded-lg bg-primary py-3 text-white hover:bg-primary-hover">
            登录
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          还没有账号？<Link href="/register" className="text-primary hover:underline">注册</Link>
        </p>
      </div>
    </div>
  );
}
