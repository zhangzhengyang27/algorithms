'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, BookOpen, BarChart3, Trophy } from 'lucide-react';
import { useProgressStore } from '@/store';
import { STUDY_PLAN, PLAN_TOTAL_PROBLEMS, type PlanDifficulty } from '@/lib/study-plan';

const DIFF_STYLE: Record<PlanDifficulty, string> = {
  EASY: 'text-ok',
  MEDIUM: 'text-warn',
  HARD: 'text-err',
};
const DIFF_LABEL: Record<PlanDifficulty, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
};

export function StudyPlanGrid() {
  const completed = useProgressStore((s) => s.completedProblems);

  // 全局完成度（按题单内唯一题目计）
  const uniqueSlugs = new Set(
    STUDY_PLAN.flatMap((sec) => sec.nodes.flatMap((n) => n.problems.map((p) => p.slug))),
  );
  const doneCount = Array.from(uniqueSlugs).filter((s) => completed.has(s)).length;
  const overallPct = uniqueSlugs.size ? Math.round((doneCount / uniqueSlugs.size) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* 总览进度 */}
      <div className="bg-surface rounded-lg border border-edge p-5 flex items-center gap-5">
        <div className="w-11 h-11 rounded-md bg-brand-soft flex items-center justify-center shrink-0">
          <Trophy size={20} className="text-brand" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">题单总进度</span>
            <span className="font-mono text-xs text-ink-3">
              {doneCount}/{uniqueSlugs.size} 题 · {overallPct}%
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </div>

      {STUDY_PLAN.map((section) => (
        <section key={section.id}>
          <div className="mb-4">
            <h2 className="font-display text-lg font-semibold tracking-tight">{section.title}</h2>
            <p className="text-xs text-ink-3 mt-0.5">{section.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.nodes.map((node) => {
              const total = node.problems.length;
              const done = node.problems.filter((p) => completed.has(p.slug)).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div
                  key={node.id}
                  className="bg-surface rounded-lg border border-edge p-4 flex flex-col hover:border-edge-2 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">{node.title}</h3>
                    <span className="font-mono text-[10px] text-ink-3">{done}/{total}</span>
                  </div>

                  {/* 节点进度条 */}
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-ok' : 'bg-brand'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* 题目清单 */}
                  <ul className="space-y-1 mb-3 flex-1">
                    {node.problems.map((p) => {
                      const isDone = completed.has(p.slug);
                      return (
                        <li key={p.slug}>
                          <Link
                            href={`/problems/${p.slug}`}
                            className="group flex items-center gap-2 text-[13px] py-0.5"
                          >
                            {isDone ? (
                              <CheckCircle2 size={13} className="text-ok shrink-0" />
                            ) : (
                              <Circle size={13} className="text-edge-2 group-hover:text-ink-3 shrink-0 transition-colors" />
                            )}
                            <span className={`truncate ${isDone ? 'text-ink-3 line-through decoration-ink-3/40' : 'text-ink-2 group-hover:text-brand'} transition-colors`}>
                              {p.title}
                            </span>
                            <span className={`ml-auto shrink-0 font-mono text-[9px] ${DIFF_STYLE[p.difficulty]}`}>
                              {DIFF_LABEL[p.difficulty]}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {/* 联动入口：教程 + 可视化 */}
                  <div className="flex items-center gap-2 pt-3 border-t border-edge">
                    {node.tutorial && (
                      <Link
                        href={`/tutorials/${node.tutorial}`}
                        className="inline-flex items-center gap-1 text-[11px] text-ink-3 hover:text-brand transition-colors"
                      >
                        <BookOpen size={11} />
                        讲解
                      </Link>
                    )}
                    {node.visualizer && (
                      <Link
                        href={`/visualizer/${node.visualizer}`}
                        className="inline-flex items-center gap-1 text-[11px] text-ink-3 hover:text-brand transition-colors"
                      >
                        <BarChart3 size={11} />
                        可视化
                      </Link>
                    )}
                    {pct === 100 && (
                      <span className="ml-auto text-[10px] text-ok font-mono">✓ 已完成</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-center text-[11px] text-ink-3 font-mono pt-2">
        题单维度 · 共 {PLAN_TOTAL_PROBLEMS} 题 · 完成度实时同步自你的刷题进度
      </p>
    </div>
  );
}
