'use client';

import { useEffect, useMemo, useState } from 'react';
import { PieChart, TrendingUp, Award } from 'lucide-react';
import { type Problem } from '@/lib/api-client';
import { getAllProblems } from '@/lib/problems-cache';
import { useProgressStore, dayKey, computeStreak } from '@/store';

const DIFF_META: { key: 'EASY' | 'MEDIUM' | 'HARD'; label: string; color: string }[] = [
  { key: 'EASY', label: '简单', color: 'var(--ok)' },
  { key: 'MEDIUM', label: '中等', color: 'var(--warn)' },
  { key: 'HARD', label: '困难', color: 'var(--err)' },
];

/** 通用 SVG 环形图 */
function Donut({
  segments,
  size = 116,
  centerTop,
  centerBottom,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  centerTop: string;
  centerBottom: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="9" />
        {total > 0 &&
          segments.map((seg, i) => {
            const frac = seg.value / total;
            const dash = frac * c;
            const el = (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="9"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              />
            );
            offset += dash;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold leading-none">{centerTop}</span>
        <span className="text-[10px] text-ink-3 mt-1">{centerBottom}</span>
      </div>
    </div>
  );
}

export function StatsDashboard() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const completed = useProgressStore((s) => s.completedProblems);
  const attempting = useProgressStore((s) => s.attemptingProblems);
  const solvedAt = useProgressStore((s) => s.solvedAt);

  useEffect(() => {
    let active = true;
    getAllProblems()
      .then((rows) => active && setProblems(rows))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    // 按难度聚合
    const byDiff = DIFF_META.map((d) => {
      const items = problems.filter((p) => p.difficulty === d.key);
      const done = items.filter((p) => completed.has(p.slug)).length;
      const ing = items.filter((p) => attempting.has(p.slug)).length;
      return { ...d, total: items.length, done, ing, notStarted: items.length - done - ing };
    });

    // 按分类聚合（取题目数 Top 8）
    const catMap = new Map<string, { name: string; total: number; done: number }>();
    for (const p of problems) {
      const name = p.category?.name ?? '未分类';
      const e = catMap.get(name) ?? { name, total: 0, done: 0 };
      e.total += 1;
      if (completed.has(p.slug)) e.done += 1;
      catMap.set(name, e);
    }
    const byCategory = Array.from(catMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // 近 30 天每日完成数
    const counts: Record<string, number> = {};
    for (const iso of Object.values(solvedAt)) {
      const k = dayKey(iso);
      counts[k] = (counts[k] ?? 0) + 1;
    }
    const trend: { label: string; count: number }[] = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 29);
    for (let i = 0; i < 30; i++) {
      const k = dayKey(cursor);
      trend.push({ label: `${cursor.getMonth() + 1}/${cursor.getDate()}`, count: counts[k] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    const maxTrend = Math.max(1, ...trend.map((t) => t.count));

    const totalDone = problems.filter((p) => completed.has(p.slug)).length;
    return { byDiff, byCategory, trend, maxTrend, totalDone };
  }, [problems, completed, attempting, solvedAt]);

  const streak = computeStreak(solvedAt);
  const activeDays = new Set(Object.values(solvedAt).map((v) => dayKey(v))).size;

  if (problems.length === 0) {
    return <div className="py-20 text-center text-sm text-ink-3">统计数据加载中…</div>;
  }

  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '已完成题目', value: stats.totalDone, icon: <Award size={16} className="text-ok" /> },
          { label: '连续打卡', value: `${streak} 天`, icon: <TrendingUp size={16} className="text-err" /> },
          { label: '活跃天数', value: `${activeDays} 天`, icon: <PieChart size={16} className="text-brand" /> },
          { label: '题库总量', value: problems.length, icon: <PieChart size={16} className="text-warn" /> },
        ].map((c) => (
          <div key={c.label} className="bg-surface rounded-lg border border-edge p-4">
            <div className="w-8 h-8 rounded-md bg-surface-2 flex items-center justify-center mb-3">{c.icon}</div>
            <div className="font-display text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-ink-3 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 按难度完成度环形图 */}
        <div className="bg-surface rounded-lg border border-edge p-6">
          <h2 className="font-display text-sm font-semibold mb-5">按难度完成度</h2>
          <div className="grid grid-cols-3 gap-2">
            {stats.byDiff.map((d) => {
              const pct = d.total ? Math.round((d.done / d.total) * 100) : 0;
              return (
                <div key={d.key} className="flex flex-col items-center">
                  <Donut
                    centerTop={`${pct}%`}
                    centerBottom={d.label}
                    segments={[
                      { value: d.done, color: d.color },
                      { value: d.ing, color: 'var(--edge-2)' },
                    ]}
                  />
                  <div className="mt-2 text-[10px] text-ink-3 font-mono">
                    {d.done}/{d.total} 题
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 近 30 天活跃趋势 */}
        <div className="bg-surface rounded-lg border border-edge p-6">
          <h2 className="font-display text-sm font-semibold mb-5">近 30 天刷题趋势</h2>
          <div className="flex items-end gap-[3px] h-32">
            {stats.trend.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${t.label} · ${t.count} 题`}>
                <div
                  className={`w-full rounded-t-sm transition-all ${t.count > 0 ? 'bg-brand/70 group-hover:bg-brand' : 'bg-surface-2'}`}
                  style={{ height: `${t.count > 0 ? Math.max(8, (t.count / stats.maxTrend) * 100) : 4}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-ink-3 font-mono">
            <span>{stats.trend[0]?.label}</span>
            <span>30 天前 → 今天</span>
            <span>{stats.trend[29]?.label}</span>
          </div>
        </div>
      </div>

      {/* 按分类完成度 */}
      <div className="bg-surface rounded-lg border border-edge p-6">
        <h2 className="font-display text-sm font-semibold mb-5">按分类完成度（Top 8）</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {stats.byCategory.map((c) => {
            const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
            return (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ink-2">{c.name}</span>
                  <span className="font-mono text-ink-3">{c.done}/{c.total} · {pct}%</span>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
