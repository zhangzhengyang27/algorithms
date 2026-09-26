import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="text-center anim-fade-up max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-soft mb-6">
          <FileQuestion size={28} className="text-brand" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">404</h1>
        <p className="text-lg font-medium text-ink-2 mb-1">页面不存在</p>
        <p className="text-sm text-ink-3 leading-relaxed mb-8">
          你访问的页面可能已被移动或删除。试试返回首页，或从教程列表重新开始学习。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium bg-brand text-on-brand hover:opacity-90 transition-all"
          >
            <Home size={15} />
            返回首页
          </Link>
          <Link
            href="/tutorials"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium bg-surface border border-edge text-ink-2 hover:text-ink hover:border-edge-2 transition-all"
          >
            <ArrowLeft size={15} />
            浏览教程
          </Link>
        </div>
      </div>
    </div>
  );
}
