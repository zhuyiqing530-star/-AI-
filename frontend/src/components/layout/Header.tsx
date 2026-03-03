"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/upload", label: "生成视频" },
  { href: "/listing", label: "AI文案" },
  { href: "/dashboard", label: "工作台" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          VideoLingo
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary font-medium" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{user.name}</span>
              <button
                onClick={logout}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-hover"
            >
              登录
            </Link>
          )}
        </nav>

        {/* 移动端菜单按钮 */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {menuOpen && (
        <nav className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === item.href ? "bg-primary/10 text-primary font-medium" : "text-muted hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="rounded-lg border border-border px-3 py-2 text-center text-sm hover:bg-secondary"
              >
                退出（{user.name}）
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-primary px-3 py-2 text-center text-sm text-white hover:bg-primary-hover"
              >
                登录
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
