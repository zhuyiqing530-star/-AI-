"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/upload", label: "生成视频" },
  { href: "/dashboard", label: "工作台" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          VideoLingo
        </Link>
        <nav className="flex items-center gap-6">
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
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-hover"
          >
            登录
          </Link>
        </nav>
      </div>
    </header>
  );
}
