import { LCSPanel } from '@/components/visualizer/lcs-panel';

export default function LCSPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">最长公共子序列 LCS</h1>
        <p className="text-gray-400 text-sm mt-1">
          O(mn) 二维动态规划。观察 dp 矩阵填表、字符匹配转移与回溯出的公共子序列。
        </p>
      </div>
      <LCSPanel />
    </div>
  );
}
