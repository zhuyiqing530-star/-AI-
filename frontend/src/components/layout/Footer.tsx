import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted">
            © 2026 VideoLingo. 跨境电商AI视频本地化平台
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/about" className="hover:text-foreground">关于我们</Link>
            <Link href="/pricing" className="hover:text-foreground">定价</Link>
            <Link href="/contact" className="hover:text-foreground">联系我们</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
