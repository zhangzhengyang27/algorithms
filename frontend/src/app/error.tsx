'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * 路由级错误边界（app/error.tsx）
 * 页面级渲染错误时的兜底 UI，支持重试。
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可在此上报错误（生产环境）
    console.error('页面渲染错误:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="text-center anim-fade-up max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-err/10 mb-6">
          <AlertTriangle size={28} className="text-err" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight mb-2">出错了</h1>
        <p className="text-sm text-ink-3 leading-relaxed mb-8">
          页面加载时发生了一点问题。你可以重试，或返回首页。
          {error?.digest && (
            <span className="block mt-2 font-mono text-[11px] text-ink-3/60">
              错误码：{error.digest}
            </span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium bg-brand text-on-brand hover:opacity-90 transition-all"
          >
            <RefreshCw size={15} />
            重试
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium bg-surface border border-edge text-ink-2 hover:text-ink hover:border-edge-2 transition-all"
          >
            <Home size={15} />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
