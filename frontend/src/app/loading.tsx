import { Loader2 } from 'lucide-react';

/**
 * 页面级加载兜底（app/loading.tsx）
 * 路由懒加载/流式渲染期间的骨架屏。
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-ink-3 text-sm">
        <Loader2 size={18} className="animate-spin" />
        加载中…
      </div>
    </div>
  );
}
