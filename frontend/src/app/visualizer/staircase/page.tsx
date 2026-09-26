import { StaircasePanel } from '@/components/visualizer/staircase-panel';

export default function StaircasePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">爬楼梯 Staircase</h1>
        <p className="text-gray-400 text-sm mt-1">动态规划：每次 1 或 2 步，求走到第 n 级的方法数。</p>
      </div>
      <StaircasePanel />
    </div>
  );
}
