import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TUTORIAL_LIST } from "@/lib/tutorial-list";

/**
 * 教程页底部的「上一节 / 下一节」导航。
 * - 默认：基于 TUTORIAL_LIST 的全局学习路径线性推进。
 * - scopedCategory 传入时：仅在当前分类内部推进，并携带 ?category= 保持受限上下文。
 */
export function TutorialPager({
  slug,
  scopedCategory,
}: {
  slug: string;
  scopedCategory?: string | null;
}) {
  // 受限模式：只在当前分类子集内推进
  const scopedList =
    scopedCategory && scopedCategory !== ""
      ? TUTORIAL_LIST.filter((t) => t.category === scopedCategory)
      : TUTORIAL_LIST;
  const idx = scopedList.findIndex((t) => t.slug === slug);
  if (idx < 0) return null;

  const prev = idx > 0 ? scopedList[idx - 1] : null;
  const next = idx < scopedList.length - 1 ? scopedList[idx + 1] : null;
  if (!prev && !next) return null;

  // 受限模式下链接携带 ?category=，保持侧边栏受限视图
  const hrefFor = (s: string) =>
    scopedCategory && scopedCategory !== ""
      ? `/tutorials/${s}?category=${encodeURIComponent(scopedCategory)}`
      : `/tutorials/${s}`;

  return (
    <nav className="mt-14 pt-6 border-t border-edge grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
      {prev ? (
        <Link
          href={hrefFor(prev.slug)}
          className="group flex flex-col gap-1 p-4 bg-surface hover:bg-surface-2 border border-edge hover:border-brand/30 rounded-lg transition-all"
        >
          <span className="flex items-center gap-1 text-[11px] text-ink-3">
            <ChevronLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            上一节
          </span>
          <span className="text-[13px] font-medium text-ink group-hover:text-brand transition-colors line-clamp-1">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={hrefFor(next.slug)}
          className="group flex flex-col gap-1 p-4 bg-surface hover:bg-surface-2 border border-edge hover:border-brand/30 rounded-lg transition-all text-right sm:col-start-2"
        >
          <span className="flex items-center justify-end gap-1 text-[11px] text-ink-3">
            下一节
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-[13px] font-medium text-ink group-hover:text-brand transition-colors line-clamp-1">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
