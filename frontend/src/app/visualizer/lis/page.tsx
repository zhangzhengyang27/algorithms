import { LISPanel } from '@/components/visualizer/lis-panel';

export default function LISPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">最长递增子序列 LIS</h1>
        <p className="text-gray-400 text-sm mt-1">动态规划：每个位置记录以它结尾的 LIS 长度。</p>
      </div>
      <LISPanel />
    </div>
  );
}
