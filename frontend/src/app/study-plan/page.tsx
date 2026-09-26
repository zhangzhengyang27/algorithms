import { ListChecks } from 'lucide-react';
import { StudyPlanGrid } from '@/components/study-plan/study-plan-grid';

export const metadata = {
  title: '学习计划 · 题单',
  description: '按知识图谱节点组织的刷题题单，实时同步完成度',
};

/**
 * 题单 / 学习计划页（题单维度）。
 * 与「教程维度」的 /roadmap 互补：这里以具体题目为节点，显示完成度，
 * 参考 NeetCode Roadmap / LeetCode 学习计划。
 */
export default function StudyPlanPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-brand-soft flex items-center justify-center">
            <ListChecks size={18} className="text-brand" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">学习计划</h1>
        </div>
        <p className="text-ink-2 text-sm">
          按知识图谱节点刷题，每个节点关联讲解与可视化，完成度实时同步
        </p>
      </div>

      <div className="anim-fade-up stagger-1">
        <StudyPlanGrid />
      </div>
    </div>
  );
}
