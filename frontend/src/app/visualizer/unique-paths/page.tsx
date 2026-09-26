import { UniquePathsPanel } from '@/components/visualizer/unique-paths-panel';

export default function UniquePathsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">不同路径 Unique Paths</h1>
        <p className="text-gray-400 text-sm mt-1">
          动态规划：dp[i][j] = dp[i-1][j] + dp[i][j-1]，只能向右/向下。
        </p>
      </div>
      <UniquePathsPanel />
    </div>
  );
}
