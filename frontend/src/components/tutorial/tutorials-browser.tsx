"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import type { TutorialIndexItem } from "@/lib/tutorial-page";

type DisplayTutorial = TutorialIndexItem;

const DISPLAY_CATEGORIES = [
  "全部",
  "排序算法",
  "搜索算法",
  "数据结构",
  "算法思想",
  "动态规划",
  "图论",
  "字符串",
  "工程实战",
];

export function TutorialsBrowser({ tutorials }: { tutorials: DisplayTutorial[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 分类选择完全由 URL 派生（单一数据源）：可分享、可刷新、可前进后退
  const selectedCategory = (() => {
    const q = searchParams.get("category");
    return q && q.trim() !== "" ? q : "全部";
  })();

  const updateCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "全部") params.delete("category");
    else params.set("category", cat);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const categories = useMemo(() => {
    const fromData = new Set<string>();
    for (const t of tutorials) fromData.add(t.category);
    const all = ["全部", ...Array.from(fromData).filter((c) => c !== "全部")];
    return all.length > 1 ? all : DISPLAY_CATEGORIES;
  }, [tutorials]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tutorials) map.set(t.category, (map.get(t.category) ?? 0) + 1);
    return map;
  }, [tutorials]);

  const filteredTutorials = useMemo(
    () =>
      selectedCategory === "全部"
        ? tutorials
        : tutorials.filter((t) => t.category === selectedCategory),
    [tutorials, selectedCategory],
  );

  // 卡片链接携带当前的 category，保持用户上下文
  const cardHref = (slug: string) => {
    if (selectedCategory === "全部") return `/tutorials/${slug}`;
    return `/tutorials/${slug}?category=${encodeURIComponent(selectedCategory)}`;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">算法教程</h1>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ok/10 text-ok"
            title="教程内容由前端本地 Markdown 驱动"
          >
            本地
          </span>
        </div>
        <p className="text-ink-2 text-sm">
          {tutorials.length} 篇教程 · 系统学习算法与数据结构的原理与实现
        </p>
      </div>

      {selectedCategory === "工程实战" && (
        <div className="anim-fade-up mb-8 relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-soft via-surface to-surface p-6 md:p-8">
          <div className="absolute inset-0 bg-glow-top pointer-events-none" />
          <div className="relative">
            <span className="inline-block rounded bg-brand px-2 py-0.5 font-mono text-[10px] text-on-brand">
              工程实战专栏
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
              把算法装进真实系统
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2 md:text-base">
              从短网址、Redis 到高性能队列与搜索引擎，这一专栏用工业级案例拆解数据结构与算法如何在生产系统中落地——
              复杂度、权衡与设计模式，一篇一个真实系统。
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[200px_1fr] gap-8">
        {/* ─── Sidebar: category filter ─── */}
        {/* min-w-0：分类条是 nowrap 横向滚动，grid 子项默认 min-width:auto 会把整页撑到 900+px */}
        <aside className="anim-fade-up stagger-1 min-w-0">
          <div className="lg:sticky lg:top-20">
            <p className="font-mono text-[10px] text-ink-3 uppercase tracking-widest mb-3">
              Categories
            </p>
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                const count = cat === "全部" ? tutorials.length : (categoryCounts.get(cat) ?? 0);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateCategory(cat)}
                    className={clsx(
                      "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-[13px] whitespace-nowrap transition-all text-left",
                      active
                        ? "bg-brand-soft text-brand font-medium"
                        : "text-ink-2 hover:text-ink hover:bg-surface-2",
                    )}
                  >
                    <span>{cat}</span>
                    <span className={clsx("font-mono text-[10px]", active ? "text-brand" : "text-ink-3")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ─── Content: tutorial grid ─── */}
        <div className="anim-fade-up stagger-2">
          {filteredTutorials.length === 0 ? (
            <div className="text-center text-ink-3 py-16 glass-card rounded-lg">
              该分类下暂无教程
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredTutorials.map((tutorial) => (
                <Link
                  key={tutorial.slug}
                  href={cardHref(tutorial.slug)}
                  className={clsx(
                    "group flex flex-col p-4 glass-card rounded-lg hover:border-edge-2 transition-all hover:-translate-y-0.5",
                    tutorial.category === "工程实战" && "border-l-2 border-l-brand",
                  )}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10px] text-brand bg-brand-soft px-1.5 py-0.5 rounded">
                      {tutorial.category}
                    </span>
                    <ArrowRight
                      size={13}
                      className="text-ink-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </div>
                  <h3 className="text-sm font-medium leading-snug mb-1.5 group-hover:text-brand transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-ink-3 text-xs leading-relaxed line-clamp-2 mt-auto">
                    {tutorial.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
