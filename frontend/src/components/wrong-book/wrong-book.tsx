'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlarmClock, CheckCircle2, Trash2, Play, BookX } from 'lucide-react';
import clsx from 'clsx';
import { getAllProblems } from '@/lib/problems-cache';
import { useProgressStore, type WrongEntry } from '@/store';

type FilterKey = 'ALL' | 'DUE';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function isDue(entry: WrongEntry): boolean {
  return new Date(entry.nextReview).getTime() <= Date.now();
}

/**
 * 错题本 + 间隔重复复习提醒。
 * 数据源为 store.wrongProblems（运行失败时自动记录）。
 * 到期复习的题目高亮提醒，复习通过可推进间隔阶段（1→2→4→7→15→30 天）。
 */
export function WrongBook() {
  const wrongProblems = useProgressStore((s) => s.wrongProblems);
  const advanceReview = useProgressStore((s) => s.advanceReview);
  const removeWrong = useProgressStore((s) => s.removeWrong);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const slugs = Object.keys(wrongProblems);

  useEffect(() => {
    if (slugs.length === 0) return;
    let active = true;
    getAllProblems()
      .then((rows) => {
        if (!active) return;
        const map: Record<string, string> = {};
        for (const r of rows) map[r.slug] = r.title;
        setTitles(map);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.length]);

  const entries = useMemo(() => {
    const list = slugs.map((slug) => ({ slug, entry: wrongProblems[slug] }));
    const filtered = filter === 'DUE' ? list.filter((x) => isDue(x.entry)) : list;
    // 到期优先，其次按最近出错时间倒序
    return filtered.sort((a, b) => {
      const da = isDue(a.entry) ? 0 : 1;
      const db = isDue(b.entry) ? 0 : 1;
      if (da !== db) return da - db;
      return new Date(b.entry.lastAt).getTime() - new Date(a.entry.lastAt).getTime();
    });
  }, [slugs, wrongProblems, filter]);

  const dueCount = slugs.filter((s) => isDue(wrongProblems[s])).length;

  if (slugs.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} className="text-ok" />
        </div>
        <p className="text-sm text-ink-2 mb-1">错题本为空</p>
        <p className="text-xs text-ink-3">运行题目失败时会自动收录到这里，便于间隔重复复习</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 复习提醒横幅 */}
      <div
        className={clsx(
          'rounded-lg border p-4 flex items-center gap-3',
          dueCount > 0 ? 'border-warn/40 bg-warn/10' : 'border-edge bg-surface',
        )}
      >
        <AlarmClock size={18} className={dueCount > 0 ? 'text-warn' : 'text-ink-3'} />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {dueCount > 0 ? `今日有 ${dueCount} 道题待复习` : '暂无待复习题目'}
          </p>
          <p className="text-xs text-ink-3 mt-0.5">
            共收录 {slugs.length} 道错题 · 间隔重复曲线 1/2/4/7/15/30 天
          </p>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-surface rounded-lg border border-edge">
          {(['ALL', 'DUE'] as FilterKey[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1 text-xs rounded-md transition-colors cursor-pointer',
                filter === f ? 'bg-brand/10 text-brand font-medium' : 'text-ink-3 hover:text-ink',
              )}
            >
              {f === 'ALL' ? '全部' : '待复习'}
            </button>
          ))}
        </div>
      </div>

      {/* 错题列表 */}
      {entries.length === 0 ? (
        <div className="py-16 text-center text-sm text-ink-3">当前筛选下没有错题</div>
      ) : (
        <div className="space-y-2">
          {entries.map(({ slug, entry }) => {
            const due = isDue(entry);
            return (
              <div
                key={slug}
                className={clsx(
                  'bg-surface rounded-lg border p-4 flex items-center gap-4',
                  due ? 'border-warn/40' : 'border-edge',
                )}
              >
                <div className="w-9 h-9 rounded-md bg-surface-2 flex items-center justify-center shrink-0">
                  <BookX size={16} className={due ? 'text-warn' : 'text-ink-3'} />
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/problems/${slug}`} className="text-sm font-medium hover:text-brand transition-colors truncate block">
                    {titles[slug] ?? slug}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-ink-3 font-mono">
                    <span>错 {entry.count} 次</span>
                    <span>最近 {formatDate(entry.lastAt)}</span>
                    <span>阶段 {entry.stage}</span>
                    <span className={due ? 'text-warn' : ''}>
                      {due ? '已到复习时间' : `下次复习 ${formatDate(entry.nextReview)}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/problems/${slug}`}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border border-brand/40 text-brand hover:bg-brand/10 transition-colors"
                  >
                    <Play size={11} />
                    去复习
                  </Link>
                  <button
                    onClick={() => advanceReview(slug)}
                    title="标记本次复习通过，推进间隔阶段"
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md border border-edge text-ink-3 hover:text-ok hover:border-ok/40 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={11} />
                    通过
                  </button>
                  <button
                    onClick={() => removeWrong(slug)}
                    title="移出错题本"
                    className="p-1.5 rounded-md border border-edge text-ink-3 hover:text-err hover:border-err/40 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
