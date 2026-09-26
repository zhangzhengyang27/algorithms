'use client';

import Link from 'next/link';
import { BookOpen, BarChart3, GraduationCap } from 'lucide-react';
import { getProblemRelations } from '@/lib/problem-resources';

/**
 * 题目 → 教程/可视化 反向关联条。
 * 打通「做题卡壳 → 看讲解 → 看动画」闭环。
 * 无关联时返回 null，不占位。
 */
export function ProblemRelatedLinks({ slug }: { slug: string }) {
  const rel = getProblemRelations(slug);
  if (!rel) return null;

  return (
    <div className="rounded-lg border border-brand/25 bg-brand-soft/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap size={15} className="text-brand" />
        <h3 className="text-xs font-semibold text-ink">卡壳了？先看讲解再看动画</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {rel.tutorials.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            title={t.description}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface border border-edge hover:border-brand/40 text-[12px] text-ink-2 hover:text-brand transition-colors"
          >
            <BookOpen size={12} className="text-brand" />
            {t.title}
          </Link>
        ))}
        {rel.visualizers.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            title={v.description}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-brand/10 border border-brand/30 hover:bg-brand/20 text-[12px] text-brand transition-colors"
          >
            <BarChart3 size={12} />
            {v.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
