import { DpKnapsackPanel } from '@/components/visualizer/dp-knapsack-panel';

export default function DpKnapsackPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">背包 DP Knapsack DP</h1>
        <p className="text-gray-400 text-sm mt-1">
          对比 0/1 背包（参考上一行）与完全背包（参考本行）的转移差异，观察 dp 表填充与选取方案回溯。
        </p>
      </div>
      <DpKnapsackPanel />
    </div>
  );
}
