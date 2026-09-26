import { KnapsackPanel } from '@/components/visualizer/knapsack-panel';

export default function KnapsackPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">0/1 背包 Knapsack</h1>
        <p className="text-gray-400 text-sm mt-1">
          动态规划：dp[i][w] 表示前 i 个物品在容量 w 下的最大价值。
        </p>
      </div>
      <KnapsackPanel />
    </div>
  );
}
