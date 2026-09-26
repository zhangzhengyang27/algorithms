'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { type Problem } from '@/lib/api-client';
import { getAllProblems } from '@/lib/problems-cache';
import { useProgressStore, dayKey } from '@/store';

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
};
const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: 'text-ok bg-ok/10',
  MEDIUM: 'text-warn bg-warn/10',
  HARD: 'text-err bg-err/10',
};

/** 由日期字符串生成稳定伪随机数（0..1） */
function seededRatio(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * 每日一题：基于当天日期从全量题库中确定性选取一题（同一天内稳定不变）。
 * 展示「今日已完成」状态，支持换一题（当天内随机切换）。
 */
export function DailyProblem() {
  const [pool, setPool] = useState<Problem[]>([]);
  const [salt, setSalt] = useState(0);
  const completed = useProgressStore((s) => s.completedProblems);
  const solvedAt = useProgressStore((s) => s.solvedAt);

  useEffect(() => {
    let active = true;
    getAllProblems()
      .then((rows) => {
        if (active && rows.length) setPool(rows);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (pool.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-edge-2 bg-surface-2/30 p-4">
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <Sparkles size={13} />
          每日一题加载中…
        </div>
      </div>
    );
  }

  const today = dayKey(new Date());
  const idx = Math.floor(seededRatio(`${today}#${salt}`) * pool.length);
  const problem = pool[idx];
  const isDone = completed.has(problem.slug);
  const solvedToday = solvedAt[problem.slug] ? dayKey(solvedAt[problem.slug]) === today : false;

  return (
    <div className="rounded-lg border border-brand/30 bg-gradient-to-br from-brand-soft/60 to-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-brand" />
          <span className="text-xs font-semibold text-ink">每日一题</span>
          <span className="font-mono text-[10px] text-ink-3">{today}</span>
        </div>
        <button
          onClick={() => setSalt((s) => s + 1)}
          className="inline-flex items-center gap-1 text-[11px] text-ink-3 hover:text-brand transition-colors cursor-pointer"
        >
          <RefreshCw size={11} />
          换一题
        </button>
      </div>

      <Link href={`/problems/${problem.slug}`} className="group block">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-ink group-hover:text-brand transition-colors truncate">
            {problem.title}
          </span>
          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 ${DIFFICULTY_STYLE[problem.difficulty]}`}>
            {DIFFICULTY_LABEL[problem.difficulty] ?? problem.difficulty}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-3 truncate">{problem.category?.name ?? '综合'}</span>
          {isDone ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-ok">
              <CheckCircle2 size={12} />
              {solvedToday ? '今日已完成' : '已完成'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-brand">
              开始挑战
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
