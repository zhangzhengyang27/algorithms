'use client';

import Link from 'next/link';
import { CheckCircle, AlertCircle, TrendingUp, BookOpen, Code, ArrowRight, Flame, Clock } from 'lucide-react';
import { useProgressStore, computeStreak } from '@/store';
import { ActivityCalendar } from '@/components/progress/activity-calendar';

// 本地可确定的题数/教程数（未登录或 totals 未同步时的兜底分母）
const LOCAL_PROBLEM_TOTAL = 18;
const LOCAL_TUTORIAL_TOTAL = 137;

export default function ProgressPage() {
  const completed = useProgressStore((s) => s.completedProblems);
  const attempting = useProgressStore((s) => s.attemptingProblems);
  const completedTutorials = useProgressStore((s) => s.completedTutorials);
  const solvedAt = useProgressStore((s) => s.solvedAt);
  const totalPracticeTime = useProgressStore((s) => s.totalPracticeTime);
  const user = useProgressStore((s) => s.user);
  // 真实总量：登录后由后端同步（~1900 题）；未同步时为 0 → 用本地兜底
  const syncedProblemTotal = useProgressStore((s) => s.totalProblems);
  const syncedTutorialTotal = useProgressStore((s) => s.totalTutorials);
  const problemTotal = syncedProblemTotal > 0 ? syncedProblemTotal : LOCAL_PROBLEM_TOTAL;
  const tutorialTotal = syncedTutorialTotal > 0 ? syncedTutorialTotal : LOCAL_TUTORIAL_TOTAL;
  // 连续打卡天数由 solvedAt 权威推导（而非累加的 currentStreak）
  const currentStreak = computeStreak(solvedAt);

  const totalItems = problemTotal + tutorialTotal;
  const completedItems = completed.size + completedTutorials.size;
  const attemptingItems = attempting.size;
  const completionRate = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  const recentActivity = [
    ...Array.from(completed).slice(-2).map((slug) => ({
      type: 'problem' as const, slug, title: slug, status: 'COMPLETED' as const,
    })),
    ...Array.from(attempting).slice(-2).map((slug) => ({
      type: 'problem' as const, slug, title: slug, status: 'ATTEMPTING' as const,
    })),
    ...Array.from(completedTutorials).slice(-2).map((slug) => ({
      type: 'tutorial' as const, slug, title: slug, status: 'COMPLETED' as const,
    })),
  ].slice(0, 6);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">学习进度</h1>
          {user && (
            <span className="font-mono text-xs text-ink-3 bg-surface-2 px-2 py-0.5 rounded">
              {user.email}
            </span>
          )}
        </div>
        <p className="text-ink-2 text-sm">追踪你的算法学习旅程</p>
      </div>

      {/* ─── Dashboard grid ─── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 anim-fade-up stagger-1">
        <StatCard
          icon={<CheckCircle size={16} className="text-ok" />}
          value={completed.size}
          label="题目已完成"
          sub={`共 ${problemTotal} 题`}
        />
        <StatCard
          icon={<AlertCircle size={16} className="text-warn" />}
          value={attemptingItems}
          label="进行中"
          sub="继续加油"
        />
        <StatCard
          icon={<BookOpen size={16} className="text-brand" />}
          value={completedTutorials.size}
          label="教程已读"
          sub={`共 ${tutorialTotal} 篇`}
        />
        <StatCard
          icon={<Flame size={16} className="text-err" />}
          value={currentStreak}
          label="连续天数"
          sub={`${totalPracticeTime} 分钟练习`}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* ─── Left: completion + activity ─── */}
        <div className="space-y-6 anim-fade-up stagger-2">
          {/* Completion ring / bar */}
          <div className="bg-surface rounded-lg border border-edge p-6">
            <h2 className="font-display text-sm font-semibold mb-5 flex items-center gap-2">
              <TrendingUp size={15} className="text-brand" />
              总体完成率
            </h2>
            <div className="flex items-center gap-8">
              {/* Big number */}
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="var(--brand)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${completionRate * 2.64} 264`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold">{completionRate}%</span>
                </div>
              </div>
              {/* Breakdown */}
              <div className="flex-1 space-y-3">
                {[
                  { label: '题目', done: completed.size, total: problemTotal, color: 'bg-ok' },
                  { label: '教程', done: completedTutorials.size, total: tutorialTotal, color: 'bg-brand' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-ink-2">{row.label}</span>
                      <span className="font-mono text-ink-3">{row.done}/{row.total}</span>
                    </div>
                    <div className="h-[3px] bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${row.color} rounded-full transition-all duration-500`}
                        style={{ width: `${row.total > 0 ? (row.done / row.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 打卡热力日历 */}
          <ActivityCalendar solvedAt={solvedAt} />

          {/* Recent activity */}
          <div className="bg-surface rounded-lg border border-edge overflow-hidden">
            <div className="px-5 py-3.5 border-b border-edge">
              <h2 className="font-display text-sm font-semibold">最近活动</h2>
            </div>
            {recentActivity.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-ink-3 text-sm mb-3">还没有学习记录</p>
                <Link href="/problems/two-sum" className="text-xs text-brand hover:underline">
                  开始第一题 →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-edge">
                {recentActivity.map((a, i) => (
                  <div key={`${a.type}-${a.slug}-${i}`} className="px-5 py-3 flex items-center gap-3">
                    {a.type === 'problem' ? (
                      <Code size={14} className="text-ink-3" />
                    ) : (
                      <BookOpen size={14} className="text-ink-3" />
                    )}
                    <span className="text-[13px] font-medium flex-1 truncate font-mono">{a.title}</span>
                    <span className="text-[10px] text-ink-3">{a.type === 'problem' ? '题目' : '教程'}</span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        a.status === 'COMPLETED' ? 'bg-ok/10 text-ok' : 'bg-warn/10 text-warn'
                      }`}
                    >
                      {a.status === 'COMPLETED' ? 'AC' : 'WA'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right: quick actions ─── */}
        <div className="space-y-3 anim-fade-up stagger-3">
          <p className="font-mono text-[10px] text-ink-3 uppercase tracking-widest">Quick start</p>
          <QuickAction
            href="/visualizer/sorting"
            title="继续学习"
            desc="从排序算法可视化开始"
            icon={<TrendingUp size={16} className="text-brand" />}
          />
          <QuickAction
            href="/problems"
            title="刷题练习"
            desc="巩固算法知识"
            icon={<Code size={16} className="text-ok" />}
          />
          <QuickAction
            href="/tutorials"
            title="阅读教程"
            desc="40+ 篇深度教程"
            icon={<BookOpen size={16} className="text-warn" />}
          />
          <QuickAction
            href="/stats"
            title="统计仪表盘"
            desc="难度/分类完成度与趋势"
            icon={<TrendingUp size={16} className="text-brand" />}
          />

          {/* Tip card */}
          <div className="p-4 rounded-lg border border-dashed border-edge-2 bg-surface-2/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={13} className="text-ink-3" />
              <span className="text-xs font-medium text-ink-2">学习提示</span>
            </div>
            <p className="text-xs text-ink-3 leading-relaxed">
              每天 30 分钟，先看可视化理解原理，再读教程巩固，最后刷题验证。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, sub }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  sub: string;
}) {
  return (
    <div className="bg-surface rounded-lg border border-edge p-5 hover:border-edge-2 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-md bg-surface-2 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="font-display text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs text-ink-2">{label}</div>
      <div className="text-[10px] text-ink-3 font-mono mt-0.5">{sub}</div>
    </div>
  );
}

function QuickAction({ href, title, desc, icon }: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 bg-surface rounded-lg border border-edge hover:border-edge-2 transition-all hover:-translate-y-0.5"
    >
      <div className="w-9 h-9 rounded-md bg-surface-2 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium group-hover:text-brand transition-colors">{title}</div>
        <div className="text-xs text-ink-3">{desc}</div>
      </div>
      <ArrowRight size={14} className="text-ink-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
    </Link>
  );
}
