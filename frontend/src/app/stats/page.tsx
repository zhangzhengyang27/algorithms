import { PieChart } from 'lucide-react';
import { StatsDashboard } from '@/components/stats/stats-dashboard';

export const metadata = {
  title: '统计仪表盘',
  description: '按难度/分类的完成度环形图与刷题活跃趋势',
};

/**
 * 统计仪表盘：按难度/分类的完成度环形图、近 30 天刷题趋势。
 * 数据来自全量题库 + 本地/后端进度。
 */
export default function StatsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-brand-soft flex items-center justify-center">
            <PieChart size={18} className="text-brand" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">统计仪表盘</h1>
        </div>
        <p className="text-ink-2 text-sm">按难度与分类透视你的刷题完成度与活跃趋势</p>
      </div>

      <div className="anim-fade-up stagger-1">
        <StatsDashboard />
      </div>
    </div>
  );
}
