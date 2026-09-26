import { DPPanel } from '@/components/visualizer/dp-panel';

export default function DPPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">动态规划 DP</h1>
        <p className="text-gray-400 text-sm mt-1">
          0/1 背包问题：逐步填充 DP 表，观察状态转移过程。
        </p>
      </div>
      <DPPanel />
    </div>
  );
}
