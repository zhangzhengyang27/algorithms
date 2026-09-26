'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, BookOpen, X, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import type { SidebarGroup } from '@/lib/tutorial-list';

export function TutorialSidebar({ groups }: { groups: SidebarGroup[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scopedCategory = searchParams.get('category')?.trim() || null;
  const currentSlug = pathname.replace('/tutorials/', '').split('?')[0];
  // 当前 active 所在分类（路由变化时始终重新计算，强制该分类展开）
  const activeCategory =
    groups.find((g) => g.items.some((i) => i.slug === currentSlug))?.category ?? null;
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  // 自动滚动到当前激活项（仅在侧边栏容器内滚动，不影响主页面）
  useEffect(() => {
    const container = asideRef.current;
    const active = activeRef.current;
    if (container && active) {
      const top = active.offsetTop - container.offsetTop - container.clientHeight / 2 + active.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }, [currentSlug]);

  const toggleCategory = (category: string) => {
    // 当前 active 分类不允许折叠
    if (category === activeCategory) return;
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // 受 ?category= 限定时，只展示该分类下的子项（与"目录栏只显示这 N 个"对应）
  const scopedGroup = scopedCategory ? groups.find((g) => g.category === scopedCategory) ?? null : null;
  const shownGroups = scopedGroup ? [scopedGroup] : groups;
  // 子项链接：限定分类时保留 ?category= 让用户回到同分类；切到其他分类可直接换 URL
  const itemHref = (slug: string) =>
    scopedCategory ? `/tutorials/${slug}?category=${encodeURIComponent(scopedCategory)}` : `/tutorials/${slug}`;

  const sidebarContent = (
    <nav className="space-y-1">
      {shownGroups.map((group) => {
        const isCollapsed = scopedCategory
          ? false // 限定分类时永远展开
          : group.category !== activeCategory && collapsed.has(group.category);
        const hasActive = group.items.some((i) => i.slug === currentSlug);
        return (
          <div key={group.category}>
            <button
              type="button"
              onClick={() => toggleCategory(group.category)}
              className={clsx(
                'flex items-center gap-1.5 w-full px-2 py-1.5 text-left rounded-md transition-colors group',
                hasActive ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
              )}
              aria-expanded={!isCollapsed}
            >
              <ChevronRight
                size={12}
                className={clsx(
                  'shrink-0 transition-transform text-ink-3',
                  !isCollapsed && 'rotate-90'
                )}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
                {group.category}
              </span>
              <span className="ml-auto text-[10px] font-mono text-ink-3">
                {group.items.length}
              </span>
            </button>
            {!isCollapsed && (
              <div className="ml-3 pl-2 border-l border-edge space-y-px mt-0.5 mb-1">
                {group.items.map((item) => {
                  const isActive = item.slug === currentSlug;
                  return (
                    <Link
                      key={item.slug}
                      href={itemHref(item.slug)}
                      ref={isActive ? activeRef : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        'block px-2 py-1 rounded text-[13px] leading-snug transition-colors truncate',
                        isActive
                          ? 'text-brand bg-brand-soft font-medium'
                          : 'text-ink-3 hover:text-ink hover:bg-surface-2'
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 移动端触发按钮 */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-surface border border-edge rounded-lg shadow-lg text-sm text-ink-2 hover:text-ink transition-colors"
      >
        <BookOpen size={15} />
        <span className="text-xs">目录</span>
      </button>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-bg border-r border-edge overflow-y-auto p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-ink">教程目录</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 text-ink-3 hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* 桌面端固定侧边栏 */}
      <aside ref={asideRef} className="hidden lg:block w-56 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-none">
        <div className="mb-3 px-2">
          {scopedCategory ? (
            // 受限模式：顶部「返回全部分类」链接
            <Link
              href="/tutorials"
              className="flex items-center gap-1.5 text-[11px] font-mono text-ink-3 hover:text-brand transition-colors uppercase tracking-widest"
            >
              <ArrowLeft size={11} />
              返回全部教程
            </Link>
          ) : (
            <Link
              href="/tutorials"
              className="text-[11px] font-mono text-ink-3 hover:text-brand transition-colors uppercase tracking-widest"
            >
              ← 全部教程
            </Link>
          )}
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
